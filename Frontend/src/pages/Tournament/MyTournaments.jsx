import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import { toast } from "sonner";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import CreateTournament from "./Components/HostTournament";
import EditTournament from "./Components/EditTournament";
import {
  getMyTournaments,
  getAllTournaments,
  getEnrolledTournaments,
  createTournament,
  updateTournament,
} from "../../services/api.tournaments";
import {
  pageVariants,
  listVariants,
  itemVariants,
  MotionButton,
  MotionCard,
} from "../../components/ui/motion";
import DynamicBackground from "../../components/ui/DynamicBackground";

export default function Tournaments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("browse");
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false);
  const [selectedTournamentData, setSelectedTournamentData] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const queryClient = useQueryClient();

  const createdQuery = useInfiniteQuery({
    queryKey: ["tournaments", "created", statusFilter],
    queryFn: ({ pageParam }) =>
      getMyTournaments({
        limit: 9,
        cursor: pageParam ?? undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.meta?.hasMore ? lastPage.meta.nextCursor : undefined),
  });

  const enrolledQuery = useInfiniteQuery({
    queryKey: ["tournaments", "enrolled", statusFilter],
    queryFn: ({ pageParam }) =>
      getEnrolledTournaments({
        limit: 9,
        cursor: pageParam ?? undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.meta?.hasMore ? lastPage.meta.nextCursor : undefined),
  });

  const browseQuery = useInfiniteQuery({
    queryKey: ["tournaments", "browse", statusFilter],
    queryFn: ({ pageParam }) =>
      getAllTournaments({
        limit: 9,
        cursor: pageParam ?? undefined,
        status: statusFilter === "all" ? undefined : statusFilter,
      }),
    initialPageParam: null,
    getNextPageParam: (lastPage) => (lastPage?.meta?.hasMore ? lastPage.meta.nextCursor : undefined),
  });

  const handleCreateTournament = async (formData) => {
    try {
      const entryFeeNum = formData.entryFee ? parseInt(String(formData.entryFee).replace(/\D/g, ""), 10) || 0 : 0;
      await createTournament({
        name: formData.tournamentName,
        description: formData.description || "",
        location: formData.location || "",
        locationLatitude: formData.locationLatitude,
        locationLongitude: formData.locationLongitude,
        locationPlaceId: formData.locationPlaceId,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : new Date().toISOString(),
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : new Date().toISOString(),
        entryFee: entryFeeNum,
        format: formData.format || "KNOCKOUT",
        status: "UPCOMING",
      });
      setIsCreateTournamentOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success("Tournament hosted successfully");
    } catch (err) {
      toast.error(err?.message || "Failed to create tournament");
      throw err;
    }
  };

  const handleEditTournament = async (formData) => {
    if (!selectedTournamentData?.id) return;
    try {
      const entryFeeNum = formData.entryFee ? parseInt(String(formData.entryFee).replace(/\D/g, ""), 10) || 0 : 0;
      await updateTournament(selectedTournamentData.id, {
        name: formData.tournamentName,
        description: formData.description,
        location: formData.location,
        locationLatitude: formData.locationLatitude,
        locationLongitude: formData.locationLongitude,
        locationPlaceId: formData.locationPlaceId,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        entryFee: entryFeeNum,
        format: formData.format,
        status: formData.status || selectedTournamentData.status,
      });
      setIsEditTournamentOpen(false);
      await queryClient.invalidateQueries({ queryKey: ["tournaments"] });
      toast.success("Tournament updated");
    } catch (err) {
      toast.error(err?.message || "Failed to update tournament");
      throw err;
    }
  };

  const openEditTournament = (tournament) => {
    setSelectedTournamentData({
      id: tournament.tournamentId,
      tournamentName: tournament.name,
      description: tournament.description,
      location: tournament.location,
      format: tournament.format,
      startDate: tournament.startDate ? tournament.startDate.slice(0, 10) : "",
      endDate: tournament.endDate ? tournament.endDate.slice(0, 10) : "",
      entryFee: tournament.entryFee,
      prizePool: tournament.prizePool,
      status: tournament.status,
      maxTeams: tournament.maxTeams,
      locationLatitude: tournament.locationLatitude,
      locationLongitude: tournament.locationLongitude,
      locationPlaceId: tournament.locationPlaceId,
    });
    setIsEditTournamentOpen(true);
  };

  const tournaments = useMemo(() => {
    const source =
      activeTab === "created"
        ? (createdQuery.data?.pages ?? []).flatMap((p) => p?.tournaments ?? [])
        : activeTab === "enrolled"
          ? (enrolledQuery.data?.pages ?? []).flatMap((p) => p?.tournaments ?? [])
          : (browseQuery.data?.pages ?? []).flatMap((p) => p?.tournaments ?? []);
    return source.filter(t => {
      const matchesSearch = !searchQuery.trim() || 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.format?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
        t.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, createdQuery.data?.pages, enrolledQuery.data?.pages, browseQuery.data?.pages, searchQuery, statusFilter]);

  const statusClass = (status) => {
    const value = String(status || "UPCOMING").toUpperCase();
    if (value === "ONGOING") return "bg-primary-100 text-primary-700";
    if (value === "FINISHED") return "bg-surface-200 text-surface-700";
    if (value === "CANCELLED") return "bg-rose-100 text-rose-700";
    return "bg-blue-100 text-blue-700";
  };

  const activeQuery =
    activeTab === "created"
      ? createdQuery
      : activeTab === "enrolled"
        ? enrolledQuery
        : browseQuery;
  const loading = activeQuery.isLoading;
  const error = activeQuery.error;

  const tabs = [
    { id: "browse", label: "Browse" },
    { id: "created", label: "Created" },
    { id: "enrolled", label: "Enrolled" },
  ];

  const currentViewLabel =
    activeTab === "created"
      ? "Created"
      : activeTab === "enrolled"
        ? "Enrolled"
        : "Browse";

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
          className="relative flex-1 overflow-auto p-6 md:p-8 bg-[#eef1f6]"
        >
          <DynamicBackground
            className="z-0"
            patternType="grid"
            patternSize={50}
            patternColor="rgba(15,23,42,0.035)"
            gradient="linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.92) 55%, rgba(236,253,245,0.88) 100%)"
            showAccents
          />
          <div className="relative z-10">
          {error && (
            <motion.div initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 rounded-xl border border-red-200 bg-red-50 p-4 text-red-700 text-sm">
              {error?.message || "Failed to load tournaments"}
            </motion.div>
          )}
          {loading && (
            <div className="mb-6 flex items-center gap-3 text-surface-500">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading tournaments...
            </div>
          )}

          {/* Hero Card */}
          <div className="app-card mb-8 p-6">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 font-['Outfit']">
                  <span className="gradient-text">Tournaments</span>
                </h2>
                <p className="text-sm text-surface-500">Participate in or host football tournaments</p>
              </div>
              <MotionButton
                onClick={() => setIsCreateTournamentOpen(true)}
                className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Host Tournament
              </MotionButton>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3">
                <p className="text-xs text-surface-500">Visible Tournaments</p>
                <p className="text-xl font-bold text-gray-900 font-['Outfit']">{tournaments.length}</p>
              </div>
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3">
                <p className="text-xs text-surface-500">Status Filter</p>
                <p className="text-xl font-bold text-gray-900 capitalize font-['Outfit']">{statusFilter}</p>
              </div>
              <div className="rounded-2xl border border-surface-200 bg-surface-50 px-4 py-3">
                <p className="text-xs text-surface-500">Current View</p>
                <p className="text-xl font-bold text-gray-900 font-['Outfit']">{currentViewLabel}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" 
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full py-2.5 pl-10 pr-4 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="px-4 py-2.5 text-sm font-medium"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex flex-wrap rounded-full bg-surface-100 p-1 border border-surface-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-gray-900"
                      : "text-surface-500 hover:text-gray-900"
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="tournament-list-tab-pill"
                      transition={{ type: "spring", stiffness: 360, damping: 28 }}
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                </button>
              ))}
            </div>
          </div>

          <AnimatePresence mode="wait">
          {activeTab === "created" ? (
            <motion.div key="created" variants={listVariants} initial="hidden" animate="visible" className="space-y-5">
              {tournaments.length === 0 && !loading && (
                <div className="app-card p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-400">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">No created tournaments</p>
                  <p className="text-sm text-surface-500">Tournaments you host will appear here.</p>
                </div>
              )}
              {tournaments.map((tournament, i) => (
                <motion.div layoutId={`tournament-card-${tournament.tournamentId}`} variants={itemVariants} key={tournament.tournamentId} className="app-card p-6">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900 font-['Outfit']">{tournament.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusClass(tournament.status)}`}>
                          {tournament.status ?? "UPCOMING"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-primary-50 text-primary-700 border border-primary-200 whitespace-nowrap">
                          {tournament.format ?? "Format TBD"}
                        </span>
                      </div>
                      {tournament.description && (
                        <p className="mb-4 line-clamp-2 text-sm text-surface-600">{tournament.description}</p>
                      )}
                      <div className="flex items-center gap-6 flex-wrap text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-surface-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="font-medium">{tournament.location ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-surface-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span className="font-medium">
                            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-surface-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          <span className="font-medium">
                            {tournament.entryFee != null && tournament.entryFee > 0 ? `NPR ${tournament.entryFee}` : "Free"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex gap-2">
                      <MotionButton
                        onClick={() => openEditTournament(tournament)}
                        className="rounded-xl border border-primary-200 bg-primary-50 px-4 py-2 text-sm font-semibold text-primary-700 hover:bg-primary-100"
                      >
                        Edit
                      </MotionButton>
                      <MotionButton
                        onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                        className="btn-primary rounded-xl whitespace-nowrap px-5 py-2 text-sm"
                      >
                        View Details
                      </MotionButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div key={activeTab} variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.length === 0 && !loading && (
                <div className="col-span-full app-card p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                    <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-400">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6M18 9h1.5a2.5 2.5 0 0 0 0-5H18M4 22h16M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-800 mb-1">
                    {activeTab === "enrolled" ? "No enrolled tournaments" : "No tournaments to browse"}
                  </p>
                  <p className="text-sm text-surface-500">Check back later for new tournaments.</p>
                </div>
              )}
              {tournaments.map((tournament, i) => (
                <motion.div layoutId={`tournament-card-${tournament.tournamentId}`} variants={itemVariants} key={tournament.tournamentId} className="app-card p-6 flex flex-col">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-gray-900 font-['Outfit'] truncate">{tournament.name}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold flex-shrink-0 ${statusClass(tournament.status)}`}>
                      {tournament.status ?? "UPCOMING"}
                    </span>
                  </div>
                  <span className="mb-4 inline-flex w-fit bg-primary-50 text-primary-700 px-3 py-1 rounded-full text-xs font-semibold border border-primary-200">{tournament.format ?? "—"}</span>
                  {tournament.description && <p className="mb-4 text-sm text-surface-600 line-clamp-2">{tournament.description}</p>}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-surface-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-sm">{tournament.location ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-surface-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-sm">
                        {tournament.startDate ? `Starts ${new Date(tournament.startDate).toLocaleDateString()}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-surface-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span className="text-sm">
                        {tournament.entryFee != null && tournament.entryFee > 0 ? `NPR ${tournament.entryFee}` : "Free"}
                      </span>
                    </div>
                  </div>
                  <MotionButton
                    onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                    className="btn-primary mt-6 w-full py-2.5 text-sm"
                  >
                    View Details
                  </MotionButton>
                </motion.div>
              ))}
            </motion.div>
          )}
          </AnimatePresence>

          {activeQuery.hasNextPage && (
            <div className="mt-7 flex justify-center">
              <MotionButton
                onClick={() => activeQuery.fetchNextPage()}
                disabled={activeQuery.isFetchingNextPage}
                className="btn-secondary px-5 py-2.5 text-sm font-semibold"
              >
                {activeQuery.isFetchingNextPage ? "Loading more..." : "Load more"}
              </MotionButton>
            </div>
          )}
          </div>
        </motion.main>
      </div>

      <CreateTournament
        isOpen={isCreateTournamentOpen}
        onClose={() => setIsCreateTournamentOpen(false)}
        onCreateTournament={handleCreateTournament}
      />

      <EditTournament
        key={selectedTournamentData?.id || "new-edit"}
        isOpen={isEditTournamentOpen}
        onClose={() => setIsEditTournamentOpen(false)}
        onEditTournament={handleEditTournament}
        tournamentData={selectedTournamentData}
      />
    </div>
  );
}
