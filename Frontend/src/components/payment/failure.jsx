import { useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base64Decode } from "../../utills/helper.js";
import { checkPaymentStatus } from "../../services/api.payments";

const Failure = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);

  const token = queryParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const product_id =
    decoded?.transaction_uuid ||
    queryParams.get("purchase_order_id") ||
    sessionStorage.getItem("current_transaction_id");

  useEffect(() => {
    sessionStorage.removeItem("pending_tournament_join");

    if (product_id) {
      markPaymentAsFailed(product_id);
    }
  }, [product_id]);

  const markPaymentAsFailed = async (product_id) => {
    try {
      await checkPaymentStatus({
        product_id,
        paymentStatus: "FAILED",
      });
    } catch (error) {
      console.error("Error updating payment status:", error);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-red-100 text-red-600">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="48"
          height="48"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <circle cx="12" cy="12" r="10"></circle>
          <line x1="15" y1="9" x2="9" y2="15"></line>
          <line x1="9" y1="9" x2="15" y2="15"></line>
        </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Payment Failed!</h1>
        <p className="mt-2 text-sm text-red-600">
          There was an issue processing your payment.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-700">
            <strong>Transaction ID:</strong> {product_id || "Not available"}
          </p>
          <p className="mt-2 text-sm text-slate-600">
            If the amount was deducted from your account, it will be refunded
            within 3-5 business days.
          </p>
        </div>

        <div className="mt-6">
          <button
            onClick={() => navigate("/")}
            className="w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Return to Home
          </button>
        </div>
      </div>
    </div>
  );
};

export default Failure;