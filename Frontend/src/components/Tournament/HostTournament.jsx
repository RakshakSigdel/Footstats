import React, { useState } from 'react';

const CreateTournament = ({ isOpen, onClose, onCreateTournament }) => {
  const [formData, setFormData] = useState({
    tournamentName: '',
    description: '',
    location: '',
    format: 'Knockout',
    startDate: '',
    endDate: '',
    prizePool: '',
    entryFee: '',
    skillLevel: 'All Levels',
    maxTeams: ''
  });

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateTournament(formData);
    setFormData({
      tournamentName: '',
      description: '',
      location: '',
      format: 'Knockout',
      startDate: '',
      endDate: '',
      prizePool: '',
      entryFee: '',
      skillLevel: 'All Levels',
      maxTeams: ''
    });
  };

  if (!isOpen) return null;

  return (
     <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-md">
     <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 sticky top-0 bg-white border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Host New Tournament</h2>
          <p className="text-sm text-gray-600 mt-1">Set up a new tournament for teams to compete</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Tournament Name</label>
            <input
              type="text"
              name="tournamentName"
              placeholder="e.g., Nepal Cup 2024"
              value={formData.tournamentName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Description</label>
            <textarea
              name="description"
              placeholder="Describe your tournament..."
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location and Format */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Location</label>
              <input
                type="text"
                name="location"
                placeholder="e.g., Kathmandu"
                value={formData.location}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Format</label>
              <select
                name="format"
                value={formData.format}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="Knockout">Knockout</option>
                <option value="Round Robin">Round Robin</option>
                <option value="Group Stage">Group Stage</option>
                <option value="Swiss">Swiss</option>
              </select>
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Prize Pool and Entry Fee */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Prize Pool</label>
              <input
                type="text"
                name="prizePool"
                placeholder="e.g., NPR 50,000"
                value={formData.prizePool}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Entry Fee</label>
              <input
                type="text"
                name="entryFee"
                placeholder="e.g., NPR 5,000 or Free"
                value={formData.entryFee}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Skill Level and Max Teams */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="All Levels">All Levels</option>
                <option value="Beginner">Beginner</option>
                <option value="Intermediate">Intermediate</option>
                <option value="Advanced">Advanced</option>
                <option value="Professional">Professional</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Max Teams</label>
              <input
                type="number"
                name="maxTeams"
                placeholder="e.g., 16"
                value={formData.maxTeams}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-6 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-gray-900 text-white rounded-lg font-medium hover:bg-gray-800 transition-colors"
            >
              Host Tournament
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateTournament;
