import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import EditTournament from "./Components/EditTournament";
import CreateSchedule from "../Schedule/Components/CreateSchedule";
import {
  getTournamentById,
  updateTournament,
  joinTournament,
  getTournamentRegistrations,
  reviewTournamentRegistration,
  updateTournamentStatus,
} from "../../services/api.tournaments";
import { initiatePayment } from "../../services/api.payments";
import { getAdminClubs } from "../../services/api.clubs";

const STATUS_OPTIONS = ["UPCOMING", "ONGOING", "FINISHED", "CANCELLED"];

export default function TournamentDetails() {
  const { tournamentId } = useParams();
  const navigate = useNavigate();

  const currentUser = JSON.parse(localStorage.getItem("user") || "{}");

  const [tournament, setTournament] = useState(null);
  const [adminClubs, setAdminClubs] = useState([]);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [activeTab, setActiveTab] = useState("overview");
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false);
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false);

  const [joinForm, setJoinForm] = useState({
    clubId: "",
    notes: "",
    paymentReference: "",
    paymentGateway: "esewa",
  });
  const [joinLoading, setJoinLoading] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: "UPCOMING",
    winnerClubId: "",
    runnerUpClubId: "",
  });
  const [statusLoading, setStatusLoading] = useState(false);

  const loadTournament = async () => {
    if (!tournamentId) return;

    const [tournamentDetails, clubs] = await Promise.all([
      getTournamentById(tournamentId),
      getAdminClubs().catch(() => []),
    ]);

    setTournament(tournamentDetails);
    setAdminClubs(Array.isArray(clubs) ? clubs : []);

    const owner = tournamentDetails?.createdBy === currentUser?.id;
    const adminIds = Array.isArray(tournamentDetails?.admins)
      ? tournamentDetails.admins.map((a) => a.userId)
      : [];
    const admin = owner || adminIds.includes(currentUser?.id);

    const regs = admin
      ? await getTournamentRegistrations(tournamentId).catch(() => tournamentDetails?.registrations || [])
      : tournamentDetails?.registrations || [];
    setRegistrations(Array.isArray(regs) ? regs : []);

    setStatusForm({
      status: tournamentDetails?.status || "UPCOMING",
      winnerClubId: tournamentDetails?.winnerClubId ? String(tournamentDetails.winnerClubId) : "",
      runnerUpClubId: tournamentDetails?.runnerUpClubId ? String(tournamentDetails.runnerUpClubId) : "",
    });
  };

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        await loadTournament();
      } catch (err) {
        setError(err?.message || "Failed to load tournament");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [tournamentId]);

  const refreshRegistrations = async () => {
    if (!tournamentId) return;
    try {
      const regs = await getTournamentRegistrations(tournamentId);
      setRegistrations(Array.isArray(regs) ? regs : []);
    } catch {
      // Keep current state if request is forbidden for non-admin users.
    }
  };

  const tournamentAdminIds = useMemo(
    () => (Array.isArray(tournament?.admins) ? tournament.admins.map((a) => a.userId) : []),
    [tournament],
  );

  const isTournamentOwner = tournament?.createdBy === currentUser?.id;
  const isTournamentAdmin = isTournamentOwner || tournamentAdminIds.includes(currentUser?.id);

  const acceptedRegistrations = useMemo(
    () => registrations.filter((r) => r.status === "ACCEPTED"),
    [registrations],
  );
  const pendingRegistrations = useMemo(
    () => registrations.filter((r) => r.status === "PENDING"),
    [registrations],
  );

  const joinedClubIds = useMemo(
    () => new Set(acceptedRegistrations.map((r) => r.clubId)),
    [acceptedRegistrations],
  );

  const canSubmitJoinRequest = adminClubs.some((club) => !joinedClubIds.has(club.clubId));

  const tournamentSchedules = useMemo(
    () => (Array.isArray(tournament?.schedules) ? tournament.schedules : []),
    [tournament],
  );

  const topPlayers = useMemo(
    () => (Array.isArray(tournament?.topPlayers) ? tournament.topPlayers : []),
    [tournament],
  );

  const topClubs = useMemo(
    () => (Array.isArray(tournament?.topClubs) ? tournament.topClubs : []),
    [tournament],
  );

  const handleEditTournament = async (formData) => {
    if (!tournamentId) return;

    try {
      const entryFeeNum = formData.entryFee
        ? parseInt(String(formData.entryFee).replace(/\D/g, ""), 10) || 0
        : 0;

      await updateTournament(tournamentId, {
        name: formData.tournamentName,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        entryFee: entryFeeNum,
        format: formData.format,
        status: formData.status || tournament?.status,
      });

      await loadTournament();
      setIsEditTournamentOpen(false);
      setSuccess("Tournament updated successfully.");
    } catch (err) {
      setError(err?.message || "Failed to update tournament");
    }
  };

  const handleJoinTournament = async (e) => {
    e.preventDefault();
    if (!tournamentId || !joinForm.clubId) return;

    setJoinLoading(true);
    setError(null);
    setSuccess(null);

    try {
      const entryFee = Number(tournament?.entryFee || 0);

      if (entryFee > 0) {
        const productId = `tour-${tournamentId}-club-${joinForm.clubId}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;

        sessionStorage.setItem(
          "pending_tournament_join",
          JSON.stringify({
            tournamentId: Number(tournamentId),
            clubId: Number(joinForm.clubId),
            notes: joinForm.notes,
            paymentReference: productId,
          }),
        );

        const customerName = `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() ||
          "Club Admin";

        const paymentResponse = await initiatePayment({
          amount: entryFee,
          productId,
          paymentGateway: joinForm.paymentGateway,
          customerEmail: currentUser?.email,
          customerName,
          customerPhone: currentUser?.phone || currentUser?.Phone || "9800000000",
          productName: `Tournament Registration - ${tournament?.name || `Tournament ${tournamentId}`}`,
        });

        if (!paymentResponse?.paymentUrl) {
          throw new Error("Payment URL is invalid. Please try again.");
        }

        window.location.href = paymentResponse.paymentUrl;
        return;
      }

      await joinTournament(tournamentId, {
        clubId: Number(joinForm.clubId),
        notes: joinForm.notes,
        paymentReference: joinForm.paymentReference || null,
      });
      setSuccess("Join request submitted. Tournament admin will review it.");
      setJoinForm({
        clubId: "",
        notes: "",
        paymentReference: "",
        paymentGateway: "esewa",
      });
      await loadTournament();
    } catch (err) {
      setError(err?.error || err?.message || "Failed to submit join request");
    } finally {
      setJoinLoading(false);
    }
  };

  const handleReviewRegistration = async (registrationId, action) => {
    setError(null);
    setSuccess(null);

    try {
      await reviewTournamentRegistration(registrationId, { action });
      setSuccess(`Request ${action === "APPROVE" ? "approved" : "declined"}.`);
      await refreshRegistrations();
      await loadTournament();
    } catch (err) {
      setError(err?.error || err?.message || "Failed to review request");
    }
  };

  const handleUpdateStatus = async (e) => {
    e.preventDefault();
    if (!tournamentId) return;

    setStatusLoading(true);
    setError(null);
    setSuccess(null);

    try {
      await updateTournamentStatus(tournamentId, {
        status: statusForm.status,
        winnerClubId: statusForm.winnerClubId ? Number(statusForm.winnerClubId) : null,
        runnerUpClubId: statusForm.runnerUpClubId ? Number(statusForm.runnerUpClubId) : null,
      });

      setSuccess("Tournament status updated.");
      await loadTournament();
    } catch (err) {
      setError(err?.error || err?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview" },
    { id: "clubs", label: "Clubs" },
    { id: "requests", label: "Join Requests", adminOnly: true },
    { id: "schedules", label: "Schedules" },
    { id: "topPlayers", label: "Top Players" },
    { id: "topClubs", label: "Top Clubs" },
  ].filter((tab) => !tab.adminOnly || isTournamentAdmin);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 inline-flex items-center gap-2 text-sm font-semibold text-slate-700 hover:text-slate-900"
          >
            Back
          </button>

          {error && (
            <div className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </div>
          )}
          {success && (
            <div className="mb-4 rounded-xl border border-green-200 bg-green-50 p-4 text-sm text-green-700">
              {success}
            </div>
          )}

          {loading && <div className="text-gray-500">Loading tournament...</div>}
          {!loading && !tournament && <div className="text-gray-500">Tournament not found.</div>}

          {tournament && (
            <>
              <div className="mb-6 flex flex-wrap items-start justify-between gap-4">
                <div>
                  <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                  <p className="mt-2 max-w-3xl text-sm text-gray-600">{tournament.description || "No description."}</p>
                  <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide text-gray-600">
                    <span className="rounded-full bg-white px-3 py-1 border border-gray-200">{tournament.status}</span>
                    <span className="rounded-full bg-white px-3 py-1 border border-gray-200">{tournament.format}</span>
                    <span className="rounded-full bg-white px-3 py-1 border border-gray-200">{tournament.location}</span>
                  </div>
                </div>

                {isTournamentOwner && (
                  <button
                    onClick={() => setIsEditTournamentOpen(true)}
                    className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800"
                  >
                    Edit Tournament
                  </button>
                )}
                {isTournamentAdmin && (
                  <button
                    onClick={() => setIsCreateScheduleOpen(true)}
                    className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                  >
                    Create Schedule
                  </button>
                )}
              </div>

              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="text-xs text-gray-500">Joined Clubs</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{acceptedRegistrations.length}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="text-xs text-gray-500">Pending Requests</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{pendingRegistrations.length}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="text-xs text-gray-500">Schedules</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">{tournamentSchedules.length}</div>
                </div>
                <div className="rounded-xl border border-gray-100 bg-white p-4">
                  <div className="text-xs text-gray-500">Entry Fee</div>
                  <div className="mt-1 text-2xl font-bold text-gray-900">
                    {Number(tournament.entryFee || 0) > 0 ? `NPR ${tournament.entryFee}` : "Free"}
                  </div>
                </div>
              </div>

              <div className="mb-6 flex flex-wrap gap-2 rounded-xl border border-gray-200 bg-white p-2">
                {tabs.map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
                      activeTab === tab.id
                        ? "bg-slate-900 text-white"
                        : "text-gray-600 hover:bg-gray-100 hover:text-gray-900"
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {activeTab === "overview" && (
                <div className="space-y-6">
                  <section className="rounded-xl border border-gray-100 bg-white p-6">
                    <h2 className="text-lg font-bold text-gray-900">Register Your Club</h2>
                    <p className="mt-1 text-sm text-gray-600">
                      Any club where you are a creator/admin can request to join this tournament.
                    </p>
                    <p className="mt-2 rounded-lg bg-amber-50 border border-amber-200 p-3 text-sm text-amber-800">
                      Paid tournaments require payment before your club join request is submitted.
                    </p>

                    {canSubmitJoinRequest ? (
                      <form className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleJoinTournament}>
                        <select
                          required
                          value={joinForm.clubId}
                          onChange={(e) => setJoinForm((p) => ({ ...p, clubId: e.target.value }))}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                        {Number(tournament.entryFee || 0) > 0 && (
                          <select
                            value={joinForm.paymentGateway}
                            onChange={(e) =>
                              setJoinForm((p) => ({
                                ...p,
                                paymentGateway: e.target.value,
                              }))
                            }
                            className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          >
                            <option value="esewa">eSewa</option>
                            <option value="khalti">Khalti</option>
                          </select>
                        )}
                        <input
                          type="text"
                          value={joinForm.paymentReference}
                          onChange={(e) => setJoinForm((p) => ({ ...p, paymentReference: e.target.value }))}
                          placeholder="Payment reference (only for free/manual override)"
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        />
                        <textarea
                          value={joinForm.notes}
                          onChange={(e) => setJoinForm((p) => ({ ...p, notes: e.target.value }))}
                          placeholder="Message to tournament admin"
                          className="md:col-span-2 rounded-lg border border-gray-300 px-3 py-2 text-sm"
                          rows={3}
                        />
                        <button
                          type="submit"
                          disabled={joinLoading}
                          className="md:col-span-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {joinLoading
                            ? "Processing..."
                            : Number(tournament.entryFee || 0) > 0
                              ? "Proceed to Payment"
                              : "Submit Join Request"}
                        </button>
                      </form>
                    ) : (
                      <p className="mt-4 text-sm text-gray-600">
                        You do not have any eligible club for this tournament or all your admin clubs are already enrolled/requested.
                      </p>
                    )}
                  </section>

                  {isTournamentAdmin && (
                    <section className="rounded-xl border border-gray-100 bg-white p-6">
                      <h2 className="text-lg font-bold text-gray-900">Tournament Controls</h2>
                      <p className="mt-1 text-sm text-gray-600">
                        Manage tournament status and winner details.
                      </p>

                      <form className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4" onSubmit={handleUpdateStatus}>
                        <select
                          value={statusForm.status}
                          onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>
                              {status}
                            </option>
                          ))}
                        </select>

                        <select
                          value={statusForm.winnerClubId}
                          onChange={(e) => setStatusForm((p) => ({ ...p, winnerClubId: e.target.value }))}
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
                          className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
                        >
                          <option value="">Runner-up club (optional)</option>
                          {acceptedRegistrations.map((r) => (
                            <option key={`${r.registrationId}-runner`} value={r.clubId}>
                              {r.club?.name}
                            </option>
                          ))}
                        </select>

                        <button
                          type="submit"
                          disabled={statusLoading}
                          className="md:col-span-3 rounded-lg bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-800 disabled:opacity-60"
                        >
                          {statusLoading ? "Updating..." : "Update Tournament Status"}
                        </button>
                      </form>
                    </section>
                  )}
                </div>
              )}

              {activeTab === "clubs" && (
                <section className="rounded-xl border border-gray-100 bg-white p-6">
                  <h2 className="text-lg font-bold text-gray-900">Joined Clubs</h2>
                  {acceptedRegistrations.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-600">No clubs have been approved yet.</p>
                  ) : (
                    <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-3">
                      {acceptedRegistrations.map((r) => (
                        <div key={r.registrationId} className="rounded-lg border border-gray-200 p-4">
                          <div className="font-semibold text-gray-900">{r.club?.name || `Club ${r.clubId}`}</div>
                          <div className="mt-1 text-xs text-gray-500">Payment: {r.paymentStatus}</div>
                          {r.notes && <p className="mt-2 text-xs text-gray-600">{r.notes}</p>}
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "requests" && isTournamentAdmin && (
                <section className="rounded-xl border border-gray-100 bg-white p-6">
                  <h2 className="text-lg font-bold text-gray-900">Join Requests</h2>
                  <p className="mt-1 text-sm text-gray-600">Review club requests and approve or decline.</p>

                  {pendingRegistrations.length === 0 ? (
                    <p className="mt-4 text-sm text-gray-600">No pending requests.</p>
                  ) : (
                    <div className="mt-4 space-y-3">
                      {pendingRegistrations.map((registration) => (
                        <div
                          key={registration.registrationId}
                          className="rounded-lg border border-gray-200 p-4 flex flex-col md:flex-row md:items-center md:justify-between gap-3"
                        >
                          <div>
                            <div className="font-semibold text-gray-900">{registration.club?.name || `Club ${registration.clubId}`}</div>
                            <div className="text-xs text-gray-500">Payment status: {registration.paymentStatus}</div>
                            {registration.notes && (
                              <p className="mt-1 text-xs text-gray-600">{registration.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleReviewRegistration(registration.registrationId, "APPROVE")}
                              className="rounded-lg bg-green-600 px-3 py-2 text-xs font-semibold text-white hover:bg-green-700"
                            >
                              Approve
                            </button>
                            <button
                              onClick={() => handleReviewRegistration(registration.registrationId, "DECLINE")}
                              className="rounded-lg bg-red-600 px-3 py-2 text-xs font-semibold text-white hover:bg-red-700"
                            >
                              Decline
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "schedules" && (
                <section className="space-y-4">
                  {isTournamentAdmin && (
                    <div className="rounded-xl border border-gray-100 bg-white p-6">
                      <h2 className="text-lg font-bold text-gray-900">Create Tournament Schedule</h2>
                      <p className="mt-1 text-sm text-gray-600">Create match schedules directly from this tournament with both clubs selected from accepted registrations.</p>
                      <button
                        onClick={() => setIsCreateScheduleOpen(true)}
                        className="mt-4 rounded-lg bg-blue-600 px-4 py-2 text-sm font-semibold text-white hover:bg-blue-700"
                      >
                        Open Create Schedule
                      </button>
                    </div>
                  )}

                  <div className="rounded-xl border border-gray-100 bg-white p-6">
                    <h2 className="text-lg font-bold text-gray-900">Tournament Matches</h2>
                    {tournamentSchedules.length === 0 ? (
                      <p className="mt-3 text-sm text-gray-600">No schedules created yet.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {tournamentSchedules.map((schedule) => (
                          <div
                            key={schedule.scheduleId}
                            onClick={() => navigate(`/schedule/${schedule.scheduleId}`)}
                            className="cursor-pointer rounded-lg border border-gray-200 p-4 hover:bg-gray-50"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-semibold text-gray-900">
                                {schedule.teamOne?.name || `Club ${schedule.teamOneId}`} vs {schedule.teamTwo?.name || `Club ${schedule.teamTwoId}`}
                              </div>
                              <div className="text-xs text-gray-500">{schedule.scheduleStatus}</div>
                            </div>
                            <div className="mt-1 text-xs text-gray-500">
                              {schedule.date ? new Date(schedule.date).toLocaleString() : "TBD"} at {schedule.location}
                            </div>
                            {schedule.match && (
                              <div className="mt-2 text-sm font-semibold text-slate-700">
                                Score: {schedule.match.teamOneGoals} - {schedule.match.teamTwoGoals}
                              </div>
                            )}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "topPlayers" && (
                <section className="rounded-xl border border-gray-100 bg-white p-6">
                  <h2 className="text-lg font-bold text-gray-900">Top Players</h2>
                  <p className="mt-1 text-sm text-gray-600">Tournament-specific leaderboard by goals and assists.</p>
                  {topPlayers.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-600">No player stats available yet.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                            <th className="py-2">Player</th>
                            <th className="py-2">Club</th>
                            <th className="py-2">Goals</th>
                            <th className="py-2">Assists</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPlayers.map((player) => (
                            <tr key={`${player.userId}-${player.clubId}`} className="border-b border-gray-100">
                              <td className="py-3 font-semibold text-gray-900">
                                {player.firstName} {player.lastName}
                              </td>
                              <td className="py-3 text-gray-600">{player.clubName || `Club ${player.clubId}`}</td>
                              <td className="py-3 text-gray-900">{player.goals}</td>
                              <td className="py-3 text-gray-900">{player.assists}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {activeTab === "topClubs" && (
                <section className="rounded-xl border border-gray-100 bg-white p-6">
                  <h2 className="text-lg font-bold text-gray-900">Top Clubs</h2>
                  <p className="mt-1 text-sm text-gray-600">Tournament table generated from completed match scores.</p>
                  {topClubs.length === 0 ? (
                    <p className="mt-3 text-sm text-gray-600">No club standings available yet.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="w-full min-w-[700px] text-sm">
                        <thead>
                          <tr className="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500">
                            <th className="py-2">Club</th>
                            <th className="py-2">P</th>
                            <th className="py-2">W</th>
                            <th className="py-2">D</th>
                            <th className="py-2">L</th>
                            <th className="py-2">GF</th>
                            <th className="py-2">GA</th>
                            <th className="py-2">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topClubs.map((club) => (
                            <tr key={club.clubId} className="border-b border-gray-100">
                              <td className="py-3 font-semibold text-gray-900">{club.clubName}</td>
                              <td className="py-3 text-gray-700">{club.played}</td>
                              <td className="py-3 text-gray-700">{club.wins}</td>
                              <td className="py-3 text-gray-700">{club.draws}</td>
                              <td className="py-3 text-gray-700">{club.losses}</td>
                              <td className="py-3 text-gray-700">{club.goalsFor}</td>
                              <td className="py-3 text-gray-700">{club.goalsAgainst}</td>
                              <td className="py-3 font-bold text-gray-900">{club.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
            </>
          )}
        </main>
      </div>

      {tournament && (
        <EditTournament
          key={tournament.tournamentId}
          isOpen={isEditTournamentOpen}
          onClose={() => setIsEditTournamentOpen(false)}
          onEditTournament={handleEditTournament}
          tournamentData={{
            id: tournament.tournamentId,
            tournamentName: tournament.name,
            description: tournament.description,
            location: tournament.location,
            format: tournament.format,
            startDate: tournament.startDate ? tournament.startDate.slice(0, 10) : "",
            endDate: tournament.endDate ? tournament.endDate.slice(0, 10) : "",
            entryFee: tournament.entryFee,
            status: tournament.status,
          }}
        />
      )}

      {tournament && isTournamentAdmin && (
        <CreateSchedule
          isOpen={isCreateScheduleOpen}
          onClose={() => setIsCreateScheduleOpen(false)}
          onCreated={async () => {
            await loadTournament();
            setSuccess("Tournament schedule created.");
          }}
          defaultCreationType="tournament"
          preselectedTournamentId={String(tournament.tournamentId)}
          lockCreationType={true}
        />
      )}
    </div>
  );
}
