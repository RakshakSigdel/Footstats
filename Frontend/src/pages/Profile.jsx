import { useEffect, useState } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getMyProfile } from "../services/api.player";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyProfile();
        setProfile(data);
      } catch (err) {
        setError(err?.message || "Failed to load profile");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
          )}
          {loading && <div className="mb-6 text-gray-500">Loading profile...</div>}
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-start justify-between">
              <div className="flex items-start gap-6">
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-700">
                    {profile ? `${profile.firstName?.charAt(0) || ""}${profile.lastName?.charAt(0) || ""}`.toUpperCase() || "?" : "—"}
                  </span>
                </div>
                <div>
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    {profile ? `${profile.firstName ?? ""} ${profile.lastName ?? ""}`.trim() || "Player" : "—"}
                  </h1>
                  <div className="flex gap-2 mb-4">
                    {profile?.position && (
                      <span className="bg-slate-900 text-white text-sm px-3 py-1 rounded-full">{profile.position}</span>
                    )}
                    {profile?.gender && (
                      <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">{profile.gender}</span>
                    )}
                  </div>
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-gray-600">
                    {profile?.Phone && (
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                        </svg>
                        <span>{profile.Phone}</span>
                      </div>
                    )}
                    {profile?.location && (
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{profile.location}</span>
                      </div>
                    )}
                    {profile?.dateOfBirth && (
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>DOB: {new Date(profile.dateOfBirth).toLocaleDateString()}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Right side - Edit Button */}
              <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
                Edit Profile
              </button>
            </div>

            {/* ─── divider now inside the card ─── */}
            <div className="border-t border-gray-200 my-8"></div>

            {/* Stats Cards – now inside same card */}
            <div className="grid grid-cols-4 gap-6">
              {/* Goals */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.goalsScored ?? "—"}</h3>
                <p className="text-sm text-gray-600">Goals</p>
              </div>

              {/* Assists */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.assist ?? "—"}</h3>
                <p className="text-sm text-gray-600">Assists</p>
              </div>

              {/* Matches */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <circle cx="12" cy="8" r="6" />
                  <path d="M12 14v8" />
                  <path d="M8.5 20h7" />
                  <path d="M10 17h4" />
                </svg>
              </div>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.matchesPlayed ?? "—"}</h3>
              <p className="text-sm text-gray-600">Matches</p>
            </div>

              {/* Win Rate */}
              <div className="text-center">
                <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.winRate ?? "—"}%</h3>
                <p className="text-sm text-gray-600">Win Rate</p>
              </div>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-6">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setActiveTab("recent")}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "recent" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                Recent Matches
              </button>
              <button
                onClick={() => setActiveTab("achievements")}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "achievements" ? "bg-white shadow-sm" : "text-gray-600"
                }`}
              >
                Achievements
              </button>
            </div>
          </div>

          {/* Tab Content */}
          {activeTab === "recent" && (
            <div className="space-y-4">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
                Recent matches for your profile are not provided by the backend. View <a href="/schedules" className="text-blue-600 hover:underline">Schedules</a> for match data.
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 text-center text-gray-500">
              Achievements are not provided by the backend yet.
            </div>
          )}
        </main>
      </div>
    </div>
  );
}