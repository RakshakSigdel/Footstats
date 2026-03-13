//Imported in - src/pages/Club/clubDetails.jsx
import { useState } from "react";

const JoinClubRequest = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    preferredPosition: "",
    whyJoin: "",
    additionalMessage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const positions = [
    "Goalkeeper",
    "Center Back",
    "Left Back",
    "Right Back",
    "Defensive Midfielder",
    "Central Midfielder",
    "Attacking Midfielder",
    "Left Midfielder",
    "Right Midfielder",
    "Left Winger",
    "Right Winger",
    "Striker",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.preferredPosition) {
      setFormError("Preferred position is required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await onSubmit(formData.preferredPosition, formData.whyJoin, formData.additionalMessage);
      setFormData({ preferredPosition: "", whyJoin: "", additionalMessage: "" });
      onClose();
    } catch (err) {
      setFormError(err?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Request to Join Club</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the form below to send your join request</p>
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Preferred Position <span className="text-red-500">*</span>
            </label>
            <select
              name="preferredPosition"
              value={formData.preferredPosition}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your position</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Why do you want to join this club? <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              name="whyJoin"
              value={formData.whyJoin}
              onChange={handleChange}
              rows={3}
              placeholder="Tell the club why you'd be a great fit..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Any other important message? <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              name="additionalMessage"
              value={formData.additionalMessage}
              onChange={handleChange}
              rows={2}
              placeholder="Anything else you'd like us to know..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JoinClubRequest;