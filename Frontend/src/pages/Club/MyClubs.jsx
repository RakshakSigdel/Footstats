import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { AnimatePresence, motion } from "framer-motion";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import ClubListCard from "../../components/Club/ClubListCard";
import CreateClub from "./Components/CreateClub";
import { getMyClubs, getAllClubs, createClub } from "../../services/api.clubs";
import { toMediaUrl } from "../../services/media";
import { itemVariants, listVariants } from "../../components/ui/motion";

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
        const [my, all] = await Promise.all([
          getMyClubs().catch(() => []),
          getAllClubs().catch(() => []),
        ]);
        setMyClubs(Array.isArray(my) ? my : []);
        setBrowseClubs(Array.isArray(all) ? all : []);
      } catch (err) {
        setError(err?.message || "Failed to load clubs");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // Filter clubs based on search query
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
      const my = await getMyClubs();
      setMyClubs(Array.isArray(my) ? my : []);
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
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
          )}
          {loading && <div className="mb-6 text-gray-500">Loading clubs...</div>}
          {/* Header Section */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
                My Clubs
              </h2>
              <p className="text-sm text-gray-500">
                Join or create football clubs
              </p>
            </div>
            <button 
              onClick={() => setIsCreateClubOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Club
            </button>
          </div>

          {/* Search Bar */}
          <div className="mb-6">
            <div className="relative max-w-md">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search clubs by name, location..."
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
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="relative inline-flex rounded-full border border-gray-200 bg-gray-100 p-1">
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
                  activeTab === "myClubs" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Clubs
              </button>
              <button 
                onClick={() => setActiveTab("browseClubs")}
                className={`relative z-10 px-5 py-1.5 text-sm font-semibold rounded-full transition-colors ${
                  activeTab === "browseClubs" ? "text-gray-900" : "text-gray-500 hover:text-gray-700"
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
                className="space-y-5"
              >
                {filteredMyClubs.length === 0 && !loading && (
                  <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                    {searchQuery ? `No clubs found matching "${searchQuery}"` : "You have not created any clubs yet. Create one above."}
                  </div>
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
                className="grid grid-cols-1 md:grid-cols-2 gap-6"
              >
                {filteredBrowseClubs.length === 0 && !loading && (
                  <div className="md:col-span-2 text-center py-8 text-gray-500">
                    {searchQuery ? `No clubs found matching "${searchQuery}"` : "No clubs to browse yet."}
                  </div>
                )}
                {filteredBrowseClubs.map((club) => (
                  <motion.div key={club.clubId} variants={itemVariants} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <div className="flex items-start gap-4 mb-6">
                      <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
                        {getClubLogoUrl(club.logo) ? (
                          <img src={getClubLogoUrl(club.logo)} alt={club.name} className="w-full h-full object-cover" />
                        ) : (
                          <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                            <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                            <path d="M4 22h16" />
                            <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                            <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                            <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                          </svg>
                        )}
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold text-gray-900 mb-2">{club.name}</h3>
                        <div className="flex items-center gap-1.5 text-sm text-gray-600">
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>{club.location ?? "—"}</span>
                        </div>
                      </div>
                    </div>
                    {club.description && <p className="text-sm text-gray-600 mb-4 line-clamp-2">{club.description}</p>}
                    <div className="flex justify-end">
                      <button
                        onClick={() => handleJoinClub(club.clubId)}
                        className="bg-slate-900 text-white px-5 py-2.5 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors"
                      >
                        View Details
                      </button>
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