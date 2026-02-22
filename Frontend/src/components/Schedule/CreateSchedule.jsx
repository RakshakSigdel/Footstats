import React, { useState, useEffect } from 'react';
import { getMyClubs, getAllClubs } from '../../services/api.clubs';
import { getMyTournaments } from '../../services/api.tournaments';

export default function CreateSchedule({ isOpen, onClose, onCreateSchedule }) {
  const [formData, setFormData] = useState({
    teamOneId: '',
    teamTwoId: '',
    scheduleType: 'Friendly',
    location: '',
    date: '',
    time: '',
    creationType: 'club', // 'club' or 'tournament'
    createdFromClub: '',
    createdFromTournament: '',
  });

  const [myClubs, setMyClubs] = useState([]);
  const [allClubs, setAllClubs] = useState([]);
  const [myTournaments, setMyTournaments] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadData();
    }
  }, [isOpen]);

  const loadData = async () => {
    setLoading(true);
    try {
      const [clubs, allClubsData, tournaments] = await Promise.all([
        getMyClubs().catch(() => []),
        getAllClubs().catch(() => []),
        getMyTournaments().catch(() => []),
      ]);
      setMyClubs(Array.isArray(clubs) ? clubs : []);
      setAllClubs(Array.isArray(allClubsData) ? allClubsData : []);
      setMyTournaments(Array.isArray(tournaments) ? tournaments : []);
    } catch (err) {
      console.error('Failed to load data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleCreationTypeChange = (type) => {
    setFormData((prev) => ({
      ...prev,
      creationType: type,
      createdFromClub: type === 'club' ? prev.createdFromClub : '',
      createdFromTournament: type === 'tournament' ? prev.createdFromTournament : '',
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Validate
    if (!formData.teamOneId || !formData.teamTwoId) {
      alert('Please select both teams');
      return;
    }

    if (formData.teamOneId === formData.teamTwoId) {
      alert('Teams must be different');
      return;
    }

    if (formData.creationType === 'club' && !formData.createdFromClub) {
      alert('Please select a club');
      return;
    }

    if (formData.creationType === 'tournament' && !formData.createdFromTournament) {
      alert('Please select a tournament');
      return;
    }

    if (!formData.date || !formData.time) {
      alert('Please select date and time');
      return;
    }

    // Combine date and time
    const dateTime = new Date(`${formData.date}T${formData.time}`);

    const scheduleData = {
      teamOneId: parseInt(formData.teamOneId),
      teamTwoId: parseInt(formData.teamTwoId),
      scheduleType: formData.scheduleType,
      location: formData.location,
      date: dateTime.toISOString(),
      scheduleStatus: 'UPCOMING',
      createdFromClub: formData.creationType === 'club' ? parseInt(formData.createdFromClub) : null,
      createdFromTournament: formData.creationType === 'tournament' ? parseInt(formData.createdFromTournament) : null,
    };

    try {
      await onCreateSchedule(scheduleData);
      // Reset form
      setFormData({
        teamOneId: '',
        teamTwoId: '',
        scheduleType: 'Friendly',
        location: '',
        date: '',
        time: '',
        creationType: 'club',
        createdFromClub: '',
        createdFromTournament: '',
      });
      onClose();
    } catch (err) {
      console.error('Failed to create schedule:', err);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-2xl mx-4 shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white px-6 pt-6 pb-4 border-b border-gray-200 z-10">
          <h2 className="text-2xl font-bold text-gray-900">Create Schedule</h2>
          <p className="text-sm text-gray-500 mt-1">Schedule a match between two clubs</p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Creation Type Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Creating From
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => handleCreationTypeChange('club')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.creationType === 'club'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                My Club
              </button>
              <button
                type="button"
                onClick={() => handleCreationTypeChange('tournament')}
                className={`flex-1 px-4 py-3 rounded-lg border-2 font-medium transition-all ${
                  formData.creationType === 'tournament'
                    ? 'border-blue-500 bg-blue-50 text-blue-700'
                    : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }`}
              >
                My Tournament
              </button>
            </div>
          </div>

          {/* Club/Tournament Selection */}
          {formData.creationType === 'club' ? (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Your Club <span className="text-red-500">*</span>
              </label>
              <select
                name="createdFromClub"
                value={formData.createdFromClub}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a club</option>
                {myClubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>
          ) : (
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Select Your Tournament <span className="text-red-500">*</span>
              </label>
              <select
                name="createdFromTournament"
                value={formData.createdFromTournament}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Choose a tournament</option>
                {myTournaments.map((tournament) => (
                  <option key={tournament.tournamentId} value={tournament.tournamentId}>
                    {tournament.name}
                  </option>
                ))}
              </select>
            </div>
          )}

          {/* Team Selection */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Team 1 <span className="text-red-500">*</span>
              </label>
              <select
                name="teamOneId"
                value={formData.teamOneId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select team</option>
                {allClubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.name}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Team 2 <span className="text-red-500">*</span>
              </label>
              <select
                name="teamTwoId"
                value={formData.teamTwoId}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              >
                <option value="">Select team</option>
                {allClubs.map((club) => (
                  <option key={club.clubId} value={club.clubId}>
                    {club.name}
                  </option>
                ))}
              </select>
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
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="Friendly">Friendly</option>
              <option value="League">League</option>
              <option value="Knockout">Knockout</option>
              <option value="Cup">Cup</option>
            </select>
          </div>

          {/* Date and Time */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                name="date"
                value={formData.date}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Time <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                name="time"
                value={formData.time}
                onChange={handleInputChange}
                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Location */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              placeholder="e.g., Stadium Name, City"
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            />
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800 font-medium disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? 'Creating...' : 'Create Schedule'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
