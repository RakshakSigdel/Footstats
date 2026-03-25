import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getScheduleById } from '../../services/api.schedules'
import { getClubMembers } from '../../services/api.clubs'
import { createMatch } from '../../services/api.matches'
import { createMatchEvent, updateMatchEvent, deleteMatchEvent } from '../../services/api.matchEvents'
import ScheduleMatchLineup from './Components/ScheduleMatchLineup'
import { pageVariants, MotionButton } from "../../components/ui/motion";
import DynamicBackground from "../../components/ui/DynamicBackground";

export default function ScheduleDetails() {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  const [showEventModal, setShowEventModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  
  const [teamOneMembers, setTeamOneMembers] = useState([])
  const [teamTwoMembers, setTeamTwoMembers] = useState([])
  
  const [eventForm, setEventForm] = useState({
    eventType: 'GOAL',
    clubId: '',
    userId: '',
    assistById: '',
    minute: ''
  })
  
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)
  const [creatingMatch, setCreatingMatch] = useState(false)
  
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  const loadSchedule = async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await getScheduleById(scheduleId)
      setSchedule(s)
      
      if (s.teamOneId) {
        try {
          const members = await getClubMembers(s.teamOneId)
          setTeamOneMembers(members || [])
        } catch (e) {
          console.error("Failed to load team one members:", e)
        }
      }
      if (s.teamTwoId) {
        try {
          const members = await getClubMembers(s.teamTwoId)
          setTeamTwoMembers(members || [])
        } catch (e) {
          console.error("Failed to load team two members:", e)
        }
      }
    } catch (err) {
      setError(err?.message || 'Failed to load schedule')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (!scheduleId) return
    loadSchedule()
  }, [scheduleId])

  const match = schedule?.match
  const teamOneName = schedule?.teamOne?.name || 'Team 1'
  const teamTwoName = schedule?.teamTwo?.name || 'Team 2'
  const matchSize = schedule?.matchSize || 11
  const typeColor = schedule?.scheduleType === 'Knockout' ? 'bg-red-100 text-red-700' : schedule?.scheduleType === 'League' ? 'bg-blue-100 text-blue-700' : 'bg-primary-100 text-primary-700'

  const teamOneLineup = match?.lineups?.filter(l => l.club?.clubId === schedule?.teamOneId) || []
  const teamTwoLineup = match?.lineups?.filter(l => l.club?.clubId === schedule?.teamTwoId) || []

  const getEventIcon = (eventType) => {
    switch(eventType) {
      case 'GOAL': return '⚽'
      case 'YELLOW_CARD': return '🟨'
      case 'RED_CARD': return '🟥'
      case 'SUBSTITUTION': return '🔄'
      default: return '•'
    }
  }

  const canManage = () => {
    if (!currentUser.id) return false
    if (schedule?.creationFromUser?.userId === currentUser.id) return true
    const isTeamOneAdmin = teamOneMembers.find(
      m => m.user?.userId === currentUser.id && (m.role === 'ADMIN' || m.isCreator)
    )
    if (isTeamOneAdmin) return true
    const isTeamTwoAdmin = teamTwoMembers.find(
      m => m.user?.userId === currentUser.id && (m.role === 'ADMIN' || m.isCreator)
    )
    if (isTeamTwoAdmin) return true
    return false
  }

  const handleCreateMatch = async () => {
    setCreatingMatch(true)
    setError(null)
    try {
      await createMatch({ scheduleId: schedule.scheduleId })
      await loadSchedule()
    } catch (err) {
      setError(err?.message || 'Failed to initialize match details')
    } finally {
      setCreatingMatch(false)
    }
  }

  const openAddEventModal = () => {
    setEditingEvent(null)
    setEventForm({
      eventType: 'GOAL',
      clubId: schedule?.teamOneId?.toString() || '',
      userId: '',
      assistById: '',
      minute: ''
    })
    setModalError(null)
    setShowEventModal(true)
  }

  const openEditEventModal = (event) => {
    setEditingEvent(event)
    setEventForm({
      eventType: event.eventType,
      clubId: event.club?.clubId?.toString() || '',
      userId: event.user?.userId?.toString() || '',
      assistById: event.assistBy?.userId?.toString() || '',
      minute: event.minute?.toString() || ''
    })
    setModalError(null)
    setShowEventModal(true)
  }

  const handleEventSubmit = async () => {
    if (!eventForm.clubId || !eventForm.userId || !eventForm.minute) {
      setModalError("Please fill in all required fields")
      return
    }
    
    setModalLoading(true)
    setModalError(null)
    try {
      const data = {
        matchId: match.matchId,
        eventType: eventForm.eventType,
        clubId: Number(eventForm.clubId),
        userId: Number(eventForm.userId),
        assistById: eventForm.assistById ? Number(eventForm.assistById) : null,
        minute: Number(eventForm.minute)
      }
      
      if (editingEvent) {
        await updateMatchEvent(editingEvent.matchEventId, data)
      } else {
        await createMatchEvent(data)
      }
      
      setShowEventModal(false)
      await loadSchedule()
    } catch (err) {
      setModalError(err?.response?.data?.message || err?.message || "Failed to save event")
    } finally {
      setModalLoading(false)
    }
  }

  const handleDeleteEvent = async (eventId) => {
    if (!window.confirm("Are you sure you want to delete this event?")) return
    
    try {
      await deleteMatchEvent(eventId)
      await loadSchedule()
    } catch (err) {
      setError(err?.message || "Failed to delete event")
    }
  }

  const getPlayersForClub = (clubId) => {
    const id = Number(clubId)
    let members = []
    if (id === schedule?.teamOneId) members = teamOneMembers
    else if (id === schedule?.teamTwoId) members = teamTwoMembers
    return members.map(m => m.user).filter(Boolean)
  }

  return (
    <>
      <motion.main
          variants={pageVariants}
          initial="initial"
          animate="animate"
          exit="exit"
          className="relative flex-1 p-4 md:p-8 overflow-auto bg-[#eef1f6] exclude-link-pointer"
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
          <MotionButton onClick={() => navigate(-1)} className="flex items-center gap-2 text-primary-600 hover:text-primary-700 mb-6 font-semibold text-sm">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </MotionButton>

          {error && <motion.div initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }} className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{error}</motion.div>}
          {loading && (
            <div className="mb-6 flex items-center gap-3 text-surface-500">
              <div className="w-5 h-5 border-2 border-primary-500 border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          )}
          {!schedule && !loading && <div className="mb-6 text-surface-500">Schedule not found.</div>}

          {schedule && (
            <>
              {/* Match Header */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="app-card p-6 md:p-8 mb-6"
              >
                <div className="flex flex-col md:flex-row justify-between items-start mb-6 gap-4">
                  <div>
                    <div className="flex items-center gap-2 mb-3">
                      <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${typeColor}`}>
                        {schedule.scheduleType ?? 'Match'}
                      </span>
                      <span className="inline-block px-3 py-1 rounded-full text-sm font-semibold bg-purple-100 text-purple-700">
                        {matchSize}v{matchSize}
                      </span>
                    </div>
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2 font-['Outfit']">
                      {teamOneName} <span className="text-surface-400">vs</span> {teamTwoName}
                    </h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-surface-600 text-sm">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{schedule.location ?? 'TBD'}</span>
                      </div>
                    </div>
                  </div>
                  <div className="text-left md:text-right">
                    <div className="bg-primary-50 border border-primary-200 rounded-2xl px-4 md:px-6 py-3 inline-block">
                      <p className="text-sm text-surface-600 mb-1">
                        {schedule.date ? new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold gradient-text font-['Outfit']">
                        {schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Display */}
                {match && (
                  <div className="bg-gradient-to-r from-primary-900 via-primary-800 to-primary-900 rounded-2xl p-4 md:p-6 mt-6">
                    <div className="flex items-center justify-center gap-6 md:gap-12">
                      <div className="text-center flex-1">
                        <p className="text-lg md:text-xl font-bold text-white/80 mb-2">{teamOneName}</p>
                        <p className="text-4xl md:text-6xl font-bold text-white font-['Outfit']">{match.teamOneGoals ?? 0}</p>
                      </div>
                      <div className="text-2xl md:text-4xl font-bold text-white/40">-</div>
                      <div className="text-center flex-1">
                        <p className="text-lg md:text-xl font-bold text-white/80 mb-2">{teamTwoName}</p>
                        <p className="text-4xl md:text-6xl font-bold text-white font-['Outfit']">{match.teamTwoGoals ?? 0}</p>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        schedule.scheduleStatus === 'FINISHED' ? 'bg-white/20 text-white' :
                        schedule.scheduleStatus === 'ONGOING' ? 'bg-primary-400 text-white animate-pulse-glow' :
                        'bg-white/10 text-white/70'
                      }`}>
                        {schedule.scheduleStatus ?? 'Scheduled'}
                      </span>
                    </div>
                  </div>
                )}

                {!match && (
                  <div className="bg-surface-50 rounded-2xl p-6 mt-6 text-center border border-surface-200">
                    {canManage() ? (
                      <div>
                        <p className="text-surface-600 mb-4">
                          {schedule.scheduleStatus === 'FINISHED'
                            ? 'The match is finished. Record the lineup and match events now.'
                            : 'Record lineup and match events for this match.'}
                        </p>
                        <MotionButton
                          onClick={handleCreateMatch}
                          disabled={creatingMatch}
                          className="btn-primary px-6 py-2.5 text-sm disabled:opacity-50"
                        >
                          {creatingMatch ? 'Setting up...' : 'Record Match Details'}
                        </MotionButton>
                      </div>
                    ) : (
                      <p className="text-surface-500">
                        {schedule.scheduleStatus === 'FINISHED'
                          ? 'Match details have not been recorded yet'
                          : 'Match not started yet'}
                      </p>
                    )}
                  </div>
                )}
              </motion.div>

              {/* Match Events */}
              <motion.div
                initial={{ opacity: 0, y: 16 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="app-card p-6 mb-6"
              >
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900 font-['Outfit']">Match Events</h2>
                  {canManage() && match && schedule?.date && new Date(schedule.date) <= new Date() && (
                    <MotionButton 
                      onClick={openAddEventModal}
                      className="btn-primary px-4 py-2 text-sm flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Event
                    </MotionButton>
                  )}
                </div>
                
                {(!match?.matchEvents || match.matchEvents.length === 0) ? (
                  <p className="text-surface-500 text-center py-6">No events recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {match.matchEvents.map((event) => (
                      <div key={event.matchEventId} className="flex items-center gap-4 p-4 border border-surface-200 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all">
                        <div className="text-2xl">{getEventIcon(event.eventType)}</div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-gray-900">{event.user?.firstName} {event.user?.lastName}</span>
                            <span className="text-sm text-surface-600">({event.club?.name})</span>
                            {event.assistBy && (
                              <span className="text-sm text-surface-500">
                                • Assist: {event.assistBy.firstName} {event.assistBy.lastName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-surface-600 capitalize">{event.eventType.replace('_', ' ').toLowerCase()}</p>
                        </div>
                        <div className="bg-primary-50 border border-primary-200 px-3 py-1 rounded-full">
                          <span className="font-bold text-primary-700">{event.minute}'</span>
                        </div>
                        {canManage() && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditEventModal(event)}
                              className="text-surface-400 hover:text-primary-600 p-1.5 rounded-lg hover:bg-primary-50 transition-colors"
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.matchEventId)}
                              className="text-surface-400 hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                              title="Delete"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <polyline points="3 6 5 6 21 6" />
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                              </svg>
                            </button>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </motion.div>

              <ScheduleMatchLineup
                schedule={schedule}
                match={match}
                teamOneName={teamOneName}
                teamTwoName={teamTwoName}
                matchSize={matchSize}
                teamOneLineup={teamOneLineup}
                teamTwoLineup={teamTwoLineup}
                canManage={canManage}
                getPlayersForClub={getPlayersForClub}
                onReload={loadSchedule}
                onError={setError}
              />
            </>
          )}
          </div>
      </motion.main>

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 10 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="app-card w-full max-w-md p-6"
          >
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900 font-['Outfit']">
                {editingEvent ? 'Edit Event' : 'Add Match Event'}
              </h2>
              <button onClick={() => setShowEventModal(false)} className="text-surface-400 hover:text-surface-600 p-1 rounded-lg hover:bg-surface-100 transition-colors">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Event Type *</label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm"
                >
                  <option value="GOAL">Goal</option>
                  <option value="YELLOW_CARD">Yellow Card</option>
                  <option value="RED_CARD">Red Card</option>
                  <option value="SUBSTITUTION">Substitution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Team *</label>
                <select
                  value={eventForm.clubId}
                  onChange={(e) => setEventForm({ ...eventForm, clubId: e.target.value, userId: '', assistById: '' })}
                  className="w-full px-4 py-2.5 text-sm"
                >
                  <option value="">Select Team</option>
                  <option value={schedule?.teamOneId}>{teamOneName}</option>
                  <option value={schedule?.teamTwoId}>{teamTwoName}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Player *</label>
                <select
                  value={eventForm.userId}
                  onChange={(e) => setEventForm({ ...eventForm, userId: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm"
                  disabled={!eventForm.clubId}
                >
                  <option value="">Select Player</option>
                  {getPlayersForClub(eventForm.clubId).map((p) => (
                    <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              {eventForm.eventType === 'GOAL' && (
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1.5">Assist By</label>
                  <select
                    value={eventForm.assistById}
                    onChange={(e) => setEventForm({ ...eventForm, assistById: e.target.value })}
                    className="w-full px-4 py-2.5 text-sm"
                    disabled={!eventForm.clubId}
                  >
                    <option value="">None</option>
                    {getPlayersForClub(eventForm.clubId).filter(p => p.userId.toString() !== eventForm.userId).map((p) => (
                      <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1.5">Minute *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={eventForm.minute}
                  onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
                  className="w-full px-4 py-2.5 text-sm"
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="btn-secondary flex-1 px-4 py-2.5 text-sm"
              >
                Cancel
              </button>
              <MotionButton
                onClick={handleEventSubmit}
                disabled={modalLoading}
                className="btn-primary flex-1 px-4 py-2.5 text-sm disabled:opacity-50"
              >
                {modalLoading ? 'Saving...' : editingEvent ? 'Update' : 'Add Event'}
              </MotionButton>
            </div>
          </motion.div>
        </div>
      )}

    </>
  )
}
