import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getAllClubs, getMyClubs } from "../services/api.clubs";
import { getAllTournaments } from "../services/api.tournaments";

export default function Discover() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [clubs, setClubs] = useState([]);
  const [myClubIds, setMyClubIds] = useState(new Set());
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  const filters = ["All", "Clubs", "Tournaments", "Upcoming", "Free Entry"];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [clubsData, tournamentsData, myClubsData] = await Promise.all([
          getAllClubs().catch(() => []),
          getAllTournaments().catch(() => []),
          getMyClubs().catch(() => []),
        ]);
        setClubs(Array.isArray(clubsData) ? clubsData : []);
        setTournaments(Array.isArray(tournamentsData) ? tournamentsData : []);
        const ids = new Set((Array.isArray(myClubsData) ? myClubsData : []).map(c => c.clubId));
        setMyClubIds(ids);
      } catch (err) {
        setError(err?.message || "Failed to load discover data");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredClubs = useMemo(() => {
    if (activeFilter === "Tournaments" || activeFilter === "Upcoming" || activeFilter === "Free Entry") return [];
    return clubs.filter(club => {
      if (myClubIds.has(club.clubId)) return false;
      if (!searchQuery.trim()) return true;
      const query = searchQuery.toLowerCase();
      return club.name?.toLowerCase().includes(query) ||
        club.location?.toLowerCase().includes(query) ||
        club.description?.toLowerCase().includes(query);
    });
  }, [clubs, myClubIds, activeFilter, searchQuery]);

  const filteredTournaments = useMemo(() => {
    if (activeFilter === "Clubs") return [];
    return tournaments.filter(t => {
      const matchesSearch = !searchQuery.trim() ||
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.location?.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesFilter = 
        activeFilter === "All" || 
        activeFilter === "Tournaments" ||
        (activeFilter === "Upcoming" && t.status?.toLowerCase() === "upcoming") ||
        (activeFilter === "Free Entry" && (!t.entryFee || t.entryFee === 0));
      return matchesSearch && matchesFilter;
    });
  }, [tournaments, activeFilter, searchQuery]);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {loading && <div className="mb-6 text-gray-500">Loading...</div>}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
            <p className="text-gray-600">Find clubs and tournaments near you</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search clubs or tournaments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-12 pr-10 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery("")}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <line x1="18" y1="6" x2="6" y2="18" />
                      <line x1="6" y1="6" x2="18" y2="18" />
                    </svg>
                  </button>
                )}
              </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-slate-900 text-white"
                      : "bg-transparent text-gray-600 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Clubs Near You Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Clubs Near You</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {filteredClubs.length === 0 && !loading && (
                <div className="col-span-2 text-center py-8 text-gray-500">No clubs to show.</div>
              )}
              {filteredClubs.map((club) => (
                <div key={club.clubId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
                  </div>
                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{club.location ?? "—"}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    {club.description && <span className="text-sm text-gray-600 line-clamp-1 flex-1 mr-2">{club.description}</span>}
                    <button onClick={() => navigate(`/club/${club.clubId}`)} className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 whitespace-nowrap">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tournaments Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Tournaments</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {filteredTournaments.length === 0 && !loading && (
                <div className="col-span-3 text-center py-8 text-gray-500">No tournaments to show.</div>
              )}
              {filteredTournaments.map((tournament) => (
                <div key={tournament.tournamentId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{tournament.name}</h3>
                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{tournament.location ?? "—"}</span>
                    </div>
                    <div className="text-sm text-gray-900 font-medium">
                      {tournament.startDate ? `Starts ${new Date(tournament.startDate).toLocaleDateString()}` : "—"}
                    </div>
                    <div className="text-sm text-gray-900 font-bold">
                      {tournament.entryFee != null && tournament.entryFee > 0 ? `NPR ${tournament.entryFee}` : "Free"}
                    </div>
                  </div>
                  <button onClick={() => navigate(`/tournament/${tournament.tournamentId}`)} className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800">
                    View Details
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}