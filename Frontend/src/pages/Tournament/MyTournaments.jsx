import { useState, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { useInfiniteQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
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
import { itemVariants, listVariants, MotionButton } from "../../components/ui/motion";

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
    });
    setIsEditTournamentOpen(true);
  };

  // Filter tournaments based on search and status
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
    if (value === "ONGOING") return "bg-emerald-100 text-emerald-700";
    if (value === "FINISHED") return "bg-slate-200 text-slate-700";
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
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 overflow-auto bg-[#eef1f6] p-6 md:p-8">
          {error && (
            <motion.div initial={{ x: -8, opacity: 0 }} animate={{ x: 0, opacity: 1 }} className="mb-6 rounded-xl border border-red-300 bg-red-50 p-4 text-red-700">
              {error?.message || "Failed to load tournaments"}
            </motion.div>
          )}
          {loading && <div className="mb-6 text-gray-500">Loading tournaments...</div>}
          <div className="mb-8 rounded-2xl border border-gray-100 bg-white p-6 shadow-sm">
            <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
              <div>
                <h2 className="text-3xl font-bold text-gray-900 mb-1">Tournaments</h2>
                <p className="text-sm text-gray-600">Participate in or host football tournaments</p>
              </div>
              <MotionButton
                onClick={() => setIsCreateTournamentOpen(true)}
                className="bg-green-600 text-white hover:bg-green-700 rounded-lg flex items-center gap-2 px-6 py-2 text-sm font-medium"
              >
                <svg
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                >
                  <line x1="12" y1="5" x2="12" y2="19" />
                  <line x1="5" y1="12" x2="19" y2="12" />
                </svg>
                Host Tournament
              </MotionButton>
            </div>
            <div className="mt-5 grid grid-cols-1 gap-3 sm:grid-cols-3">
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Visible Tournaments</p>
                <p className="text-xl font-bold text-gray-900">{tournaments.length}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Status Filter</p>
                <p className="text-xl font-bold text-gray-900 capitalize">{statusFilter}</p>
              </div>
              <div className="rounded-xl border border-gray-100 bg-gray-50 px-4 py-3">
                <p className="text-xs text-gray-500">Current View</p>
                <p className="text-xl font-bold text-gray-900">{currentViewLabel}</p>
              </div>
            </div>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search tournaments..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full rounded-lg border border-gray-200 bg-white py-2.5 pl-10 pr-4 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
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
              className="rounded-lg border border-gray-200 bg-white px-4 py-2.5 focus:border-blue-500 focus:ring-2 focus:ring-blue-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="finished">Finished</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex flex-wrap rounded-full bg-gray-100 p-1 border border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`relative rounded-full px-5 py-2 text-sm font-semibold whitespace-nowrap transition-colors ${
                    activeTab === tab.id
                      ? "text-gray-900"
                      : "text-gray-600 hover:text-gray-900"
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

          {activeTab === "created" ? (
            <motion.div variants={listVariants} initial="hidden" animate="visible" className="space-y-5">
              {tournaments.length === 0 && !loading && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                  No created tournaments found for the selected filters.
                </div>
              )}
              {tournaments.map((tournament) => (
                <motion.div layoutId={`tournament-card-${tournament.tournamentId}`} variants={itemVariants} key={tournament.tournamentId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-3 flex-wrap">
                        <h2 className="text-2xl font-bold text-gray-900">{tournament.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${statusClass(tournament.status)}`}>
                          {tournament.status ?? "UPCOMING"}
                        </span>
                        <span className="px-3 py-1 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 whitespace-nowrap">
                          {tournament.format ?? "Format TBD"}
                        </span>
                      </div>
                      {tournament.description && (
                        <p className="mb-4 line-clamp-2 text-sm text-gray-600">{tournament.description}</p>
                      )}
                      <div className="flex items-center gap-8 flex-wrap text-xs md:text-sm">
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">{tournament.location ?? "—"}</span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                            <line x1="16" y1="2" x2="16" y2="6" />
                            <line x1="8" y1="2" x2="8" y2="6" />
                            <line x1="3" y1="10" x2="21" y2="10" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : "—"}
                          </span>
                        </div>
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="1" x2="12" y2="23" />
                            <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {tournament.entryFee != null && tournament.entryFee > 0 ? `NPR ${tournament.entryFee}` : "Free"}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="ml-6 flex gap-2">
                      <MotionButton
                        onClick={() => openEditTournament(tournament)}
                        className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-2 text-sm font-semibold text-blue-700 hover:bg-blue-100"
                      >
                        Edit
                      </MotionButton>
                      <MotionButton
                        onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                        className="bg-slate-900 text-white hover:bg-slate-800 rounded-lg whitespace-nowrap px-6 py-2 font-medium"
                      >
                        View Details
                      </MotionButton>
                    </div>
                  </div>
                </motion.div>
              ))}
            </motion.div>
          ) : (
            <motion.div variants={listVariants} initial="hidden" animate="visible" className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
              {tournaments.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  {activeTab === "enrolled" ? "No enrolled tournaments found." : "No tournaments to browse."}
                </div>
              )}
              {tournaments.map((tournament) => (
                <motion.div layoutId={`tournament-card-${tournament.tournamentId}`} variants={itemVariants} key={tournament.tournamentId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 flex flex-col hover:shadow-md transition-shadow">
                  <div className="mb-4 flex items-center justify-between gap-2">
                    <h2 className="text-xl font-bold text-gray-900">{tournament.name}</h2>
                    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold ${statusClass(tournament.status)}`}>
                      {tournament.status ?? "UPCOMING"}
                    </span>
                  </div>
                  <span className="mb-4 inline-flex w-fit bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-semibold">{tournament.format ?? "—"}</span>
                  {tournament.description && <p className="mb-4 text-sm text-gray-600 line-clamp-2">{tournament.description}</p>}
                  <div className="space-y-3 flex-1">
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-sm text-gray-600">{tournament.location ?? "—"}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {tournament.startDate ? `Starts ${new Date(tournament.startDate).toLocaleDateString()}` : "—"}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span className="text-sm text-gray-600">
                        {tournament.entryFee != null && tournament.entryFee > 0 ? `NPR ${tournament.entryFee}` : "Free"}
                      </span>
                    </div>
                  </div>
                  <MotionButton
                    onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                    className="bg-slate-900 text-white hover:bg-slate-800 mt-6 w-full py-2 rounded-lg font-medium"
                  >
                    View Details
                  </MotionButton>
                </motion.div>
              ))}
            </motion.div>
          )}
          {activeQuery.hasNextPage && (
            <div className="mt-7 flex justify-center">
              <MotionButton
                onClick={() => activeQuery.fetchNextPage()}
                disabled={activeQuery.isFetchingNextPage}
                className="btn-secondary px-4 py-2 text-sm font-semibold"
              >
                {activeQuery.isFetchingNextPage ? "Loading more..." : "Load more"}
              </MotionButton>
            </div>
          )}
        </main>
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
