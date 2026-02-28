import React, { useState, useEffect, useMemo } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from '../components/Global/Sidebar'
import Topbar from '../components/Global/Topbar'
import EditTournament from '../components/Tournament/EditTournament'
import { getTournamentById, updateTournament } from '../services/api.tournaments'
import { getTournamentSchedules } from '../services/api.schedules'
import { getAllClubs } from '../services/api.clubs'

export default function TournamentDetails() {
  const { tournamentId } = useParams()
  const navigate = useNavigate()
  const [tournament, setTournament] = useState(null)
  const [schedules, setSchedules] = useState([])
  const [clubsMap, setClubsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)
  const [isEditTournamentOpen, setIsEditTournamentOpen] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => {
    if (!tournamentId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [t, scheds, clubs] = await Promise.all([
          getTournamentById(tournamentId),
          getTournamentSchedules(tournamentId).catch(() => []),
          getAllClubs().catch(() => []),
        ])
        setTournament(t)
        setSchedules(Array.isArray(scheds) ? scheds : [])
        const map = {}
        ;(Array.isArray(clubs) ? clubs : []).forEach((c) => { if (c?.clubId) map[c.clubId] = c.name })
        setClubsMap(map)
      } catch (err) {
        setError(err?.message || 'Failed to load tournament')
        throw err
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [tournamentId])

  // Calculate standings from schedules
  const standings = useMemo(() => {
    const teamStats = {}
    
    schedules.forEach(s => {
      // Initialize teams if needed
      if (s.teamOneId && !teamStats[s.teamOneId]) {
        teamStats[s.teamOneId] = { 
          clubId: s.teamOneId, 
          name: clubsMap[s.teamOneId] || `Team ${s.teamOneId}`,
          played: 0, wins: 0, draws: 0, losses: 0, 
          goalsFor: 0, goalsAgainst: 0, points: 0 
        }
      }
      if (s.teamTwoId && !teamStats[s.teamTwoId]) {
        teamStats[s.teamTwoId] = { 
          clubId: s.teamTwoId, 
          name: clubsMap[s.teamTwoId] || `Team ${s.teamTwoId}`,
          played: 0, wins: 0, draws: 0, losses: 0, 
          goalsFor: 0, goalsAgainst: 0, points: 0 
        }
      }

      // Only count completed matches (status COMPLETED or has goals data)
      if (s.status !== 'COMPLETED' && (s.teamOneGoals == null || s.teamTwoGoals == null)) return
      
      const t1Goals = s.teamOneGoals ?? 0
      const t2Goals = s.teamTwoGoals ?? 0
      
      if (teamStats[s.teamOneId]) {
        teamStats[s.teamOneId].played++
        teamStats[s.teamOneId].goalsFor += t1Goals
        teamStats[s.teamOneId].goalsAgainst += t2Goals
        if (t1Goals > t2Goals) {
          teamStats[s.teamOneId].wins++
          teamStats[s.teamOneId].points += 3
        } else if (t1Goals === t2Goals) {
          teamStats[s.teamOneId].draws++
          teamStats[s.teamOneId].points += 1
        } else {
          teamStats[s.teamOneId].losses++
        }
      }
      
      if (teamStats[s.teamTwoId]) {
        teamStats[s.teamTwoId].played++
        teamStats[s.teamTwoId].goalsFor += t2Goals
        teamStats[s.teamTwoId].goalsAgainst += t1Goals
        if (t2Goals > t1Goals) {
          teamStats[s.teamTwoId].wins++
          teamStats[s.teamTwoId].points += 3
        } else if (t1Goals === t2Goals) {
          teamStats[s.teamTwoId].draws++
          teamStats[s.teamTwoId].points += 1
        } else {
          teamStats[s.teamTwoId].losses++
        }
      }
    })
    
    return Object.values(teamStats).sort((a, b) => {
      if (b.points !== a.points) return b.points - a.points
      const gdA = a.goalsFor - a.goalsAgainst
      const gdB = b.goalsFor - b.goalsAgainst
      if (gdB !== gdA) return gdB - gdA
      return b.goalsFor - a.goalsFor
    })
  }, [schedules, clubsMap])

  // Organize bracket rounds for knockout tournaments
  const bracketRounds = useMemo(() => {
    if (tournament?.format !== 'Knockout') return []
    
    // Group by round/stage if available, otherwise by date
    const roundMap = {}
    const schedulesWithRound = schedules.map((s, idx) => ({
      ...s,
      round: s.round || s.stage || `Match ${idx + 1}`
    }))
    
    schedulesWithRound.forEach(s => {
      const round = s.round
      if (!roundMap[round]) roundMap[round] = []
      roundMap[round].push(s)
    })
    
    // Try to sort rounds logically
    const roundOrder = ['Final', 'Semi-Final', 'Semi-Finals', 'Quarter-Final', 'Quarter-Finals', 'Round of 16', 'Round of 32']
    const sortedRounds = Object.entries(roundMap).sort((a, b) => {
      const aIdx = roundOrder.findIndex(r => a[0].toLowerCase().includes(r.toLowerCase()))
      const bIdx = roundOrder.findIndex(r => b[0].toLowerCase().includes(r.toLowerCase()))
      if (aIdx === -1 && bIdx === -1) return a[0].localeCompare(b[0])
      if (aIdx === -1) return 1
      if (bIdx === -1) return -1
      return bIdx - aIdx // Reverse so Final is last
    })
    
    return sortedRounds.map(([name, matches]) => ({ name, matches }))
  }, [schedules, tournament])

  const handleEditTournament = async (formData) => {
    if (!tournamentId) return
    try {
      const entryFeeNum = formData.entryFee ? parseInt(String(formData.entryFee).replace(/\D/g, ''), 10) || 0 : 0
      await updateTournament(tournamentId, {
        name: formData.tournamentName,
        description: formData.description,
        location: formData.location,
        startDate: formData.startDate ? new Date(formData.startDate).toISOString() : undefined,
        endDate: formData.endDate ? new Date(formData.endDate).toISOString() : undefined,
        entryFee: entryFeeNum,
        format: formData.format,
        status: formData.status || tournament?.status,
      })
      const updated = await getTournamentById(tournamentId)
      setTournament(updated)
      setIsEditTournamentOpen(false)
    } catch (err) {
      setError(err?.message || 'Failed to update tournament')
      throw err
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: '📊' },
    { id: 'standings', label: 'Standings', icon: '🏆' },
    { id: 'bracket', label: 'Bracket', icon: '🎯', show: tournament?.format === 'Knockout' },
    { id: 'matches', label: 'Matches', icon: '⚽' },
  ].filter(t => t.show !== false)

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <button onClick={() => navigate(-1)} className="flex items-center justify-center w-8 h-8 text-gray-600 hover:text-gray-900 hover:bg-gray-200 rounded transition-colors mb-6">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
          </button>

          {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {loading && <div className="mb-6 text-gray-500">Loading tournament...</div>}
          {!tournament && !loading && <div className="mb-6 text-gray-500">Tournament not found.</div>}

          {tournament && (
          <>
          <div className="flex items-start justify-between mb-6">
            <div className="flex items-start gap-4">
              <div>
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-3xl font-bold text-gray-900">{tournament.name}</h1>
                  <span className="bg-slate-900 text-white px-3 py-1 rounded-full text-xs font-bold">{tournament.status ?? 'Upcoming'}</span>
                </div>
                <p className="text-sm text-gray-600 max-w-2xl">{tournament.description ?? '—'}</p>
              </div>
            </div>
            <button onClick={() => setIsEditTournamentOpen(true)} className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg font-medium hover:bg-blue-100 transition-colors flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
              </svg>
              Edit Tournament
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Schedules</div>
              <div className="text-2xl font-bold text-gray-900">{schedules.length}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Location</div>
              <div className="text-2xl font-bold text-gray-900">{tournament.location ?? '—'}</div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Entry Fee</div>
              <div className="text-2xl font-bold text-gray-900">
                {tournament.entryFee != null && tournament.entryFee > 0 ? `NPR ${tournament.entryFee}` : 'Free'}
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="text-sm text-gray-600 mb-2">Format</div>
              <div className="text-2xl font-bold text-gray-900">{tournament.format ?? '—'}</div>
            </div>
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                    activeTab === tab.id ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>

          {/* Overview Tab */}
          {activeTab === 'overview' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tournament Details</h2>
              <div className="grid grid-cols-2 gap-8">
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Format</p>
                    <p className="text-lg font-medium text-gray-900">{tournament.format ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Start Date</p>
                    <p className="text-lg font-medium text-gray-900">
                      {tournament.startDate ? new Date(tournament.startDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
                <div className="space-y-6">
                  <div>
                    <p className="text-sm text-gray-600 mb-1">Status</p>
                    <p className="text-lg font-medium text-gray-900">{tournament.status ?? '—'}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600 mb-1">End Date</p>
                    <p className="text-lg font-medium text-gray-900">
                      {tournament.endDate ? new Date(tournament.endDate).toLocaleDateString() : '—'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Quick Stats</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Teams</span>
                  <span className="text-lg font-bold text-gray-900">{standings.length}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Total Matches</span>
                  <span className="text-lg font-bold text-gray-900">{schedules.length}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Completed</span>
                  <span className="text-lg font-bold text-gray-900">
                    {schedules.filter(s => s.status === 'COMPLETED' || (s.teamOneGoals != null && s.teamTwoGoals != null)).length}
                  </span>
                </div>
              </div>
            </div>
          </div>
          )}

          {/* Standings Tab */}
          {activeTab === 'standings' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">League Standings</h2>
            {standings.length === 0 ? (
              <p className="text-gray-500">No teams in this tournament yet.</p>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-gray-200">
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">#</th>
                      <th className="text-left py-3 px-2 text-sm font-semibold text-gray-600">Team</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">P</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">W</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">D</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">L</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">GF</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">GA</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">GD</th>
                      <th className="text-center py-3 px-2 text-sm font-semibold text-gray-600">Pts</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((team, idx) => (
                      <tr key={team.clubId} className={`border-b border-gray-100 hover:bg-gray-50 ${idx < 4 ? 'bg-green-50/50' : ''}`}>
                        <td className="py-4 px-2">
                          <span className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold ${
                            idx === 0 ? 'bg-yellow-400 text-yellow-900' :
                            idx === 1 ? 'bg-gray-300 text-gray-700' :
                            idx === 2 ? 'bg-amber-600 text-white' :
                            'bg-gray-100 text-gray-600'
                          }`}>
                            {idx + 1}
                          </span>
                        </td>
                        <td className="py-4 px-2">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                              {team.name?.charAt(0) || '?'}
                            </div>
                            <span className="font-medium text-gray-900">{team.name}</span>
                          </div>
                        </td>
                        <td className="py-4 px-2 text-center text-gray-700">{team.played}</td>
                        <td className="py-4 px-2 text-center text-green-600 font-medium">{team.wins}</td>
                        <td className="py-4 px-2 text-center text-gray-600">{team.draws}</td>
                        <td className="py-4 px-2 text-center text-red-600 font-medium">{team.losses}</td>
                        <td className="py-4 px-2 text-center text-gray-700">{team.goalsFor}</td>
                        <td className="py-4 px-2 text-center text-gray-700">{team.goalsAgainst}</td>
                        <td className="py-4 px-2 text-center font-medium">
                          <span className={team.goalsFor - team.goalsAgainst >= 0 ? 'text-green-600' : 'text-red-600'}>
                            {team.goalsFor - team.goalsAgainst >= 0 ? '+' : ''}{team.goalsFor - team.goalsAgainst}
                          </span>
                        </td>
                        <td className="py-4 px-2 text-center font-bold text-gray-900">{team.points}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
          )}

          {/* Bracket Tab (Knockout only) */}
          {activeTab === 'bracket' && tournament?.format === 'Knockout' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">Tournament Bracket</h2>
            {bracketRounds.length === 0 ? (
              <p className="text-gray-500">No bracket matches scheduled yet.</p>
            ) : (
              <div className="flex gap-8 overflow-x-auto pb-4">
                {bracketRounds.map((round, roundIdx) => (
                  <div key={round.name} className="flex-shrink-0 min-w-[280px]">
                    <h3 className="text-sm font-semibold text-gray-600 mb-4 text-center uppercase tracking-wide">
                      {round.name}
                    </h3>
                    <div className="space-y-4">
                      {round.matches.map((match) => {
                        const isCompleted = match.status === 'COMPLETED' || (match.teamOneGoals != null && match.teamTwoGoals != null)
                        const teamOneName = clubsMap[match.teamOneId] || `Team ${match.teamOneId}`
                        const teamTwoName = clubsMap[match.teamTwoId] || `Team ${match.teamTwoId}`
                        const t1Goals = match.teamOneGoals ?? '-'
                        const t2Goals = match.teamTwoGoals ?? '-'
                        const t1Won = isCompleted && match.teamOneGoals > match.teamTwoGoals
                        const t2Won = isCompleted && match.teamTwoGoals > match.teamOneGoals
                        
                        return (
                          <div 
                            key={match.scheduleId} 
                            className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer"
                            onClick={() => navigate(`/schedule/${match.scheduleId}`)}
                          >
                            <div className={`flex items-center justify-between p-3 ${t1Won ? 'bg-green-50' : 'bg-gray-50'} border-b border-gray-200`}>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="w-6 h-6 bg-blue-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {teamOneName.charAt(0)}
                                </div>
                                <span className={`text-sm ${t1Won ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{teamOneName}</span>
                              </div>
                              <span className={`text-lg font-bold ${t1Won ? 'text-green-600' : 'text-gray-600'}`}>{t1Goals}</span>
                            </div>
                            <div className={`flex items-center justify-between p-3 ${t2Won ? 'bg-green-50' : 'bg-white'}`}>
                              <div className="flex items-center gap-2 flex-1">
                                <div className="w-6 h-6 bg-purple-600 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                  {teamTwoName.charAt(0)}
                                </div>
                                <span className={`text-sm ${t2Won ? 'font-bold text-gray-900' : 'text-gray-700'}`}>{teamTwoName}</span>
                              </div>
                              <span className={`text-lg font-bold ${t2Won ? 'text-green-600' : 'text-gray-600'}`}>{t2Goals}</span>
                            </div>
                            {!isCompleted && match.date && (
                              <div className="px-3 py-2 bg-gray-100 text-xs text-gray-500 text-center">
                                {new Date(match.date).toLocaleDateString()} • {new Date(match.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </div>
                            )}
                          </div>
                        )
                      })}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          )}

          {/* Matches Tab */}
          {activeTab === 'matches' && (
          <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
            <h2 className="text-xl font-bold text-gray-900 mb-6">All Matches</h2>
            {schedules.length === 0 ? (
              <p className="text-gray-500">No matches scheduled yet.</p>
            ) : (
              <div className="space-y-3">
                {schedules.map((s) => {
                  const isCompleted = s.status === 'COMPLETED' || (s.teamOneGoals != null && s.teamTwoGoals != null)
                  return (
                    <div 
                      key={s.scheduleId} 
                      onClick={() => navigate(`/schedule/${s.scheduleId}`)}
                      className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                    >
                      <div className="flex items-center gap-6 flex-1">
                        <div className="flex items-center gap-3 flex-1">
                          <div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(clubsMap[s.teamOneId] || 'T1').charAt(0)}
                          </div>
                          <span className="font-medium text-gray-900">{clubsMap[s.teamOneId] ?? `Team ${s.teamOneId}`}</span>
                        </div>
                        
                        {isCompleted ? (
                          <div className="flex items-center gap-2 px-4">
                            <span className={`text-2xl font-bold ${s.teamOneGoals > s.teamTwoGoals ? 'text-green-600' : 'text-gray-600'}`}>
                              {s.teamOneGoals}
                            </span>
                            <span className="text-gray-400">-</span>
                            <span className={`text-2xl font-bold ${s.teamTwoGoals > s.teamOneGoals ? 'text-green-600' : 'text-gray-600'}`}>
                              {s.teamTwoGoals}
                            </span>
                          </div>
                        ) : (
                          <div className="px-4">
                            <span className="text-sm font-medium text-gray-400">VS</span>
                          </div>
                        )}
                        
                        <div className="flex items-center gap-3 flex-1 justify-end">
                          <span className="font-medium text-gray-900">{clubsMap[s.teamTwoId] ?? `Team ${s.teamTwoId}`}</span>
                          <div className="w-10 h-10 bg-purple-600 rounded-full flex items-center justify-center text-white font-bold">
                            {(clubsMap[s.teamTwoId] || 'T2').charAt(0)}
                          </div>
                        </div>
                      </div>
                      
                      <div className="flex items-center gap-4 ml-6">
                        <div className="text-right">
                          <div className="text-sm text-gray-600">
                            {s.date ? new Date(s.date).toLocaleDateString() : 'TBD'}
                          </div>
                          {s.location && <div className="text-xs text-gray-400">{s.location}</div>}
                        </div>
                        <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                          isCompleted ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'
                        }`}>
                          {isCompleted ? 'Completed' : 'Upcoming'}
                        </span>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
          )}
          </>
          )}
        </main>
      </div>

      {tournament && (
      <EditTournament
        isOpen={isEditTournamentOpen}
        onClose={() => setIsEditTournamentOpen(false)}
        onEditTournament={handleEditTournament}
        tournamentData={{
          id: tournament.tournamentId,
          tournamentName: tournament.name,
          description: tournament.description,
          location: tournament.location,
          format: tournament.format,
          startDate: tournament.startDate ? tournament.startDate.slice(0, 10) : '',
          endDate: tournament.endDate ? tournament.endDate.slice(0, 10) : '',
          entryFee: tournament.entryFee,
          status: tournament.status,
          maxTeams: tournament.maxTeams,
        }}
      />
      )}
    </div>
  )
}
