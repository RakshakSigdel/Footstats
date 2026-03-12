import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import { getScheduleById } from '../../services/api.schedules'
import { getClubMembers } from '../../services/api.clubs'
import { createMatch } from '../../services/api.matches'
import { createMatchEvent, updateMatchEvent, deleteMatchEvent } from '../../services/api.matchEvents'
import { addPlayerToLineup, updateLineup, removeFromLineup } from '../../services/api.matchLineups'

export default function ScheduleDetails() {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  
  // Modals state
  const [showEventModal, setShowEventModal] = useState(false)
  const [showLineupModal, setShowLineupModal] = useState(false)
  const [editingEvent, setEditingEvent] = useState(null)
  const [editingLineup, setEditingLineup] = useState(null)
  
  // Club members for lineup selection
  const [teamOneMembers, setTeamOneMembers] = useState([])
  const [teamTwoMembers, setTeamTwoMembers] = useState([])
  
  // Form data
  const [eventForm, setEventForm] = useState({
    eventType: 'GOAL',
    clubId: '',
    userId: '',
    assistById: '',
    minute: ''
  })
  const [lineupForm, setLineupForm] = useState({
    clubId: '',
    userId: '',
    position: '',
    isStarter: true
  })
  
  const [modalLoading, setModalLoading] = useState(false)
  const [modalError, setModalError] = useState(null)
  const [creatingMatch, setCreatingMatch] = useState(false)
  
  // Get current user from localStorage
  const currentUser = JSON.parse(localStorage.getItem("user") || "{}")

  const loadSchedule = async () => {
    setLoading(true)
    setError(null)
    try {
      const s = await getScheduleById(scheduleId)
      setSchedule(s)
      
      // Load club members for both teams
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
  const typeColor = schedule?.scheduleType === 'Knockout' ? 'bg-red-100 text-red-700' : schedule?.scheduleType === 'League' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

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

  // Check if current user can manage this schedule
  const canManage = () => {
    if (!currentUser.id) return false
    // Schedule creator (the user who created/requested it)
    if (schedule?.creationFromUser?.userId === currentUser.id) return true
    // Admin of team 1
    const isTeamOneAdmin = teamOneMembers.find(
      m => m.user?.userId === currentUser.id && (m.role === 'ADMIN' || m.isCreator)
    )
    if (isTeamOneAdmin) return true
    // Admin of team 2
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

  // Event Modal Functions
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
      await loadSchedule() // Refresh data
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

  // Lineup Modal Functions
  const openAddLineupModal = (teamId) => {
    setEditingLineup(null)
    setLineupForm({
      clubId: teamId?.toString() || '',
      userId: '',
      position: '',
      isStarter: true
    })
    setModalError(null)
    setShowLineupModal(true)
  }

  const openEditLineupModal = (lineup) => {
    setEditingLineup(lineup)
    setLineupForm({
      clubId: lineup.club?.clubId?.toString() || '',
      userId: lineup.user?.userId?.toString() || '',
      position: lineup.position || '',
      isStarter: lineup.isStarter ?? true
    })
    setModalError(null)
    setShowLineupModal(true)
  }

  const handleLineupSubmit = async () => {
    if (!lineupForm.clubId || !lineupForm.userId) {
      setModalError("Please select a team and player")
      return
    }
    
    setModalLoading(true)
    setModalError(null)
    try {
      const data = {
        matchId: match.matchId,
        clubId: Number(lineupForm.clubId),
        userId: Number(lineupForm.userId),
        position: lineupForm.position || null,
        isStarter: lineupForm.isStarter
      }
      
      if (editingLineup) {
        await updateLineup(editingLineup.matchLineupId, data)
      } else {
        await addPlayerToLineup(data)
      }
      
      setShowLineupModal(false)
      await loadSchedule()
    } catch (err) {
      setModalError(err?.response?.data?.message || err?.message || "Failed to save lineup")
    } finally {
      setModalLoading(false)
    }
  }

  const handleRemoveFromLineup = async (lineupId) => {
    if (!window.confirm("Remove this player from lineup?")) return
    
    try {
      await removeFromLineup(lineupId)
      await loadSchedule()
    } catch (err) {
      setError(err?.message || "Failed to remove from lineup")
    }
  }

  // Get available players (as user objects) for the selected club in forms
  const getPlayersForClub = (clubId) => {
    const id = Number(clubId)
    let members = []
    if (id === schedule?.teamOneId) members = teamOneMembers
    else if (id === schedule?.teamTwoId) members = teamTwoMembers
    return members.map(m => m.user).filter(Boolean)
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-4 md:p-8 overflow-auto bg-[#eef1f6]">
          <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {loading && <div className="mb-6 text-gray-500">Loading...</div>}
          {!schedule && !loading && <div className="mb-6 text-gray-500">Schedule not found.</div>}

          {schedule && (
            <>
              {/* Match Header */}
              <div className="bg-white rounded-xl shadow-sm p-6 md:p-8 mb-6">
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
                    <h1 className="text-2xl md:text-4xl font-bold text-gray-900 mb-2">{teamOneName} vs {teamTwoName}</h1>
                    <div className="flex flex-wrap items-center gap-2 md:gap-4 text-gray-600 text-sm">
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
                    <div className="bg-blue-50 rounded-lg px-4 md:px-6 py-3 inline-block">
                      <p className="text-sm text-gray-600 mb-1">
                        {schedule.date ? new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-blue-600">
                        {schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Display */}
                {match && (
                  <div className="bg-gray-50 rounded-xl p-4 md:p-6 mt-6">
                    <div className="flex items-center justify-center gap-6 md:gap-12">
                      <div className="text-center flex-1">
                        <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">{teamOneName}</p>
                        <p className="text-4xl md:text-6xl font-bold text-blue-600">{match.teamOneGoals ?? 0}</p>
                      </div>
                      <div className="text-2xl md:text-4xl font-bold text-gray-400">-</div>
                      <div className="text-center flex-1">
                        <p className="text-lg md:text-xl font-bold text-gray-900 mb-2">{teamTwoName}</p>
                        <p className="text-4xl md:text-6xl font-bold text-red-600">{match.teamTwoGoals ?? 0}</p>
                      </div>
                    </div>
                    <div className="text-center mt-4">
                      <span className={`inline-block px-4 py-2 rounded-full text-sm font-bold ${
                        schedule.scheduleStatus === 'FINISHED' ? 'bg-gray-800 text-white' :
                        schedule.scheduleStatus === 'ONGOING' ? 'bg-green-600 text-white' :
                        'bg-blue-100 text-blue-700'
                      }`}>
                        {schedule.scheduleStatus ?? 'Scheduled'}
                      </span>
                    </div>
                  </div>
                )}

                {!match && (
                  <div className="bg-gray-50 rounded-xl p-6 mt-6 text-center">
                    {canManage() ? (
                      <div>
                        <p className="text-gray-600 mb-4">
                          {schedule.scheduleStatus === 'FINISHED'
                            ? 'The match is finished. Record the lineup and match events now.'
                            : 'Record lineup and match events for this match.'}
                        </p>
                        <button
                          onClick={handleCreateMatch}
                          disabled={creatingMatch}
                          className="bg-blue-600 text-white px-6 py-2 rounded-lg font-medium hover:bg-blue-700 disabled:opacity-50"
                        >
                          {creatingMatch ? 'Setting up...' : 'Record Match Details'}
                        </button>
                      </div>
                    ) : (
                      <p className="text-gray-500">
                        {schedule.scheduleStatus === 'FINISHED'
                          ? 'Match details have not been recorded yet'
                          : 'Match not started yet'}
                      </p>
                    )}
                  </div>
                )}
              </div>

              {/* Match Events */}
              <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                <div className="flex justify-between items-center mb-6">
                  <h2 className="text-xl md:text-2xl font-bold text-gray-900">Match Events</h2>
                {canManage() && match && schedule?.date && new Date(schedule.date) <= new Date() && (
                    <button 
                      onClick={openAddEventModal}
                      className="bg-blue-600 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-700 flex items-center gap-2"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" />
                        <line x1="5" y1="12" x2="19" y2="12" />
                      </svg>
                      Add Event
                    </button>
                  )}
                </div>
                
                {(!match?.matchEvents || match.matchEvents.length === 0) ? (
                  <p className="text-gray-500 text-center py-4">No events recorded yet</p>
                ) : (
                  <div className="space-y-3">
                    {match.matchEvents.map((event) => (
                      <div key={event.matchEventId} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="text-2xl">{getEventIcon(event.eventType)}</div>
                        <div className="flex-1">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-bold text-gray-900">{event.user?.firstName} {event.user?.lastName}</span>
                            <span className="text-sm text-gray-600">({event.club?.name})</span>
                            {event.assistBy && (
                              <span className="text-sm text-gray-500">
                                • Assist: {event.assistBy.firstName} {event.assistBy.lastName}
                              </span>
                            )}
                          </div>
                          <p className="text-sm text-gray-600 capitalize">{event.eventType.replace('_', ' ').toLowerCase()}</p>
                        </div>
                        <div className="bg-blue-50 px-3 py-1 rounded-full">
                          <span className="font-bold text-blue-700">{event.minute}'</span>
                        </div>
                        {canManage() && (
                          <div className="flex gap-2">
                            <button 
                              onClick={() => openEditEventModal(event)}
                              className="text-gray-400 hover:text-blue-600 p-1"
                              title="Edit"
                            >
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                              </svg>
                            </button>
                            <button 
                              onClick={() => handleDeleteEvent(event.matchEventId)}
                              className="text-gray-400 hover:text-red-600 p-1"
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
              </div>

              {/* Lineups */}
              <div className="bg-white rounded-xl shadow-sm p-6">
                <h2 className="text-xl md:text-2xl font-bold text-gray-900 mb-6">Lineups</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Team One Lineup */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{teamOneName}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          teamOneLineup.length >= matchSize ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{teamOneLineup.length}/{matchSize}</span>
                      </div>
                      {canManage() && match && teamOneLineup.length < matchSize && (
                        <button 
                          onClick={() => openAddLineupModal(schedule.teamOneId)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Player
                        </button>
                      )}
                      {canManage() && match && teamOneLineup.length >= matchSize && (
                        <span className="text-xs text-green-600 font-medium">Lineup full</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {teamOneLineup.length === 0 && (
                        <p className="text-gray-500 text-sm">No lineup available</p>
                      )}
                      {teamOneLineup.map((player) => (
                        <div key={player.matchLineupId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {player.user?.firstName?.[0]}{player.user?.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{player.user?.firstName} {player.user?.lastName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {player.position && <span>{player.position}</span>}
                            </div>
                          </div>
                          {player.isStarter && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium flex-shrink-0">Starter</span>
                          )}
                          {canManage() && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button 
                                onClick={() => openEditLineupModal(player)}
                                className="text-gray-400 hover:text-blue-600 p-1"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleRemoveFromLineup(player.matchLineupId)}
                                className="text-gray-400 hover:text-red-600 p-1"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Team Two Lineup */}
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <div className="flex items-center gap-2">
                        <h3 className="text-lg font-bold text-gray-900">{teamTwoName}</h3>
                        <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${
                          teamTwoLineup.length >= matchSize ? 'bg-green-100 text-green-700' : 'bg-gray-100 text-gray-600'
                        }`}>{teamTwoLineup.length}/{matchSize}</span>
                      </div>
                      {canManage() && match && teamTwoLineup.length < matchSize && (
                        <button 
                          onClick={() => openAddLineupModal(schedule.teamTwoId)}
                          className="text-blue-600 hover:text-blue-700 text-sm font-medium flex items-center gap-1"
                        >
                          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" />
                            <line x1="5" y1="12" x2="19" y2="12" />
                          </svg>
                          Add Player
                        </button>
                      )}
                      {canManage() && match && teamTwoLineup.length >= matchSize && (
                        <span className="text-xs text-green-600 font-medium">Lineup full</span>
                      )}
                    </div>
                    <div className="space-y-2">
                      {teamTwoLineup.length === 0 && (
                        <p className="text-gray-500 text-sm">No lineup available</p>
                      )}
                      {teamTwoLineup.map((player) => (
                        <div key={player.matchLineupId} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                          <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                            <span className="text-white font-bold text-sm">
                              {player.user?.firstName?.[0]}{player.user?.lastName?.[0]}
                            </span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-semibold text-gray-900 truncate">{player.user?.firstName} {player.user?.lastName}</p>
                            <div className="flex items-center gap-2 text-xs text-gray-600">
                              {player.position && <span>{player.position}</span>}
                            </div>
                          </div>
                          {player.isStarter && (
                            <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium flex-shrink-0">Starter</span>
                          )}
                          {canManage() && (
                            <div className="flex gap-1 flex-shrink-0">
                              <button 
                                onClick={() => openEditLineupModal(player)}
                                className="text-gray-400 hover:text-blue-600 p-1"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                  <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                </svg>
                              </button>
                              <button 
                                onClick={() => handleRemoveFromLineup(player.matchLineupId)}
                                className="text-gray-400 hover:text-red-600 p-1"
                              >
                                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                  <line x1="18" y1="6" x2="6" y2="18" />
                                  <line x1="6" y1="6" x2="18" y2="18" />
                                </svg>
                              </button>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>

      {/* Add/Edit Event Modal */}
      {showEventModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingEvent ? 'Edit Event' : 'Add Match Event'}
              </h2>
              <button onClick={() => setShowEventModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Event Type *</label>
                <select
                  value={eventForm.eventType}
                  onChange={(e) => setEventForm({ ...eventForm, eventType: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="GOAL">Goal</option>
                  <option value="YELLOW_CARD">Yellow Card</option>
                  <option value="RED_CARD">Red Card</option>
                  <option value="SUBSTITUTION">Substitution</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                <select
                  value={eventForm.clubId}
                  onChange={(e) => setEventForm({ ...eventForm, clubId: e.target.value, userId: '', assistById: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Team</option>
                  <option value={schedule?.teamOneId}>{teamOneName}</option>
                  <option value={schedule?.teamTwoId}>{teamTwoName}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player *</label>
                <select
                  value={eventForm.userId}
                  onChange={(e) => setEventForm({ ...eventForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Assist By</label>
                  <select
                    value={eventForm.assistById}
                    onChange={(e) => setEventForm({ ...eventForm, assistById: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <label className="block text-sm font-medium text-gray-700 mb-1">Minute *</label>
                <input
                  type="number"
                  min="1"
                  max="120"
                  value={eventForm.minute}
                  onChange={(e) => setEventForm({ ...eventForm, minute: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="e.g., 45"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEventModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleEventSubmit}
                disabled={modalLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {modalLoading ? 'Saving...' : editingEvent ? 'Update' : 'Add Event'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Add/Edit Lineup Modal */}
      {showLineupModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">
                {editingLineup ? 'Edit Lineup' : 'Add to Lineup'}
              </h2>
              <button onClick={() => setShowLineupModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {modalError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {modalError}
              </div>
            )}

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Team *</label>
                <select
                  value={lineupForm.clubId}
                  onChange={(e) => setLineupForm({ ...lineupForm, clubId: e.target.value, userId: '' })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!!editingLineup}
                >
                  <option value="">Select Team</option>
                  <option value={schedule?.teamOneId}>{teamOneName}</option>
                  <option value={schedule?.teamTwoId}>{teamTwoName}</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Player *</label>
                <select
                  value={lineupForm.userId}
                  onChange={(e) => setLineupForm({ ...lineupForm, userId: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  disabled={!lineupForm.clubId || !!editingLineup}
                >
                  <option value="">Select Player</option>
                  {getPlayersForClub(lineupForm.clubId).map((p) => (
                    <option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Position</label>
                <select
                  value={lineupForm.position}
                  onChange={(e) => setLineupForm({ ...lineupForm, position: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Position</option>
                  <option value="Goalkeeper">Goalkeeper</option>
                  <option value="Defender">Defender</option>
                  <option value="Midfielder">Midfielder</option>
                  <option value="Forward">Forward</option>
                </select>
              </div>

              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="isStarter"
                  checked={lineupForm.isStarter}
                  onChange={(e) => setLineupForm({ ...lineupForm, isStarter: e.target.checked })}
                  className="w-4 h-4 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <label htmlFor="isStarter" className="text-sm font-medium text-gray-700">Starting Player</label>
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowLineupModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleLineupSubmit}
                disabled={modalLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {modalLoading ? 'Saving...' : editingLineup ? 'Update' : 'Add Player'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
