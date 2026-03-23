import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import { toast } from "sonner";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import ClubListCard from "../../components/Club/ClubListCard";
import EditTournament from "./Components/EditTournament";
import JoinTournamentForm from "./Components/JoinTournamentForm";
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
import { pageVariants, MotionButton } from "../../components/ui/motion";

const STATUS_OPTIONS = ["UPCOMING", "ONGOING", "FINISHED", "CANCELLED"];
const ENROLLMENT_OPTIONS = ["OPEN", "CLOSED"];

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
    paymentMode: "PAY_NOW",
  });
  const [joinLoading, setJoinLoading] = useState(false);

  const [statusForm, setStatusForm] = useState({
    status: "UPCOMING",
    enrollmentStatus: "OPEN",
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
      enrollmentStatus: tournamentDetails?.enrollmentStatus || "OPEN",
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
      // Keep current state
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

  const canJoinByTournamentState =
    tournament?.enrollmentStatus !== "CLOSED" &&
    !["FINISHED", "CANCELLED"].includes(tournament?.status);

  const canSubmitJoinRequest =
    canJoinByTournamentState &&
    adminClubs.some((club) => !joinedClubIds.has(club.clubId));

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
      toast.success("Tournament updated successfully");
    } catch (err) {
      setError(err?.message || "Failed to update tournament");
      toast.error(err?.message || "Failed to update tournament");
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
        if (joinForm.paymentMode === "PAY_NOW") {
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
          const customerName = `${currentUser?.firstName || ""} ${currentUser?.lastName || ""}`.trim() || "Club Admin";
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
      }
      const response = await joinTournament(tournamentId, {
        clubId: Number(joinForm.clubId),
        notes: joinForm.notes,
        paymentReference: joinForm.paymentReference || null,
      });
      setSuccess(
        response?.registration?.status === "ACCEPTED"
          ? "Payment confirmed. Your club is enrolled in this tournament."
          : "Join request submitted. Tournament admin will review it.",
      );
      toast.success("Join request submitted");
      setJoinForm({ clubId: "", notes: "", paymentReference: "", paymentGateway: "esewa", paymentMode: "PAY_NOW" });
      await loadTournament();
    } catch (err) {
      setError(err?.error || err?.message || "Failed to submit join request");
      toast.error(err?.error || err?.message || "Failed to submit join request");
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
      toast.success(`Request ${action === "APPROVE" ? "approved" : "declined"}.`);
      await refreshRegistrations();
      await loadTournament();
    } catch (err) {
      setError(err?.error || err?.message || "Failed to review request");
      toast.error(err?.error || err?.message || "Failed to review request");
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
        enrollmentStatus: statusForm.enrollmentStatus,
        winnerClubId: statusForm.winnerClubId ? Number(statusForm.winnerClubId) : null,
        runnerUpClubId: statusForm.runnerUpClubId ? Number(statusForm.runnerUpClubId) : null,
      });
      setSuccess("Tournament status updated.");
      toast.success("Tournament status updated");
      await loadTournament();
    } catch (err) {
      setError(err?.error || err?.message || "Failed to update status");
      toast.error(err?.error || err?.message || "Failed to update status");
    } finally {
      setStatusLoading(false);
    }
  };

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "join", label: "Join Tournament", icon: "🤝", hide: !canSubmitJoinRequest },
    { id: "clubs", label: "Clubs", icon: "👥" },
    { id: "requests", label: "Join Requests", icon: "📬", adminOnly: true },
    { id: "schedules", label: "Schedules", icon: "🗓️" },
    { id: "topPlayers", label: "Top Players", icon: "🏆" },
    { id: "topClubs", label: "Top Clubs", icon: "🥇" },
  ].filter((tab) => (!tab.adminOnly || isTournamentAdmin) && !tab.hide);

  return (
    <div className="flex min-h-screen bg-gray-50 exclude-link-pointer">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="flex-1 p-6 md:p-8 overflow-auto"
        >
          <MotionButton
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold text-sm"
          >
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </MotionButton>

          {error && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-4 rounded-xl border border-red-200 bg-red-50 p-4 text-sm text-red-700">
              {error}
            </motion.div>
          )}
          {success && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-4 rounded-xl border border-primary-200 bg-primary-50 p-4 text-sm text-primary-700">
              {success}
            </motion.div>
          )}

          {loading && (
            <div className="flex items-center gap-3 text-surface-500">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading tournament...
            </div>
          )}
          {!loading && !tournament && <div className="text-surface-500">Tournament not found.</div>}

          {tournament && (
            <>
              {/* Tournament Header */}
              <motion.div
                layoutId={`tournament-card-${tournament.tournamentId}`}
                className="mb-6 app-card p-6"
              >
                <div className="flex flex-wrap items-start justify-between gap-5">
                  <div className="flex items-start gap-4 md:gap-5">
                    <div className="h-14 w-14 md:h-16 md:w-16 rounded-2xl bg-gradient-to-br from-primary-600 to-primary-700 flex items-center justify-center text-white shadow-lg shadow-primary-600/20">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
                    </div>
                    <div>
                      <h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Outfit']">{tournament.name}</h1>
                      <p className="mt-2 max-w-3xl text-sm text-surface-600">{tournament.description || "No description."}</p>
                      <div className="mt-3 flex flex-wrap gap-2 text-xs font-semibold uppercase tracking-wide">
                        <span className="rounded-full bg-primary-50 px-3 py-1 border border-primary-200 text-primary-700">{tournament.status}</span>
                        <span className="rounded-full bg-surface-50 px-3 py-1 border border-surface-200 text-surface-600">Enrollment {tournament.enrollmentStatus || "OPEN"}</span>
                        <span className="rounded-full bg-blue-50 px-3 py-1 border border-blue-200 text-blue-700">{tournament.format}</span>
                        <span className="rounded-full bg-surface-50 px-3 py-1 border border-surface-200 text-surface-600">{tournament.location}</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {canSubmitJoinRequest && (
                      <MotionButton
                        onClick={() => setActiveTab("join")}
                        className="btn-primary rounded-xl px-4 py-2 text-sm"
                      >
                        Join Tournament
                      </MotionButton>
                    )}
                    {isTournamentOwner && (
                      <MotionButton
                        onClick={() => setIsEditTournamentOpen(true)}
                        className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
                      >
                        Edit Tournament
                      </MotionButton>
                    )}
                    {isTournamentAdmin && (
                      <MotionButton
                        onClick={() => setIsCreateScheduleOpen(true)}
                        className="btn-primary rounded-xl px-4 py-2 text-sm"
                      >
                        Create Schedule
                      </MotionButton>
                    )}
                  </div>
                </div>
              </motion.div>

              {/* Stats Cards */}
              <div className="mb-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                {[
                  { label: 'Joined Clubs', value: acceptedRegistrations.length },
                  { label: 'Pending Requests', value: pendingRegistrations.length },
                  { label: 'Schedules', value: tournamentSchedules.length },
                  { label: 'Entry Fee', value: Number(tournament.entryFee || 0) > 0 ? `NPR ${tournament.entryFee}` : 'Free' },
                ].map((stat) => (
                  <div key={stat.label} className="app-card p-4">
                    <div className="text-xs text-surface-500 font-medium">{stat.label}</div>
                    <div className="mt-1 text-2xl font-bold text-gray-900 font-['Outfit']">{stat.value}</div>
                  </div>
                ))}
              </div>

              {/* Tabs */}
              <div className="mb-6">
                <div className="inline-flex flex-wrap gap-1 rounded-2xl border border-surface-200 bg-surface-100 p-1">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`relative rounded-xl px-4 py-2 text-sm font-semibold transition-colors ${
                        activeTab === tab.id ? "text-primary-700" : "text-surface-600 hover:text-gray-900"
                      }`}
                    >
                      {activeTab === tab.id && (
                        <motion.span
                          layoutId="tournament-details-tab-pill"
                          transition={{ type: "spring", stiffness: 360, damping: 30 }}
                          className="absolute inset-0 rounded-xl bg-white shadow-sm"
                        />
                      )}
                      <span className="relative z-10 flex items-center gap-2">
                        <span>{tab.icon}</span>
                        <span>{tab.label}</span>
                      </span>
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
              <motion.div
                key={activeTab}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                transition={{ duration: 0.2 }}
              >
              {activeTab === "overview" && (
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
                        <MotionButton
                          onClick={() => setActiveTab("join")}
                          className="btn-primary rounded-xl px-4 py-2 text-sm"
                        >
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
                      <p className="mt-1 text-sm text-surface-600">
                        Manage tournament status and winner details.
                      </p>

                      <form className="mt-4 grid grid-cols-1 md:grid-cols-4 gap-4" onSubmit={handleUpdateStatus}>
                        <select
                          value={statusForm.status}
                          onChange={(e) => setStatusForm((p) => ({ ...p, status: e.target.value }))}
                          className="px-3 py-2.5 text-sm"
                        >
                          {STATUS_OPTIONS.map((status) => (
                            <option key={status} value={status}>{status}</option>
                          ))}
                        </select>

                        <select
                          value={statusForm.enrollmentStatus}
                          onChange={(e) => setStatusForm((p) => ({ ...p, enrollmentStatus: e.target.value }))}
                          className="px-3 py-2.5 text-sm"
                        >
                          {ENROLLMENT_OPTIONS.map((state) => (
                            <option key={state} value={state}>Enrollment {state}</option>
                          ))}
                        </select>

                        <select
                          value={statusForm.winnerClubId}
                          onChange={(e) => setStatusForm((p) => ({ ...p, winnerClubId: e.target.value }))}
                          className="px-3 py-2.5 text-sm"
                        >
                          <option value="">Winner club (optional)</option>
                          {acceptedRegistrations.map((r) => (
                            <option key={r.registrationId} value={r.clubId}>{r.club?.name}</option>
                          ))}
                        </select>

                        <select
                          value={statusForm.runnerUpClubId}
                          onChange={(e) => setStatusForm((p) => ({ ...p, runnerUpClubId: e.target.value }))}
                          className="px-3 py-2.5 text-sm"
                        >
                          <option value="">Runner-up club (optional)</option>
                          {acceptedRegistrations.map((r) => (
                            <option key={`${r.registrationId}-runner`} value={r.clubId}>{r.club?.name}</option>
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
              )}

              {activeTab === "join" && (
                <JoinTournamentForm
                  tournament={tournament}
                  adminClubs={adminClubs}
                  joinedClubIds={joinedClubIds}
                  joinForm={joinForm}
                  setJoinForm={setJoinForm}
                  joinLoading={joinLoading}
                  onSubmit={handleJoinTournament}
                  canSubmitJoinRequest={canSubmitJoinRequest}
                  canJoinByTournamentState={canJoinByTournamentState}
                />
              )}

              {activeTab === "clubs" && (
                <section className="app-card p-6">
                  <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Joined Clubs</h2>
                  {acceptedRegistrations.length === 0 ? (
                    <p className="mt-3 text-sm text-surface-600">No clubs have been approved yet.</p>
                  ) : (
                    <div className="mt-4 space-y-4">
                      {acceptedRegistrations.map((r) => (
                        <ClubListCard
                          key={r.registrationId}
                          club={{
                            ...r.club,
                            foundedDate: r.club?.foundedDate,
                          }}
                          showRole={false}
                          showFounded={false}
                          onClick={() => navigate(`/club/${r.clubId}`)}
                          metaLines={[
                            ...(isTournamentAdmin
                              ? [{ label: "Payment", value: r.paymentStatus || "PENDING" }]
                              : []),
                            ...(r.notes
                              ? [{ label: "Note", value: r.notes }]
                              : []),
                          ]}
                        />
                      ))}
                    </div>
                  )}
                </section>
              )}

              {activeTab === "requests" && isTournamentAdmin && (
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
                            {registration.notes && (
                              <p className="mt-1 text-xs text-surface-600">{registration.notes}</p>
                            )}
                          </div>
                          <div className="flex gap-2">
                            <MotionButton
                              onClick={() => handleReviewRegistration(registration.registrationId, "APPROVE")}
                              className="btn-primary rounded-xl px-3 py-2 text-xs"
                            >
                              Approve
                            </MotionButton>
                            <MotionButton
                              onClick={() => handleReviewRegistration(registration.registrationId, "DECLINE")}
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
              )}

              {activeTab === "schedules" && (
                <section className="space-y-4">
                  {isTournamentAdmin && (
                    <div className="app-card p-6">
                      <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Create Tournament Schedule</h2>
                      <p className="mt-1 text-sm text-surface-600">Create match schedules directly from this tournament with both clubs selected from accepted registrations.</p>
                      <MotionButton
                        onClick={() => setIsCreateScheduleOpen(true)}
                        className="btn-primary mt-4 rounded-xl px-4 py-2 text-sm"
                      >
                        Open Create Schedule
                      </MotionButton>
                    </div>
                  )}

                  <div className="app-card p-6">
                    <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Tournament Matches</h2>
                    {tournamentSchedules.length === 0 ? (
                      <p className="mt-3 text-sm text-surface-600">No schedules created yet.</p>
                    ) : (
                      <div className="mt-4 space-y-3">
                        {tournamentSchedules.map((schedule) => (
                          <div
                            key={schedule.scheduleId}
                            onClick={() => navigate(`/schedule/${schedule.scheduleId}`)}
                            className="cursor-pointer rounded-xl border border-surface-200 p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
                          >
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <div className="font-semibold text-gray-900">
                                {schedule.teamOne?.name || `Club ${schedule.teamOneId}`} vs {schedule.teamTwo?.name || `Club ${schedule.teamTwoId}`}
                              </div>
                              <div className="text-xs font-medium text-surface-500 bg-surface-100 px-2.5 py-1 rounded-full">{schedule.scheduleStatus}</div>
                            </div>
                            <div className="mt-1 text-xs text-surface-500">
                              {schedule.date ? new Date(schedule.date).toLocaleString() : "TBD"} at {schedule.location}
                            </div>
                            {schedule.match && (
                              <div className="mt-2 text-sm font-bold text-gray-900 font-['Outfit']">
                                Score: {schedule.match.teamOneGoals} - {schedule.match.teamTwoGoals}
                              </div>
                            )}
                            <p className="mt-2 text-xs font-semibold text-primary-700">Open Schedule Details →</p>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </section>
              )}

              {activeTab === "topPlayers" && (
                <section className="app-card p-6">
                  <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Top Players</h2>
                  <p className="mt-1 text-sm text-surface-600">Tournament-specific leaderboard by goals and assists.</p>
                  {topPlayers.length === 0 ? (
                    <p className="mt-3 text-sm text-surface-600">No player stats available yet.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="table-premium w-full min-w-[520px] text-sm">
                        <thead>
                          <tr className="border-b-2 border-surface-200 text-left text-xs uppercase tracking-wide text-surface-500">
                            <th className="py-3 pr-4">Player</th>
                            <th className="py-3 pr-4">Club</th>
                            <th className="py-3 pr-4">Goals</th>
                            <th className="py-3">Assists</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topPlayers.map((player) => (
                            <tr key={`${player.userId}-${player.clubId}`} className="border-b border-surface-100 hover:bg-primary-50/30 transition-colors">
                              <td className="py-3 pr-4 font-semibold text-gray-900">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/player/${player.userId}`)}
                                  className="text-left text-primary-700 hover:text-primary-800 hover:underline"
                                >
                                  {player.firstName} {player.lastName}
                                </button>
                              </td>
                              <td className="py-3 pr-4 text-surface-600">
                                <button
                                  type="button"
                                  onClick={() => navigate(`/club/${player.clubId}`)}
                                  className="text-left text-primary-700 hover:text-primary-800 hover:underline"
                                >
                                  {player.clubName || `Club ${player.clubId}`}
                                </button>
                              </td>
                              <td className="py-3 pr-4 font-bold text-gray-900">{player.goals}</td>
                              <td className="py-3 font-bold text-gray-900">{player.assists}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}

              {activeTab === "topClubs" && (
                <section className="app-card p-6">
                  <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Top Clubs</h2>
                  <p className="mt-1 text-sm text-surface-600">Tournament table generated from completed match scores.</p>
                  {topClubs.length === 0 ? (
                    <p className="mt-3 text-sm text-surface-600">No club standings available yet.</p>
                  ) : (
                    <div className="mt-4 overflow-x-auto">
                      <table className="table-premium w-full min-w-[700px] text-sm">
                        <thead>
                          <tr className="border-b-2 border-surface-200 text-left text-xs uppercase tracking-wide text-surface-500">
                            <th className="py-3 pr-4">Club</th>
                            <th className="py-3 pr-4">P</th>
                            <th className="py-3 pr-4">W</th>
                            <th className="py-3 pr-4">D</th>
                            <th className="py-3 pr-4">L</th>
                            <th className="py-3 pr-4">GF</th>
                            <th className="py-3 pr-4">GA</th>
                            <th className="py-3">Pts</th>
                          </tr>
                        </thead>
                        <tbody>
                          {topClubs.map((club) => (
                            <tr
                              key={club.clubId}
                              onClick={() => navigate(`/club/${club.clubId}`)}
                              className="border-b border-surface-100 cursor-pointer hover:bg-primary-50/30 transition-colors"
                            >
                              <td className="py-3 pr-4 font-semibold text-gray-900">{club.clubName}</td>
                              <td className="py-3 pr-4 text-surface-700">{club.played}</td>
                              <td className="py-3 pr-4 text-surface-700">{club.wins}</td>
                              <td className="py-3 pr-4 text-surface-700">{club.draws}</td>
                              <td className="py-3 pr-4 text-surface-700">{club.losses}</td>
                              <td className="py-3 pr-4 text-surface-700">{club.goalsFor}</td>
                              <td className="py-3 pr-4 text-surface-700">{club.goalsAgainst}</td>
                              <td className="py-3 font-bold text-primary-700">{club.points}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </section>
              )}
              </motion.div>
              </AnimatePresence>
            </>
          )}
        </motion.main>
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
