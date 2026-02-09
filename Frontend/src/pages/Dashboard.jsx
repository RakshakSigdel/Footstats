import { useEffect, useState } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getMyProfile } from "../services/api.player";

export default function Dashboard() {
  const [profile, setProfile] = useState(null);

  useEffect(() => {
    let isCurrent = true;
    (async () => {
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
    })();
    
    return () => {
      isCurrent = false;
    };
  }, []);
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar - White with subtle border */}
        <Topbar />

        {/* Thin horizontal separator after top bar */}
        <div className="border-t border-gray-200"></div>

        {/* Scrollable Main Content - Light Blue-Gray Background */}
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Header / Welcome */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {profile?.firstName}!
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Here's what's happening with your football journey
            </p>
          </div>

          {/* Stats Cards - SMALLER SIZE but ALL content kept */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Appearances */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 bg-teal-50 rounded-lg flex items-center justify-center text-teal-600">
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
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  +33%
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-0.5">Appearances</p>
              <h3 className="text-2xl font-bold text-gray-900">{profile?.matchesPlayed || 0}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Till date</p>
            </div>

            {/* Total Goals */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 bg-red-50 rounded-lg flex items-center justify-center text-red-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <circle cx="12" cy="12" r="10" />
                    <path d="M12 2v20M2 12h20" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  +52%
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-0.5">Total Goals</p>
              <h3 className="text-2xl font-bold text-gray-900">{profile?.goalsScored || 0}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Till date</p>
            </div>

            {/* Assists */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 bg-blue-50 rounded-lg flex items-center justify-center text-blue-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <path d="M17 8h.01" />
                    <path d="M11 16h.01" />
                    <path d="M20 4 4 20" />
                    <path d="m4 4 16 16" />
                    <path d="M7 7h10v10" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  +8%
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-0.5">Assists</p>
              <h3 className="text-2xl font-bold text-gray-900">{profile?.assist || 0}</h3>
              <p className="text-xs text-gray-500 mt-0.5">Till date</p>
            </div>

            {/* Win Rate */}
            <div className="bg-white p-3 rounded-xl shadow-sm border border-gray-100">
              <div className="flex justify-between items-start mb-2">
                <div className="w-8 h-8 bg-purple-50 rounded-lg flex items-center justify-center text-purple-600">
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                  >
                    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12" />
                  </svg>
                </div>
                <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-medium">
                  +5%
                </span>
              </div>
              <p className="text-xs text-gray-600 mb-0.5">Win Rate</p>
              <h3 className="text-2xl font-bold text-gray-900">76%</h3>
              <p className="text-xs text-gray-500 mt-0.5">Last 10 matches</p>
            </div>
          </div>

          {/* Upcoming Matches Section */}
          <div>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg md:text-xl font-bold text-gray-900">
                Upcoming Matches
              </h3>
              <button className="text-sm text-blue-600 hover:text-blue-700 font-medium transition-colors">
                View All →
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {/* Match Card 1 - SMALLER SIZE but ALL content kept */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Dec 25, 2025</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-base">
                      K
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">
                      Kathmandu FC
                    </span>
                  </div>

                  <div className="px-3">
                    <span className="text-gray-400 font-bold text-xs">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-10 h-10 bg-green-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                      P
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">
                      Pokhara United
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-t pt-3">
                  <div className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>10:00</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>ANFA Complex</span>
                  </div>
                </div>

                <button className="w-full border border-gray-300 rounded-lg py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  View Details
                </button>
              </div>

              {/* Match Card 2 - SMALLER SIZE but ALL content kept */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Dec 28, 2025</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-base">
                      L
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">
                      Lalitpur City
                    </span>
                  </div>

                  <div className="px-3">
                    <span className="text-gray-400 font-bold text-xs">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                      B
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">
                      Biratnagar Kings
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-t pt-3">
                  <div className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>16:30</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Dasharath Stadium</span>
                  </div>
                </div>

                <button className="w-full border border-gray-300 rounded-lg py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  View Details
                </button>
              </div>

              {/* Match Card 3 - SMALLER SIZE but ALL content kept */}
              <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-100">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-1.5 text-xs text-gray-500">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                      <line x1="16" y1="2" x2="16" y2="6" />
                      <line x1="8" y1="2" x2="8" y2="6" />
                      <line x1="3" y1="10" x2="21" y2="10" />
                    </svg>
                    <span>Jan 2, 2026</span>
                  </div>
                  <span className="text-xs text-green-600 bg-green-50 px-2 py-0.5 rounded-full font-semibold">
                    UPCOMING
                  </span>
                </div>

                <div className="flex items-center justify-between mb-3">
                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-10 h-10 bg-slate-900 rounded-full flex items-center justify-center text-white font-bold text-base">
                      D
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">
                      Dharan Heroes
                    </span>
                  </div>

                  <div className="px-3">
                    <span className="text-gray-400 font-bold text-xs">VS</span>
                  </div>

                  <div className="flex flex-col items-center gap-1.5 flex-1">
                    <div className="w-10 h-10 bg-cyan-600 rounded-full flex items-center justify-center text-white font-bold text-base">
                      H
                    </div>
                    <span className="text-xs font-semibold text-gray-900 text-center">
                      Hetauda Strikers
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-xs text-gray-500 mb-3 pb-3 border-t pt-3">
                  <div className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>14:00</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <svg
                      width="12"
                      height="12"
                      viewBox="0 0 24 24"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                    >
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>Local Ground</span>
                  </div>
                </div>

                <button className="w-full border border-gray-300 rounded-lg py-2 text-xs font-medium text-gray-700 transition-colors hover:bg-gray-50">
                  View Details
                </button>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
