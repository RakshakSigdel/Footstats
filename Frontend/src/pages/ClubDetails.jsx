
import React, { useState } from 'react'
import Sidebar from '../components/Global/Sidebar'
import Topbar from '../components/Global/Topbar'
import { useParams, useNavigate } from 'react-router-dom'

export default function ClubDetails() {
  const { clubId } = useParams()
  const navigate = useNavigate()
  
  // Mock data - replace with API call
  const clubData = {
    id: 1,
    name: 'Kathmandu FC',
    logo: '🏆',
    members: 32,
    founded: 2018,
    location: 'Kathmandu, Nepal',
    totalMatches: 156,
    winRate: '68%',
    tournamentsWon: 8,
    activePlayers: 32,
    teamMembers: [
      { id: 1, name: 'Rajesh Shrestha', position: 'Forward', number: 10, matches: 28, goals: 24, initials: 'R' },
      { id: 2, name: 'Anil Maharjan', position: 'Midfielder', number: 8, matches: 30, goals: 12, initials: 'A' },
      { id: 3, name: 'Sunil Tamang', position: 'Defender', number: 5, matches: 29, goals: 3, initials: 'S' },
      { id: 4, name: 'Bikash Rai', position: 'Goalkeeper', number: 1, matches: 32, goals: 0, initials: 'B' },
      { id: 5, name: 'Kiran Limbu', position: 'Forward', number: 11, matches: 25, goals: 18, initials: 'K' },
    ],
    recentResults: [
      { id: 1, opponent: 'Pokhara United', result: 'Win', score: '3-1', date: 'Dec 15' },
      { id: 2, opponent: 'Lalitpur City', result: 'Win', score: '2-0', date: 'Dec 12' },
      { id: 3, opponent: 'Biratnagar Kings', result: 'Draw', score: '1-1', date: 'Dec 8' },
      { id: 4, opponent: 'Dharan Heroes', result: 'Win', score: '4-2', date: 'Dec 5' },
    ]
  }

  const getResultColor = (result) => {
    switch(result) {
      case 'Win':
        return 'bg-green-100 text-green-700'
      case 'Draw':
        return 'bg-yellow-100 text-yellow-700'
      case 'Loss':
        return 'bg-red-100 text-red-700'
      default:
        return 'bg-gray-100 text-gray-700'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          {/* Header Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-start justify-between mb-6">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0">
                  <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
                
                <div>
                  <div className="flex items-center gap-3">
                    <h1 className="text-3xl font-bold text-gray-900">{clubData.name}</h1>
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="#FFD700" stroke="#FFD700" strokeWidth="2">
                      <circle cx="12" cy="8" r="7"/>
                      <path d="M8 15h8M7 15h10"/>
                    </svg>
                  </div>
                  <p className="text-sm text-gray-500 mt-1">
                    Founded {clubData.founded} • {clubData.location}
                  </p>
                </div>
              </div>

              <div className="text-right">
                <div className="text-3xl font-bold text-gray-900">{clubData.members}</div>
                <div className="text-sm text-gray-500">Members</div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4 border-t border-gray-100">
              <button className="bg-blue-600 text-white py-2 px-6 rounded-lg font-medium hover:bg-blue-700 transition-colors flex items-center justify-center gap-2">
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                Invite Members
              </button>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
                <span className="text-sm text-gray-600">Total Matches</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{clubData.totalMatches}</div>
              <div className="text-xs text-gray-500 mt-2">This season</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <polyline points="12 3 20 7.5 20 16.5 12 21 4 16.5 4 7.5 12 3"></polyline>
                  <line x1="12" y1="12" x2="20" y2="7.5"></line>
                  <line x1="12" y1="12" x2="12" y2="21"></line>
                  <line x1="12" y1="12" x2="4" y2="7.5"></line>
                </svg>
                <span className="text-sm text-gray-600">Win Rate</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{clubData.winRate}</div>
              <div className="text-xs text-gray-500 mt-2">Last 50 games</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <circle cx="12" cy="8" r="7"/>
                  <path d="M8 15h8M7 15h10"/>
                </svg>
                <span className="text-sm text-gray-600">Tournaments Won</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{clubData.tournamentsWon}</div>
              <div className="text-xs text-gray-500 mt-2">All time</div>
            </div>

            <div className="bg-white rounded-xl shadow-sm p-5 border border-gray-100">
              <div className="flex items-center gap-3 mb-3">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2">
                  <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                  <circle cx="9" cy="7" r="4" />
                  <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                  <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                </svg>
                <span className="text-sm text-gray-600">Active Players</span>
              </div>
              <div className="text-3xl font-bold text-gray-900">{clubData.activePlayers}</div>
              <div className="text-xs text-gray-500 mt-2">Registered</div>
            </div>
          </div>

          {/* Team Members Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 mb-6 border border-gray-100">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-lg font-bold text-gray-900">Team Members</h2>
              <button className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                View All
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Player</th>
                    <th className="text-left py-3 px-2 font-semibold text-gray-700">Position</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Number</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Matches</th>
                    <th className="text-center py-3 px-2 font-semibold text-gray-700">Goals</th>
                  </tr>
                </thead>
                <tbody>
                  {clubData.teamMembers.map((player) => (
                    <tr key={player.id} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-3 px-2">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                            {player.initials}
                          </div>
                          <span className="font-medium text-gray-900">{player.name}</span>
                        </div>
                      </td>
                      <td className="py-3 px-2 text-gray-600">{player.position}</td>
                      <td className="py-3 px-2 text-center">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded font-semibold">
                          {player.number}
                        </span>
                      </td>
                      <td className="py-3 px-2 text-center text-gray-700">{player.matches}</td>
                      <td className="py-3 px-2 text-center text-gray-900 font-semibold">{player.goals}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* Recent Results Section */}
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-lg font-bold text-gray-900 mb-6">Recent Results</h2>

            <div className="space-y-3">
              {clubData.recentResults.map((result) => (
                <div key={result.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg hover:bg-gray-50 transition-colors">
                  <div className="flex items-center gap-3">
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${getResultColor(result.result)}`}>
                      {result.result}
                    </span>
                    <span className="text-gray-900 font-medium">{result.opponent}</span>
                  </div>
                  <div className="text-right">
                    <div className="text-lg font-bold text-gray-900">{result.score}</div>
                    <div className="text-xs text-gray-500">{result.date}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
