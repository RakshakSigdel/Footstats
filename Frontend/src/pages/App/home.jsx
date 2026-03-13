import React from 'react';

export default function Home({ onOpenCreateClub, onOpenEditClub }) {
  const clubs = [
    {
      clubName: 'Kathmandu FC',
      description: 'Premier football club',
      location: 'Kathmandu',
      members: 32,
      wins: 48
    },
    {
      clubName: 'Valley Warriors',
      description: 'Valley based club',
      location: 'Valley',
      members: 28,
      wins: 35
    }
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-6xl mx-auto p-8">
        <div className="flex justify-between items-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900">My Clubs</h1>
          <button
            onClick={onOpenCreateClub}
            className="bg-slate-900 hover:bg-slate-800 text-white font-semibold py-3 px-8 rounded-lg transition-colors shadow-md"
          >
            + Create Club
          </button>
        </div>

        {/* Clubs Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {clubs.map((club, index) => (
            <div key={index} className="bg-white rounded-lg shadow-md p-6 hover:shadow-lg transition-shadow">
              <h2 className="text-xl font-bold text-gray-900 mb-2">{club.clubName}</h2>
              <p className="text-gray-600 mb-4">{club.members} members • {club.wins} wins</p>
              <div className="flex gap-3">
                <button 
                  onClick={() => onOpenEditClub(club)}
                  className="text-blue-600 hover:text-blue-800 font-medium"
                >
                  Edit Club
                </button>
                <button className="text-blue-600 hover:text-blue-800 font-medium">View Club</button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
