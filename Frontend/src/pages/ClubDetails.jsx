import React, { useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";


// EditClub Modal Component

const EditClub = ({ isOpen, onClose, onEditClub, clubData }) => {
  const [formData, setFormData] = useState(
    clubData || {
      clubName: "",
      description: "",
      location: "",
    },
  );

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditClub(formData);
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

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview"); // NEW: Tab state

  // Mock data - replace with real API data
  const clubData = {
    id: 1,
    name: "Kathmandu FC",
    members: 32,
    founded: 2018,
    location: "Kathmandu, Nepal",
    totalMatches: 156,
    winRate: "68%",
    tournamentsWon: 8,
    activePlayers: 32,
    teamMembers: [
      {
        id: 1,
        name: "Rajesh Shrestha",
        position: "Forward",
        number: 10,
        matches: 28,
        goals: 24,
        initials: "R",
      },
      {
        id: 2,
        name: "Anil Maharjan",
        position: "Midfielder",
        number: 8,
        matches: 30,
        goals: 12,
        initials: "A",
      },
      {
        id: 3,
        name: "Sunil Tamang",
        position: "Defender",
        number: 5,
        matches: 29,
        goals: 3,
        initials: "S",
      },
      {
        id: 4,
        name: "Bikash Rai",
        position: "Goalkeeper",
        number: 1,
        matches: 32,
        goals: 0,
        initials: "B",
      },
      {
        id: 5,
        name: "Kiran Limbu",
        position: "Forward",
        number: 11,
        matches: 25,
        goals: 18,
        initials: "K",
      },
    ],
    recentResults: [
      {
        id: 1,
        opponent: "Pokhara United",
        result: "Win",
        score: "3-1",
        date: "Dec 15",
      },
      {
        id: 2,
        opponent: "Lalitpur City",
        result: "Win",
        score: "2-0",
        date: "Dec 12",
      },
      {
        id: 3,
        opponent: "Biratnagar Kings",
        result: "Draw",
        score: "1-1",
        date: "Dec 8",
      },
      {
        id: 4,
        opponent: "Dharan Heroes",
        result: "Win",
        score: "4-2",
        date: "Dec 5",
      },
    ],
  };

  // NEW: Navigation tabs configuration
  const tabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "matches", label: "Matches", icon: "⚽" },
    { id: "requests", label: "Requests", icon: "📬", badge: 3 },
    { id: "chat", label: "Chat", icon: "💬", badge: 5 }
  ];

  const getResultColor = (result) => {
    switch (result) {
      case "Win":
        return "bg-green-100 text-green-700";
      case "Draw":
        return "bg-yellow-100 text-yellow-700";
      case "Loss":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const handleEditClub = (updatedData) => {
    console.log("Club updated with:", updatedData);
    // → Here you would call your API to save changes
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Back button */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {/* ─── Header Section ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 relative">
            {/* Member count - top right */}
            <div className="absolute top-6 right-6 md:top-8 md:right-8 text-right">
              <div className="text-4xl md:text-5xl font-bold text-gray-900">
                {clubData.members}
              </div>
              <div className="text-sm md:text-base text-gray-500">Members</div>
            </div>

            <div className="flex items-start gap-5 md:gap-6 pr-32 md:pr-48">
              {/* Club Logo */}
              <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                <svg
                  width="40"
                  height="32"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="white"
                  strokeWidth="2"
                >
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
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">
                    {clubData.name}
                  </h1>
                  <span className="text-yellow-500 text-2xl">●</span>
                </div>

                <p className="text-sm md:text-base text-gray-600 mb-4">
                  Founded {clubData.founded} • {clubData.location}
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

          {/* ─── NEW: Navigation Tabs ─── */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                    activeTab === tab.id
                      ? "text-blue-600 bg-blue-50"
                      : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.badge && (
                    <span className="bg-red-500 text-white text-xs px-2 py-0.5 rounded-full font-bold">
                      {tab.badge}
                    </span>
                  )}
                  {activeTab === tab.id && (
                    <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>
                  )}
                </button>
              ))}
            </div>
          </div>

          {/* ─── Tab Content: OVERVIEW ─── */}
          {activeTab === "overview" && (
            <>
              {/* Stats Cards with hover effect */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  {
                    icon: (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                      >
                        <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                        <line x1="16" y1="2" x2="16" y2="6" />
                        <line x1="8" y1="2" x2="8" y2="6" />
                        <line x1="3" y1="10" x2="21" y2="10" />
                      </svg>
                    ),
                    label: "Total Matches",
                    value: clubData.totalMatches,
                    sub: "This season",
                  },
                  {
                    icon: (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                      >
                        <polyline points="22 7 13.5 15.5 8.5 10.5 2 17" />
                        <polyline points="16 7 22 7 22 13" />
                      </svg>
                    ),
                    label: "Win Rate",
                    value: clubData.winRate,
                    sub: "Last 50 games",
                  },
                  {
                    icon: (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                      >
                        <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                        <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                        <path d="M4 22h16" />
                        <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                        <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                        <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                      </svg>
                    ),
                    label: "Tournaments Won",
                    value: clubData.tournamentsWon,
                    sub: "All time",
                  },
                  {
                    icon: (
                      <svg
                        width="28"
                        height="28"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="#6B7280"
                        strokeWidth="2"
                      >
                        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="9" cy="7" r="4" />
                        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                      </svg>
                    ),
                    label: "Active Players",
                    value: clubData.activePlayers,
                    sub: "Registered",
                  },
                ].map((stat, index) => (
                  <div
                    key={index}
                    className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center transition-all duration-200 hover:shadow-lg hover:scale-[1.03] hover:border-blue-200 cursor-pointer group"
                  >
                    {/* Icon + Label on top */}
                    <div className="flex flex-col items-center mb-3">
                      <div className="text-gray-600 group-hover:text-blue-600 transition-colors mb-2">
                        {stat.icon}
                      </div>
                      <div className="text-base font-medium text-gray-700">
                        {stat.label}
                      </div>
                    </div>

                    {/* Big value */}
                    <div className="text-4xl md:text-5xl font-bold text-gray-900 mb-1">
                      {stat.value}
                    </div>

                    {/* Small subtext at bottom */}
                    <div className="text-xs text-gray-500">{stat.sub}</div>
                  </div>
                ))}
              </div>

              {/* Recent Results Section */}
              <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
                <h2 className="text-xl font-bold text-gray-900 mb-6">
                  Recent Results
                </h2>

                <div className="space-y-4">
                  {clubData.recentResults.map((result) => (
                    <div
                      key={result.id}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span
                          className={`px-4 py-1.5 rounded-full text-sm font-semibold ${getResultColor(result.result)}`}
                        >
                          {result.result}
                        </span>
                        <span className="font-medium text-gray-900">
                          {result.opponent}
                        </span>
                      </div>
                      <div className="text-right">
                        <div className="text-xl font-bold text-gray-900">
                          {result.score}
                        </div>
                        <div className="text-sm text-gray-500">{result.date}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </>
          )}

          {/* ─── Tab Content: MEMBERS ─── */}
          {activeTab === "members" && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                <button className="text-blue-600 hover:text-blue-700 font-medium">
                  View All
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-sm min-w-[600px]">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Player
                      </th>
                      <th className="text-left py-4 px-4 font-semibold text-gray-700">
                        Position
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        Number
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        Matches
                      </th>
                      <th className="text-center py-4 px-4 font-semibold text-gray-700">
                        Goals
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {clubData.teamMembers.map((player) => (
                      <tr
                        key={player.id}
                        className="border-b border-gray-100 hover:bg-gray-50"
                      >
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-700 rounded-full flex items-center justify-center text-white font-bold text-lg">
                              {player.initials}
                            </div>
                            <span className="font-medium text-gray-900">
                              {player.name}
                            </span>
                          </div>
                        </td>
                        <td className="py-4 px-4 text-gray-700">
                          {player.position}
                        </td>
                        <td className="py-4 px-4 text-center">
                          <span className="bg-blue-100 text-blue-700 px-3 py-1 rounded font-semibold">
                            {player.number}
                          </span>
                        </td>
                        <td className="py-4 px-4 text-center text-gray-800 font-medium">
                          {player.matches}
                        </td>
                        <td className="py-4 px-4 text-center text-gray-900 font-bold">
                          {player.goals}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ─── Tab Content: MATCHES ─── */}
          {activeTab === "matches" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Upcoming & Recent Matches</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">⚽</div>
                <p className="text-gray-600">No matches scheduled yet</p>
              </div>
            </div>
          )}

          {/* ─── Tab Content: REQUESTS ─── */}
          {activeTab === "requests" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Join Requests</h2>
              <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                  <div key={i} className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                    <div className="flex items-center gap-4">
                      <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                        <span className="text-lg font-bold text-purple-700">P{i}</span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900">Player Name {i}</h3>
                        <p className="text-sm text-gray-600">Forward • 2 days ago</p>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <button className="bg-green-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-green-700 transition-colors">
                        Accept
                      </button>
                      <button className="bg-red-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-red-700 transition-colors">
                        Decline
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ─── Tab Content: CHAT ─── */}
          {activeTab === "chat" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Club Chat</h2>
              <div className="text-center py-12">
                <div className="text-6xl mb-4">💬</div>
                <p className="text-gray-600">Chat feature coming soon!</p>
              </div>
            </div>
          )}

          {/* Edit Club Modal */}
          <EditClub
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onEditClub={handleEditClub}
            clubData={{
              clubName: clubData.name,
              description: "Official football club based in Kathmandu",
              location: clubData.location,
            }}
          />
        </main>
      </div>
    </div>
  );
}