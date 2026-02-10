import { useState } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";

export default function Discover() {
  const [activeFilter, setActiveFilter] = useState("All");

  const filters = ["All", "Clubs", "Tournaments", "Within 5km", "This Month"];

  const clubs = [
    {
      name: "Kathmandu FC",
      level: "Intermediate",
      location: "Kathmandu",
      distance: "2.5 km",
      members: 45
    },
    {
      name: "Pokhara United",
      level: "Advanced",
      location: "Pokhara",
      distance: "5.8 km",
      members: 38
    },
    {
      name: "Lalitpur Strikers",
      level: "Beginner",
      location: "Lalitpur",
      distance: "3.2 km",
      members: 52
    },
    {
      name: "Bhaktapur Warriors",
      level: "Intermediate",
      location: "Bhaktapur",
      distance: "7.1 km",
      members: 41
    }
  ];

  const tournaments = [
    {
      name: "Nepal Cup 2024",
      location: "Kathmandu",
      teams: 16,
      startDate: "Starts Mar 15",
      prize: "NPR 5000"
    },
    {
      name: "Valley Championship",
      location: "Lalitpur",
      teams: 8,
      startDate: "Starts Apr 1",
      prize: "NPR 3000"
    },
    {
      name: "Amateur League",
      location: "Pokhara",
      teams: 24,
      startDate: "Starts Mar 20",
      prize: "Free"
    }
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Header */}
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Discover</h1>
            <p className="text-gray-600">Find clubs and tournaments near you</p>
          </div>

          {/* Search and Filter Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8">
            {/* Search Bar */}
            <div className="flex gap-4 mb-6">
              <div className="flex-1 relative">
                <div className="absolute left-4 top-1/2 -translate-y-1/2">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.35-4.35" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Search clubs or tournaments..."
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button className="px-6 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all flex items-center gap-2">
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polygon points="22 3 2 3 10 12.46 10 19 14 21 14 12.46 22 3" />
                </svg>
                Filters
              </button>
            </div>

            {/* Filter Tabs */}
            <div className="flex gap-3">
              {filters.map((filter) => (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                    activeFilter === filter
                      ? "bg-slate-900 text-white"
                      : "bg-transparent text-gray-600 hover:bg-green-600 hover:text-white"
                  }`}
                >
                  {filter}
                </button>
              ))}
            </div>
          </div>

          {/* Clubs Near You Section */}
          <div className="mb-8">
            <div className="flex items-center gap-2 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                <circle cx="9" cy="7" r="4" />
                <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                <path d="M16 3.13a4 4 0 0 1 0 7.75" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Clubs Near You</h2>
            </div>

            <div className="grid grid-cols-2 gap-6">
              {clubs.map((club) => (
                <div key={club.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  <div className="flex items-start justify-between mb-4">
                    <h3 className="text-xl font-bold text-gray-900">{club.name}</h3>
                    <span className="bg-slate-900 text-white text-xs px-3 py-1 rounded-full font-medium">
                      {club.level}
                    </span>
                  </div>

                  <div className="flex items-center gap-1.5 text-sm text-gray-600 mb-4">
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>{club.location}</span>
                    <span>•</span>
                    <span>{club.distance}</span>
                  </div>

                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">{club.members} members</span>
                    <button className="bg-slate-900 text-white px-5 py-2 rounded-lg text-sm font-medium hover:bg-slate-800">
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Upcoming Tournaments Section */}
          <div>
            <div className="flex items-center gap-2 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Upcoming Tournaments</h2>
            </div>

            <div className="grid grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <div key={tournament.name} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-lg hover:-translate-y-1 transition-all duration-200 cursor-pointer">
                  <h3 className="text-xl font-bold text-gray-900 mb-4">{tournament.name}</h3>

                  <div className="space-y-2 mb-6">
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span>{tournament.location}</span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                      <span>{tournament.teams} teams</span>
                    </div>

                    <div className="text-sm text-gray-900 font-medium">
                      {tournament.startDate}
                    </div>

                    <div className="text-sm text-gray-900 font-bold">
                      {tournament.prize}
                    </div>
                  </div>

                  <button className="w-full bg-slate-900 text-white py-3 rounded-lg text-sm font-medium hover:bg-slate-800">
                    Register Now
                  </button>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}