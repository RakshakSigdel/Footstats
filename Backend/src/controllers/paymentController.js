import PaymentService from "../services/paymentService.js";

export const initiatePayment = async (req, res) => {
  try {
    const {
      amount,
      productId,
      paymentGateway,
      paymnetGateway,
      customerEmail,
      customerName,
      customerPhone,
      productName,
    } = req.body;

    const gateway = paymentGateway || paymnetGateway;
    const email = customerEmail || req.body.costumerEmail;
    const name = customerName || req.body.costumerName;
    const phone = customerPhone || req.body.costumerPhone;

    if (!gateway) {
      return res.status(400).json({ message: "Payment gateway is required" });
    }

    if (!amount || !productId || !email || !name || !phone || !productName) {
      return res.status(400).json({ message: "All fields are required" });
    }

    const result = await PaymentService.initiatePayment({
      ...req.body,
      paymentGateway: gateway,
      customerEmail: email,
      customerName: name,
      customerPhone: phone,
    });

    res.status(200).json({
      message: "Payment initiated successfully",
      paymentUrl: result.paymentUrl,
      transaction: result.transaction,
    });
  } catch (error) {
    console.error("Error during payment initiation:", error);
    res.status(error.status || 500).json({
      message: error.message || "Payment initiation failed",
      error: error.error || error.message,
    });
  }
};

export const checkPaymentStatus = async (req, res) => {
  try {
    const { product_id, pidx, paymentStatus, status } = req.body;

    if (!product_id) {
      return res.status(400).json({ message: "Product ID is required" });
    }

    const result = await PaymentService.checkPaymentStatus({
      product_id,
      pidx,
      paymentStatus: paymentStatus || status,
    });

    return res.status(200).json(result);
  } catch (error) {
    console.error("Error during payment status check:", error);
    res.status(error.status || 500).json({
      message: error.message || "Payment status check failed",
      error: error.error || error.message,
    });
  }
};

export const getTransactionByProductId = async (req, res) => {
  try {
    const transaction = await PaymentService.getTransactionByProductId(
      req.params.productId,
    );

    return res.status(200).json({ transaction });
  } catch (error) {
    res.status(error.status || 500).json({
      message: error.message || "Internal server error",
    });
  }
};

