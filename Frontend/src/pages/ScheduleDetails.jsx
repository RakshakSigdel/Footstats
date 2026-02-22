import React, { useState, useEffect } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getScheduleById } from '../services/api.schedules'
import { getMatchesByScheduleId } from '../services/api.matches'
import { getAllClubs } from '../services/api.clubs'

export default function ScheduleDetails() {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const [schedule, setSchedule] = useState(null)
  const [scheduleMatches, setScheduleMatches] = useState([])
  const [clubsMap, setClubsMap] = useState({})
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    if (!scheduleId) return
    const load = async () => {
      setLoading(true)
      setError(null)
      try {
        const [s, m, clubs] = await Promise.all([
          getScheduleById(scheduleId),
          getMatchesByScheduleId(scheduleId).catch(() => []),
          getAllClubs().catch(() => []),
        ])
        setSchedule(s)
        setScheduleMatches(Array.isArray(m) ? m : [])
        const map = {}
        ;(Array.isArray(clubs) ? clubs : []).forEach((c) => { if (c?.id) map[c.id] = c.name })
        setClubsMap(map)
      } catch (err) {
        setError(err?.message || 'Failed to load schedule')
        throw err
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [scheduleId])

  const matchResult = scheduleMatches[0]
  const teamOneName = schedule ? (clubsMap[schedule.teamOneId] ?? schedule.teamOneId) : 'Team 1'
  const teamTwoName = schedule ? (clubsMap[schedule.teamTwoId] ?? schedule.teamTwoId) : 'Team 2'
  const isPast = schedule?.date && new Date(schedule.date) < new Date()
  const typeColor = schedule?.scheduleType === 'Knockout' ? 'bg-red-100 text-red-700' : schedule?.scheduleType === 'League' ? 'bg-blue-100 text-blue-700' : 'bg-green-100 text-green-700'

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
              <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${typeColor} mb-4`}>
                      {schedule.scheduleType ?? 'Match'}
                    </span>
                    <h1 className="text-4xl font-bold text-gray-900 mb-2">{teamOneName} vs {teamTwoName}</h1>
                    <p className="text-gray-600 text-lg">Match Details</p>
                  </div>
                  <div className="text-right">
                    <div className="bg-blue-50 rounded-lg px-4 py-2 inline-block">
                      <p className="text-2xl font-bold text-blue-600">
                        {schedule.date ? new Date(schedule.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'TBD'}
                      </p>
                      <p className="text-sm text-gray-600">
                        {schedule.date ? new Date(schedule.date).toLocaleDateString() : 'TBD'}
                      </p>
                    </div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="bg-gray-50 rounded-lg p-4 text-left">
                    <p className="text-gray-600 text-sm mb-1">Location</p>
                    <p className="text-lg font-semibold text-gray-900">{schedule.location ?? 'TBD'}</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-4">
                    <p className="text-gray-600 text-sm mb-1">Status</p>
                    <p className="text-lg font-semibold text-gray-900">{schedule.scheduleStatus ?? (isPast ? 'Completed' : 'Scheduled')}</p>
                  </div>
                  {matchResult && (
                    <div className="bg-gray-50 rounded-lg p-4">
                      <p className="text-gray-600 text-sm mb-1">Score</p>
                      <p className="text-2xl font-bold text-gray-900">{matchResult.teamOneGoals ?? 0} - {matchResult.teamTwoGoals ?? 0}</p>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-xl shadow-md p-8 mb-8">
                <h2 className="text-2xl font-bold text-gray-900 mb-6">Teams</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-xl font-bold text-gray-900">{teamOneName}</p>
                    {matchResult && <p className="text-3xl font-bold text-blue-600 mt-2">{matchResult.teamOneGoals ?? 0}</p>}
                  </div>
                  <div className="bg-gray-50 rounded-lg p-6 text-center">
                    <p className="text-xl font-bold text-gray-900">{teamTwoName}</p>
                    {matchResult && <p className="text-3xl font-bold text-red-600 mt-2">{matchResult.teamTwoGoals ?? 0}</p>}
                  </div>
                </div>
              </div>
            </>
          )}
        </main>
      </div>
    </div>
  )
}
