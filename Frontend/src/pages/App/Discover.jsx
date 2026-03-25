import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import DynamicBackground from "../../components/ui/DynamicBackground";
import { PageTransitionItem, pageSectionStaggerVariants } from "../../components/ui/PageTransition";
import { getAllClubs, getMyClubs } from "../../services/api.clubs";
import { getAllTournaments } from "../../services/api.tournaments";
import { getLocationRecommendations } from "../../services/api.locations";
import { Users, Trophy, MapPin, Search, X, CalendarDays } from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.4, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Discover() {
  const navigate = useNavigate();
  const [activeFilter, setActiveFilter] = useState("All");
  const [clubs, setClubs] = useState([]);
  const [myClubIds, setMyClubIds] = useState(new Set());
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [recommendationMode, setRecommendationMode] = useState(false);

  const filters = ["All", "Clubs", "Tournaments", "Upcoming", "Free Entry"];

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [recommendations, myClubsData] = await Promise.all([
          getLocationRecommendations({ radiusKm: 2000, limit: 10 }),
          getMyClubs().catch(() => []),
        ]);

        setRecommendationMode(true);
        setClubs(Array.isArray(recommendations?.clubs) ? recommendations.clubs : []);
        setTournaments(Array.isArray(recommendations?.tournaments) ? recommendations.tournaments : []);
        setMyClubIds(new Set((Array.isArray(myClubsData) ? myClubsData : []).map((c) => c.clubId)));
      } catch (err) {
        const [clubsData, tournamentsData, myClubsData] = await Promise.all([
          getAllClubs().catch(() => []),
          getAllTournaments().catch(() => []),
          getMyClubs().catch(() => []),
        ]);

        setRecommendationMode(false);
        setClubs(Array.isArray(clubsData) ? clubsData : []);
        const tournamentItems = Array.isArray(tournamentsData)
          ? tournamentsData
          : tournamentsData?.tournaments || [];
        setTournaments(tournamentItems);
        setMyClubIds(new Set((Array.isArray(myClubsData) ? myClubsData : []).map((c) => c.clubId)));
        setError(err?.message || "Set your profile location to see nearby recommendations");
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
    <main className="relative flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <DynamicBackground
            className="z-0"
            patternType="grid"
            patternSize={50}
            patternColor="rgba(15,23,42,0.035)"
            gradient="linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.92) 55%, rgba(224,242,254,0.88) 100%)"
            showAccents
          />
          <motion.div variants={pageSectionStaggerVariants} className="relative z-10">
          {error && (
            <PageTransitionItem className="mb-6">
              <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">{error}</div>
            </PageTransitionItem>
          )}
          {loading && (
            <PageTransitionItem className="mb-6">
              <div className="flex items-center gap-3 text-slate-500">
                <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-sky-500" />
                Loading...
              </div>
            </PageTransitionItem>
          )}

          <PageTransitionItem className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-2 font-['Outfit']">Discover</h1>
            <p className="text-slate-500">
              {recommendationMode
                ? "Nearest clubs and tournaments based on your location"
                : "Find clubs and tournaments near you"}
            </p>
          </PageTransitionItem>

          {/* Search and Filter Section */}
          <PageTransitionItem className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 mb-8">
            <div className="flex gap-4 mb-5">
              <div className="flex-1 relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
                <input
                  type="text"
                  placeholder="Search clubs or tournaments..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 border border-slate-200 rounded-xl text-sm"
                />
                {searchQuery && (
                  <button onClick={() => setSearchQuery("")} className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600">
                    <X size={16} />
                  </button>
                )}
              </div>
            </div>

            <div className="flex flex-wrap gap-2">
              {filters.map((filter) => (
                <motion.button
                  key={filter}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all ${
                    activeFilter === filter
                      ? "bg-gradient-to-r from-sky-600 to-cyan-600 text-white shadow-md shadow-sky-500/20"
                      : "bg-slate-100 text-slate-600 hover:bg-sky-50 hover:text-sky-700"
                  }`}
                >
                  {filter}
                </motion.button>
              ))}
            </div>
          </PageTransitionItem>

          {/* Clubs Near You Section */}
          {(activeFilter === "All" || activeFilter === "Clubs") && (
            <PageTransitionItem className="mb-8">
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-sky-50 flex items-center justify-center">
                  <Users size={18} className="text-sky-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">Clubs Near You</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {filteredClubs.length === 0 && !loading && (
                  <div className="col-span-2 text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl mb-3">🏟️</div>
                    <p className="text-slate-500">No clubs to show</p>
                  </div>
                )}
                {filteredClubs.map((club, idx) => (
                  <motion.div
                    key={club.clubId}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 group relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-start justify-between mb-4">
                      <h3 className="text-xl font-bold text-slate-900">{club.name}</h3>
                    </div>
                    <div className="flex items-center gap-1.5 text-sm text-slate-500 mb-4">
                      <MapPin size={14} />
                      <span>{club.location ?? "—"}</span>
                      {club.distanceKm != null && (
                        <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-100">
                          {club.distanceKm} km away
                        </span>
                      )}
                    </div>
                    <div className="flex items-center justify-between">
                      {club.description && <span className="text-sm text-slate-500 line-clamp-1 flex-1 mr-3">{club.description}</span>}
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => navigate(`/club/${club.clubId}`)}
                        className="btn-primary px-5 py-2 rounded-xl text-sm font-semibold whitespace-nowrap"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </PageTransitionItem>
          )}

          {/* Upcoming Tournaments Section */}
          {(activeFilter !== "Clubs") && (
            <PageTransitionItem>
              <div className="flex items-center gap-2.5 mb-5">
                <div className="w-8 h-8 rounded-lg bg-amber-50 flex items-center justify-center">
                  <Trophy size={18} className="text-amber-600" />
                </div>
                <h2 className="text-2xl font-bold text-slate-900 font-['Outfit']">Upcoming Tournaments</h2>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredTournaments.length === 0 && !loading && (
                  <div className="col-span-full text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl mb-3">🏆</div>
                    <p className="text-slate-500">No tournaments to show</p>
                  </div>
                )}
                {filteredTournaments.map((tournament, idx) => (
                  <motion.div
                    key={tournament.tournamentId}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 group relative overflow-hidden cursor-pointer"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-orange-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <h3 className="text-xl font-bold text-slate-900 mb-4">{tournament.name}</h3>
                    <div className="space-y-2 mb-5">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <MapPin size={14} />
                        <span>{tournament.location ?? "—"}</span>
                        {tournament.distanceKm != null && (
                          <span className="rounded-full bg-sky-50 px-2 py-0.5 text-xs font-semibold text-sky-700 border border-sky-100">
                            {tournament.distanceKm} km away
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-2 text-sm text-slate-700 font-medium">
                        <CalendarDays size={14} className="text-slate-400" />
                        {tournament.startDate ? `Starts ${new Date(tournament.startDate).toLocaleDateString()}` : "—"}
                      </div>
                      <div className="text-sm font-bold">
                        {tournament.entryFee != null && tournament.entryFee > 0 ? (
                          <span className="text-amber-600">NPR {tournament.entryFee}</span>
                        ) : (
                          <span className="text-sky-600">Free Entry ✨</span>
                        )}
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => navigate(`/tournament/${tournament.tournamentId}`)}
                      className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold"
                    >
                      View Details
                    </motion.button>
                  </motion.div>
                ))}
              </div>
            </PageTransitionItem>
          )}
          </motion.div>
    </main>
  );
}