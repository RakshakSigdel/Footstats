import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from '../components/Global/Sidebar'
import Topbar from '../components/Global/Topbar'
import EditTournament from '../components/Tournament/EditTournament'

export default function TournamentDetails() {
  const navigate = useNavigate()
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false)

  // Mock tournament data
  const tournament = {
    id: 1,
    name: 'Nepal Cup 2024',
    status: 'Active',
    description: '',
    teams: '16/16',
    prizePool: 'NPR 50,000',
    location: 'Kathmandu',
    entryFee: 'NPR 5,000',
    format: 'Knockout',
    skillLevel: 'Advanced',
    startDate: 'Mar 10, 2024',
    endDate: 'Apr 15, 2024',
    tournamentName: 'Nepal Cup 2024',
    maxTeams: 16,
    registeredTeams: [
      { id: 1, name: 'Kathmandu FC', status: 'Active' },
      { id: 2, name: 'Pokhara United', status: 'Active' },
      { id: 3, name: 'Lalitpur Lions', status: 'Active' },
      { id: 4, name: 'Bhaktapur Warriors', status: 'Eliminated' }
    ]
  }

  const handleEditTournament = (formData) => {
    console.log("Tournament updated:", formData)
    setIsEditTournamentOpen(false)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Header */}
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <button 
                onClick={() => navigate(-1)}
                className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors"
              >
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M19 12H5M12 19l-7-7 7-7"/>
                </svg>
              </button>

              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">
                    {tournament.status}
                  </span>
                </div>
                <p className="text-sm text-gray-600 max-w-2xl">{tournament.description}</p>
              </div>
            </div>

            <button 
              onClick={() => setIsEditTournamentOpen(true)}
              className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Tournament
            </button>
          </div>

          {/* Info Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            {/* Teams */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm text-gray-600">Teams</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tournament.teams}</div>
            </div>

            {/* Prize Pool */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <circle cx="12" cy="8" r="7"/>
                  <path d="M8 15h8M7 15h10"/>
                </svg>
                <span className="text-sm text-gray-600">Prize Pool</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tournament.prizePool}</div>
            </div>

            {/* Location */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                  <circle cx="12" cy="10" r="3" />
                </svg>
                <span className="text-sm text-gray-600">Location</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tournament.location}</div>
            </div>

            {/* Entry Fee */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <line x1="12" y1="1" x2="12" y2="23" />
                  <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
                <span className="text-sm text-gray-600">Entry Fee</span>
              </div>
              <div className="text-2xl font-bold text-gray-900">{tournament.entryFee}</div>
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Tournament Details - Takes 2 columns */}
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tournament Details</h2>
              
              <div className="grid grid-cols-2 gap-8">
                {/* Left Column */}
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Format</p>
                    <p className="text-lg font-medium text-gray-900">{tournament.format}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="text-lg font-medium text-gray-900">{tournament.startDate}</p>
                  </div>
                </div>

                {/* Right Column */}
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Skill Level</p>
                    <p className="text-lg font-medium text-gray-900">{tournament.skillLevel}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="text-lg font-medium text-gray-900">{tournament.endDate}</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Registered Teams */}
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Registered Teams</h2>
              
              <div className="space-y-3">
                {tournament.registeredTeams.map((team) => (
                  <div key={team.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                    <span className="font-medium text-gray-900">{team.name}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      team.status === 'Active' 
                        ? 'bg-gray-100 text-gray-700' 
                        : 'bg-red-500 text-white'
                    }`}>
                      {team.status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>

      <EditTournament
        isOpen={isEditTournamentOpen}
        onClose={() => setIsEditTournamentOpen(false)}
        onEditTournament={handleEditTournament}
        tournamentData={tournament}
      />
    </div>
  )
}
