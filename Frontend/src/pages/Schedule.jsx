import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import CreateSchedule from "../components/Schedule/CreateSchedule";
import { getMySchedules, createSchedule } from "../services/api.schedules";
import { getAllMatches } from "../services/api.matches";
import { getAllClubs } from "../services/api.clubs";

export default function Schedule() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [schedules, setSchedules] = useState([])
  const [matches, setMatches] = useState([])
  const [clubsMap, setClubsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)

  useEffect(() => {
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [scheds, allMatches, clubs] = await Promise.all([
          getMySchedules().catch(() => []),
          getAllMatches().catch(() => []),
          getAllClubs().catch(() => []),
        ])
        setSchedules(Array.isArray(scheds) ? scheds : [])
        setMatches(Array.isArray(allMatches) ? allMatches : [])
        const map = {}
        ;(Array.isArray(clubs) ? clubs : []).forEach((c) => { if (c?.clubId) map[c.clubId] = c.name })
        setClubsMap(map)
      } catch (err) {
        setError(err?.message || 'Failed to load schedules')
        throw err
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  const handleCreateSchedule = async (scheduleData) => {
    try {
      await createSchedule(scheduleData)
      // Reload schedules
      const scheds = await getMySchedules()
      setSchedules(Array.isArray(scheds) ? scheds : [])
      setIsCreateScheduleOpen(false)
    } catch (err) {
      setError(err?.message || 'Failed to create schedule')
      throw err
    }
  }

  const now = new Date()
  const upcomingSchedules = useMemo(() =>
    schedules.filter((s) => s?.date && new Date(s.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [schedules]
  )
  const pastSchedules = useMemo(() =>
    schedules.filter((s) => s?.date && new Date(s.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [schedules]
  )

  const getMatchForSchedule = (scheduleId) => matches.find((m) => m.scheduleId === scheduleId)

  const typeColor = (type) => {
    if (type === 'Knockout') return 'bg-red-100 text-red-700'
    if (type === 'League') return 'bg-blue-100 text-blue-700'
    return 'bg-green-100 text-green-700'
  }

  const openScheduleDetails = (schedule) => navigate(`/schedule/${schedule.scheduleId}`, { state: { schedule } })

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-3xl font-bold text-gray-900 mb-1">Schedules</h2>
              <p className="text-sm text-gray-500">Manage your upcoming matches and view past results</p>
            </div>
            <button
              onClick={() => setIsCreateScheduleOpen(true)}
              className="bg-slate-900 text-white px-6 py-2 rounded-lg font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Schedule
            </button>
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

          {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {loading && <div className="mb-6 text-gray-500">Loading schedules...</div>}

          <div className="space-y-4">
            {activeTab === 'upcoming' && upcomingSchedules.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">No upcoming matches.</div>
            )}
            {activeTab === 'upcoming' && upcomingSchedules.map((schedule) => {
              const teamOne = clubsMap[schedule.teamOneId] ?? 'Team 1'
              const teamTwo = clubsMap[schedule.teamTwoId] ?? 'Team 2'
              const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString() : 'TBD'
              const timeStr = schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              return (
                <div key={schedule.scheduleId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${typeColor(schedule.scheduleType)}`}>
                        {schedule.scheduleType ?? 'Match'}
                      </span>
                      <h3 className="text-base font-bold text-gray-900">{teamOne} vs {teamTwo}</h3>
                    </div>
                    <div className="flex items-center gap-8 flex-1">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-sm">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-sm">{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-sm">{schedule.location ?? 'TBD'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <button onClick={() => openScheduleDetails(schedule)} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors">
                        Details
                      </button>
                    </div>
                  </div>
                </div>
              )
            })}

            {activeTab === 'past' && pastSchedules.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">No past matches.</div>
            )}
            {activeTab === 'past' && pastSchedules.map((schedule) => {
              const matchResult = getMatchForSchedule(schedule.scheduleId)
              const teamOne = clubsMap[schedule.teamOneId] ?? 'Team 1'
              const teamTwo = clubsMap[schedule.teamTwoId] ?? 'Team 2'
              const score = matchResult ? `${matchResult.teamOneGoals ?? 0} - ${matchResult.teamTwoGoals ?? 0}` : '—'
              const result = matchResult
                ? matchResult.teamOneGoals > matchResult.teamTwoGoals
                  ? 'Win'
                  : matchResult.teamOneGoals < matchResult.teamTwoGoals
                    ? 'Loss'
                    : 'Draw'
                : '—'
              const resultColor = result === 'Win' ? 'bg-slate-900 text-white' : result === 'Loss' ? 'bg-red-600 text-white' : 'bg-slate-700 text-white'
              return (
                <div key={schedule.scheduleId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${typeColor(schedule.scheduleType)}`}>
                        {schedule.scheduleType ?? 'Match'}
                      </span>
                      <h3 className="text-lg font-bold text-gray-900">{teamOne} vs {teamTwo}</h3>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${resultColor}`}>{result}</span>
                    </div>
                    <div className="flex items-center gap-8">
                      <div className="flex items-center gap-2 text-gray-600">
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-sm">{schedule.date ? new Date(schedule.date).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 min-w-[60px]">{score}</div>
                    </div>
                    <button onClick={() => openScheduleDetails(schedule)} className="bg-blue-50 text-blue-700 px-5 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap">
                      View Full Stats
                    </button>
                  </div>
                </div>
              )
            })}
          </div>
        </main>
      </div>

      <CreateSchedule
        isOpen={isCreateScheduleOpen}
        onClose={() => setIsCreateScheduleOpen(false)}
        onCreateSchedule={handleCreateSchedule}
      />
    </div>
  )
}
