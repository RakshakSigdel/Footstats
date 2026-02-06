import { useState } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import CreateTournament from "../components/Tournament/HostTournament";
import EditTournament from "../components/Tournament/EditTournament";

export default function Tournaments() {
  const [isCreateTournamentOpen, setIsCreateTournamentOpen] = useState(false);
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false);
  const [selectedTournamentData, setSelectedTournamentData] = useState(null);

  const handleCreateTournament = (formData) => {
    console.log("Tournament created:", formData);
    setIsCreateTournamentOpen(false);
    // Add API call here to save tournament to backend
  };

  const handleEditTournament = (formData) => {
    console.log("Tournament updated:", formData);
    setIsEditTournamentOpen(false);
    // Add API call here to update tournament in backend
  };

  const openEditTournament = (tournamentData) => {
    setSelectedTournamentData(tournamentData);
    setIsEditTournamentOpen(true);
  };
  const tournaments = [
    {
      tournamentName: "Nepal Cup 2024",
      description: "Premier football tournament",
      location: "Kathmandu",
      format: "Knockout",
      startDate: "2024-03-10",
      endDate: "2024-04-15",
      prizePool: "NPR 50,000",
      entryFee: "NPR 5,000",
      skillLevel: "Advanced",
      maxTeams: 16,
      teams: 16,
    },
    {
      tournamentName: "Valley Championship",
      description: "Valley based championship",
      location: "Valley",
      format: "Round Robin",
      startDate: "2024-02-01",
      endDate: "2024-03-01",
      prizePool: "NPR 30,000",
      entryFee: "Free",
      skillLevel: "All Levels",
      maxTeams: 8,
      teams: 8,
    },
  ];

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
                My Tournaments
              </h2>
              <p className="text-sm text-gray-500">
                Host or join football tournaments
              </p>
            </div>
            <button
              onClick={() => setIsCreateTournamentOpen(true)}
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
              Host Tournament
            </button>
          </div>

          {/* Tournaments Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {tournaments.map((tournament, index) => (
              <div
                key={index}
                className="bg-white rounded-xl shadow-sm border border-gray-100 p-5 hover:shadow-md transition-shadow"
              >
                <h2 className="text-xl font-bold text-gray-900 mb-2">
                  {tournament.tournamentName}
                </h2>
                <p className="text-gray-600 mb-2">{tournament.teams} teams</p>
                <p className="text-sm text-gray-500 mb-4">
                  {tournament.location} • {tournament.format}
                </p>
                <div className="flex gap-3">
                  <button
                    onClick={() => openEditTournament(tournament)}
                    className="text-blue-600 hover:text-blue-800 font-medium text-sm"
                  >
                    Edit
                  </button>
                  <button className="text-blue-600 hover:text-blue-800 font-medium text-sm">
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
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
