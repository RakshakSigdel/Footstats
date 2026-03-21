export default function JoinTournamentForm({
  tournament,
  adminClubs,
  joinedClubIds,
  joinForm,
  setJoinForm,
  joinLoading,
  onSubmit,
  canSubmitJoinRequest,
  canJoinByTournamentState = true,
}) {
  const isPaidTournament = Number(tournament?.entryFee || 0) > 0;

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm md:p-8">
      <div className="mb-5">
        <h2 className="text-2xl font-bold text-slate-900">Join Tournament</h2>
        <p className="mt-1 text-sm text-slate-600">
          Submit your club for enrollment in this tournament.
        </p>
      </div>

      <div className="rounded-xl border border-blue-200 bg-blue-50 p-4 text-sm text-blue-900">
        <p className="font-semibold">Enrollment flow</p>
        {isPaidTournament ? (
          <p className="mt-1">
            For paid tournaments, you can pay now for instant enrollment or submit a pending request for admin approval.
          </p>
        ) : (
          <p className="mt-1">
            This tournament is free. Your request will be reviewed by tournament admins.
          </p>
        )}
      </div>

      {canSubmitJoinRequest ? (
        <form className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-2" onSubmit={onSubmit}>
          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Club
            </label>
            <select
              required
              value={joinForm.clubId}
              onChange={(e) => setJoinForm((p) => ({ ...p, clubId: e.target.value }))}
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              <option value="">Select your club</option>
              {adminClubs
                .filter((club) => !joinedClubIds.has(club.clubId))
                .map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.name}
                  </option>
                ))}
            </select>
          </div>

          {isPaidTournament && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Enrollment Type
              </label>
              <select
                value={joinForm.paymentMode}
                onChange={(e) => setJoinForm((p) => ({ ...p, paymentMode: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="PAY_NOW">Pay now and auto-enroll</option>
                <option value="PENDING_APPROVAL">Request admin approval without payment</option>
              </select>
            </div>
          )}

          {isPaidTournament && joinForm.paymentMode === "PAY_NOW" && (
            <div>
              <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
                Payment Gateway
              </label>
              <select
                value={joinForm.paymentGateway}
                onChange={(e) => setJoinForm((p) => ({ ...p, paymentGateway: e.target.value }))}
                className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              >
                <option value="esewa">eSewa</option>
                <option value="khalti">Khalti</option>
              </select>
            </div>
          )}

          <div className="md:col-span-2">
            <label className="mb-1 block text-xs font-semibold uppercase tracking-wide text-slate-500">
              Message to Tournament Admin
            </label>
            <textarea
              value={joinForm.notes}
              onChange={(e) => setJoinForm((p) => ({ ...p, notes: e.target.value }))}
              placeholder="Share any details for your request"
              className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm"
              rows={4}
            />
          </div>

          <button
            type="submit"
            disabled={joinLoading}
            className="md:col-span-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
          >
            {joinLoading
              ? "Processing..."
              : isPaidTournament
                ? joinForm.paymentMode === "PAY_NOW"
                  ? "Proceed to Payment"
                  : "Submit Pending Request"
                : "Submit Join Request"}
          </button>
        </form>
      ) : (
        <p className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4 text-sm text-slate-600">
          {canJoinByTournamentState
            ? "You do not have any eligible club for this tournament or your clubs are already enrolled/requested."
            : "Joining is disabled right now. Tournament enrollment is closed or the tournament is finished/cancelled."}
        </p>
      )}
    </section>
  );
}
