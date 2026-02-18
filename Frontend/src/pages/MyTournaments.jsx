import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import CreateTournament from "../components/Tournament/HostTournament";
import EditTournament from "../components/Tournament/EditTournament";

export default function Tournaments() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("my");
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false);
  const [selectedTournamentData, setSelectedTournamentData] = useState(null);

  const handleCreateTournament = (formData) => {
    console.log("Tournament created:", formData);
    setIsCreateTournamentOpen(false);
  };

  const handleEditTournament = (formData) => {
    console.log("Tournament updated:", formData);
    setIsEditTournamentOpen(false);
  };

  const openEditTournament = (tournamentData) => {
    setSelectedTournamentData(tournamentData);
    setIsEditTournamentOpen(true);
  };

  const myTournaments = [
    {
      id: 0,
      tournamentName: "Nepal Cup 2024",
      status: "Active",
      statusColor: "bg-slate-900 text-white",
      teams: 16,
      nextDate: "Next: Mar 15",
      prizePool: "NPR 50,000",
      description: "Premier football tournament",
      location: "Kathmandu",
      format: "Knockout",
      startDate: "2024-03-10",
      endDate: "2024-04-15",
      entryFee: "NPR 5,000",
      skillLevel: "Advanced",
      maxTeams: 16,
    },
    {
      id: 1,
      tournamentName: "Valley Championship",
      status: "Upcoming",
      statusColor: "bg-slate-600 text-white",
      teams: 8,
      nextDate: "Starts: Apr 1",
      prizePool: "NPR 30,000",
      description: "Valley based championship",
      location: "Valley",
      format: "Round Robin",
      startDate: "2024-04-01",
      endDate: "2024-05-01",
      entryFee: "Free",
      skillLevel: "All Levels",
      maxTeams: 8,
    },
  ];

  const browseTournaments = [
    {
      id: 2,
      tournamentName: "Amateur League",
      skillLevel: "All Levels",
      location: "Pokhara",
      teamsRegistered: "24/32",
      startDate: "Starts Mar 20",
      entryFee: "Free",
    },
    {
      id: 3,
      tournamentName: "City Futsal Cup",
      skillLevel: "Intermediate",
      location: "Kathmandu",
      teamsRegistered: "12/16",
      startDate: "Starts Mar 28",
      entryFee: "NPR 3,000",
    },
    {
      id: 4,
      tournamentName: "Regional Championship",
      skillLevel: "Advanced",
      location: "Lalitpur",
      teamsRegistered: "18/24",
      startDate: "Starts Apr 5",
      entryFee: "NPR 5,000",
    },
  ];

  const tournaments = activeTab === "my" ? myTournaments : browseTournaments;

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">
                Tournaments
              </h2>
              <p className="text-sm text-gray-600">
                Participate in or host football tournaments
              </p>
            </div>
            <button
              onClick={() => setIsCreateTournamentOpen(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Host Tournament
            </button>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button
                onClick={() => setActiveTab("my")}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "my"
                    ? "bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                My Tournaments
              </button>
              <button
                onClick={() => setActiveTab("browse")}
                className={`px-6 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === "browse"
                    ? "bg-white shadow-sm"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                Browse
              </button>
            </div>
          </div>

          {/* Tournament Cards */}
          {activeTab === "my" ? (
            // My Tournaments - Full width layout
            <div className="space-y-4">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow"
                >
                  <div className="flex items-center justify-between">
                    {/* Left: Name and Status */}
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <h2 className="text-2xl font-bold text-gray-900">
                          {tournament.tournamentName}
                        </h2>
                        <span
                          className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${tournament.statusColor}`}
                        >
                          {tournament.status}
                        </span>
                      </div>

                      {/* Tournament Info */}
                      <div className="flex items-center gap-8 flex-wrap">
                        {/* Teams */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            width="18"
                            height="18"
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
                          <span className="text-sm font-medium text-gray-700">
                            {tournament.teams} teams
                          </span>
                        </div>

                        {/* Next Date / Start Date */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            width="18"
                            height="18"
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
                          <span className="text-sm font-medium text-gray-700">
                            {tournament.nextDate}
                          </span>
                        </div>

                        {/* Prize Pool */}
                        <div className="flex items-center gap-2 text-gray-600">
                          <svg
                            width="18"
                            height="18"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                          >
                            <circle cx="12" cy="8" r="7" />
                            <path d="M8 15h8M7 15h10" />
                          </svg>
                          <span className="text-sm font-medium text-gray-700">
                            {tournament.prizePool}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Right: View Details Button */}
                  <button
                    onClick={() => navigate(`/tournament/${tournament.id}`)}
                    className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors whitespace-nowrap ml-6"
                  >
                      View Details
                    </button>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            // Browse - Grid layout
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {tournaments.map((tournament) => (
                <div
                  key={tournament.id}
                  className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md transition-shadow flex flex-col"
                >
                  {/* Tournament Name */}
                  <h2 className="text-xl font-bold text-gray-900 mb-3">
                    {tournament.tournamentName}
                  </h2>

                  {/* Skill Level Badge */}
                  <div className="mb-4">
                    <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                      {tournament.skillLevel}
                    </span>
                  </div>

                  {/* Tournament Details */}
                  <div className="space-y-3 flex-1">
                    {/* Location */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                        <circle cx="12" cy="10" r="3" />
                      </svg>
                      <span className="text-sm text-gray-600">{tournament.location}</span>
                    </div>

                    {/* Teams Registered */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        width="18"
                        height="18"
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
                      <span className="text-sm text-gray-600">
                        {tournament.teamsRegistered} teams registered
                      </span>
                    </div>

                    {/* Start Date */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        width="18"
                        height="18"
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
                      <span className="text-sm text-gray-600">{tournament.startDate}</span>
                    </div>

                    {/* Entry Fee */}
                    <div className="flex items-center gap-2 text-gray-600">
                      <svg
                        width="18"
                        height="18"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <line x1="12" y1="1" x2="12" y2="23" />
                        <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                      </svg>
                      <span className="text-sm text-gray-600">{tournament.entryFee}</span>
                    </div>
                  </div>

                  {/* Register Button */}
                  <button className="mt-6 w-full bg-slate-900 text-white py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors">
                    Register Team
                  </button>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <CreateTournament
        isOpen={isCreateTournamentOpen}
        onClose={() => setIsCreateTournamentOpen(false)}
        onCreateTournament={handleCreateTournament}
      />

      <EditTournament
        isOpen={isEditTournamentOpen}
        onClose={() => setIsEditTournamentOpen(false)}
        onEditTournament={handleEditTournament}
        tournamentData={selectedTournamentData}
      />
    </div>
  );
}
