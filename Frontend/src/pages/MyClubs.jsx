import Sidebar from "../components/Sidebar";
import Topbar from "../components/Topbar";

export default function MyClubs() {
  return (
    <div className="flex min-h-screen bg-gray-50">
      {/* Fixed Sidebar */}
      <Sidebar />

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col">
        {/* Top Bar */}
        <Topbar />

        {/* Scrollable Main Content */}
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
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
            <button className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2">
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

          <div className="mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button className="px-5 py-1.5 text-sm font-semibold bg-white rounded-full shadow-sm">
                My Clubs
              </button>
              <button className="px-5 py-1.5 text-sm text-gray-500 hover:text-gray-700">
                Browse Clubs
              </button>
            </div>
          </div>

          {/* Club Cards */}
          <div className="space-y-5">
            {/* Kathmandu FC Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  {/* Club Logo */}
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Club name + role */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        Kathmandu FC
                      </h3>
                      <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                        Player
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-x-25 gap-y-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>32 members</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Kathmandu</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Since 2018</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                        <span className="font-bold text-gray-800">48 wins</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="bg-blue-50 text-blue-700 rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap">
                  View Details
                </button>
              </div>
            </div>

            {/* Valley Warriors Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100">
              <div className="flex items-center justify-between gap-6">
                <div className="flex items-center gap-4 flex-1">
                  {/* Club Logo */}
                  <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                      <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                      <path d="M4 22h16" />
                      <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                      <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                      <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                    </svg>
                  </div>

                  <div className="flex-1 min-w-0">
                    {/* Club name + role */}
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-base font-bold text-gray-900 truncate">
                        Valley Warriors
                      </h3>
                      <span className="bg-purple-50 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">
                        Captain
                      </span>
                    </div>

                    {/* Info row */}
                    <div className="flex flex-wrap items-center gap-x-25 gap-y-3 text-xs text-gray-600">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        <span>28 members</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>Lalitpur</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>Since 2020</span>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                          <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                          <path d="M4 22h16" />
                          <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                          <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                          <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                        </svg>
                        <span className="font-bold text-gray-800">35 wins</span>
                      </div>
                    </div>
                  </div>
                </div>

                <button className="bg-blue-50 text-blue-700 rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap">
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
