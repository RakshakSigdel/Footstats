import { PrismaClient } from "@prisma/client";
import axios from "axios";
import { generateHmacSha256Hash } from "../utils/helper.js";

const prisma = new PrismaClient();

const ensureEnvVars = (keys, gateway) => {
  const missing = keys.filter((key) => !process.env[key]);
  if (missing.length > 0) {
    throw {
      status: 500,
      message: `${gateway} payment gateway is not configured on the server`,
      error: `Missing env vars: ${missing.join(", ")}`,
    };
  }
};

class PaymentService {
  static async initiatePayment(paymentData) {
    const {
      amount,
      productId,
      paymentGateway,
      paymnetGateway,
      customerEmail,
      customerName,
      customerPhone,
      productName,
    } = paymentData;

    const gateway = (paymentGateway || paymnetGateway || "").toUpperCase();
    const email = customerEmail || paymentData.costumerEmail;
    const name = customerName || paymentData.costumerName;
    const phone = customerPhone || paymentData.costumerPhone;

    if (!gateway) {
      throw { status: 400, message: "Unsupported payment gateway" };
    }

    let transaction;

    try {
      transaction = await prisma.payment.create({
        data: {
          customerName: name,
          customerEmail: email,
          customerPhone: phone,
          productName,
          productId,
          amount: Number(amount),
          paymentGateway: gateway,
          status: "PENDING",
          gatewayTransactionId: productId,
        },
      });
    } catch (error) {
      if (error?.code === "P2002") {
        throw {
          status: 409,
          message: "Duplicate transaction reference. Please retry payment.",
          error: "gatewayTransactionId already exists",
        };
      }

      throw {
        status: 500,
        message: "Failed to create payment transaction",
        error: error.message,
      };
    }

    let paymentConfig;

    if (gateway === "ESEWA") {
      paymentConfig = await this.generateEsewaConfig(amount, productId);
    } else if (gateway === "KHALTI") {
      paymentConfig = await this.generateKhaltiConfig(
        amount,
        productId,
        productName,
        phone,
      );
    } else {
      throw { status: 400, message: "Unsupported payment gateway" };
    }

    try {
      const payment = await axios.post(paymentConfig.url, paymentConfig.data, {
        headers: paymentConfig.headers,
      });

      const paymentUrl = paymentConfig.responseHandler(payment);

      if (!paymentUrl) {
        throw new Error("Payment URL is missing in the response");
      }

      return { paymentUrl, transaction };
    } catch (error) {
      await prisma.payment.update({
        where: { paymentId: transaction.paymentId },
        data: { status: "FAILED" },
      });

      throw {
        status: 500,
        message: "Payment initiation failed",
        error: error.response?.data || error.message,
      };
    }
  }

  static async generateEsewaConfig(amount, productId) {
    ensureEnvVars(
      [
        "ESEWA_MERCHANT_ID",
        "ESEWA_SECRET",
        "ESEWA_PAYMENT_URL",
        "SUCCESS_URL",
        "FAILURE_URL",
      ],
      "ESEWA",
    );

    const paymentData = {
      amount,
      failure_url: process.env.FAILURE_URL,
      product_delivery_charge: "0",
      product_service_charge: "0",
      product_code: process.env.ESEWA_MERCHANT_ID,
      signed_field_names: "total_amount,transaction_uuid,product_code",
      success_url: process.env.SUCCESS_URL,
      tax_amount: "0",
      total_amount: amount,
      transaction_uuid: productId,
    };

    const data = `total_amount=${paymentData.total_amount},transaction_uuid=${paymentData.transaction_uuid},product_code=${paymentData.product_code}`;
    const signature = generateHmacSha256Hash(data, process.env.ESEWA_SECRET);

    return {
      url: process.env.ESEWA_PAYMENT_URL,
      data: { ...paymentData, signature },
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      responseHandler: (response) => response.request?.res?.responseUrl,
    };
  }

  // GENERATE KHALTI CONFIG
  static async generateKhaltiConfig(amount, productId, productName, phone) {
    ensureEnvVars(
      [
        "KHALTI_PAYMENT_URL",
        "KHALTI_PUBLIC_KEY",
        "KHALTI_SECRET_KEY",
        "SUCCESS_URL",
        "FAILURE_URL",
      ],
      "KHALTI",
    );

    return {
      url: process.env.KHALTI_PAYMENT_URL,
      data: {
        amount: amount * 100, // Convert to paisa
        mobile: phone,
        product_identity: productId,
        product_name: productName,
        return_url: process.env.SUCCESS_URL,
        failure_url: process.env.FAILURE_URL,
        public_key: process.env.KHALTI_PUBLIC_KEY,
        website_url: process.env.FRONTEND_URL || "http://localhost:5173",
        purchase_order_id: productId,
        purchase_order_name: productName,
      },
      headers: {
        Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
        "Content-Type": "application/json",
      },
      responseHandler: (response) => response.data?.payment_url,
    };
  }

  // CHECK PAYMENT STATUS
  static async checkPaymentStatus(statusData) {
    const { product_id, pidx, paymentStatus } = statusData;

    const transaction = await prisma.payment.findFirst({
      where: { productId: product_id },
    });

    if (!transaction) {
      throw { status: 404, message: "Transaction not found" };
    }

    if (paymentStatus === "FAILED") {
      const updatedTransaction = await prisma.payment.update({
        where: { paymentId: transaction.paymentId },
        data: { status: "FAILED" },
      });

      return {
        message: "Transaction status updated to FAILED",
        status: "FAILED",
        transaction: updatedTransaction,
      };
    }

    const paymentGateway = transaction.paymentGateway.toLowerCase();

    if (paymentGateway === "esewa") {
      return await this.verifyEsewaPayment(transaction);
    } else if (paymentGateway === "khalti") {
      return await this.verifyKhaltiPayment(transaction, pidx);
    } else {
      throw { status: 400, message: "Invalid payment gateway" };
    }
  }

  // VERIFY ESEWA PAYMENT
  static async verifyEsewaPayment(transaction) {
    const paymentData = {
      product_code: process.env.ESEWA_MERCHANT_ID,
      total_amount: transaction.amount.toString(),
      transaction_uuid: transaction.productId,
    };

    try {
      const response = await axios.get(
        process.env.ESEWA_PAYMENT_STATUS_CHECK_URL,
        { params: paymentData },
      );

      const paymentStatusCheck = response.data;

      if (paymentStatusCheck.status === "COMPLETE") {
        const updatedTransaction = await prisma.payment.update({
          where: { paymentId: transaction.paymentId },
          data: {
            status: "COMPLETED",
            gatewayResponse: paymentStatusCheck,
          },
        });

        return {
          message: "Transaction status updated successfully",
          status: "COMPLETED",
          transaction: updatedTransaction,
        };
      } else {
        const updatedTransaction = await prisma.payment.update({
          where: { paymentId: transaction.paymentId },
          data: {
            status: "FAILED",
            gatewayResponse: paymentStatusCheck,
          },
        });

        return {
          message: "Transaction status updated to FAILED",
          status: "FAILED",
          transaction: updatedTransaction,
        };
      }
    } catch (error) {
      throw {
        status: 500,
        message: "Esewa payment verification failed",
        error: error.response?.data || error.message,
      };
    }
  }

  // VERIFY KHALTI PAYMENT
  static async verifyKhaltiPayment(transaction, pidx) {
    try {
      const response = await axios.post(
        process.env.KHALTI_VERIFICATION_URL,
        { pidx },
        {
          headers: {
            Authorization: `Key ${process.env.KHALTI_SECRET_KEY}`,
            "Content-Type": "application/json",
          },
        },
      );

      const paymentStatusCheck = response.data;

      if (paymentStatusCheck.status === "Completed") {
        const updatedTransaction = await prisma.payment.update({
          where: { paymentId: transaction.paymentId },
          data: {
            status: "COMPLETED",
            gatewayResponse: paymentStatusCheck,
          },
        });

        return {
          message: "Transaction status updated successfully",
          status: "COMPLETED",
          transaction: updatedTransaction,
        };
      } else {
        const updatedTransaction = await prisma.payment.update({
          where: { paymentId: transaction.paymentId },
          data: {
            status: "FAILED",
            gatewayResponse: paymentStatusCheck,
          },
        });

        return {
          message: "Transaction status updated to FAILED",
          status: "FAILED",
          transaction: updatedTransaction,
        };
      }
    } catch (error) {
      if (error.response?.status === 400) {
        const updatedTransaction = await prisma.payment.update({
          where: { paymentId: transaction.paymentId },
          data: {
            status: "FAILED",
            gatewayResponse: error.response.data,
          },
        });

        return {
          message: "Transaction status updated to FAILED",
          status: "FAILED",
          transaction: updatedTransaction,
        };
      } else {
        throw {
          status: 500,
          message: "Khalti payment verification failed",
          error: error.response?.data || error.message,
        };
      }
    }
  }

  // GET TRANSACTION BY PRODUCT ID
  static async getTransactionByProductId(productId) {
    const transaction = await prisma.payment.findFirst({
      where: { productId },
      include: {
        user: {
          select: {
            userId: true,
            firstName: true,
            lastName: true,
            email: true,
          },
        },
        tournament: {
          select: {
            tournamentId: true,
            name: true,
          },
        },
      },
    });

    if (!transaction) {
      throw { status: 404, message: "Transaction not found" };
    }

    return transaction;
  }
}

export default PaymentService;