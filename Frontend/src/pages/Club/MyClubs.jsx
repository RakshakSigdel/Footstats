import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import ClubListCard from "../../components/Club/ClubListCard";
import CreateClub from "./Components/CreateClub";
import { getMyClubs, getAllClubs, createClub } from "../../services/api.clubs";
import { getLocationRecommendations } from "../../services/api.locations";
import { toMediaUrl } from "../../services/media";
import { itemVariants, listVariants } from "../../components/ui/motion";
import { Plus, Search, X, MapPin, Users } from "lucide-react";

const getClubLogoUrl = (logoPath) => toMediaUrl(logoPath);

export default function MyClubs() {
  const navigate = useNavigate();
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("myClubs");
  const [myClubs, setMyClubs] = useState([]);
  const [browseClubs, setBrowseClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [searchQuery, setSearchQuery] = useState("");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [my, recommendations, all] = await Promise.all([
          getMyClubs().catch(() => []),
          getLocationRecommendations({ radiusKm: 2000, limit: 10 }).catch(() => null),
          getAllClubs().catch(() => []),
        ]);

        const normalizedMyClubs = Array.isArray(my) ? my : [];
        setMyClubs(normalizedMyClubs);

        const recommendedClubs = Array.isArray(recommendations?.clubs) ? recommendations.clubs : [];
        if (recommendedClubs.length > 0) {
          setBrowseClubs(recommendedClubs.slice(0, 10));
        } else {
          const myClubIds = new Set(normalizedMyClubs.map((club) => Number(club.clubId)));
          const fallbackClubs = (Array.isArray(all) ? all : [])
            .filter((club) => !myClubIds.has(Number(club.clubId)))
            .slice(0, 10);
          setBrowseClubs(fallbackClubs);
        }

        if (normalizedMyClubs.length === 0) {
          setActiveTab("browseClubs");
        }
      } catch (err) {
        setError(err?.message || "Failed to load clubs");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const filteredMyClubs = useMemo(() => {
    if (!searchQuery.trim()) return myClubs;
    const query = searchQuery.toLowerCase();
    return myClubs.filter(club => 
      club.name?.toLowerCase().includes(query) ||
      club.location?.toLowerCase().includes(query) ||
      club.description?.toLowerCase().includes(query)
    );
  }, [myClubs, searchQuery]);

  const filteredBrowseClubs = useMemo(() => {
    const myClubIds = new Set((myClubs || []).map((club) => Number(club.clubId)));
    const joinableClubs = (browseClubs || []).filter(
      (club) => !myClubIds.has(Number(club.clubId))
    );

    if (!searchQuery.trim()) return joinableClubs;
    const query = searchQuery.toLowerCase();
    return joinableClubs.filter(club => 
      club.name?.toLowerCase().includes(query) ||
      club.location?.toLowerCase().includes(query) ||
      club.description?.toLowerCase().includes(query)
    );
  }, [browseClubs, myClubs, searchQuery]);

  const handleCreateClub = async (formData, logoFile) => {
    try {
      await createClub(formData, logoFile);
      setIsCreateClubOpen(false);

      const [my, recommendations, all] = await Promise.all([
        getMyClubs().catch(() => []),
        getLocationRecommendations({ radiusKm: 2000, limit: 10 }).catch(() => null),
        getAllClubs().catch(() => []),
      ]);

      const normalizedMyClubs = Array.isArray(my) ? my : [];
      setMyClubs(normalizedMyClubs);

      const recommendedClubs = Array.isArray(recommendations?.clubs) ? recommendations.clubs : [];
      if (recommendedClubs.length > 0) {
        setBrowseClubs(recommendedClubs.slice(0, 10));
      } else {
        const myClubIds = new Set(normalizedMyClubs.map((club) => Number(club.clubId)));
        const fallbackClubs = (Array.isArray(all) ? all : [])
          .filter((club) => !myClubIds.has(Number(club.clubId)))
          .slice(0, 10);
        setBrowseClubs(fallbackClubs);
      }

      if (normalizedMyClubs.length === 0) {
        setActiveTab("browseClubs");
      } else {
        setActiveTab("myClubs");
      }
    } catch (err) {
      setError(err?.message || "Failed to create club");
      throw err;
    }
  };

  const handleViewDetails = (clubId) => navigate(`/club/${clubId}`);
  const handleJoinClub = (clubId) => {
    navigate(`/club/${clubId}`);
  };

  return (
    <div className="flex min-h-screen bg-gray-50 exclude-link-pointer">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">{error}</motion.div>
          )}
          {loading && (
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-500" />
              Loading clubs...
            </div>
          )}

          {/* Header Section */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 font-['Outfit']">
                My Clubs
              </h2>
              <p className="text-sm text-slate-500">
                Join or create football clubs
              </p>
            </div>
            <motion.button 
              whileHover={{ scale: 1.04, y: -2 }}
              whileTap={{ scale: 0.96 }}
              onClick={() => setIsCreateClubOpen(true)}
              className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2"
            >
              <Plus size={16} />
              Create Club
            </motion.button>
          </motion.div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" size={18} />
              <input
                type="text"
                placeholder="Search clubs by name, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-10 py-2.5 border border-slate-200 rounded-xl bg-white text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  <X size={16} />
                </button>
              )}
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="relative inline-flex rounded-full border border-slate-200 bg-slate-100 p-1">
              <motion.div
                layoutId="clubs-tab-pill"
                transition={{ type: "spring", stiffness: 360, damping: 28 }}
                className={`absolute top-1 bottom-1 rounded-full bg-white shadow-sm ${
                  activeTab === "myClubs" ? "left-1 right-[50%]" : "left-[50%] right-1"
                }`}
              />
              <button 
                onClick={() => setActiveTab("myClubs")}
                className={`relative z-10 px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                  activeTab === "myClubs" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                My Clubs
              </button>
              <button 
                onClick={() => setActiveTab("browseClubs")}
                className={`relative z-10 px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                  activeTab === "browseClubs" ? "text-slate-900" : "text-slate-500 hover:text-slate-700"
                }`}
              >
                Browse Clubs
              </button>
            </div>
          </div>

          <AnimatePresence mode="wait">
            {activeTab === "myClubs" && (
              <motion.div
                key="my-clubs-tab"
                variants={listVariants}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="space-y-4"
              >
                {filteredMyClubs.length === 0 && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="bg-white p-10 rounded-2xl shadow-sm border border-slate-100 text-center">
                    <div className="text-4xl mb-3">🏟️</div>
                    <p className="text-slate-600 font-medium mb-1">
                      {searchQuery ? `No clubs found matching "${searchQuery}"` : "You haven't joined any clubs yet"}
                    </p>
                    <p className="text-sm text-slate-400">
                      {searchQuery ? "Try a different search" : "Create one or browse nearby clubs to get started!"}
                    </p>
                  </motion.div>
                )}
                {filteredMyClubs.map((club) => (
                  <motion.div key={club.clubId} variants={itemVariants}>
                    <ClubListCard
                      club={club}
                      onClick={() => handleViewDetails(club.clubId)}
                    />
                  </motion.div>
                ))}
              </motion.div>
            )}

            {activeTab === "browseClubs" && (
              <motion.div
                key="browse-clubs-tab"
                variants={listVariants}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -8 }}
                className="grid grid-cols-1 md:grid-cols-2 gap-5"
              >
                {filteredBrowseClubs.length === 0 && !loading && (
                  <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="md:col-span-2 text-center py-10 bg-white rounded-2xl border border-slate-100">
                    <div className="text-4xl mb-3">🔍</div>
                    <p className="text-slate-500 font-medium">
                      {searchQuery ? `No clubs found matching "${searchQuery}"` : "No clubs to browse yet"}
                    </p>
                  </motion.div>
                )}
                {filteredBrowseClubs.map((club, idx) => (
                  <motion.div
                    key={club.clubId}
                    variants={itemVariants}
                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                    className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-400 to-teal-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                    <div className="flex items-start gap-4 mb-5">
                      <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md shadow-emerald-500/20">
                        {getClubLogoUrl(club.logo) ? (
                          <img src={getClubLogoUrl(club.logo)} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <Users size={24} className="text-white" />
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-slate-900 mb-1.5">{club.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-slate-500">
                          <MapPin size={14} />
                          <span>{club.location ?? "—"}</span>
                          {club.distanceKm != null && (
                            <span className="rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-semibold text-emerald-700 border border-emerald-100">
                              {club.distanceKm} km away
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                    {club.description && <p className="text-sm text-slate-500 mb-4 line-clamp-2">{club.description}</p>}
                    <div className="flex justify-end">
                      <motion.button
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                        onClick={() => handleJoinClub(club.clubId)}
                        className="btn-primary px-5 py-2.5 rounded-xl text-sm font-semibold"
                      >
                        View Details
                      </motion.button>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </main>
      </div>

      <CreateClub
        isOpen={isCreateClubOpen}
        onClose={() => setIsCreateClubOpen(false)}
        onCreateClub={handleCreateClub}
      />
    </div>
  );
}