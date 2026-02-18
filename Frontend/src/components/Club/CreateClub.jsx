import React, { useState } from 'react';

const CreateClub = ({ isOpen, onClose, onCreateClub }) => {
  const [formData, setFormData] = useState({
    clubName: '',
    description: '',
    location: '',
    skillLevel: 'All Levels',
    joiningFee: ''
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
    onCreateClub(formData);
    setFormData({
      clubName: '',
      description: '',
      location: '',
      skillLevel: 'All Levels',
      joiningFee: ''
    });
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 flex justify-center items-center z-50 bg-black/30 backdrop-blur-md">
  <div className="bg-white rounded-xl w-full max-w-md shadow-2xl overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 relative">
          <h2 className="text-2xl font-bold text-gray-900">Create New Club</h2>
          <p className="text-sm text-gray-600 mt-1">Set up a new football club for your team</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 border-t border-gray-200 space-y-4">
          {/* Club Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Name</label>
            <input
              type="text"
              name="clubName"
              placeholder="e.g., Kathmandu FC"
              value={formData.clubName}
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
              placeholder="Describe your club..."
              value={formData.description}
              onChange={handleInputChange}
              rows="4"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none"
            />
          </div>

          {/* Location and Skill Level */}
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
          </div>

          {/* Joining Fee */}
          {/* <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Joining Fee</label>
            <input
              type="text"
              name="joiningFee"
              placeholder="e.g., NPR 1,000 or Free"
              value={formData.joiningFee}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div> */}

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2 border border-gray-300 rounded-lg text-gray-700 font-medium hover:bg-gray-50 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2 bg-slate-900 text-white rounded-lg font-medium hover:bg-slate-800 transition-colors"
            >
              Create Club
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CreateClub;
