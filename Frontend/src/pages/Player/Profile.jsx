import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import {
  getMyProfile,
  getPlayerById,
  updatePlayerById,
  uploadProfilePhoto,
} from "../../services/api.player";
import { getMyClubs } from "../../services/api.clubs";
import { toMediaUrl } from "../../services/media";
import PlaceAutocompleteInput from "../../components/Location/PlaceAutocompleteInput";
import {
  Camera, Edit3, X, MapPin, Calendar, Shield, Target, Users as UsersIcon, Trophy, ChevronRight
} from "lucide-react";

function StatCard({ label, value, icon: Icon, gradient }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.02, transition: { duration: 0.2 } }}
      className="bg-white rounded-2xl border border-slate-100/80 shadow-sm p-5 text-center group relative overflow-hidden"
    >
      <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
      {Icon && (
        <div className="w-10 h-10 mx-auto mb-3 rounded-xl bg-slate-50 flex items-center justify-center">
          <Icon size={18} className="text-slate-500" />
        </div>
      )}
      <div className="text-2xl font-bold text-slate-900 mb-1">{value ?? "-"}</div>
      <div className="text-xs font-semibold text-slate-400 uppercase tracking-wide">{label}</div>
    </motion.div>
  );
}

export default function Profile() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [myClubs, setMyClubs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  const [showEditModal, setShowEditModal] = useState(false);
  const [editFormData, setEditFormData] = useState({
    firstName: "",
    lastName: "",
    Phone: "",
    location: "",
    gender: "",
    dateOfBirth: "",
  });
  const [editLoading, setEditLoading] = useState(false);
  const [editError, setEditError] = useState(null);
  const [editSelectedPlace, setEditSelectedPlace] = useState(null);
  const [editLocationError, setEditLocationError] = useState(null);

  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [uploadingPhoto, setUploadingPhoto] = useState(false);
  const [uploadError, setUploadError] = useState(null);

  const isOwnProfileRoute = !playerId;

  const loadProfile = async () => {
    setLoading(true);
    setError(null);
    try {
      if (isOwnProfileRoute) {
        const [me, clubs] = await Promise.all([
          getMyProfile(),
          getMyClubs().catch(() => []),
        ]);
        if (!me?.userId) {
          throw new Error("Your profile could not be resolved.");
        }
        const fullPlayer = await getPlayerById(me.userId);
        setPlayer(fullPlayer);
        setMyClubs(Array.isArray(clubs) ? clubs : []);
      } else {
        const fullPlayer = await getPlayerById(playerId);
        setPlayer(fullPlayer);
        setMyClubs([]);
      }
    } catch (err) {
      setError(err?.message || "Failed to load player profile");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { loadProfile(); }, [playerId]);

  useEffect(() => {
    return () => { if (photoPreview) URL.revokeObjectURL(photoPreview); };
  }, [photoPreview]);

  const age = player?.dateOfBirth
    ? Math.floor((Date.now() - new Date(player.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
    : null;

  const displayPosition = player?.userClubs?.find((uc) => uc.position)?.position || null;

  const initials = player
    ? `${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.toUpperCase() || "?"
    : "?";

  const profilePhotoUrl = useMemo(() => {
    if (photoPreview) return photoPreview;
    return toMediaUrl(player?.profilePhoto);
  }, [photoPreview, player?.profilePhoto]);

  const tabs = [
    { id: "details", label: "Details" },
    { id: "clubs", label: "Clubs" },
    { id: "matches", label: "Matches" },
    { id: "achievements", label: "Achievements" },
  ];

  const resultStyle = (result) => {
    if (result === "Win") return "bg-emerald-50 text-emerald-700 border border-emerald-200";
    if (result === "Loss") return "bg-red-50 text-red-700 border border-red-200";
    if (result === "Draw") return "bg-amber-50 text-amber-700 border border-amber-200";
    return "bg-slate-50 text-slate-600 border border-slate-200";
  };

  const clubsForDisplay = useMemo(() => {
    const membershipClubs = (player?.userClubs || []).map((uc) => ({
      clubId: uc.club?.clubId,
      club: uc.club,
      role: uc.role,
      position: uc.position,
      appearances: uc.appearances,
      goals: uc.goals,
      assists: uc.assists,
    }));
    const byId = new Map();
    membershipClubs.forEach((club) => { if (club.clubId) byId.set(club.clubId, club); });
    (myClubs || []).forEach((club) => {
      if (!club?.clubId) return;
      if (!byId.has(club.clubId)) {
        byId.set(club.clubId, {
          clubId: club.clubId,
          club: { clubId: club.clubId, name: club.name, location: club.location, logo: club.logo || null },
          role: club.userRole, position: null, appearances: 0, goals: 0, assists: 0,
        });
      } else {
        const existing = byId.get(club.clubId);
        byId.set(club.clubId, {
          ...existing,
          role: existing?.role || club.userRole,
          club: { ...existing?.club, logo: existing?.club?.logo || club.logo || null },
        });
      }
    });
    return [...byId.values()];
  }, [player?.userClubs, myClubs]);

  const achievements = useMemo(() => {
    if (!Array.isArray(player?.achievements)) return [];
    return player.achievements;
  }, [player?.achievements]);

  const handleOpenEditModal = () => {
    if (!player?.userId) return;
    setEditFormData({
      firstName: player.firstName || "",
      lastName: player.lastName || "",
      Phone: player.Phone || "",
      location: player.location || "",
      gender: player.gender || "",
      dateOfBirth: player.dateOfBirth ? new Date(player.dateOfBirth).toISOString().split("T")[0] : "",
    });
    if (player.locationPlaceId && player.locationLatitude != null && player.locationLongitude != null) {
      setEditSelectedPlace({
        placeId: player.locationPlaceId,
        displayName: player.location,
        latitude: Number(player.locationLatitude),
        longitude: Number(player.locationLongitude),
      });
    } else {
      setEditSelectedPlace(null);
    }
    setEditError(null);
    setEditLocationError(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEditError(null);
    if (e.target.name === "location") {
      setEditSelectedPlace(null);
      setEditLocationError(null);
    }
  };

  const handleSaveProfile = async () => {
    if (!player?.userId) return;
    const locationChanged = editFormData.location.trim() !== String(player.location || "").trim();
    if (locationChanged && !editSelectedPlace) {
      setEditLocationError("Please select a real location from suggestions");
      return;
    }
    setEditLoading(true);
    setEditError(null);
    try {
      await updatePlayerById(player.userId, {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        Phone: editFormData.Phone.trim(),
        location: editFormData.location.trim(),
        ...(editSelectedPlace && {
          locationLatitude: editSelectedPlace.latitude,
          locationLongitude: editSelectedPlace.longitude,
          locationPlaceId: editSelectedPlace.placeId,
        }),
        gender: editFormData.gender || null,
        dateOfBirth: editFormData.dateOfBirth ? new Date(editFormData.dateOfBirth).toISOString() : null,
      });
      setShowEditModal(false);
      await loadProfile();
    } catch (err) {
      setEditError(err?.message || "Failed to update profile");
    } finally {
      setEditLoading(false);
    }
  };

  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) { setUploadError("Please select an image file"); return; }
    if (file.size > 5 * 1024 * 1024) { setUploadError("Image size should be less than 5MB"); return; }
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoFile(file);
    setPhotoPreview(URL.createObjectURL(file));
    setUploadError(null);
  };

  const handleUploadPhoto = async () => {
    if (!photoFile) return;
    setUploadingPhoto(true);
    setUploadError(null);
    try {
      await uploadProfilePhoto(photoFile);
      setPhotoFile(null);
      if (photoPreview) URL.revokeObjectURL(photoPreview);
      setPhotoPreview(null);
      await loadProfile();
    } catch (err) {
      setUploadError(err?.message || "Failed to upload photo");
    } finally {
      setUploadingPhoto(false);
    }
  };

  const handleCancelPhotoUpload = () => {
    setPhotoFile(null);
    if (photoPreview) URL.revokeObjectURL(photoPreview);
    setPhotoPreview(null);
    setUploadError(null);
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </motion.div>
          )}
          {loading && (
            <div className="mb-6 flex items-center gap-3 text-slate-500">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-500" />
              {isOwnProfileRoute ? "Loading profile..." : "Loading player..."}
            </div>
          )}

          {player && (
            <>
              {/* Profile Hero Card */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-white rounded-2xl shadow-sm border border-slate-100/80 overflow-hidden mb-6"
              >
                {/* Gradient banner */}
                <div className="h-32 bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-500 relative">
                  <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNDAiIGhlaWdodD0iNDAiIHZpZXdCb3g9IjAgMCA0MCA0MCIgeG1sbnM9Imh0dHA6Ly93d3cuc3ZnLm9yZyI+PGNpcmNsZSBjeD0iMjAiIGN5PSIyMCIgcj0iMiIgZmlsbD0icmdiYSgyNTUsMjU1LDI1NSwwLjEpIi8+PC9zdmc+')] opacity-50" />
                </div>
                
                <div className="px-8 pb-8 -mt-16 relative">
                  <div className="flex flex-col sm:flex-row items-start gap-6">
                    {/* Avatar */}
                    <div className="relative">
                      <div className="w-28 h-28 rounded-2xl bg-white p-1 shadow-lg">
                        <div className="w-full h-full rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center overflow-hidden">
                          {profilePhotoUrl ? (
                            <img src={profilePhotoUrl} alt={player.firstName} className="w-full h-full object-cover rounded-xl" />
                          ) : (
                            <span className="text-3xl font-bold text-white">{initials}</span>
                          )}
                        </div>
                      </div>
                      {isOwnProfileRoute && (
                        <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-emerald-600 rounded-xl flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition-colors shadow-lg border-2 border-white">
                          <Camera size={16} className="text-white" />
                          <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                        </label>
                      )}
                    </div>

                    <div className="flex-1 pt-2 sm:pt-6">
                      <div className="flex items-start justify-between gap-4 mb-3">
                        <div>
                          <h1 className="text-2xl md:text-3xl font-bold text-slate-900 font-['Outfit']">
                            {player.firstName} {player.lastName}
                          </h1>
                          {player.location && (
                            <div className="flex items-center gap-1.5 text-sm text-slate-500 mt-1">
                              <MapPin size={14} />
                              <span>{player.location}</span>
                            </div>
                          )}
                        </div>
                        {isOwnProfileRoute && (
                          <motion.button
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                            onClick={handleOpenEditModal}
                            className="bg-emerald-50 text-emerald-700 px-4 py-2.5 rounded-xl text-sm font-semibold hover:bg-emerald-100 flex items-center gap-2 transition-colors"
                          >
                            <Edit3 size={15} />
                            Edit Profile
                          </motion.button>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-2 mb-4">
                        {displayPosition && (
                          <span className="bg-gradient-to-r from-emerald-600 to-teal-600 text-white text-xs px-3 py-1.5 rounded-full font-semibold shadow-sm shadow-emerald-500/20">
                            {displayPosition}
                          </span>
                        )}
                        {player.gender && (
                          <span className="bg-slate-100 text-slate-600 text-xs px-3 py-1.5 rounded-full font-semibold">
                            {player.gender}
                          </span>
                        )}
                        {player.preferredFoot && (
                          <span className="bg-blue-50 text-blue-700 text-xs px-3 py-1.5 rounded-full font-semibold capitalize">
                            {player.preferredFoot.toLowerCase()} foot
                          </span>
                        )}
                        {age != null && (
                          <span className="bg-amber-50 text-amber-700 text-xs px-3 py-1.5 rounded-full font-semibold">
                            {age} years old
                          </span>
                        )}
                      </div>

                      <div className="flex flex-wrap gap-6">
                        {[
                          { label: "Matches", value: player.stats?.matchesPlayed ?? 0 },
                          { label: "Goals", value: player.stats?.goals ?? 0 },
                          { label: "Assists", value: player.stats?.assists ?? 0 },
                          { label: "Win Rate", value: `${player.stats?.winRate ?? 0}%` },
                        ].map((s) => (
                          <div key={s.label} className="flex flex-col items-center">
                            <span className="text-xl font-bold text-slate-900">{s.value}</span>
                            <span className="text-xs text-slate-400 font-semibold uppercase tracking-wide">{s.label}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {photoFile && isOwnProfileRoute && (
                    <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mt-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl">
                      <div className="flex items-center justify-between gap-3">
                        <span className="text-sm font-semibold text-emerald-900">New photo selected</span>
                        <div className="flex gap-2">
                          <button onClick={handleCancelPhotoUpload} className="px-3 py-1.5 text-sm text-slate-700 border border-slate-300 rounded-xl hover:bg-slate-50" disabled={uploadingPhoto}>Cancel</button>
                          <button onClick={handleUploadPhoto} disabled={uploadingPhoto} className="btn-primary px-4 py-1.5 text-sm rounded-xl">
                            {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}
                  {uploadError && (
                    <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{uploadError}</div>
                  )}
                </div>
              </motion.div>

              {/* Tabs */}
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 mb-6 overflow-hidden">
                <div className="flex border-b border-slate-100">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-4 text-sm font-semibold transition-all relative ${
                        activeTab === tab.id
                          ? "text-emerald-600"
                          : "text-slate-500 hover:text-slate-900 hover:bg-slate-50"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <motion.div
                          layoutId="profile-tab-indicator"
                          className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-emerald-500 to-teal-500"
                          transition={{ type: "spring", stiffness: 380, damping: 30 }}
                        />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "details" && (
                  <motion.div key="details" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} className="space-y-6">
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                      <StatCard label="Matches" value={player.stats?.matchesPlayed} icon={Calendar} gradient="from-blue-400 to-indigo-500" />
                      <StatCard label="Goals" value={player.stats?.goals} icon={Target} gradient="from-emerald-400 to-teal-500" />
                      <StatCard label="Assists" value={player.stats?.assists} icon={UsersIcon} gradient="from-purple-400 to-violet-500" />
                      <StatCard label="Win Rate" value={`${player.stats?.winRate ?? 0}%`} icon={Trophy} gradient="from-amber-400 to-orange-500" />
                      <StatCard label="Wins" value={player.stats?.wins} gradient="from-emerald-400 to-green-500" />
                      <StatCard label="Draws" value={player.stats?.draws} gradient="from-amber-400 to-yellow-500" />
                      <StatCard label="Losses" value={player.stats?.losses} gradient="from-red-400 to-rose-500" />
                      <StatCard label="Yellow Cards" value={player.stats?.yellowCards} gradient="from-yellow-400 to-amber-500" />
                    </div>

                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-5 font-['Outfit']">Personal Information</h2>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12">
                        {[
                          { label: "Full Name", value: `${player.firstName} ${player.lastName}` },
                          { label: "Age", value: age != null ? `${age} years old` : null },
                          { label: "Date of Birth", value: player.dateOfBirth ? new Date(player.dateOfBirth).toLocaleDateString() : null },
                          { label: "Gender", value: player.gender },
                          { label: "Location", value: player.location },
                          { label: "Preferred Foot", value: player.preferredFoot ? player.preferredFoot.charAt(0) + player.preferredFoot.slice(1).toLowerCase() : null },
                          { label: "Primary Position", value: displayPosition },
                          { label: "Clubs", value: clubsForDisplay.length ? `${clubsForDisplay.length} club(s)` : "None" },
                          { label: "Member Since", value: player.createdAt ? new Date(player.createdAt).toLocaleDateString() : null },
                        ].filter((r) => r.value).map((row) => (
                          <div key={row.label} className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-slate-400">{row.label}</span>
                            <span className="text-sm text-slate-800 font-medium">{row.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </motion.div>
                )}

                {activeTab === "clubs" && (
                  <motion.div key="clubs" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-5 font-['Outfit']">
                        Clubs <span className="text-slate-400 font-normal text-sm">({clubsForDisplay.length})</span>
                      </h2>
                      {clubsForDisplay.length > 0 ? (
                        <div className="space-y-3">
                          {clubsForDisplay.map((uc) => (
                            <motion.div
                              key={uc.club.clubId}
                              whileHover={{ x: 4, transition: { duration: 0.15 } }}
                              onClick={() => navigate(`/club/${uc.club.clubId}`)}
                              className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 p-4 border border-slate-200 rounded-2xl hover:bg-emerald-50/30 hover:border-emerald-200 cursor-pointer transition-all"
                            >
                              <div className="flex items-center gap-4 min-w-0">
                                <div className="w-12 h-12 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md shadow-emerald-500/20">
                                  {toMediaUrl(uc.club.logo) ? (
                                    <img src={toMediaUrl(uc.club.logo)} alt={uc.club.name} className="w-full h-full object-cover" />
                                  ) : (
                                    <Shield size={20} className="text-white" />
                                  )}
                                </div>
                                <div className="min-w-0">
                                  <div className="font-semibold text-slate-900 flex items-center gap-2 min-w-0">
                                    <span className="truncate">{uc.club.name}</span>
                                    {uc.role === "OWNER" && <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-semibold">Owner</span>}
                                    {uc.role === "ADMIN" && <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full font-semibold">Admin</span>}
                                  </div>
                                  {uc.club.location && <div className="text-sm text-slate-500 mt-0.5 flex items-center gap-1"><MapPin size={12} />{uc.club.location}</div>}
                                  {uc.position && <div className="text-sm text-emerald-600 font-medium mt-0.5">{uc.position}</div>}
                                </div>
                              </div>
                              <div className="hidden sm:flex items-center gap-8 mr-4 text-center">
                                {[
                                  { label: "Apps", value: uc.appearances ?? 0 },
                                  { label: "Goals", value: uc.goals ?? 0 },
                                  { label: "Assists", value: uc.assists ?? 0 },
                                ].map((s) => (
                                  <div key={s.label}>
                                    <div className="text-lg font-bold text-slate-900">{s.value}</div>
                                    <div className="text-xs text-slate-400 font-semibold">{s.label}</div>
                                  </div>
                                ))}
                              </div>
                              <ChevronRight size={18} className="text-slate-300 flex-shrink-0" />
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <div className="text-4xl mb-3">⚽</div>
                          <p className="text-slate-500">
                            {isOwnProfileRoute ? "You haven't joined any clubs yet." : "This player hasn't joined any clubs yet."}
                          </p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "matches" && (
                  <motion.div key="matches" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-5 font-['Outfit']">
                        Match History <span className="text-slate-400 font-normal text-sm">({player.matches?.length ?? 0} games)</span>
                      </h2>
                      {player.matches && player.matches.length > 0 ? (
                        <div className="space-y-3">
                          {player.matches.map((m, idx) => (
                            <motion.div
                              key={m.matchId ?? idx}
                              whileHover={{ x: 4, transition: { duration: 0.15 } }}
                              onClick={() => m.scheduleId && navigate(`/schedule/${m.scheduleId}`)}
                              className="flex items-center justify-between p-4 border border-slate-200 rounded-2xl hover:bg-emerald-50/30 hover:border-emerald-200 cursor-pointer transition-all"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-semibold text-slate-900 mb-1">
                                  {m.teamOne?.name ?? "Team 1"} vs {m.teamTwo?.name ?? "Team 2"}
                                </div>
                                <div className="text-base font-bold text-slate-700 mb-1">
                                  {m.teamOneGoals} - {m.teamTwoGoals}
                                </div>
                                <div className="text-sm text-slate-500">
                                  {m.date ? new Date(m.date).toLocaleDateString() : "Date TBD"}
                                  {m.location ? ` | ${m.location}` : ""}
                                </div>
                              </div>
                              <div className="flex items-center gap-3 ml-4">
                                <span className={`text-xs font-semibold px-2.5 py-1 rounded-full ${resultStyle(m.result)}`}>
                                  {m.result || "Pending"}
                                </span>
                                <ChevronRight size={18} className="text-slate-300" />
                              </div>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <div className="text-4xl mb-3">🏟️</div>
                          <p className="text-slate-500">No match history yet.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}

                {activeTab === "achievements" && (
                  <motion.div key="achievements" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }}>
                    <div className="bg-white rounded-2xl shadow-sm border border-slate-100/80 p-6">
                      <h2 className="text-lg font-bold text-slate-900 mb-5 font-['Outfit']">Achievements</h2>
                      {achievements.length > 0 ? (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                          {achievements.map((achievement, idx) => (
                            <motion.div
                              key={achievement.id || `${achievement.title}-${idx}`}
                              whileHover={{ y: -3, scale: 1.01, transition: { duration: 0.2 } }}
                              className="rounded-2xl border border-slate-200 bg-gradient-to-br from-white to-emerald-50/30 p-5 group"
                            >
                              <div className="flex items-center justify-between gap-3 mb-3">
                                <div className="text-2xl">{achievement.icon || "🏅"}</div>
                                <span className="text-[11px] uppercase tracking-wide px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 font-semibold border border-emerald-100">
                                  {achievement.tier || "Unlocked"}
                                </span>
                              </div>
                              <h3 className="font-bold text-slate-900 mb-1">{achievement.title}</h3>
                              <p className="text-sm text-slate-500">{achievement.description}</p>
                            </motion.div>
                          ))}
                        </div>
                      ) : (
                        <div className="py-10 text-center">
                          <div className="text-4xl mb-3">🏆</div>
                          <p className="text-slate-500">Play more matches to unlock achievements.</p>
                        </div>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </>
          )}
        </main>
      </div>

      {/* Edit Profile Modal */}
      <AnimatePresence>
        {showEditModal && isOwnProfileRoute && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4"
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6"
            >
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-slate-900 font-['Outfit']">Edit Profile</h2>
                <button onClick={() => setShowEditModal(false)} className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition-colors">
                  <X size={20} />
                </button>
              </div>

              {editError && (
                <div className="mb-4 p-3 rounded-xl bg-red-50 border border-red-200 text-red-700 text-sm">{editError}</div>
              )}

              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">First Name</label>
                    <input type="text" name="firstName" value={editFormData.firstName} onChange={handleEditInputChange} className="w-full px-3.5 py-2.5 rounded-xl text-sm" />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Last Name</label>
                    <input type="text" name="lastName" value={editFormData.lastName} onChange={handleEditInputChange} className="w-full px-3.5 py-2.5 rounded-xl text-sm" />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Phone</label>
                  <input type="tel" name="Phone" value={editFormData.Phone} onChange={handleEditInputChange} className="w-full px-3.5 py-2.5 rounded-xl text-sm" />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Location</label>
                  <PlaceAutocompleteInput
                    value={editFormData.location}
                    onChange={(nextLocation) => { setEditFormData((prev) => ({ ...prev, location: nextLocation })); setEditSelectedPlace(null); setEditLocationError(null); }}
                    onSelect={(place) => { setEditSelectedPlace(place); setEditLocationError(null); }}
                    placeholder="Search exact location"
                  />
                  {editLocationError && <p className="mt-1 text-xs text-red-600">{editLocationError}</p>}
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Gender</label>
                  <select name="gender" value={editFormData.gender} onChange={handleEditInputChange} className="w-full px-3.5 py-2.5 rounded-xl text-sm">
                    <option value="">Select Gender</option>
                    <option value="MALE">Male</option>
                    <option value="FEMALE">Female</option>
                    <option value="OTHER">Other</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-600 mb-1.5 uppercase tracking-wide">Date of Birth</label>
                  <input type="date" name="dateOfBirth" value={editFormData.dateOfBirth} onChange={handleEditInputChange} className="w-full px-3.5 py-2.5 rounded-xl text-sm" />
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <button onClick={() => setShowEditModal(false)} className="flex-1 px-4 py-2.5 border border-slate-300 text-slate-700 rounded-xl hover:bg-slate-50 font-medium text-sm">
                  Cancel
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleSaveProfile}
                  disabled={editLoading}
                  className="flex-1 btn-primary px-4 py-2.5 rounded-xl text-sm font-semibold disabled:opacity-50"
                >
                  {editLoading ? "Saving..." : "Save Changes"}
                </motion.button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
