import React, { useState } from 'react'
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";

export default function Schedule() {
  const [activeTab, setActiveTab] = useState('upcoming')

  const upcomingMatches = [
    {
      id: 1,
      type: 'League',
      typeColor: 'bg-blue-100 text-blue-700',
      opponent: 'Kathmandu FC',
      date: 'Mar 15',
      time: '16:00',
      stadium: 'Dasharath Stadium'
    },
    {
      id: 2,
      type: 'Friendly',
      typeColor: 'bg-green-100 text-green-700',
      opponent: 'Pokhara United',
      date: 'Mar 18',
      time: '14:30',
      stadium: 'Pokhara Stadium'
    },
    {
      id: 3,
      type: 'Cup',
      typeColor: 'bg-red-100 text-red-700',
      opponent: 'Lalitpur Strikers',
      date: 'Mar 22',
      time: '15:00',
      stadium: 'ANFA Complex'
    },
    {
      id: 4,
      type: 'League',
      typeColor: 'bg-blue-100 text-blue-700',
      opponent: 'Bhaktapur Warriors',
      date: 'Mar 25',
      time: '17:00',
      stadium: 'Tudhkhel Ground'
    }
  ]

  const pastMatches = [
    {
      id: 1,
      type: 'League',
      typeColor: 'bg-blue-900 text-white',
      opponent: 'Valley FC',
      date: 'Mar 10',
      score: '3 - 2',
      result: 'Win',
      resultColor: 'bg-gray-900 text-white'
    },
    {
      id: 2,
      type: 'Friendly',
      typeColor: 'bg-gray-800 text-white',
      opponent: 'Nepal United',
      date: 'Mar 8',
      score: '1 - 1',
      result: 'Draw',
      resultColor: 'bg-gray-700 text-white'
    },
    {
      id: 3,
      type: 'Cup',
      typeColor: 'bg-red-600 text-white',
      opponent: 'Capital Stars',
      date: 'Mar 5',
      score: '0 - 2',
      result: 'Loss',
      resultColor: 'bg-gray-700 text-white'
    }
  ]

  const matches = activeTab === 'upcoming' ? upcomingMatches : pastMatches

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Header Section */}
          <div className="mb-8">
            <h2 className="text-3xl font-bold text-gray-900 mb-1">Schedules</h2>
            <p className="text-sm text-gray-500">Manage your upcoming matches and view past results</p>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex bg-gray-100 rounded-full p-1 border border-gray-200">
              <button 
                onClick={() => setActiveTab('upcoming')}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'upcoming' 
                    ? 'bg-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Upcoming
              </button>
              <button 
                onClick={() => setActiveTab('past')}
                className={`px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'past' 
                    ? 'bg-white shadow-sm' 
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Past Matches
              </button>
            </div>
          </div>

          {/* Match Cards */}
          <div className="space-y-4">
            {matches.map((match) => (
              activeTab === 'upcoming' ? (
                // Upcoming Matches Layout
                <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between gap-6">
                    {/* Match Type and Details */}
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${match.typeColor}`}>
                        {match.type}
                      </span>
                      <div className="flex-1 min-w-0">
                        <h3 className="text-base font-bold text-gray-900">vs {match.opponent}</h3>
                      </div>
                    </div>

                    {/* Match Info */}
                    <div className="flex items-center gap-8 flex-1">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-sm">{match.date}</span>
                      </div>

                      {/* Time */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-sm">{match.time}</span>
                      </div>

                      {/* Stadium */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-sm">{match.stadium}</span>
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        Details
                      </button>
                      <button className="bg-gray-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors">
                        Confirm Attendance
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                // Past Matches Layout
                <div key={match.id} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between gap-6">
                    {/* Left: Type, Opponent, Result */}
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${match.typeColor}`}>
                        {match.type}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">vs {match.opponent}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${match.resultColor}`}>
                        {match.result}
                      </span>
                    </div>

                    {/* Middle: Date and Score */}
                    <div className="flex items-center gap-8">
                      {/* Date */}
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-sm">{match.date}</span>
                      </div>

                      {/* Score */}
                      <div className="text-2xl font-bold text-gray-900 min-w-[60px]">
                        {match.score}
                      </div>
                    </div>

                    {/* Right: View Full Stats Button */}
                    <button className="bg-blue-50 text-blue-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap">
                      View Full Stats
                    </button>
                  </div>
                </div>
              )
            ))}
          </div>

          {/* Schedule a New Match Section */}
          <div className="mt-12 flex flex-col items-center justify-center py-12 bg-white rounded-lg border border-gray-100">
            <svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#6B7280" strokeWidth="2" className="mb-4">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <h3 className="text-lg font-bold text-gray-900 mb-2">Schedule a New Match</h3>
            <p className="text-sm text-gray-500 mb-6">Organize a match with another club</p>
            <button className="bg-gray-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-gray-800 transition-colors">
              Create Match Request
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
