import { useEffect, useState } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getMyProfile } from "../services/api.player";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    
    const loadProfile = async () => {
      try {
        const data = await getMyProfile();
        if (isCurrent) {
          setProfile(data);
        }
      } catch (err) {
        if (isCurrent) {
          console.log("Couldnot load profile", err);
        }
      }
    };
    
    loadProfile();
    
    return () => {
      isCurrent = false;
    };
  }, []);

  const topScorers = [
    { rank: 1, name: "Anil Maharjan", club: "Kathmandu FC", goals: 28 },
    { rank: 2, name: "Rajesh Shrestha", club: "Lalitpur City", goals: 24 },
    { rank: 3, name: "Sunil Tamang", club: "Pokhara United", goals: 22 },
    { rank: 4, name: "Bikash Rai", club: "Biratnagar Kings", goals: 20 },
    { rank: 5, name: "Kiran Limbu", club: "Dharan Heroes", goals: 18 }
  ];

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Welcome Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {profile?.firstName || "Rajesh"}!
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Here's what's happening with your football journey
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Goals Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                  +12%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Total Goals</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.goalsScored || 24}</h3>
              <p className="text-xs text-gray-500">This season</p>
            </div>

            {/* Assists Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                  +8%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Assists</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">{profile?.assist || 18}</h3>
              <p className="text-xs text-gray-500">This season</p>
            </div>

            {/* Win Rate Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-medium">
                  +5%
                </span>
              </div>
              <p className="text-sm text-gray-600 mb-1">Win Rate</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">76%</h3>
              <p className="text-xs text-gray-500">Last 10 matches</p>
            </div>

            {/* Tournaments Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-gray-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Tournaments</p>
              <h3 className="text-3xl font-bold text-gray-900 mb-1">3</h3>
              <p className="text-xs text-gray-500">Active entries</p>
            </div>
          </div>

          {/* Upcoming Matches Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Upcoming Matches</h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium">
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Match Card 1 */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Dec 25, 2025</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                      K
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">Kathmandu FC</span>
                  </div>

                  <div className="px-4">
                    <span className="text-gray-400 font-bold text-sm">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                      P
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">Pokhara United</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-t pt-4">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>15:00</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>ANFA Complex</span>
                  </div>
                </div>

                <button className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  View Details
                </button>
              </div>

              {/* Match Card 2 */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Dec 28, 2025</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                      L
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">Lalitpur City</span>
                  </div>

                  <div className="px-4">
                    <span className="text-gray-400 font-bold text-sm">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                      B
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">Biratnagar Kings</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-t pt-4">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>16:30</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Dasharath Stadium</span>
                  </div>
                </div>

                <button className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  View Details
                </button>
              </div>

              {/* Match Card 3 */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2 text-sm text-gray-500">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Jan 2, 2026</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                      D
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">Dharan Heroes</span>
                  </div>

                  <div className="px-4">
                    <span className="text-gray-400 font-bold text-sm">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-2 flex-1">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                      H
                    </div>
                    <span className="text-sm font-semibold text-gray-900 text-center">Hetauda Strikers</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-t pt-4">
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>14:00</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Local Ground</span>
                  </div>
                </div>

                <button className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all">
                  View Details
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Section - Personal Performance & Top Scorers */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personal Performance Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Personal Performance</h3>
              
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Matches Played</span>
                  <span className="text-2xl font-bold text-gray-900">32</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Average Rating</span>
                  <span className="text-2xl font-bold text-gray-900">8.4</span>
                </div>
                
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Minutes Played</span>
                  <span className="text-2xl font-bold text-gray-900">2,640</span>
                </div>
                
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Clean Sheets</span>
                  <span className="text-2xl font-bold text-gray-900">12</span>
                </div>
              </div>
            </div>

            {/* Top Scorers Card */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Top Scorers - Kathmandu</h3>
              
              <div className="space-y-3">
                {topScorers.map((scorer) => (
                  <div 
                    key={scorer.rank}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-all ${
                      scorer.rank === 2 ? 'bg-green-50 hover:bg-green-100' : 'hover:bg-blue-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-sm">
                        {scorer.rank}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{scorer.name}</p>
                        <p className="text-sm text-gray-500">{scorer.club}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-2xl font-bold text-gray-900">{scorer.goals}</p>
                      <p className="text-xs text-gray-500">goals</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}