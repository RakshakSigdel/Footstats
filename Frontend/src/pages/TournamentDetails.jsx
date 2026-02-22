import React, { useState, useEffect } from 'react'
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
        ;(Array.isArray(clubs) ? clubs : []).forEach((c) => { if (c?.id) map[c.id] = c.name })
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
              <h2 className="text-xl font-bold text-gray-900 mb-6">Tournament Schedules</h2>
              {schedules.length === 0 ? (
                <p className="text-gray-500">No schedules yet.</p>
              ) : (
                <div className="space-y-3">
                  {schedules.map((s) => (
                    <div key={s.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
                      <span className="font-medium text-gray-900">{clubsMap[s.teamOneId] ?? s.teamOneId} vs {clubsMap[s.teamTwoId] ?? s.teamTwoId}</span>
                      <span className="text-sm text-gray-600">{s.date ? new Date(s.date).toLocaleDateString() : ''}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
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
          id: tournament.id,
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
