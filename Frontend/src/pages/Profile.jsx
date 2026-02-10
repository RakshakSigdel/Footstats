import { useEffect, useState } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getMyProfile } from "../services/api.player";

export default function Profile() {
  const [profile, setProfile] = useState(null);
  const [activeTab, setActiveTab] = useState("recent");

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    try {
      const data = await getMyProfile();
      setProfile(data);
    } catch (error) {
      console.log("Error loading profile:", error);
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Profile Header Card */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-start justify-between">
              {/* Left side - Avatar and Info */}
              <div className="flex items-start gap-6">
                {/* Avatar */}
                <div className="w-32 h-32 bg-blue-100 rounded-full flex items-center justify-center">
                  <span className="text-4xl font-bold text-gray-700">
                    RK
                  </span>
                </div>

                {/* Info */}
                <div>
                  {/* Name - Big Heading */}
                  <h1 className="text-3xl font-bold text-gray-900 mb-3">
                    Rajesh Kumar
                  </h1>

                  {/* Position Badges */}
                  <div className="flex gap-2 mb-4">
                    <span className="bg-slate-900 text-white text-sm px-3 py-1 rounded-full">
                      Forward
                    </span>
                    <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                      Right Foot
                    </span>
                  </div>

                  {/* Contact Info - 2 Rows x 2 Columns Grid */}
                  <div className="grid grid-cols-2 gap-x-12 gap-y-2 text-sm text-gray-600">
                    {/* Row 1 - Email */}
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="2" y="4" width="20" height="16" rx="2" />
                        <path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" />
                      </svg>
                      <span>rajesh.kumar@email.com</span>
                    </div>
                    
                    {/* Row 1 - Phone */}
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z" />
                      </svg>
                      <span>+977 9841234567</span>
                    </div>

                    {/* Row 2 - Location */}
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>Kathmandu, Nepal</span>
                    </div>

                    {/* Row 2 - Joined Date */}
                    <div className="flex items-center gap-2">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                      <span>Joined Jan 2024</span>
                    </div>
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
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.goalsScored || 24}</h3>
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
                <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.assist || 12}</h3>
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
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.matchesPlayed || 48}</h3>
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
                <h3 className="text-3xl font-bold text-gray-900 mb-1">67%</h3>
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
              {/* Match Card 1 - Win */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Win
                    </span>
                    <span className="text-lg font-bold text-gray-900">vs Valley FC</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                  <span>Mar 10</span>
                  <span className="font-bold text-gray-900">3-2</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>2 Goals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-500">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="12" x2="14.5" y2="14.5" />
                    </svg>
                    <span>1 Assists</span>
                  </div>
                </div>
              </div>

              {/* Match Card 2 - Draw */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-gray-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Draw
                    </span>
                    <span className="text-lg font-bold text-gray-900">vs Nepal United</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                  <span>Mar 8</span>
                  <span className="font-bold text-gray-900">1-1</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>0 Goals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-500">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="12" x2="14.5" y2="14.5" />
                    </svg>
                    <span>1 Assists</span>
                  </div>
                </div>
              </div>

              {/* Match Card 3 - Loss */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-4">
                    <span className="bg-red-500 text-white text-xs px-3 py-1 rounded-full font-semibold">
                      Loss
                    </span>
                    <span className="text-lg font-bold text-gray-900">vs Capital Stars</span>
                  </div>
                </div>
                <div className="flex items-center gap-6 mt-3 text-sm text-gray-600">
                  <span>Mar 5</span>
                  <span className="font-bold text-gray-900">0-2</span>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-blue-600">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                    </svg>
                    <span>0 Goals</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-pink-500">
                      <circle cx="12" cy="12" r="10" />
                      <circle cx="12" cy="12" r="6" />
                      <circle cx="12" cy="12" r="2" />
                      <line x1="12" y1="8" x2="12" y2="12" />
                      <line x1="12" y1="12" x2="14.5" y2="14.5" />
                    </svg>
                    <span>0 Assists</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === "achievements" && (
            <div className="grid grid-cols-2 gap-6">
              {/* Achievement Card 1 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
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
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Top Scorer</h3>
                    <p className="text-sm text-gray-600 mb-1">Valley League 2024</p>
                    <p className="text-xs text-gray-500">Mar 2024</p>
                  </div>
                </div>
              </div>

              {/* Achievement Card 2 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
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
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Hat-trick Hero</h3>
                    <p className="text-sm text-gray-600 mb-1">Scored 3 goals in a match</p>
                    <p className="text-xs text-gray-500">Feb 2024</p>
                  </div>
                </div>
              </div>

              {/* Achievement Card 3 */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                <div className="flex items-start gap-4">
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
                  <div>
                    <h3 className="text-lg font-bold text-gray-900 mb-1">Team Player</h3>
                    <p className="text-sm text-gray-600 mb-1">50 matches played</p>
                    <p className="text-xs text-gray-500">Jan 2024</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}