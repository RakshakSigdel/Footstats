import { MotionButton } from "../../../components/ui/motion";

export default function TournamentOverviewTab({
  tournament,
  canSubmitJoinRequest,
  canJoinByTournamentState,
  onOpenJoinForm,
  isTournamentAdmin,
  statusForm,
  setStatusForm,
  statusLoading,
  onUpdateStatus,
  acceptedRegistrations,
  statusOptions,
  enrollmentOptions,
}) {
  return (
    <div className="space-y-6">
      <section className="app-card p-6">
        <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Tournament Overview</h2>
        <p className="mt-1 text-sm text-surface-600">
          Snapshot of the competition details, timeline, and participation status.
        </p>

        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">Start Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {tournament.startDate ? new Date(tournament.startDate).toLocaleString() : "TBD"}
            </p>
          </div>
          <div className="rounded-2xl border border-surface-200 bg-surface-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-surface-500">End Date</p>
            <p className="mt-1 text-sm font-semibold text-gray-900">
              {tournament.endDate ? new Date(tournament.endDate).toLocaleString() : "TBD"}
            </p>
          </div>
        </div>

        {tournament.paymentInstructions && (
          <div className="mt-4 rounded-2xl border border-blue-200 bg-blue-50 p-4">
            <p className="text-xs font-semibold uppercase tracking-wide text-blue-700">Payment Instructions</p>
            <p className="mt-2 text-sm text-blue-900 whitespace-pre-wrap">{tournament.paymentInstructions}</p>
          </div>
        )}

        {canSubmitJoinRequest && (
          <div className="mt-4 rounded-2xl border border-primary-200 bg-primary-50 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
            <p className="text-sm text-primary-900 font-medium">
              Ready to participate? Open the Join Tournament tab to submit your club.
            </p>
            <MotionButton onClick={onOpenJoinForm} className="btn-primary rounded-xl px-4 py-2 text-sm">
              Open Join Form
            </MotionButton>
          </div>
        )}

        {!canJoinByTournamentState && (
          <div className="mt-4 rounded-2xl border border-accent-400/30 bg-accent-400/10 p-4 text-sm text-accent-600">
            Tournament enrollment is currently unavailable because this tournament is {tournament?.status?.toLowerCase() || "not open"} or enrollment is closed by the admin.
          </div>
        )}
      </section>

      {isTournamentAdmin && (
        <section className="app-card p-6">
          <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Tournament Controls</h2>
          <p className="mt-1 text-sm text-surface-600">Manage tournament status and winner details.</p>

          <form className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={onUpdateStatus}>
            <select
              value={statusForm.status}
              onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
              className="px-3 py-2.5 text-sm"
            >
              {statusOptions.map((status) => (
                <option key={status} value={status}>
                  {status}
                </option>
              ))}
            </select>

            <select
              value={statusForm.enrollmentStatus}
              onChange={(e) => setStatusForm((p) => ({ ...p, enrollmentStatus: e.target.value }))}
              className="px-3 py-2.5 text-sm"
            >
              {enrollmentOptions.map((state) => (
                <option key={state} value={state}>
                  Enrollment {state}
                </option>
              ))}
            </select>

            <select
              value={statusForm.winnerClubId}
              onChange={(e) => setStatusForm((p) => ({ ...p, winnerClubId: e.target.value }))}
              className="px-3 py-2.5 text-sm"
            >
              <option value="">Winner club (optional)</option>
              {acceptedRegistrations.map((r) => (
                <option key={r.registrationId} value={r.clubId}>
                  {r.club?.name}
                </option>
              ))}
            </select>

            <select
              value={statusForm.runnerUpClubId}
              onChange={(e) => setStatusForm((p) => ({ ...p, runnerUpClubId: e.target.value }))}
              className="px-3 py-2.5 text-sm"
            >
              <option value="">Runner-up club (optional)</option>
              {acceptedRegistrations.map((r) => (
                <option key={`${r.registrationId}-runner`} value={r.clubId}>
                  {r.club?.name}
                </option>
              ))}
            </select>

            <MotionButton
              type="submit"
              disabled={statusLoading}
              className="md:col-span-4 btn-primary py-2.5 text-sm disabled:opacity-60"
            >
              {statusLoading ? "Updating..." : "Update Tournament Status"}
            </MotionButton>
          </form>
        </section>
      )}
    </div>
  );
}
