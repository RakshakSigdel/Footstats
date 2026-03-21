import React, { useState } from 'react';

const CreateClub = ({ isOpen, onClose, onCreateClub }) => {
  const [formData, setFormData] = useState({
    clubName: '',
    description: '',
    location: '',
    skillLevel: 'All Levels',
    joiningFee: ''
  });

  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        alert('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        alert('Image size should be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
    }
  };

  const handleRemoveLogo = () => {
    setLogoFile(null);
    setLogoPreview(null);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreateClub({
      name: formData.clubName,
      description: formData.description,
      location: formData.location,
      foundedDate: new Date().toISOString(),
    }, logoFile);
    
    // Reset form
    setFormData({
      clubName: '',
      description: '',
      location: '',
      skillLevel: 'All Levels',
      joiningFee: ''
    });
    setLogoFile(null);
    setLogoPreview(null);
  };

  if (!isOpen) return null;

  return (
  <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 p-4 backdrop-blur-md">
  <div className="app-card flex max-h-[90vh] w-full max-w-md flex-col overflow-hidden rounded-xl">
        {/* Modal Header - Fixed */}
        <div className="p-6 relative border-b border-gray-200 flex-shrink-0">
          <h2 className="text-2xl font-bold text-gray-900">Create New Club</h2>
          <p className="text-sm text-gray-600 mt-1">Set up a new football club for your team</p>
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none w-6 h-6 flex items-center justify-center"
          >
            ×
          </button>
        </div>

        {/* Form - Scrollable */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden">
          <div className="p-6 space-y-4 overflow-y-auto flex-1">
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
              className="w-full px-4 py-2"
            />
          </div>

          {/* Club Logo */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Club Logo (Optional)</label>
            {!logoPreview ? (
              <label className="w-full h-32 border-2 border-dashed border-gray-300 rounded-lg flex flex-col items-center justify-center cursor-pointer hover:border-blue-500 hover:bg-blue-50 transition-colors">
                <svg className="w-10 h-10 text-gray-400 mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <span className="text-sm text-gray-600">Click to upload logo</span>
                <span className="text-xs text-gray-500 mt-1">PNG, JPG up to 5MB</span>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleLogoChange}
                  className="hidden"
                />
              </label>
            ) : (
              <div className="relative w-full h-32 border-2 border-gray-300 rounded-lg overflow-hidden">
                <img src={logoPreview} alt="Logo preview" className="w-full h-full object-contain bg-gray-50" />
                <button
                  type="button"
                  onClick={handleRemoveLogo}
                  className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1.5 hover:bg-red-600"
                >
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            )}
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
              className="w-full resize-none px-4 py-2"
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
                className="w-full px-4 py-2"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Skill Level</label>
              <select
                name="skillLevel"
                value={formData.skillLevel}
                onChange={handleInputChange}
                className="w-full cursor-pointer px-4 py-2"
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
          </div>

          {/* Action Buttons - Fixed Footer */}
          <div className="flex gap-3 justify-end p-6 border-t border-gray-200 flex-shrink-0 bg-white">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-2 text-gray-700 font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2 font-medium"
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
