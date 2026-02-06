import React from 'react';

export default function Tournaments({ onOpenCreateTournament, onOpenEditTournament }) {
  const tournaments = [
    {
      tournamentName: 'Nepal Cup 2024',
      description: 'Premier football tournament',
      location: 'Kathmandu',
      format: 'Knockout',
      startDate: '2024-03-10',
      endDate: '2024-04-15',
      prizePool: 'NPR 50,000',
      entryFee: 'NPR 5,000',
      skillLevel: 'Advanced',
      maxTeams: 16,
      teams: 16
    },
    {
      tournamentName: 'Valley Championship',
      description: 'Valley based championship',
      location: 'Valley',
      format: 'Round Robin',
      startDate: '2024-02-01',
      endDate: '2024-03-01',
      prizePool: 'NPR 30,000',
      entryFee: 'Free',
      skillLevel: 'All Levels',
      maxTeams: 8,
      teams: 8
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">Tournaments</h1>
          <button
            onClick={onOpenCreateTournament}
            className="bg-gray-900 hover:bg-gray-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
          >
            + Host Tournament
          </button>
        </div>

        {/* Tournaments Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map((tournament, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{tournament.tournamentName}</h2>
              <p className="text-gray-600 mb-2">{tournament.teams} teams</p>
              <p className="text-sm text-gray-500 mb-4">{tournament.location} • {tournament.format}</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenEditTournament(tournament)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit
                </button>
                <button className="text-blue-600 hover:text-blue-800 font-medium">View Tournament</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
