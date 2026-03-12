import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import CreateSchedule from "./Components/CreateSchedule";
import { getMySchedules } from "../../services/api.schedules";
import { getAllMatches } from "../../services/api.matches";
import { getAllClubs } from "../../services/api.clubs";
import { getMyScheduleRequests, approveScheduleRequest, rejectScheduleRequest } from "../../services/api.scheduleRequests";

export default function Schedule() {
  const navigate = useNavigate()
  const [activeTab, setActiveTab] = useState('upcoming')
  const [schedules, setSchedules] = useState([])
  const [matches, setMatches] = useState([])
  const [clubsMap, setClubsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isCreateScheduleOpen, setIsCreateScheduleOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [typeFilter, setTypeFilter] = useState("all")
  const [inboxRequests, setInboxRequests] = useState([])
  const [inboxLoading, setInboxLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(null)

  const getClubLogoUrl = (logoPath) => {
    if (!logoPath) return null;
    return logoPath.startsWith('http') ? logoPath : `http://localhost:5555${logoPath}`;
  };

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
        loadInbox()
        setSchedules(Array.isArray(scheds) ? scheds : [])
        setMatches(Array.isArray(allMatches) ? allMatches : [])
        const map = {}
        ;(Array.isArray(clubs) ? clubs : []).forEach((c) => { if (c?.clubId) map[c.clubId] = c })
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

  const loadInbox = async () => {
    setInboxLoading(true)
    try {
      const reqs = await getMyScheduleRequests().catch(() => [])
      setInboxRequests(Array.isArray(reqs) ? reqs : [])
    } finally {
      setInboxLoading(false)
    }
  }

  const handleApprove = async (requestId) => {
    setActionLoading(requestId)
    try {
      await approveScheduleRequest(requestId)
      setInboxRequests((prev) => prev.filter((r) => r.requestId !== requestId))
      // Refresh schedules so the newly approved one appears
      const scheds = await getMySchedules().catch(() => [])
      setSchedules(Array.isArray(scheds) ? scheds : [])
    } catch (err) {
      setError(err?.message || 'Failed to approve request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleReject = async (requestId) => {
    setActionLoading(requestId)
    try {
      await rejectScheduleRequest(requestId)
      setInboxRequests((prev) => prev.filter((r) => r.requestId !== requestId))
    } catch (err) {
      setError(err?.message || 'Failed to reject request')
    } finally {
      setActionLoading(null)
    }
  }

  const handleScheduleCreated = async () => {
    try {
      const scheds = await getMySchedules()
      setSchedules(Array.isArray(scheds) ? scheds : [])
    } catch (err) {
      setError(err?.message || 'Failed to reload schedules')
    }
  }

  const now = new Date()
  
  // Filter function for search and type
  const filterSchedule = (s) => {
    const teamOne = clubsMap[s.teamOneId]?.name || ''
    const teamTwo = clubsMap[s.teamTwoId]?.name || ''
    const matchesSearch = !searchQuery.trim() ||
      teamOne.toLowerCase().includes(searchQuery.toLowerCase()) ||
      teamTwo.toLowerCase().includes(searchQuery.toLowerCase()) ||
      s.location?.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = typeFilter === "all" || s.scheduleType?.toLowerCase() === typeFilter.toLowerCase()
    return matchesSearch && matchesType
  }

  const upcomingSchedules = useMemo(() =>
    schedules.filter((s) => s?.date && new Date(s.date) >= now).filter(filterSchedule).sort((a, b) => new Date(a.date) - new Date(b.date)),
    [schedules, searchQuery, typeFilter, clubsMap]
  )
  const pastSchedules = useMemo(() =>
    schedules.filter((s) => s?.date && new Date(s.date) < now).filter(filterSchedule).sort((a, b) => new Date(b.date) - new Date(a.date)),
    [schedules, searchQuery, typeFilter, clubsMap]
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

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg 
                className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" 
                width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by team, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <select
              value={typeFilter}
              onChange={(e) => setTypeFilter(e.target.value)}
              className="px-4 py-2.5 border border-gray-200 rounded-lg bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Types</option>
              <option value="knockout">Knockout</option>
              <option value="league">League</option>
              <option value="friendly">Friendly</option>
            </select>
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
              <button
                onClick={() => { setActiveTab('inbox'); loadInbox(); }}
                className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all ${
                  activeTab === 'inbox'
                    ? 'bg-white shadow-sm'
                    : 'text-gray-500 hover:text-gray-700'
                }`}
              >
                Match Requests
                {inboxRequests.length > 0 && (
                  <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full flex items-center justify-center">
                    {inboxRequests.length > 99 ? '99+' : inboxRequests.length}
                  </span>
                )}
              </button>
            </div>
          </div>

          {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {loading && activeTab !== 'inbox' && <div className="mb-6 text-gray-500">Loading schedules...</div>}

          {/* Match Request Inbox */}
          {activeTab === 'inbox' && (
            <div className="space-y-4">
              {inboxLoading && <div className="text-gray-500">Loading requests...</div>}
              {!inboxLoading && inboxRequests.length === 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center">
                  <svg className="mx-auto mb-3 text-gray-300" width="40" height="40" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                  </svg>
                  <p className="text-gray-500 font-medium">No pending match requests</p>
                  <p className="text-gray-400 text-sm mt-1">When another club requests a match against your club, it will appear here.</p>
                </div>
              )}
              {inboxRequests.map((req) => {
                const s = req.schedule
                const dateStr = s?.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'
                const timeStr = s?.date ? new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                const requester = s?.creationFromUser ? `${s.creationFromUser.firstName} ${s.creationFromUser.lastName}` : 'Unknown'
                const isActing = actionLoading === req.requestId
                return (
                  <div key={req.requestId} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-yellow-100 text-yellow-700">PENDING</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{s?.scheduleType ?? 'Friendly'}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {s?.teamOne?.name ?? 'Team 1'} <span className="text-gray-400 font-normal">vs</span> {s?.teamTwo?.name ?? 'Your Club'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-gray-600 flex-wrap">
                          <span className="flex items-center gap-1.5">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <rect x="3" y="4" width="18" height="18" rx="2" /><line x1="16" y1="2" x2="16" y2="6" /><line x1="8" y1="2" x2="8" y2="6" /><line x1="3" y1="10" x2="21" y2="10" />
                            </svg>
                            {dateStr} {timeStr && `· ${timeStr}`}
                          </span>
                          {s?.location && (
                            <span className="flex items-center gap-1.5">
                              <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" /><circle cx="12" cy="10" r="3" />
                              </svg>
                              {s.location}
                            </span>
                          )}
                          <span className="flex items-center gap-1.5 text-gray-400">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            Requested by {requester}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button onClick={() => handleReject(req.requestId)} disabled={isActing}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50 transition-colors">
                          {isActing ? '...' : 'Decline'}
                        </button>
                        <button onClick={() => handleApprove(req.requestId)} disabled={isActing}
                          className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors">
                          {isActing ? '...' : 'Accept'}
                        </button>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab !== 'inbox' && <div className="space-y-4">
            {activeTab === 'upcoming' && upcomingSchedules.length === 0 && !loading && (
              <div className="bg-white rounded-lg shadow-sm border border-gray-100 p-8 text-center text-gray-500">No upcoming matches.</div>
            )}
            {activeTab === 'upcoming' && upcomingSchedules.map((schedule) => {
              const teamOne = clubsMap[schedule.teamOneId]
              const teamTwo = clubsMap[schedule.teamTwoId]
              const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString() : 'TBD'
              const timeStr = schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              return (
                <div key={schedule.scheduleId} className="bg-white rounded-lg shadow-sm border border-gray-100 p-5">
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1">
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${typeColor(schedule.scheduleType)}`}>
                        {schedule.scheduleType ?? 'Match'}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getClubLogoUrl(teamOne?.logo) ? (
                            <img src={getClubLogoUrl(teamOne.logo)} alt={teamOne?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-600">{teamOne?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900">{teamOne?.name ?? 'Team 1'}</h3>
                        <span className="text-gray-400 font-medium">vs</span>
                        <h3 className="text-base font-bold text-gray-900">{teamTwo?.name ?? 'Team 2'}</h3>
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getClubLogoUrl(teamTwo?.logo) ? (
                            <img src={getClubLogoUrl(teamTwo.logo)} alt={teamTwo?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-600">{teamTwo?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                      </div>
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
              const teamOne = clubsMap[schedule.teamOneId]
              const teamTwo = clubsMap[schedule.teamTwoId]
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
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getClubLogoUrl(teamOne?.logo) ? (
                            <img src={getClubLogoUrl(teamOne.logo)} alt={teamOne?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-600">{teamOne?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900">{teamOne?.name ?? 'Team 1'}</h3>
                        <span className="text-gray-400 font-medium">vs</span>
                        <h3 className="text-lg font-bold text-gray-900">{teamTwo?.name ?? 'Team 2'}</h3>
                        <div className="w-8 h-8 rounded-lg overflow-hidden bg-gray-100 flex items-center justify-center flex-shrink-0">
                          {getClubLogoUrl(teamTwo?.logo) ? (
                            <img src={getClubLogoUrl(teamTwo.logo)} alt={teamTwo?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-gray-600">{teamTwo?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                      </div>
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
          </div>}
        </main>
      </div>

      <CreateSchedule
        isOpen={isCreateScheduleOpen}
        onClose={() => setIsCreateScheduleOpen(false)}
        onCreated={handleScheduleCreated}
      />
    </div>
  )
}
