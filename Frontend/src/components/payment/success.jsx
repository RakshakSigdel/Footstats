import React, { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { base64Decode } from "../../utills/helper.js";
import { checkPaymentStatus } from "../../services/api.payments";
import { joinTournament } from "../../services/api.tournaments";

const Success = () => {
  const [paymentStatus, setPaymentStatus] = useState(null);
  const [registrationMessage, setRegistrationMessage] = useState("");
  const [redirectTournamentId, setRedirectTournamentId] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [verificationError, setVerificationError] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const queryParams = new URLSearchParams(location.search);

  // For eSewa: Decode the data parameter
  const token = queryParams.get("data");
  const decoded = token ? base64Decode(token) : null;
  const product_id =
    decoded?.transaction_uuid || queryParams.get("purchase_order_id");

  const isKhalti = queryParams.get("pidx") !== null;
  const rawAmount =
    decoded?.total_amount ||
    queryParams.get("total_amount") ||
    queryParams.get("amount");
  const total_amount = isKhalti ? rawAmount / 100 : rawAmount;

  useEffect(() => {
    verifyPaymentAndUpdateStatus();
  }, [product_id]);

  const completePendingTournamentJoin = async (paidProductId) => {
    const pendingRaw = sessionStorage.getItem("pending_tournament_join");
    if (!pendingRaw) return;

    let pendingJoin;
    try {
      pendingJoin = JSON.parse(pendingRaw);
    } catch {
      sessionStorage.removeItem("pending_tournament_join");
      return;
    }

    if (!pendingJoin?.paymentReference) {
      sessionStorage.removeItem("pending_tournament_join");
      return;
    }

    if (String(pendingJoin.paymentReference) !== String(paidProductId)) {
      return;
    }

    const response = await joinTournament(pendingJoin.tournamentId, {
      clubId: Number(pendingJoin.clubId),
      notes: pendingJoin.notes || "",
      paymentReference: pendingJoin.paymentReference,
    });

    sessionStorage.removeItem("pending_tournament_join");
    setRedirectTournamentId(Number(pendingJoin.tournamentId));
    setRegistrationMessage(
      response?.registration?.status === "ACCEPTED"
        ? "Payment confirmed. Your club has been enrolled in the tournament."
        : "Club registration request submitted successfully.",
    );
  };

  const verifyPaymentAndUpdateStatus = async () => {
    if (!product_id) {
      setIsLoading(false);
      setVerificationError(true);
      return;
    }

    try {
      const response = await checkPaymentStatus({
        product_id,
        pidx: queryParams.get("pidx"),
      });

      if (response) {
        setIsLoading(false);

        if (response.status === "COMPLETED") {
          try {
            await completePendingTournamentJoin(product_id);
          } catch (joinError) {
            setRegistrationMessage(
              joinError?.error ||
                joinError?.message ||
                "Payment is completed, but registration submission failed. Please try joining the tournament again.",
            );
          }

          setPaymentStatus("COMPLETED");
        } else {
          navigate("/payment-failure", {
            search: `?purchase_order_id=${product_id}`,
          });
          return;
        }
      }
    } catch (error) {
      console.error("Error confirming payment:", error);
      setIsLoading(false);
      setVerificationError(true);
      if (error.status === 400) {
        navigate("/payment-failure", {
          search: `?purchase_order_id=${product_id}`,
        });
      }
    }
  };

  if (isLoading)
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50 px-4 py-10">
        <div className="rounded-xl border border-slate-200 bg-white px-6 py-4 text-sm font-medium text-slate-700 shadow-sm">
          Loading...
        </div>
      </div>
    );

  // System error state - when can't verify the payment status
  if (verificationError) {
    return (
      <div className="min-h-screen bg-slate-50 px-4 py-10">
        <div className="mx-auto w-full max-w-2xl rounded-2xl border border-red-200 bg-white p-6 shadow-sm sm:p-8">
          <h1 className="text-2xl font-bold text-red-600">
            Oops! Error occurred on confirming payment
          </h1>
          <h2 className="mt-2 text-lg font-semibold text-slate-800">
            We will resolve it soon.
          </h2>
          <p className="mt-4 text-sm text-slate-600">
            Your transaction is being processed, but we couldn't verify its
            status.
          </p>
          <p className="mt-2 text-sm text-slate-600">
            If the amount was deducted from your account, please contact our
            support team.
          </p>
          <p className="mt-4 rounded-lg bg-slate-100 px-3 py-2 text-sm text-slate-700">
            <span className="font-semibold">Reference ID:</span>{" "}
            {product_id || queryParams.get("pidx") || "Unknown"}
          </p>
          <button
            onClick={() => navigate("/")}
            className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
          >
            Go to Homepage
          </button>
        </div>
      </div>
    );
  }

  // Success state - only shown for confirmed successful payments
  return (
    <div className="min-h-screen bg-slate-50 px-4 py-10">
      <div className="mx-auto w-full max-w-2xl rounded-2xl border border-sky-200 bg-white p-6 shadow-sm sm:p-8">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-sky-100 text-sky-600">
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
          <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path>
          <polyline points="22 4 12 14.01 9 11.01"></polyline>
        </svg>
        </div>
        <h1 className="mt-5 text-2xl font-bold text-slate-900">Payment Successful!</h1>
        <p className="mt-2 text-sm text-slate-600">
          Thank you for your payment. Your transaction was successful.
        </p>

        <div className="mt-6 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <h3 className="text-base font-semibold text-slate-900">Transaction Details</h3>
          <p className="mt-3 text-sm text-slate-700">
            <strong>Amount Paid:</strong> NPR {total_amount}
          </p>
          <p className="mt-1 text-sm text-slate-700">
            <strong>Transaction ID:</strong> {product_id}
          </p>
          {paymentStatus === "COMPLETED" && (
            <>
              <p className="mt-1 text-sm text-slate-700">
                <strong>Payment Method:</strong> {isKhalti ? "Khalti" : "eSewa"}
              </p>
              <p className="mt-1 text-sm text-slate-700">
                <strong>Status:</strong> Completed
              </p>
            </>
          )}
          {registrationMessage && (
            <p className="mt-3 rounded-lg bg-sky-50 px-3 py-2 text-sm text-sky-700">
              {registrationMessage}
            </p>
          )}
        </div>

        {/* <p>
          We've sent a confirmation email with these details to your registered
          email address.
        </p> */}

        <button
          onClick={() =>
            navigate(
              redirectTournamentId
                ? `/tournament/${redirectTournamentId}`
                : "/",
            )
          }
          className="mt-6 w-full rounded-lg bg-indigo-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700"
        >
          {redirectTournamentId ? "Go to Tournament" : "Go to Homepage"}
        </button>
      </div>
    </div>
  );
};

export default Success;