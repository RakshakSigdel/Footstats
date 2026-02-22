import { useState, useEffect } from "react";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getMyProfile, updatePlayerById } from "../services/api.player";

export default function Settings() {
  const [profile, setProfile] = useState(null);
  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    location: ""
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const [notifications, setNotifications] = useState({
    matchReminders: true,
    tournamentUpdates: true,
    clubInvitations: true,
    emailNotifications: false
  });

  const [language, setLanguage] = useState("English");
  const [timezone, setTimezone] = useState("Asia/Kathmandu (NPT)");

  useEffect(() => {
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = await getMyProfile();
        setProfile(data);
        setFormData({
          firstName: data?.firstName ?? "",
          lastName: data?.lastName ?? "",
          phone: data?.Phone ?? "",
          location: data?.location ?? ""
        });
      } catch (err) {
        setError(err?.message || "Failed to load profile");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setSaveSuccess(false);
  };

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = async () => {
    if (!profile?.id) return;
    setError(null);
    setSaveSuccess(false);
    try {
      await updatePlayerById(profile.id, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        Phone: formData.phone,
        location: formData.location
      });
      setSaveSuccess(true);
    } catch (err) {
      setError(err?.message || "Failed to save changes");
      throw err;
    }
  };

  return (
    <div className="flex min-h-screen">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <div className="mb-8">
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Settings</h1>
            <p className="text-gray-600">Manage your account preferences</p>
          </div>

          {error && <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>}
          {saveSuccess && <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700">Profile updated successfully.</div>}
          {loading && <div className="mb-6 text-gray-500">Loading...</div>}

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
                <circle cx="12" cy="7" r="4" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Profile (from backend)</h2>
            </div>

            <div className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">First Name</label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Last Name</label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Phone Number</label>
                <input
                  type="tel"
                  name="phone"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">Location</label>
                <input
                  type="text"
                  name="location"
                  value={formData.location}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <button
                onClick={handleSaveChanges}
                disabled={loading || !profile?.id}
                className="bg-slate-900 text-white px-6 py-3 rounded-lg text-sm font-medium hover:bg-slate-800 disabled:opacity-50"
              >
                Save Changes
              </button>
            </div>
          </div>

          {/* Notifications Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Notifications</h2>
            </div>

            <div className="space-y-5">
              {/* Match Reminders */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Match Reminders</h3>
                  <p className="text-sm text-gray-600">Get notified about upcoming matches</p>
                </div>
                <button
                  onClick={() => handleToggle("matchReminders")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.matchReminders ? "bg-slate-900" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.matchReminders ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Tournament Updates */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Tournament Updates</h3>
                  <p className="text-sm text-gray-600">Receive updates about tournaments</p>
                </div>
                <button
                  onClick={() => handleToggle("tournamentUpdates")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.tournamentUpdates ? "bg-slate-900" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.tournamentUpdates ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Club Invitations */}
              <div className="flex items-center justify-between py-3 border-b border-gray-100">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Club Invitations</h3>
                  <p className="text-sm text-gray-600">Get notified when clubs invite you</p>
                </div>
                <button
                  onClick={() => handleToggle("clubInvitations")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.clubInvitations ? "bg-slate-900" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.clubInvitations ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>

              {/* Email Notifications */}
              <div className="flex items-center justify-between py-3">
                <div>
                  <h3 className="text-base font-semibold text-gray-900 mb-1">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive email updates</p>
                </div>
                <button
                  onClick={() => handleToggle("emailNotifications")}
                  className={`relative w-12 h-6 rounded-full transition-colors ${
                    notifications.emailNotifications ? "bg-slate-900" : "bg-gray-300"
                  }`}
                >
                  <div
                    className={`absolute top-0.5 left-0.5 w-5 h-5 bg-white rounded-full transition-transform ${
                      notifications.emailNotifications ? "translate-x-6" : "translate-x-0"
                    }`}
                  ></div>
                </button>
              </div>
            </div>
          </div>

          {/* Privacy & Security Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Privacy & Security</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Change Password
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Two-Factor Authentication
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Privacy Settings
              </button>
            </div>
          </div>

          {/* Language & Region Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <line x1="2" y1="12" x2="22" y2="12" />
                <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Language & Region</h2>
            </div>

            <div className="space-y-5">
              {/* Language */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Language
                </label>
                <select
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center"
                  }}
                >
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                </select>
              </div>

              {/* Timezone */}
              <div>
                <label className="block text-sm font-medium text-gray-900 mb-2">
                  Timezone
                </label>
                <select
                  value={timezone}
                  onChange={(e) => setTimezone(e.target.value)}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none cursor-pointer"
                  style={{
                    backgroundImage: `url("data:image/svg+xml,%3Csvg width='12' height='8' viewBox='0 0 12 8' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L6 6L11 1' stroke='%23666' stroke-width='2' stroke-linecap='round'/%3E%3C/svg%3E")`,
                    backgroundRepeat: "no-repeat",
                    backgroundPosition: "right 1rem center"
                  }}
                >
                  <option value="Asia/Kathmandu (NPT)">Asia/Kathmandu (NPT)</option>
                
                  
                </select>
              </div>
            </div>
          </div>

          {/* Payment Methods Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
            <div className="flex items-center gap-3 mb-3">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="1" y="4" width="22" height="16" rx="2" ry="2" />
                <line x1="1" y1="10" x2="23" y2="10" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Payment Methods</h2>
            </div>
            <p className="text-sm text-gray-600 mb-6">Add payment methods for tournament entries</p>

            <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
              + Add Payment Method
            </button>
          </div>

          {/* Help & Support Section */}
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8">
            <div className="flex items-center gap-3 mb-6">
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="10" />
                <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
                <line x1="12" y1="17" x2="12.01" y2="17" />
              </svg>
              <h2 className="text-2xl font-bold text-gray-900">Help & Support</h2>
            </div>

            <div className="space-y-3">
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Help Center
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Contact Support
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Terms of Service
              </button>
              <button className="w-full px-4 py-3 bg-gray-50 rounded-lg text-left text-base font-medium text-gray-900 hover:bg-green-600 hover:text-white transition-colors">
                Privacy Policy
              </button>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}