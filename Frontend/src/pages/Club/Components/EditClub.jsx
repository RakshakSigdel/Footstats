//Imported in - src/pages/Club/clubDetails.jsx

import { useState, useEffect } from "react";
import PlaceAutocompleteInput from "../../../components/Location/PlaceAutocompleteInput";

const EditClub = ({ isOpen, onClose, onEditClub, clubData }) => {
  const [formData, setFormData] = useState({
    clubName: "",
    description: "",
    location: "",
  });
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [locationError, setLocationError] = useState(null);

  useEffect(() => {
    if (clubData) {
      setFormData({
        clubName: clubData.name ?? "",
        description: clubData.description ?? "",
        location: clubData.location ?? "",
      });
      if (clubData.locationLatitude != null && clubData.locationLongitude != null && clubData.locationPlaceId) {
        setSelectedPlace({
          placeId: clubData.locationPlaceId,
          displayName: clubData.location,
          latitude: Number(clubData.locationLatitude),
          longitude: Number(clubData.locationLongitude),
        });
      } else {
        setSelectedPlace(null);
      }
      setLocationError(null);
    }
  }, [clubData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    const locationChanged = formData.location.trim() !== String(clubData?.location || "").trim();
    if (locationChanged && !selectedPlace) {
      setLocationError("Choose a real place from suggestions before saving");
      return;
    }

    onEditClub({
      name: formData.clubName,
      description: formData.description,
      location: formData.location,
      ...(selectedPlace && {
        locationLatitude: selectedPlace.latitude,
        locationLongitude: selectedPlace.longitude,
        locationPlaceId: selectedPlace.placeId,
      }),
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="app-card mx-4 w-full max-w-lg overflow-hidden rounded-2xl">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Club</h2>
          <p className="text-sm text-gray-500 mt-1">Update club information</p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Club Name
            </label>
            <input
              type="text"
              name="clubName"
              value={formData.clubName}
              onChange={handleInputChange}
              className="w-full px-4 py-3"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full resize-none px-4 py-3"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location
            </label>
            <PlaceAutocompleteInput
              value={formData.location}
              onChange={(nextLocation) => {
                setFormData((prev) => ({ ...prev, location: nextLocation }));
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

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary px-6 py-2.5 text-gray-700"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="btn-primary px-6 py-2.5"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default EditClub;