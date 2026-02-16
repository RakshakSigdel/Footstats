import React from 'react'
import { useParams, useNavigate, useLocation } from 'react-router-dom'
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";

export default function ScheduleDetails() {
  const { scheduleId } = useParams()
  const navigate = useNavigate()
  const location = useLocation()

  const scheduleDetailsById = {
    'upcoming-1': {
      location: 'Kathmandu, Nepal',
      capacity: '25,000',
      distance: '5 km away',
      description: 'League fixture with high playoff impact.',
      matchOfficials: [
        { role: 'Referee', name: 'John Doe' },
        { role: 'Assistant Referee 1', name: 'Jane Smith' },
        { role: 'Assistant Referee 2', name: 'Mike Johnson' }
      ]
    },
    'upcoming-2': {
      location: 'Pokhara, Nepal',
      capacity: '18,000',
      distance: '145 km away',
      description: 'Friendly fixture focused on tactical rotation.',
      matchOfficials: [
        { role: 'Referee', name: 'Ramesh Thapa' },
        { role: 'Assistant Referee 1', name: 'Sita Karki' },
        { role: 'Assistant Referee 2', name: 'Hari Basnet' }
      ]
    },
    'upcoming-3': {
      location: 'Lalitpur, Nepal',
      capacity: '15,000',
      distance: '8 km away',
      description: 'Cup tie where knockout rules apply.',
      matchOfficials: [
        { role: 'Referee', name: 'Manoj Rai' },
        { role: 'Assistant Referee 1', name: 'Prakash Gurung' },
        { role: 'Assistant Referee 2', name: 'Dipesh Adhikari' }
      ]
    },
    'upcoming-4': {
      location: 'Bhaktapur, Nepal',
      capacity: '12,500',
      distance: '16 km away',
      description: 'Final league phase fixture before playoffs.',
      matchOfficials: [
        { role: 'Referee', name: 'Suman Lama' },
        { role: 'Assistant Referee 1', name: 'Nabin Khadka' },
        { role: 'Assistant Referee 2', name: 'Roshan Ghimire' }
      ]
    },
    'past-1': {
      location: 'Kathmandu, Nepal',
      time: '15:00',
      stadium: 'Dasharath Stadium',
      capacity: '25,000',
      distance: '5 km away',
      description: 'Strong attacking display with three goals scored.',
      matchOfficials: [
        { role: 'Referee', name: 'Amit Sharma' },
        { role: 'Assistant Referee 1', name: 'Deepa KC' },
        { role: 'Assistant Referee 2', name: 'Rabin Kandel' }
      ]
    },
    'past-2': {
      location: 'Kathmandu, Nepal',
      time: '13:30',
      stadium: 'ANFA Complex',
      capacity: '15,000',
      distance: '7 km away',
      description: 'Balanced match where both sides shared points.',
      matchOfficials: [
        { role: 'Referee', name: 'Niraj Yadav' },
        { role: 'Assistant Referee 1', name: 'Asmita Poudel' },
        { role: 'Assistant Referee 2', name: 'Kamal Bista' }
      ]
    },
    'past-3': {
      location: 'Kathmandu, Nepal',
      time: '17:30',
      stadium: 'Tudhikhel Ground',
      capacity: '11,000',
      distance: '4 km away',
      description: 'Tough cup match with limited chances in the final third.',
      matchOfficials: [
        { role: 'Referee', name: 'Bikash Kharel' },
        { role: 'Assistant Referee 1', name: 'Anjana Joshi' },
        { role: 'Assistant Referee 2', name: 'Dipak Neupane' }
      ]
    }
  }

  const defaultTeamPlayers = [
    { id: 1, name: 'Rajesh Shrestha', position: 'Forward', number: 10 },
    { id: 2, name: 'Anil Maharjan', position: 'Midfielder', number: 8 },
    { id: 3, name: 'Sunil Tamang', position: 'Defender', number: 5 },
    { id: 4, name: 'Bikash Rai', position: 'Goalkeeper', number: 1 }
  ]

  const defaultOpponentPlayers = [
    { id: 1, name: 'Ram Kumar', position: 'Forward', number: 9 },
    { id: 2, name: 'Shyam Patel', position: 'Midfielder', number: 7 },
    { id: 3, name: 'Mohan Singh', position: 'Defender', number: 4 },
    { id: 4, name: 'Deepak Yadav', position: 'Goalkeeper', number: 1 }
  ]

  const stateMatch = location.state?.match
  const fallbackDetails = scheduleDetailsById[scheduleId] || {}
  const matchData = {
    id: scheduleId,
    type: stateMatch?.type || 'League',
    typeColor: stateMatch?.typeColor || 'bg-blue-100 text-blue-700',
    opponent: stateMatch?.opponent || 'Unknown Opponent',
    date: stateMatch?.date || 'TBD',
    time: stateMatch?.time || fallbackDetails.time || 'TBD',
    stadium: stateMatch?.stadium || fallbackDetails.stadium || 'TBD Stadium',
    location: fallbackDetails.location || 'Kathmandu, Nepal',
    capacity: fallbackDetails.capacity || 'N/A',
    distance: fallbackDetails.distance || 'N/A',
    status: stateMatch?.status === 'past' ? 'Past Match' : 'Upcoming',
    description: fallbackDetails.description || 'Match details are not available yet.',
    matchOfficials: fallbackDetails.matchOfficials || [
      { role: 'Referee', name: 'TBD' },
      { role: 'Assistant Referee 1', name: 'TBD' },
      { role: 'Assistant Referee 2', name: 'TBD' }
    ],
    teamPlayers: defaultTeamPlayers,
    opponentPlayers: defaultOpponentPlayers
  }

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      
      <div className="flex-1 flex flex-col">
        <Topbar />
        
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Back Button */}
          <button 
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7"/>
            </svg>
            Back
          </button>

          {/* Match Header Card */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <div className="flex justify-between items-start mb-6">
              <div>
                <span className={`inline-block px-3 py-1 rounded-full text-sm font-semibold ${matchData.typeColor} mb-4`}>
                  {matchData.type}
                </span>
                <h1 className="text-4xl font-bold text-gray-900 mb-2">
                  {matchData.opponent}
                </h1>
                <p className="text-gray-600 text-lg">Match Details</p>
              </div>
              <div className="text-right">
                <div className="bg-blue-50 rounded-lg px-4 py-2 inline-block">
                  <p className="text-2xl font-bold text-blue-600">{matchData.time}</p>
                  <p className="text-sm text-gray-600">{matchData.date}</p>
                </div>
              </div>
            </div>

            {/* Match Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="bg-gray-50 rounded-lg p-4 text-left">
                <p className="text-gray-600 text-sm mb-1">Stadium</p>
                <p className="text-lg font-semibold text-gray-900">{matchData.stadium}</p>
                <p className="text-sm text-gray-500 mt-2">{matchData.location}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Capacity</p>
                <p className="text-lg font-semibold text-gray-900">{matchData.capacity}</p>
                <p className="text-sm text-gray-500 mt-2">{matchData.distance}</p>
              </div>
              <div className="bg-gray-50 rounded-lg p-4">
                <p className="text-gray-600 text-sm mb-1">Status</p>
                <p className="text-lg font-semibold text-green-600">{matchData.status}</p>
              </div>
            </div>

            {/* Match Description */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <p className="text-gray-700">{matchData.description}</p>
            </div>
          </div>

          {/* Match Officials */}
          <div className="bg-white rounded-xl shadow-md p-8 mb-8">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Match Officials</h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {matchData.matchOfficials.map((official, index) => (
                <div key={index} className="bg-gray-50 rounded-lg p-4 text-center">
                  <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-3">
                    <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#0066CC" strokeWidth="2">
                      <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                      <circle cx="12" cy="7" r="4" />
                    </svg>
                  </div>
                  <p className="font-semibold text-gray-900">{official.name}</p>
                  <p className="text-sm text-gray-600">{official.role}</p>
                </div>
              ))}
            </div>
          </div>

          {/* Team Lineups */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
            {/* Our Team */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">Our Team</h2>
              <div className="space-y-3">
                {matchData.teamPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center font-semibold text-blue-600">
                        {player.number}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{player.name}</p>
                        <p className="text-sm text-gray-600">{player.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Opponent Team */}
            <div className="bg-white rounded-xl shadow-md p-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">{matchData.opponent}</h2>
              <div className="space-y-3">
                {matchData.opponentPlayers.map((player) => (
                  <div key={player.id} className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition">
                    <div className="flex items-center gap-4">
                      <div className="w-10 h-10 bg-red-100 rounded-full flex items-center justify-center font-semibold text-red-600">
                        {player.number}
                      </div>
                      <div>
                        <p className="font-semibold text-gray-900">{player.name}</p>
                        <p className="text-sm text-gray-600">{player.position}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-4 mb-8">
            <button className="flex-1 bg-blue-600 hover:bg-blue-700 text-white font-semibold py-3 px-6 rounded-lg transition-colors">
              Save to Calendar
            </button>
            <button className="flex-1 bg-gray-200 hover:bg-gray-300 text-gray-900 font-semibold py-3 px-6 rounded-lg transition-colors">
              Share Match
            </button>
          </div>
        </main>
      </div>
    </div>
  )
}
