import React, { useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import PlaceAutocompleteInput from "../../../components/Location/PlaceAutocompleteInput";

const EditTournament = ({ isOpen, onClose, onEditTournament, tournamentData }) => {
  const [formData, setFormData] = useState(tournamentData || {
    tournamentName: '',
    description: '',
    location: '',
    format: 'KNOCKOUT',
    startDate: '',
    endDate: '',
    prizePool: '',
    entryFee: '',
    skillLevel: 'All Levels',
    maxTeams: ''
  });
  const [selectedPlace, setSelectedPlace] = useState(
    tournamentData?.locationPlaceId && tournamentData?.locationLatitude != null && tournamentData?.locationLongitude != null
      ? {
          placeId: tournamentData.locationPlaceId,
          displayName: tournamentData.location,
          latitude: Number(tournamentData.locationLatitude),
          longitude: Number(tournamentData.locationLongitude),
        }
      : null,
  );
  const [locationError, setLocationError] = useState(null);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value
    }));
    if (name === "location") {
      setSelectedPlace(null);
      setLocationError(null);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const locationChanged = formData.location.trim() !== String(tournamentData?.location || "").trim();
    if (locationChanged && !selectedPlace) {
      setLocationError("Choose a real place from suggestions before saving");
      return;
    }
    onEditTournament({
      ...formData,
      ...(selectedPlace && {
        locationLatitude: selectedPlace.latitude,
        locationLongitude: selectedPlace.longitude,
        locationPlaceId: selectedPlace.placeId,
      }),
    });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm">
          <motion.div initial={{ y: 18, opacity: 0, scale: 0.98 }} animate={{ y: 0, opacity: 1, scale: 1 }} exit={{ y: 12, opacity: 0 }} className="app-card w-full max-w-lg overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200">
          <div className="flex items-start justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">Edit Tournament</h2>
              <p className="text-sm text-gray-600 mt-1">Update your tournament details</p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 text-2xl font-bold leading-none w-6 h-6 flex items-center justify-center"
            >
              ×
            </button>
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 max-h-[calc(100vh-200px)] overflow-y-auto">
          {/* Tournament Name */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Tournament Name</label>
            <input
              type="text"
              name="tournamentName"
              placeholder="eg: Nepal Cup 2024"
              value={formData.tournamentName}
              onChange={handleInputChange}
              required
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
            />
          </div>

          {/* Description */}
          <div>
            <label className="block text-sm font-semibold text-gray-900 mb-2">Description</label>
            <textarea
              name="description"
              placeholder="eg: The premier football tournament in Nepal featuring top amateur teams from across the country."
              value={formData.description}
              onChange={handleInputChange}
              rows="3"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-none bg-white"
            />
          </div>

          {/* Location and Format */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Location</label>
              <PlaceAutocompleteInput
                value={formData.location}
                onChange={(nextLocation) => {
                  setFormData((prevData) => ({ ...prevData, location: nextLocation }));
                  setSelectedPlace(null);
                  setLocationError(null);
                }}
                onSelect={(place) => {
                  setSelectedPlace(place);
                  setLocationError(null);
                }}
                placeholder="Search exact location"
              />
              {locationError && <p className="mt-1 text-xs text-red-600">{locationError}</p>}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Format</label>
              <select
                name="format"
                placeholder="eg: Knockout"
                value={formData.format}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white cursor-pointer"
              >
                <option value="KNOCKOUT">Knockout</option>
                <option value="LEAGUE">League / Round Robin</option>
              </select>
            </div>
          </div>

          {/* Start Date and End Date */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Start Date</label>
              <input
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">End Date</label>
              <input
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Prize Pool and Entry Fee */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Prize Pool</label>
              <input
                type="text"
                name="prizePool"
                value={formData.prizePool}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Entry Fee</label>
              <input
                type="text"
                name="entryFee"
                value={formData.entryFee}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Skill Level and Max Teams */}
          <div className="grid grid-cols-2 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-900 mb-2">Skill Level</label>
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
              <label className="block text-sm font-semibold text-gray-900 mb-2">Max Participants</label>
              <input
                type="number"
                name="maxTeams"
                value={formData.maxTeams}
                onChange={handleInputChange}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 justify-end pt-4 border-t border-gray-200 mt-6">
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-2 text-gray-700 font-medium"
            >
              Cancel
            </motion.button>
            <motion.button whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}
              type="submit"
              className="btn-primary px-6 py-2 font-medium"
            >
              Save Changes
            </motion.button>
          </div>
        </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default EditTournament;
