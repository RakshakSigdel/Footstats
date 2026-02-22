import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getScheduleById } from '../services/api.schedules'

export default function ScheduleDetails() {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!scheduleId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const s = await getScheduleById(scheduleId)
        setSchedule(s)
      } catch (err) {
        setError(err?.message || 'Failed to load schedule')
        throw err
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [scheduleId])

  const match = schedule?.match
  const teamOneName = schedule?.teamOne?.name || 'Team 1'
  const teamTwoName = schedule?.teamTwo?.name || 'Team 2'
  const isPast = schedule?.date && new Date(schedule.date) < new Date()
  const typeColor = schedule?.scheduleType === 'Knockout' ? 'bg-red-100 text-red-700' : schedule?.scheduleType === 'League' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

  const teamOneLineup = match?.lineups?.filter(l => l.club.clubId === schedule?.teamOneId) || []
  const teamTwoLineup = match?.lineups?.filter(l => l.club.clubId === schedule?.teamTwoId) || []
  
  const teamOneEvents = match?.matchEvents?.filter(e => e.club.clubId === schedule?.teamOneId) || []
  const teamTwoEvents = match?.matchEvents?.filter(e => e.club.clubId === schedule?.teamTwoId) || []

  const getEventIcon = (eventType) => {
    switch(eventType) {
      case 'GOAL': return '⚽'
      case 'YELLOW_CARD': return '🟨'
      case 'RED_CARD': return '🟥'
      case 'SUBSTITUTION': return '🔄'
      default: return '•'
    }
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
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
              <div className="bg-white rounded-xl shadow-sm p-8 mb-6">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${typeColor} mb-3`}>
                      {schedule.scheduleType ?? 'Match'}
                    </span>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{teamOneName} vs {teamTwoName}</h1>
                    <div className="flex items-center gap-4 text-gray-600">
                      <div className="flex items-center gap-2">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{schedule.location ?? 'TBD'}</span>
                      </div>
                      {schedule.creatorFromClub && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">•</span>
                          <span className="text-sm">Club Match: {schedule.creatorFromClub.name}</span>
                        </div>
                      )}
                      {schedule.creatorFromTournament && (
                        <div className="flex items-center gap-2">
                          <span className="text-sm">•</span>
                          <span className="text-sm">Tournament: {schedule.creatorFromTournament.name}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-50 rounded-lg px-6 py-3 inline-block">
                      <p className="text-sm text-gray-600 mb-1">
                        {schedule.date ? new Date(schedule.date).toLocaleDateString('en-US', { weekday: 'short', year: 'numeric', month: 'short', day: 'numeric' }) : 'TBD'}
                      </p>
                      <p className="text-3xl font-bold text-blue-600">
                        {schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Score Display */}
                {match && (
                  <div className="bg-gray-50 rounded-xl p-6 mt-6">
                    <div className="flex items-center justify-center gap-12">
                      <div className="text-center flex-1">
                        <p className="text-xl font-bold text-gray-900 mb-2">{teamOneName}</p>
                        <p className="text-6xl font-bold text-blue-600">{match.teamOneGoals ?? 0}</p>
                      </div>
                      <div className="text-4xl font-bold text-gray-400">-</div>
                      <div className="text-center flex-1">
                        <p className="text-xl font-bold text-gray-900 mb-2">{teamTwoName}</p>
                        <p className="text-6xl font-bold text-red-600">{match.teamTwoGoals ?? 0}</p>
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
                    <p className="text-gray-500">Match not started yet</p>
                  </div>
                )}
              </div>

              {/* Match Events */}
              {match?.matchEvents && match.matchEvents.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6 mb-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Events</h2>
                  <div className="space-y-3">
                    {match.matchEvents.map((event, idx) => (
                      <div key={idx} className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg">
                        <div className="text-2xl">{getEventIcon(event.eventType)}</div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900">{event.user.firstName} {event.user.lastName}</span>
                            <span className="text-sm text-gray-600">({event.club.name})</span>
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
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Lineups */}
              {match?.lineups && match.lineups.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm p-6">
                  <h2 className="text-2xl font-bold text-gray-900 mb-6">Lineups</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Team One Lineup */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{teamOneName}</h3>
                      <div className="space-y-2">
                        {teamOneLineup.length === 0 && (
                          <p className="text-gray-500 text-sm">No lineup available</p>
                        )}
                        {teamOneLineup.map((player, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                              {player.user.profilePhoto ? (
                                <img src={player.user.profilePhoto} alt={player.user.firstName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {player.user.firstName?.[0]}{player.user.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{player.user.firstName} {player.user.lastName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                {player.position && <span>{player.position}</span>}
                                {player.minutesPlayed > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{player.minutesPlayed} min</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {player.isStarter && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Starter</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Team Two Lineup */}
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 mb-4">{teamTwoName}</h3>
                      <div className="space-y-2">
                        {teamTwoLineup.length === 0 && (
                          <p className="text-gray-500 text-sm">No lineup available</p>
                        )}
                        {teamTwoLineup.map((player, idx) => (
                          <div key={idx} className="flex items-center gap-3 p-3 border border-gray-200 rounded-lg">
                            <div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center flex-shrink-0">
                              {player.user.profilePhoto ? (
                                <img src={player.user.profilePhoto} alt={player.user.firstName} className="w-full h-full rounded-full object-cover" />
                              ) : (
                                <span className="text-white font-bold text-sm">
                                  {player.user.firstName?.[0]}{player.user.lastName?.[0]}
                                </span>
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="font-semibold text-gray-900">{player.user.firstName} {player.user.lastName}</p>
                              <div className="flex items-center gap-2 text-xs text-gray-600">
                                {player.position && <span>{player.position}</span>}
                                {player.minutesPlayed > 0 && (
                                  <>
                                    <span>•</span>
                                    <span>{player.minutesPlayed} min</span>
                                  </>
                                )}
                              </div>
                            </div>
                            {player.isStarter && (
                              <span className="bg-green-100 text-green-700 px-2 py-1 rounded text-xs font-medium">Starter</span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  )
}
