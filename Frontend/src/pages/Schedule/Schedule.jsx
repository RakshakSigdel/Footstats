import React, { useState, useEffect, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import CreateSchedule from "./Components/CreateSchedule";
import { getMySchedules } from "../../services/api.schedules";
import { getAllMatches } from "../../services/api.matches";
import { getAllClubs } from "../../services/api.clubs";
import { getMyScheduleRequests, approveScheduleRequest, rejectScheduleRequest } from "../../services/api.scheduleRequests";
import {
  pageVariants,
  listVariants,
  itemVariants,
  MotionButton,
  MotionCard,
} from "../../components/ui/motion";
import DynamicBackground from "../../components/ui/DynamicBackground";

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
    if (type === 'Knockout') return 'bg-red-100 text-red-700 dark:bg-red-900/30 dark:text-red-400'
    if (type === 'League') return 'bg-blue-100 text-blue-700 dark:bg-blue-900/30 dark:text-blue-400'
    if (type === 'TOURNAMENT_MATCH') return 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
    return 'bg-primary-100 text-primary-700 dark:bg-primary-900/30 dark:text-primary-400'
  }

  const formatScheduleType = (type) => {
    if (!type) return 'Match'
    return String(type).replace(/_/g, ' ')
  }

  const openScheduleDetails = (schedule) => navigate(`/schedule/${schedule.scheduleId}`, { state: { schedule } })

  const tabs = [
    { id: 'upcoming', label: 'Upcoming' },
    { id: 'past', label: 'Past Matches' },
    { id: 'inbox', label: 'Match Requests', badge: inboxRequests.length },
  ]

  return (
    <>
      <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6] exclude-link-pointer"
        >
          <DynamicBackground
            className="z-0"
            patternType="grid"
            patternSize={50}
            patternColor="rgba(15,23,42,0.035)"
            gradient="linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.92) 55%, rgba(236,253,245,0.88) 100%)"
            showAccents
          />
          <div className="relative z-10">
          {/* Header Section */}
          <div className="flex justify-between items-start mb-8">
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1 font-['Outfit']">
                <span className="gradient-text">Schedules</span>
              </h2>
              <p className="text-sm text-surface-500">
                Manage your upcoming matches and view past results
              </p>
            </div>
            <MotionButton
              onClick={() => setIsCreateScheduleOpen(true)}
              className="btn-primary px-5 py-2.5 text-sm flex items-center gap-2"
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="5" x2="12" y2="19" />
                <line x1="5" y1="12" x2="19" y2="12" />
              </svg>
              Create Schedule
            </MotionButton>
          </div>

          {/* Search and Filters */}
          <div className="flex flex-wrap gap-4 mb-6">
            <div className="relative flex-1 min-w-[200px] max-w-md">
              <svg 
                className="absolute left-3.5 top-1/2 -translate-y-1/2 text-surface-400" 
                width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
              <input
                type="text"
                placeholder="Search by team, location..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 text-sm"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-surface-400 hover:text-surface-600"
                >
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="18" y1="6" x2="6" y2="18" />
                    <line x1="6" y1="6" x2="18" y2="18" />
                  </svg>
                </button>
              )}
            </div>
            <div className="relative min-w-[190px]">
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="appearance-none w-full pr-10 pl-4 py-2.5 text-sm font-medium"
              >
                <option value="all">All Match Types</option>
                <option value="knockout">Knockout</option>
                <option value="league">League</option>
                <option value="friendly">Friendly</option>
                <option value="tournament_match">Tournament Match</option>
              </select>
              <svg className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-surface-500" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <polyline points="6 9 12 15 18 9" />
              </svg>
            </div>
          </div>

          {/* Tabs */}
          <div className="mb-8">
            <div className="inline-flex bg-surface-100 rounded-full p-1 border border-surface-200">
              {tabs.map((tab) => (
                <button 
                  key={tab.id}
                  onClick={() => { setActiveTab(tab.id); if (tab.id === 'inbox') loadInbox(); }}
                  className={`relative px-5 py-2 text-sm font-semibold rounded-full transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? 'text-gray-900'
                      : 'text-surface-500 hover:text-gray-700'
                  }`}
                >
                  {activeTab === tab.id && (
                    <motion.span
                      layoutId="schedule-tab-pill"
                      transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      className="absolute inset-0 rounded-full bg-white shadow-sm"
                    />
                  )}
                  <span className="relative z-10">{tab.label}</span>
                  {tab.badge > 0 && (
                    <span className="relative z-10 ml-1.5 inline-flex min-w-[18px] h-[18px] px-1 bg-red-500 text-white text-[10px] font-bold rounded-full items-center justify-center">
                      {tab.badge > 99 ? '99+' : tab.badge}
                    </span>
                  )}
                </button>
              ))}
            </div>
          </div>

          {error && (
            <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
              {error}
            </motion.div>
          )}
          {loading && activeTab !== 'inbox' && (
            <div className="mb-6 flex items-center gap-3 text-surface-500">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading schedules...
            </div>
          )}

          {/* Match Request Inbox */}
          <AnimatePresence mode="wait">
          {activeTab === 'inbox' && (
            <motion.div
              key="inbox"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.25 }}
              className="space-y-4"
            >
              {inboxLoading && (
                <div className="flex items-center gap-3 text-surface-500">
                  <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
                  Loading requests...
                </div>
              )}
              {!inboxLoading && inboxRequests.length === 0 && (
                <div className="app-card p-10 text-center">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                    <svg className="text-surface-400" width="28" height="28" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="1.5">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                  </div>
                  <p className="text-gray-800 font-semibold mb-1">No pending match requests</p>
                  <p className="text-surface-500 text-sm">When another club requests a match against your club, it will appear here.</p>
                </div>
              )}
              {inboxRequests.map((req, i) => {
                const s = req.schedule
                const dateStr = s?.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'
                const timeStr = s?.date ? new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
                const requester = s?.creationFromUser ? `${s.creationFromUser.firstName} ${s.creationFromUser.lastName}` : 'Unknown'
                const isActing = actionLoading === req.requestId
                return (
                  <MotionCard key={req.requestId} delay={i * 0.06} className="app-card p-5">
                    <div className="flex items-start justify-between gap-4 flex-wrap">
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2 flex-wrap">
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-accent-400/20 text-accent-600">PENDING</span>
                          <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-blue-100 text-blue-700">{s?.scheduleType ?? 'Friendly'}</span>
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 mb-1">
                          {s?.teamOne?.name ?? 'Team 1'} <span className="text-surface-400 font-normal">vs</span> {s?.teamTwo?.name ?? 'Your Club'}
                        </h3>
                        <div className="flex items-center gap-4 text-sm text-surface-600 flex-wrap">
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
                          <span className="flex items-center gap-1.5 text-surface-400">
                            <svg width="14" height="14" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" /><circle cx="12" cy="7" r="4" />
                            </svg>
                            Requested by {requester}
                          </span>
                        </div>
                      </div>
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <MotionButton onClick={() => handleReject(req.requestId)} disabled={isActing}
                          className="px-4 py-2 text-sm font-medium text-red-600 border border-red-200 rounded-xl hover:bg-red-50 disabled:opacity-50 transition-colors">
                          {isActing ? '...' : 'Decline'}
                        </MotionButton>
                        <MotionButton onClick={() => handleApprove(req.requestId)} disabled={isActing}
                          className="btn-primary px-4 py-2 text-sm disabled:opacity-50">
                          {isActing ? '...' : 'Accept'}
                        </MotionButton>
                      </div>
                    </div>
                  </MotionCard>
                )
              })}
            </motion.div>
          )}

          {activeTab !== 'inbox' && (
            <motion.div
              key={activeTab}
              variants={listVariants}
              initial="hidden"
              animate="visible"
              className="space-y-4"
            >
            {activeTab === 'upcoming' && upcomingSchedules.length === 0 && !loading && (
              <div className="app-card p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-primary-50 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-primary-400">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
                <p className="text-gray-800 font-semibold mb-1">No upcoming matches</p>
                <p className="text-surface-500 text-sm">Create a schedule to get started.</p>
              </div>
            )}
            {activeTab === 'upcoming' && upcomingSchedules.map((schedule, i) => {
              const teamOne = clubsMap[schedule.teamOneId]
              const teamTwo = clubsMap[schedule.teamTwoId]
              const dateStr = schedule.date ? new Date(schedule.date).toLocaleDateString() : 'TBD'
              const timeStr = schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ''
              return (
                <motion.div key={schedule.scheduleId} variants={itemVariants} className="app-card p-5 cursor-pointer" onClick={() => openScheduleDetails(schedule)}>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-center leading-4 w-[132px] shrink-0 whitespace-normal break-words ${typeColor(schedule.scheduleType)}`}>
                        {formatScheduleType(schedule.scheduleType)}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0 border border-primary-200">
                          {getClubLogoUrl(teamOne?.logo) ? (
                            <img src={getClubLogoUrl(teamOne.logo)} alt={teamOne?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary-700">{teamOne?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                        <h3 className="text-base font-bold text-gray-900 max-w-[170px] truncate">{teamOne?.name ?? 'Team 1'}</h3>
                        <span className="text-surface-400 font-semibold text-xs uppercase tracking-wider">vs</span>
                        <h3 className="text-base font-bold text-gray-900 max-w-[170px] truncate">{teamTwo?.name ?? 'Team 2'}</h3>
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-100 flex items-center justify-center flex-shrink-0 border border-surface-200">
                          {getClubLogoUrl(teamTwo?.logo) ? (
                            <img src={getClubLogoUrl(teamTwo.logo)} alt={teamTwo?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-surface-600">{teamTwo?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-6 flex-1">
                      <div className="flex items-center gap-2 text-surface-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-sm">{dateStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-surface-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span className="text-sm">{timeStr}</span>
                      </div>
                      <div className="flex items-center gap-2 text-surface-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span className="text-sm">{schedule.location ?? 'TBD'}</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-3 flex-shrink-0">
                      <MotionButton onClick={(e) => { e.stopPropagation(); openScheduleDetails(schedule); }} className="bg-primary-50 text-primary-700 px-4 py-2 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors border border-primary-200">
                        Details
                      </MotionButton>
                    </div>
                  </div>
                </motion.div>
              )
            })}

            {activeTab === 'past' && pastSchedules.length === 0 && !loading && (
              <div className="app-card p-10 text-center">
                <div className="w-16 h-16 mx-auto mb-4 rounded-2xl bg-surface-100 flex items-center justify-center">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" className="text-surface-400">
                    <circle cx="12" cy="12" r="10" />
                    <polyline points="12 6 12 12 16 14" />
                  </svg>
                </div>
                <p className="text-gray-800 font-semibold mb-1">No past matches</p>
                <p className="text-surface-500 text-sm">Completed matches will appear here.</p>
              </div>
            )}
            {activeTab === 'past' && pastSchedules.map((schedule, i) => {
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
              const resultColor = result === 'Win' 
                ? 'bg-primary-600 text-white' 
                : result === 'Loss' 
                  ? 'bg-red-500 text-white' 
                  : 'bg-surface-600 text-white'
              return (
                <motion.div key={schedule.scheduleId} variants={itemVariants} className="app-card p-5 cursor-pointer" onClick={() => openScheduleDetails(schedule)}>
                  <div className="flex items-center justify-between gap-6">
                    <div className="flex items-center gap-4 flex-1 min-w-0">
                      <span className={`px-3 py-1 rounded-full text-[11px] font-bold text-center leading-4 w-[132px] shrink-0 whitespace-normal break-words ${typeColor(schedule.scheduleType)}`}>
                        {formatScheduleType(schedule.scheduleType)}
                      </span>
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-primary-100 flex items-center justify-center flex-shrink-0 border border-primary-200">
                          {getClubLogoUrl(teamOne?.logo) ? (
                            <img src={getClubLogoUrl(teamOne.logo)} alt={teamOne?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-primary-700">{teamOne?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                        <h3 className="text-lg font-bold text-gray-900 max-w-[170px] truncate">{teamOne?.name ?? 'Team 1'}</h3>
                        <span className="text-surface-400 font-semibold text-xs uppercase tracking-wider">vs</span>
                        <h3 className="text-lg font-bold text-gray-900 max-w-[170px] truncate">{teamTwo?.name ?? 'Team 2'}</h3>
                        <div className="w-9 h-9 rounded-xl overflow-hidden bg-surface-100 flex items-center justify-center flex-shrink-0 border border-surface-200">
                          {getClubLogoUrl(teamTwo?.logo) ? (
                            <img src={getClubLogoUrl(teamTwo.logo)} alt={teamTwo?.name} className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-xs font-bold text-surface-600">{teamTwo?.name?.[0] || 'T'}</span>
                          )}
                        </div>
                      </div>
                      <span className={`px-3 py-1 rounded-full text-xs font-bold whitespace-nowrap ${resultColor}`}>{result}</span>
                    </div>
                    <div className="flex items-center gap-6">
                      <div className="flex items-center gap-2 text-surface-600">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span className="text-sm">{schedule.date ? new Date(schedule.date).toLocaleDateString() : '—'}</span>
                      </div>
                      <div className="text-2xl font-bold text-gray-900 min-w-[60px] text-center font-['Outfit']">{score}</div>
                    </div>
                    <MotionButton onClick={(e) => { e.stopPropagation(); openScheduleDetails(schedule); }} className="bg-primary-50 text-primary-700 px-5 py-2 rounded-xl text-sm font-semibold hover:bg-primary-100 transition-colors whitespace-nowrap border border-primary-200">
                      View Full Stats
                    </MotionButton>
                  </div>
                </motion.div>
              )
            })}
          </motion.div>
          )}
          </AnimatePresence>
          </div>
      </motion.main>

      <CreateSchedule
        isOpen={isCreateScheduleOpen}
        onClose={() => setIsCreateScheduleOpen(false)}
        onCreated={handleScheduleCreated}
      />
    </>
  )
}
