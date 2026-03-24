import { MotionButton } from "../../../components/ui/motion";

export default function TournamentJoinRequestsTab({ pendingRegistrations, onReviewRegistration }) {
  return (
    <section className="app-card p-6">
      <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Join Requests</h2>
      <p className="mt-1 text-sm text-surface-600">Review club requests and approve or decline.</p>

      {pendingRegistrations.length === 0 ? (
        <p className="mt-4 text-sm text-surface-600">No pending requests.</p>
      ) : (
        <div className="mt-4 space-y-3">
          {pendingRegistrations.map((registration) => (
            <div
              key={registration.registrationId}
              className="rounded-xl border border-surface-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3 hover:border-primary-200 transition-colors"
            >
              <div>
                <div className="font-semibold text-gray-900">{registration.club?.name || `Club ${registration.clubId}`}</div>
                <div className="text-xs text-surface-500">Payment status: {registration.paymentStatus}</div>
                {registration.notes && <p className="mt-1 text-xs text-surface-600">{registration.notes}</p>}
              </div>
              <div className="flex gap-2">
                <MotionButton
                  onClick={() => onReviewRegistration(registration.registrationId, "APPROVE")}
                  className="btn-primary rounded-xl px-3 py-2 text-xs"
                >
                  Approve
                </MotionButton>
                <MotionButton
                  onClick={() => onReviewRegistration(registration.registrationId, "DECLINE")}
                  className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700 hover:bg-red-100"
                >
                  Decline
                </MotionButton>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
