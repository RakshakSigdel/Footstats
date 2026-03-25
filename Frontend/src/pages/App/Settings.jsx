import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import DynamicBackground from "../../components/ui/DynamicBackground";
import { getMyProfile, updatePlayerById } from "../../services/api.player";
import { resendVerificationCode, verifyEmail } from "../../services/api.auth";
import { useTheme } from "../../context/ThemeContext";
import PlaceAutocompleteInput from "../../components/Location/PlaceAutocompleteInput";
import {
  User, Bell, Moon, Shield, Globe, CreditCard, HelpCircle, AlertTriangle, CheckCircle2, ChevronRight
} from "lucide-react";

function ToggleSwitch({ enabled, onToggle }) {
  return (
    <button
      onClick={onToggle}
      className={`relative w-12 h-6 rounded-full transition-colors duration-200 ${
        enabled ? "bg-emerald-500" : "bg-slate-300"
      }`}
    >
      <motion.div
        animate={{ x: enabled ? 24 : 2 }}
        transition={{ type: "spring", stiffness: 500, damping: 30 }}
        className="absolute top-0.5 w-5 h-5 bg-white rounded-full shadow-md"
      />
    </button>
  );
}

function SectionHeader({ icon: Icon, title, iconColor = "text-emerald-600", iconBg = "bg-emerald-50" }) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <div className={`w-10 h-10 rounded-xl ${iconBg} flex items-center justify-center`}>
        <Icon size={20} className={iconColor} />
      </div>
      <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">{title}</h2>
    </div>
  );
}

export default function Settings() {
  const { isDarkMode, toggleDarkMode } = useTheme();
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
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [locationError, setLocationError] = useState(null);
  const [verificationCode, setVerificationCode] = useState("");
  const [emailActionLoading, setEmailActionLoading] = useState(false);
  const [emailMessage, setEmailMessage] = useState(null);

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
        if (data?.locationPlaceId && data?.locationLatitude != null && data?.locationLongitude != null) {
          setSelectedPlace({
            placeId: data.locationPlaceId,
            displayName: data.location,
            latitude: Number(data.locationLatitude),
            longitude: Number(data.locationLongitude),
          });
        }
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
    if (e.target.name === "location") {
      setSelectedPlace(null);
      setLocationError(null);
    }
  };

  const handleToggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSaveChanges = async () => {
    if (!profile?.userId) return;
    const locationChanged = formData.location.trim() !== String(profile?.location || "").trim();
    if (locationChanged && !selectedPlace) {
      setLocationError("Please select a real location from suggestions");
      return;
    }
    setError(null);
    setSaveSuccess(false);
    try {
      const response = await updatePlayerById(profile.userId, {
        firstName: formData.firstName,
        lastName: formData.lastName,
        Phone: formData.phone,
        location: formData.location,
        ...(selectedPlace && {
          locationLatitude: selectedPlace.latitude,
          locationLongitude: selectedPlace.longitude,
          locationPlaceId: selectedPlace.placeId,
        }),
      });
      const updatedProfile = response?.updatedPlayer;
      if (updatedProfile) {
        setProfile((prev) => ({ ...prev, ...updatedProfile }));
        if (updatedProfile.locationPlaceId && updatedProfile.locationLatitude != null && updatedProfile.locationLongitude != null) {
          setSelectedPlace({
            placeId: updatedProfile.locationPlaceId,
            displayName: updatedProfile.location,
            latitude: Number(updatedProfile.locationLatitude),
            longitude: Number(updatedProfile.locationLongitude),
          });
        }
      }
      setLocationError(null);
      setSaveSuccess(true);
    } catch (err) {
      setError(err?.message || "Failed to save changes");
      throw err;
    }
  };

  const handleSendVerificationCode = async () => {
    if (!profile?.email) return;
    setError(null);
    setEmailMessage(null);
    setEmailActionLoading(true);
    try {
      const response = await resendVerificationCode(profile.email);
      setEmailMessage(response?.message || "Verification code sent.");
    } catch (err) {
      setError(err?.message || "Failed to send verification code");
    } finally {
      setEmailActionLoading(false);
    }
  };

  const handleVerifyEmail = async () => {
    if (!profile?.email || !verificationCode.trim()) return;
    setError(null);
    setEmailMessage(null);
    setEmailActionLoading(true);
    try {
      const response = await verifyEmail(profile.email, verificationCode.trim());
      setProfile((prev) => ({ ...prev, emailVerified: true }));
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        localStorage.setItem("user", JSON.stringify({ ...storedUser, emailVerified: true }));
        window.dispatchEvent(new Event("user-updated"));
      } catch { /* ignore */ }
      setVerificationCode("");
      setEmailMessage(response?.message || "Email verified successfully.");
    } catch (err) {
      setError(err?.message || "Verification failed");
    } finally {
      setEmailActionLoading(false);
    }
  };

  return (
    <main className="relative flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <DynamicBackground
            className="z-0"
            patternType="grid"
            patternSize={50}
            patternColor="rgba(15,23,42,0.035)"
            gradient="linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.92) 55%, rgba(236,253,245,0.88) 100%)"
            showAccents
          />
          <div className="relative z-10">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <h1 className="text-3xl md:text-4xl font-bold text-slate-900 mb-1 font-['Outfit']">Settings</h1>
            <p className="text-sm text-slate-500">Manage your account preferences</p>
          </motion.div>

          {error && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">{error}</motion.div>}
          {saveSuccess && <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mb-6 p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-700 flex items-center gap-2"><CheckCircle2 size={16} />Profile updated successfully.</motion.div>}
          {loading && (
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-500" />
              Loading...
            </div>
          )}

          {/* Profile Section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 mb-6">
            <SectionHeader icon={User} title="Profile" />
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">First Name</label>
                <input type="text" name="firstName" value={formData.firstName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                <input type="text" name="lastName" value={formData.lastName} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phone Number</label>
                <input type="tel" name="phone" value={formData.phone} onChange={handleInputChange} className="w-full px-4 py-3 rounded-xl text-sm" />
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Location</label>
                <PlaceAutocompleteInput
                  value={formData.location}
                  onChange={(nextLocation) => { setFormData((prev) => ({ ...prev, location: nextLocation })); setSelectedPlace(null); setLocationError(null); }}
                  onSelect={(place) => { setSelectedPlace(place); setLocationError(null); }}
                  placeholder="Search exact location"
                />
                {locationError && <p className="mt-1 text-xs text-red-600">{locationError}</p>}
              </div>
              <motion.button
                whileHover={{ scale: 1.02, y: -1 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleSaveChanges}
                disabled={loading || !profile?.userId}
                className="btn-primary px-6 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
              >
                Save Changes
              </motion.button>
            </div>
          </motion.div>

          {/* Notifications Section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 mb-6">
            <SectionHeader icon={Bell} title="Notifications" iconColor="text-blue-600" iconBg="bg-blue-50" />
            <div className="space-y-1">
              {[
                { key: "matchReminders", title: "Match Reminders", desc: "Get notified about upcoming matches" },
                { key: "tournamentUpdates", title: "Tournament Updates", desc: "Receive updates about tournaments" },
                { key: "clubInvitations", title: "Club Invitations", desc: "Get notified when clubs invite you" },
                { key: "emailNotifications", title: "Email Notifications", desc: "Receive email updates" },
              ].map((item) => (
                <div key={item.key} className="flex items-center justify-between py-4 border-b border-slate-100 last:border-0">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-900">{item.title}</h3>
                    <p className="text-xs text-slate-500 mt-0.5">{item.desc}</p>
                  </div>
                  <ToggleSwitch enabled={notifications[item.key]} onToggle={() => handleToggle(item.key)} />
                </div>
              ))}
            </div>
          </motion.div>

          {/* Appearance Section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 mb-6">
            <SectionHeader icon={Moon} title="Appearance" iconColor="text-purple-600" iconBg="bg-purple-50" />
            <div className="flex items-center justify-between py-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">Dark Mode</h3>
                <p className="text-xs text-slate-500 mt-0.5">Switch to dark theme for better viewing in low light</p>
              </div>
              <ToggleSwitch enabled={isDarkMode} onToggle={toggleDarkMode} />
            </div>
          </motion.div>

          {/* Privacy & Security Section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 mb-6">
            <SectionHeader icon={Shield} title="Privacy & Security" iconColor="text-amber-600" iconBg="bg-amber-50" />

            {!profile?.emailVerified && (
              <div className="mb-6 p-4 rounded-xl border border-amber-200 bg-amber-50 flex items-start gap-3">
                <AlertTriangle size={18} className="text-amber-600 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-amber-900">Verify your email to stay updated</p>
                  <p className="text-xs text-amber-800 mt-0.5">Your account can miss important updates like match reminders, invitations, and security alerts until verified.</p>
                </div>
              </div>
            )}

            <div className="mb-6 p-4 rounded-xl border border-slate-200 bg-slate-50">
              <div className="flex items-center justify-between gap-3 mb-3">
                <div>
                  <p className="text-sm font-semibold text-slate-900">Email Verification</p>
                  <p className="text-xs text-slate-500">{profile?.email || "No email available"}</p>
                </div>
                {profile?.emailVerified ? (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                    <CheckCircle2 size={12} /> Verified
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full text-xs font-semibold bg-amber-50 text-amber-700 border border-amber-200">Not Verified</span>
                )}
              </div>
              {!profile?.emailVerified && (
                <div className="space-y-3">
                  <div className="flex flex-col md:flex-row gap-3">
                    <input
                      type="text"
                      value={verificationCode}
                      onChange={(e) => setVerificationCode(e.target.value)}
                      placeholder="Enter verification code"
                      className="flex-1 px-4 py-3 bg-white rounded-xl text-sm"
                    />
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={handleVerifyEmail}
                      disabled={emailActionLoading || !verificationCode.trim()}
                      className="btn-primary px-4 py-3 rounded-xl text-sm font-semibold disabled:opacity-50"
                    >
                      Verify Email
                    </motion.button>
                  </div>
                  <button
                    type="button"
                    onClick={handleSendVerificationCode}
                    disabled={emailActionLoading}
                    className="px-4 py-2 rounded-xl text-sm font-semibold bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                  >
                    Send Verification Code
                  </button>
                  {emailMessage && <p className="text-sm text-emerald-700">{emailMessage}</p>}
                </div>
              )}
            </div>

            <div className="space-y-2">
              {["Change Password", "Two-Factor Authentication", "Privacy Settings"].map((label) => (
                <motion.button
                  key={label}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-full px-4 py-3 rounded-xl text-left text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between"
                >
                  {label}
                  <ChevronRight size={16} className="text-slate-400" />
                </motion.button>
              ))}
            </div>
          </motion.div>

          {/* Language & Region Section */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 mb-6">
            <SectionHeader icon={Globe} title="Language & Region" iconColor="text-cyan-600" iconBg="bg-cyan-50" />
            <div className="space-y-5">
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Language</label>
                <select value={language} onChange={(e) => setLanguage(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm">
                  <option value="English">English</option>
                  <option value="Nepali">Nepali</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Timezone</label>
                <select value={timezone} onChange={(e) => setTimezone(e.target.value)} className="w-full px-4 py-3 rounded-xl text-sm">
                  <option value="Asia/Kathmandu (NPT)">Asia/Kathmandu (NPT)</option>
                </select>
              </div>
            </div>
          </motion.div>

          {/* Payment Methods */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8 mb-6">
            <SectionHeader icon={CreditCard} title="Payment Methods" iconColor="text-rose-600" iconBg="bg-rose-50" />
            <p className="text-sm text-slate-500 mb-5 -mt-2">Add payment methods for tournament entries</p>
            <motion.button
              whileHover={{ x: 4 }}
              transition={{ type: "spring", stiffness: 400, damping: 25 }}
              className="w-full px-4 py-3 rounded-xl text-left text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between"
            >
              + Add Payment Method
              <ChevronRight size={16} className="text-slate-400" />
            </motion.button>
          </motion.div>

          {/* Help & Support */}
          <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-8">
            <SectionHeader icon={HelpCircle} title="Help & Support" iconColor="text-indigo-600" iconBg="bg-indigo-50" />
            <div className="space-y-2">
              {["Help Center", "Contact Support", "Terms of Service", "Privacy Policy"].map((label) => (
                <motion.button
                  key={label}
                  whileHover={{ x: 4 }}
                  transition={{ type: "spring", stiffness: 400, damping: 25 }}
                  className="w-full px-4 py-3 rounded-xl text-left text-sm font-semibold text-slate-700 bg-slate-50 hover:bg-emerald-50 hover:text-emerald-700 transition-colors flex items-center justify-between"
                >
                  {label}
                  <ChevronRight size={16} className="text-slate-400" />
                </motion.button>
              ))}
            </div>
          </motion.div>
          </div>
    </main>
  );
}