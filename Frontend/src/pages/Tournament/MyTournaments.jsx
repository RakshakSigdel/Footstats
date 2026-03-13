import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import CreateTournament from "./Components/HostTournament";
import EditTournament from "./Components/EditTournament";
import { getMyTournaments, getAllTournaments, createTournament, updateTournament } from "../../services/api.tournaments";

export default function Tournaments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my");
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false);
  const [selectedTournamentData, setSelectedTournamentData] = useState(null);
  const [myTournaments, setMyTournaments] = useState([]);
  const [browseTournaments, setBrowseTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [my, all] = await Promise.all([
          getMyTournaments().catch(() => []),
          getAllTournaments().catch(() => []),
        ]);
        setMyTournaments(Array.isArray(my) ? my : []);
        setBrowseTournaments(Array.isArray(all) ? all : []);
      } catch (err) {
        setError(err?.message || "Failed to load tournaments");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

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
        format: formData.format || "Knockout",
        status: "Upcoming",
      });
      setIsCreateTournamentOpen(false);
      const my = await getMyTournaments();
      setMyTournaments(Array.isArray(my) ? my : []);
    } catch (err) {
      setError(err?.message || "Failed to create tournament");
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
      const my = await getMyTournaments();
      setMyTournaments(Array.isArray(my) ? my : []);
    } catch (err) {
      setError(err?.message || "Failed to update tournament");
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
    const source = activeTab === "my" ? myTournaments : browseTournaments;
    return source.filter(t => {
      const matchesSearch = !searchQuery.trim() || 
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.format?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesStatus = statusFilter === "all" || 
        t.status?.toLowerCase() === statusFilter.toLowerCase();
      return matchesSearch && matchesStatus;
    });
  }, [activeTab, myTournaments, browseTournaments, searchQuery, statusFilter]);

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
          )}
          {loading && <div className="mb-6 text-gray-500">Loading tournaments...</div>}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Tournaments
              </h2>
              <p className="text-sm text-gray-600">
                Participate in or host football tournaments
              </p>
            </div>
            <button
              onClick={() => setIsCreateTournamentOpen(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
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
            </button>
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
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
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
              className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Status</option>
              <option value="upcoming">Upcoming</option>
              <option value="ongoing">Ongoing</option>
              <option value="completed">Completed</option>
            </select>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "my"
                    ? "bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Tournaments
              </button>
              <button
                onClick={() => setActiveTab("browse")}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "browse"
                    ? "bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Browse
              </button>
            </div>
          </div>

          {activeTab === "my" ? (
            <div className="space-y-4">
              {myTournaments.length === 0 && !loading && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                  You have not hosted any tournaments yet.
                </div>
              )}
              {myTournaments.map((tournament) => (
                <div key={tournament.tournamentId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">{tournament.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${
                          tournament.status === "Active" ? "bg-slate-900 text-white" : "bg-slate-600 text-white"
                        }`}>
                          {tournament.status ?? "Upcoming"}
                        </span>
                      </div>
                      <div className="flex items-center gap-8 flex-wrap">
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
                    <button
                      onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                      className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors whitespace-nowrap ml-6"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {browseTournaments.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">No tournaments to browse.</div>
              )}
              {browseTournaments.map((tournament) => (
                <div key={tournament.tournamentId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col">
                  <h2 className="text-xl font-bold text-gray-900 mb-3">{tournament.name}</h2>
                  <div className="mb-4">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">{tournament.format ?? "—"}</span>
                  </div>
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
                  <button
                    onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                    className="mt-6 w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors"
                  >
                    View Details
                  </button>
                </div>
              ))}
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
        isOpen={isEditTournamentOpen}
        onClose={() => setIsEditTournamentOpen(false)}
        onEditTournament={handleEditTournament}
        tournamentData={selectedTournamentData}
      />
    </div>
  );
}
