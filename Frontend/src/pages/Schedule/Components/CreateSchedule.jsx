import React, { useState, useEffect, useRef } from 'react';
import { getAdminClubs, searchClubs } from '../../../services/api.clubs';
import { getMyTournaments, getTournamentById } from '../../../services/api.tournaments';
import { createScheduleRequest } from '../../../services/api.scheduleRequests';
import { createSchedule } from '../../../services/api.schedules';

export default function CreateSchedule({
  isOpen,
  onClose,
  onCreated,
  defaultCreationType = 'club',
  preselectedTournamentId = '',
  lockCreationType = false,
}) {
  const [formData, setFormData] = useState({
    scheduleType: 'Friendly',
    matchSize: 11,
    location: '',
    date: '',
    time: '',
    creationType: defaultCreationType,
    createdFromClub: '',
    createdFromTournament: preselectedTournamentId ? String(preselectedTournamentId) : '',
  });

  const [teamOneId, setTeamOneId] = useState('');
  const [teamOneName, setTeamOneName] = useState('');
  const [teamTwoId, setTeamTwoId] = useState('');
  const [teamTwoName, setTeamTwoName] = useState('');
  const [team2Query, setTeam2Query] = useState('');
  const [team2Results, setTeam2Results] = useState([]);
  const [team2Loading, setTeam2Loading] = useState(false);
  const team2Ref = useRef(null);

  const [adminClubs, setAdminClubs] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [tournamentClubs, setTournamentClubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => { if (isOpen) loadData(); }, [isOpen]);

  useEffect(() => {
    if (!isOpen) return;
    setFormData((prev) => ({
      ...prev,
      creationType: defaultCreationType,
      createdFromClub: defaultCreationType === 'club' ? prev.createdFromClub : '',
      createdFromTournament: defaultCreationType === 'tournament' && preselectedTournamentId
        ? String(preselectedTournamentId)
        : prev.createdFromTournament,
    }));
  }, [isOpen, defaultCreationType, preselectedTournamentId]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubs, tournaments] = await Promise.all([
        getAdminClubs().catch(() => []),
        getMyTournaments().catch(() => []),
      ]);
      setAdminClubs(Array.isArray(clubs) ? clubs : []);
      const tournamentItems = Array.isArray(tournaments)
        ? tournaments
        : tournaments?.tournaments || [];
      setMyTournaments(tournamentItems);
    } finally { setLoading(false); }
  };

  const handleCreatedFromClubChange = (e) => {
    const clubId = e.target.value;
    const club = adminClubs.find((c) => String(c.clubId) === clubId);
    setFormData((prev) => ({ ...prev, createdFromClub: clubId }));
    if (club) { setTeamOneId(String(club.clubId)); setTeamOneName(club.name); }
    else { setTeamOneId(''); setTeamOneName(''); }
    if (teamTwoId === String(club?.clubId)) { setTeamTwoId(''); setTeamTwoName(''); setTeam2Query(''); }
  };

  const handleCreationTypeChange = (type) => {
    if (lockCreationType) return;
    setFormData((prev) => ({ ...prev, creationType: type, createdFromClub: '', createdFromTournament: '' }));
    setTeamOneId(''); setTeamOneName('');
    setTeamTwoId(''); setTeamTwoName('');
    setTeam2Query(''); setTeam2Results([]);
    setTournamentClubs([]);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  useEffect(() => {
    if (!team2Query.trim()) { setTeam2Results([]); return; }
    const timer = setTimeout(async () => {
      setTeam2Loading(true);
      try {
        const results = await searchClubs(team2Query);
        setTeam2Results((results || []).filter((c) => String(c.clubId) !== teamOneId));
      } catch { setTeam2Results([]); } finally { setTeam2Loading(false); }
    }, 300);
    return () => clearTimeout(timer);
  }, [team2Query, teamOneId]);

  const selectTeam2 = (club) => {
    setTeamTwoId(String(club.clubId));
    setTeamTwoName(club.name);
    setTeam2Query('');
    setTeam2Results([]);
  };

  useEffect(() => {
    const handler = (e) => { if (team2Ref.current && !team2Ref.current.contains(e.target)) setTeam2Results([]); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  useEffect(() => {
    const selectedTournamentId = formData.createdFromTournament;
    if (formData.creationType !== 'tournament' || !selectedTournamentId) {
      setTournamentClubs([]);
      return;
    }

    const loadTournamentClubs = async () => {
      try {
        const tournament = await getTournamentById(selectedTournamentId);
        const acceptedClubs = (tournament?.registrations || [])
          .map((reg) => reg?.club)
          .filter((club) => club?.clubId);
        setTournamentClubs(acceptedClubs);
      } catch {
        setTournamentClubs([]);
      }
    };

    loadTournamentClubs();
  }, [formData.creationType, formData.createdFromTournament]);

  useEffect(() => {
    if (formData.creationType !== 'tournament') return;
    setTeamOneId('');
    setTeamOneName('');
    setTeamTwoId('');
    setTeamTwoName('');
  }, [formData.creationType, formData.createdFromTournament]);

  const handleSubmit = async (e) => {
    e.preventDefault(); setError('');
    if (!teamOneId) {
      setError(formData.creationType === 'tournament' ? 'Please select Team 1.' : 'Please select a club — it will be set as Team 1.');
      return;
    }
    if (!teamTwoId) {
      setError(formData.creationType === 'tournament' ? 'Please select Team 2.' : 'Please search and select an opponent (Team 2).');
      return;
    }
    if (teamOneId === teamTwoId) { setError('Teams must be different.'); return; }
    if (formData.creationType === 'club' && !formData.createdFromClub) { setError('Please select a club.'); return; }
    if (formData.creationType === 'tournament' && !formData.createdFromTournament) { setError('Please select a tournament.'); return; }
    if (!formData.date || !formData.time) { setError('Please select date and time.'); return; }

    const dateTime = new Date(`${formData.date}T${formData.time}`);
    const parsedMatchSize = Number(formData.matchSize);
    if (!Number.isInteger(parsedMatchSize) || parsedMatchSize < 5 || parsedMatchSize > 11) {
      setError('Match size must be between 5v5 and 11v11.');
      return;
    }

    const payload = {
      teamOneId: parseInt(teamOneId),
      teamTwoId: parseInt(teamTwoId),
      scheduleType: formData.scheduleType,
      matchSize: parsedMatchSize,
      location: formData.location,
      date: dateTime.toISOString(),
      createdFromClub: formData.creationType === 'club' ? parseInt(formData.createdFromClub) : null,
      createdFromTournament: formData.creationType === 'tournament' ? parseInt(formData.createdFromTournament) : null,
    };
    setLoading(true);
    try {
      if (formData.creationType === 'tournament') {
        await createSchedule(payload);
      } else {
        await createScheduleRequest(payload);
      }
      // Reset form
      setFormData({
        scheduleType: 'Friendly',
        matchSize: 11,
        location: '',
        date: '',
        time: '',
        creationType: defaultCreationType,
        createdFromClub: '',
        createdFromTournament: defaultCreationType === 'tournament' && preselectedTournamentId ? String(preselectedTournamentId) : '',
      });
      setTeamOneId('');
      setTeamOneName('');
      setTeamTwoId('');
      setTeamTwoName('');
      setTeam2Query('');
      setTeam2Results([]);
      onCreated?.();
      onClose();
    } catch (err) {
      setError(err?.message || (formData.creationType === 'tournament' ? 'Failed to create schedule' : 'Failed to send schedule request'));
    }
    finally { setLoading(false); }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="app-card mx-4 max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-2xl">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-200 z-10">
          <h2 className="text-2xl font-bold text-gray-900">Request a Match</h2>
          <p className="text-sm text-gray-500 mt-1">Send a match request to another club's admin for approval</p>
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {error && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{error}</div>}

          {/* Creation Type */}
          {!lockCreationType ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Creating From</label>
              <div className="flex gap-4">
                {['club', 'tournament'].map((type) => (
                  <button key={type} type="button" onClick={() => handleCreationTypeChange(type)}
                    className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all capitalize ${formData.creationType === type ? 'border-blue-500 bg-blue-50 text-blue-700' : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'}`}>
                    My {type === 'club' ? 'Club' : 'Tournament'}
                  </button>
                ))}
              </div>
            </div>
          ) : (
            <div className="rounded-lg border border-blue-200 bg-blue-50 px-4 py-3 text-sm text-blue-700">
              Creating from: <span className="font-semibold">My Tournament</span>
            </div>
          )}

          {/* Club/Tournament selector */}
          {formData.creationType === 'club' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Your Club <span className="text-red-500">*</span>
                <span className="text-gray-400 font-normal ml-1 text-xs">(only clubs you admin)</span>
              </label>
              <select value={formData.createdFromClub} onChange={handleCreatedFromClubChange}
                className="w-full px-4 py-3" required>
                <option value="">Choose a club</option>
                {adminClubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>{club.name}</option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Your Tournament <span className="text-red-500">*</span>
              </label>
              <select name="createdFromTournament" value={formData.createdFromTournament} onChange={handleInputChange}
                className="w-full px-4 py-3" required>
                <option value="">Choose a tournament</option>
                {myTournaments.map((t) => (
                  <option key={t.tournamentId} value={t.tournamentId}>{t.name}</option>
                ))}
              </select>
            </div>
          )}

          {/* Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Team 1 (Your Club)</label>
              {formData.creationType === 'club' ? (
                <div className={`px-4 py-3 rounded-lg border text-sm ${teamOneName ? 'border-green-300 bg-green-50 text-green-800 font-medium' : 'border-gray-200 bg-gray-50 text-gray-400'}`}>
                  {teamOneName || 'Auto-set when you pick a club above'}
                </div>
              ) : (
                <select
                  value={teamOneId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const club = tournamentClubs.find((c) => String(c.clubId) === selectedId);
                    setTeamOneId(selectedId);
                    setTeamOneName(club?.name || '');
                    if (selectedId && selectedId === teamTwoId) {
                      setTeamTwoId('');
                      setTeamTwoName('');
                    }
                  }}
                  className="w-full px-4 py-3"
                  required
                >
                  <option value="">Choose Team 1</option>
                  {tournamentClubs.map((club) => (
                    <option key={club.clubId} value={club.clubId}>{club.name}</option>
                  ))}
                </select>
              )}
            </div>

            <div ref={team2Ref} className="relative">
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Team 2 (Opponent) <span className="text-red-500">*</span>
              </label>
              {formData.creationType === 'tournament' ? (
                <select
                  value={teamTwoId}
                  onChange={(e) => {
                    const selectedId = e.target.value;
                    const club = tournamentClubs.find((c) => String(c.clubId) === selectedId);
                    setTeamTwoId(selectedId);
                    setTeamTwoName(club?.name || '');
                  }}
                  className="w-full px-4 py-3"
                  required
                >
                  <option value="">Choose Team 2</option>
                  {tournamentClubs
                    .filter((club) => String(club.clubId) !== teamOneId)
                    .map((club) => (
                      <option key={club.clubId} value={club.clubId}>{club.name}</option>
                    ))}
                </select>
              ) : teamTwoId ? (
                <div className="flex items-center gap-2">
                  <div className="flex-1 px-4 py-3 rounded-lg border border-blue-300 bg-blue-50 text-blue-800 font-medium text-sm">{teamTwoName}</div>
                  <button type="button" onClick={() => { setTeamTwoId(''); setTeamTwoName(''); }} className="p-2 text-gray-400 hover:text-red-500">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <>
                  <div className="relative">
                    <input type="text" value={team2Query} onChange={(e) => setTeam2Query(e.target.value)}
                      placeholder="Search club name..."
                      className="w-full px-4 py-3 text-sm" />
                    {team2Loading && (
                      <div className="absolute right-3 top-1/2 -translate-y-1/2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
                      </div>
                    )}
                  </div>
                  {team2Results.length > 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow-lg overflow-hidden">
                      {team2Results.map((club) => (
                        <button key={club.clubId} type="button" onClick={() => selectTeam2(club)}
                          className="w-full px-4 py-2.5 text-left hover:bg-gray-50 flex items-center justify-between">
                          <span className="font-medium text-gray-900 text-sm">{club.name}</span>
                          {club.location && <span className="text-xs text-gray-500">{club.location}</span>}
                        </button>
                      ))}
                    </div>
                  )}
                  {team2Query.trim() && !team2Loading && team2Results.length === 0 && (
                    <div className="absolute z-20 left-0 right-0 mt-1 bg-white border border-gray-200 rounded-lg shadow p-3 text-sm text-gray-500">
                      No clubs found for "{team2Query}"
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {/* Schedule Type */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Match Type
            </label>
            <select
              name="scheduleType"
              value={formData.scheduleType}
              onChange={handleInputChange}
              className="w-full px-4 py-3"
            >
              <option value="Friendly">Friendly</option>
              <option value="League">League</option>
              <option value="Knockout">Knockout</option>
              <option value="Cup">Cup</option>
            </select>
          </div>

          {/* Match Size */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Match Size
            </label>
            <select
              name="matchSize"
              value={formData.matchSize}
              onChange={handleInputChange}
              className="w-full px-4 py-3"
            >
              {[5, 6, 7, 8, 9, 10, 11].map((size) => (
                <option key={size} value={size}>{size}v{size}</option>
              ))}
            </select>
          </div>

          {/* Date/Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Date <span className="text-red-500">*</span></label>
              <input type="date" name="date" value={formData.date} onChange={handleInputChange}
                className="w-full px-4 py-3" required />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">Time <span className="text-red-500">*</span></label>
              <input type="time" name="time" value={formData.time} onChange={handleInputChange}
                className="w-full px-4 py-3" required />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">Location <span className="text-red-500">*</span></label>
            <input type="text" name="location" value={formData.location} onChange={handleInputChange}
              placeholder="e.g., Stadium Name, City"
              className="w-full px-4 py-3" required />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="btn-secondary px-6 py-2.5 text-gray-700 font-medium">
              Cancel
            </button>
            <button type="submit" disabled={loading} className="btn-primary px-6 py-2.5 font-medium disabled:cursor-not-allowed disabled:opacity-50">
              {loading ? (formData.creationType === 'tournament' ? 'Creating...' : 'Sending...') : (formData.creationType === 'tournament' ? 'Create Schedule' : 'Send Match Request')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
