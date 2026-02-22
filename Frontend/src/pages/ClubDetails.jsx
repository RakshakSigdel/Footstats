import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getClubById, updateClub } from "../services/api.clubs";
import { getClubSchedules } from "../services/api.schedules";
import { getAllClubs } from "../services/api.clubs";

// EditClub Modal Component
const EditClub = ({ isOpen, onClose, onEditClub, clubData }) => {
  const [formData, setFormData] = useState({
    clubName: "",
    description: "",
    location: "",
  });

  useEffect(() => {
    if (clubData) {
      setFormData({
        clubName: clubData.name ?? "",
        description: clubData.description ?? "",
        location: clubData.location ?? "",
      });
    }
  }, [clubData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditClub({
      name: formData.clubName,
      description: formData.description,
      location: formData.location,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Club</h2>
          <p className="text-sm text-gray-500 mt-1">Update club information</p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Club Name
            </label>
            <input
              type="text"
              name="clubName"
              value={formData.clubName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// Main ClubDetails Component
export default function ClubDetails() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [clubData, setClubData] = useState(null);
  const [clubSchedules, setClubSchedules] = useState([]);
  const [clubsMap, setClubsMap] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");

  useEffect(() => {
    if (!clubId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [club, schedules, allClubs] = await Promise.all([
          getClubById(clubId),
          getClubSchedules(clubId).catch(() => []),
          getAllClubs().catch(() => []),
        ]);
        setClubData(club);
        setClubSchedules(Array.isArray(schedules) ? schedules : []);
        const map = {};
        (Array.isArray(allClubs) ? allClubs : []).forEach((c) => { if (c?.clubId) map[c.clubId] = c.name; });
        setClubsMap(map);
      } catch (err) {
        setError(err?.message || "Failed to load club");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId]);

  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "matches", label: "Matches", icon: "⚽" },
    { id: "requests", label: "Requests", icon: "📬" },
    { id: "chat", label: "Chat", icon: "💬" },
  ];

  const getResultColor = (result) => {
    switch (result) {
      case "Win": return "bg-green-100 text-green-700";
      case "Draw": return "bg-yellow-100 text-yellow-700";
      case "Loss": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

  const handleEditClub = async (updatedData) => {
    if (!clubId) return;
    try {
      await updateClub(clubId, updatedData);
      const updated = await getClubById(clubId);
      setClubData(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to update club");
      throw err;
    }
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
          )}
          {loading && <div className="mb-6 text-gray-500">Loading club...</div>}
          {!clubData && !loading && (
            <div className="mb-6 text-gray-500">Club not found.</div>
          )}

          {clubData && (
          <>
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 relative">
            <div className="absolute top-6 right-6 md:top-8 md:right-8 text-right">
              <div className="text-4xl md:text-5xl font-bold text-gray-900">{clubSchedules.length}</div>
              <div className="text-sm md:text-base text-gray-500">Schedules</div>
            </div>

            <div className="flex items-start gap-5 md:gap-6 pr-32 md:pr-48">
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg width="40" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                  <path d="M4 22h16" />
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                </svg>
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{clubData.name}</h1>
                  <span className="text-yellow-500 text-2xl">●</span>
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  {clubData.foundedDate ? `Founded ${new Date(clubData.foundedDate).getFullYear()} • ` : ""}{clubData.location ?? ""}
                </p>

                {/* Buttons - placed below the description line, left side */}
                <div className="flex flex-wrap gap-3">
                  <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                      <circle cx="9" cy="7" r="4" />
                      <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                      <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                    </svg>
                    Invite Members
                  </button>

                  <button
                    onClick={() => setIsEditModalOpen(true)}
                    className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                  >
                    <svg
                      width="16"
                      height="16"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                      <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                    Edit Club
                  </button>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                    activeTab === tab.id ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: "Schedules", value: clubSchedules.length, sub: "Total" },
                  { label: "Location", value: clubData.location ?? "—", sub: "Club" },
                  { label: "Founded", value: clubData.foundedDate ? new Date(clubData.foundedDate).getFullYear() : "—", sub: "Year" },
                  { label: "Description", value: clubData.description ? "Set" : "—", sub: "" },
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                    <div className="text-base font-medium text-gray-700 mb-2">{stat.label}</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 truncate" title={stat.value}>{stat.value}</div>
                    {stat.sub && <div className="text-xs text-gray-500">{stat.sub}</div>}
                  </div>
                ))}
              </div>
              {clubData.description && (
                <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
                  <h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
                  <p className="text-gray-700">{clubData.description}</p>
                </div>
              )}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Club Schedules</h2>
                {clubSchedules.length === 0 ? (
                  <p className="text-gray-500">No schedules yet.</p>
                ) : (
                  <div className="space-y-3">
                    {clubSchedules.slice(0, 10).map((s) => (
                      <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                        <span className="font-medium text-gray-900">
                          {clubsMap[s.teamOneId] ?? s.teamOneId} vs {clubsMap[s.teamTwoId] ?? s.teamTwoId}
                        </span>
                        <span className="text-sm text-gray-600">
                          {s.date ? new Date(s.date).toLocaleString() : "—"} • {s.location ?? ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "members" && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Team Members</h2>
              <p className="text-gray-500">Member list is not provided by the backend API.</p>
            </div>
          )}

          {activeTab === "matches" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Club Schedules</h2>
              {clubSchedules.length === 0 ? (
                <p className="text-gray-500">No matches scheduled yet.</p>
              ) : (
                <div className="space-y-3">
                  {clubSchedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
                      <span className="font-medium">{clubsMap[s.teamOneId] ?? s.teamOneId} vs {clubsMap[s.teamTwoId] ?? s.teamTwoId}</span>
                      <span className="text-sm text-gray-600">{s.date ? new Date(s.date).toLocaleString() : ""} • {s.location ?? ""}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {activeTab === "requests" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Join Requests</h2>
              <p className="text-gray-500">Requests API is not active in the backend yet.</p>
            </div>
          )}

          {activeTab === "chat" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Club Chat</h2>
              <p className="text-gray-600">Chat feature coming soon!</p>
            </div>
          )}

          <EditClub
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onEditClub={handleEditClub}
            clubData={{ name: clubData.name, description: clubData.description, location: clubData.location }}
          />
          </>
          )}
        </main>
      </div>
    </div>
  );
}