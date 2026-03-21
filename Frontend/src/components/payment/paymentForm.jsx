import React, { useState } from "react";
import { generateUniqueId } from "../../utills/helper.js";
import { initiatePayment } from "../../services/api.payments";

const PaymentComponent = () => {
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    productName: "",
    amount: "",
    paymentGateway: "esewa",
  });

  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const productId = generateUniqueId();
      sessionStorage.setItem("current_transaction_id", productId);

      const response = await initiatePayment({
        ...formData,
        productId,
      });

      if (response.paymentUrl) {
        window.location.href = response.paymentUrl;
      } else {
        console.error("Error: Payment URL is undefined.");
        alert("Payment URL is invalid. Please try again.");
      }
    } catch (error) {
      console.error("Error initiating payment:", error);
      alert("Payment failed. Please check the console for details.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
        <h1 className="text-2xl font-bold text-slate-900">Payment Integration</h1>
        <p className="mt-2 text-sm text-slate-600">
          Please fill in all the details to proceed with payment
        </p>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label
              htmlFor="customerName"
              className="block text-sm font-medium text-slate-700"
            >
              Full Name:
            </label>
            <input
              type="text"
              id="customerName"
              name="customerName"
              value={formData.customerName}
              onChange={handleChange}
              required
              placeholder="Enter your full name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="customerEmail"
              className="block text-sm font-medium text-slate-700"
            >
              Email:
            </label>
            <input
              type="email"
              id="customerEmail"
              name="customerEmail"
              value={formData.customerEmail}
              onChange={handleChange}
              required
              placeholder="Enter your email"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="customerPhone"
              className="block text-sm font-medium text-slate-700"
            >
              Phone Number:
            </label>
            <input
              type="tel"
              id="customerPhone"
              name="customerPhone"
              value={formData.customerPhone}
              onChange={handleChange}
              required
              placeholder="Enter your phone number"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="productName"
              className="block text-sm font-medium text-slate-700"
            >
              Product/Service Name:
            </label>
            <input
              type="text"
              id="productName"
              name="productName"
              value={formData.productName}
              onChange={handleChange}
              required
              placeholder="Enter product/service name"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="amount"
              className="block text-sm font-medium text-slate-700"
            >
              Amount (NPR):
            </label>
            <input
              type="number"
              id="amount"
              name="amount"
              value={formData.amount}
              onChange={handleChange}
              required
              min="1"
              placeholder="Enter amount"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            />
          </div>

          <div className="space-y-2">
            <label
              htmlFor="paymentGateway"
              className="block text-sm font-medium text-slate-700"
            >
              Payment Method:
            </label>
            <select
              id="paymentGateway"
              name="paymentGateway"
              value={formData.paymentGateway}
              onChange={handleChange}
              required
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none transition focus:border-indigo-500 focus:ring-2 focus:ring-indigo-200"
            >
              <option value="esewa">eSewa</option>
              <option value="khalti">Khalti</option>
            </select>
          </div>

          <button
            type="submit"
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:bg-indigo-300"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Processing..." : "Proceed to Payment"}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentComponent;
