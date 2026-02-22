import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import CreateClub from "../components/Club/CreateClub";
import { getMyClubs, getAllClubs, createClub } from "../services/api.clubs";

export default function MyClubs() {
  const navigate = useNavigate();
  const [isCreateClubOpen, setIsCreateClubOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("myClubs");
  const [myClubs, setMyClubs] = useState([]);
  const [browseClubs, setBrowseClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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

  const handleCreateClub = async (formData) => {
    try {
      await createClub(formData);
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

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button 
                onClick={() => setActiveTab("myClubs")}
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "myClubs" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                My Clubs
              </button>
              <button 
                onClick={() => setActiveTab("browseClubs")}
                className={`px-5 py-1.5 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "browseClubs" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
                }`}
              >
                Browse Clubs
              </button>
            </div>
          </div>

          {/* My Clubs Tab Content */}
          {activeTab === "myClubs" && (
            <div className="space-y-5">
              {myClubs.length === 0 && !loading && (
                <div className="bg-white p-8 rounded-xl shadow-sm border border-gray-100 text-center text-gray-500">
                  You have not created any clubs yet. Create one above.
                </div>
              )}
              {myClubs.map((club) => (
                <div
                  key={club.clubId}
                  onClick={() => handleViewDetails(club.clubId)}
                  className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
                >
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                        <svg width="30" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-3 mb-2">
                          <h3 className="text-base font-bold text-gray-900 truncate">{club.name}</h3>
                          <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">Owner</span>
                        </div>
                        <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
                          {club.location && (
                            <div key="location" className="flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                                <circle cx="12" cy="10" r="3" />
                              </svg>
                              <span>{club.location}</span>
                            </div>
                          )}
                          {club.foundedDate && (
                            <div key="founded" className="flex items-center gap-1.5">
                              <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span>Since {new Date(club.foundedDate).getFullYear()}</span>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                    <button
                      onClick={(e) => { e.stopPropagation(); handleViewDetails(club.clubId); }}
                      className="bg-blue-50 text-blue-700 rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
                    >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Browse Clubs Tab Content */}
          {activeTab === "browseClubs" && (
            <div className="grid grid-cols-2 gap-6">
              {browseClubs.length === 0 && !loading && (
                <div className="col-span-2 text-center py-8 text-gray-500">No clubs to browse yet.</div>
              )}
              {browseClubs.map((club) => (
                <div key={club.clubId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <div className="flex items-start gap-4 mb-6">
                    <div className="w-14 h-14 bg-gray-100 rounded-lg flex items-center justify-center flex-shrink-0">
                      <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
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
                </div>
              ))}
            </div>
          )}
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