import { useEffect, useMemo, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
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

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value ?? "-"}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
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

        // Keep /profile and /player/:id aligned with the same payload shape.
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

  useEffect(() => {
    loadProfile();
  }, [playerId]);

  useEffect(() => {
    return () => {
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
    };
  }, [photoPreview]);

  const age =
    player?.dateOfBirth
      ? Math.floor((Date.now() - new Date(player.dateOfBirth)) / (365.25 * 24 * 60 * 60 * 1000))
      : null;

  const displayPosition =
    player?.userClubs?.find((uc) => uc.position)?.position || null;

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
    if (result === "Win") return "bg-green-100 text-green-700";
    if (result === "Loss") return "bg-red-100 text-red-700";
    if (result === "Draw") return "bg-yellow-100 text-yellow-700";
    return "bg-gray-100 text-gray-600";
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
    membershipClubs.forEach((club) => {
      if (club.clubId) byId.set(club.clubId, club);
    });

    (myClubs || []).forEach((club) => {
      if (!club?.clubId) return;
      if (!byId.has(club.clubId)) {
        byId.set(club.clubId, {
          clubId: club.clubId,
          club: {
            clubId: club.clubId,
            name: club.name,
            location: club.location,
            logo: club.logo || null,
          },
          role: club.userRole,
          position: null,
          appearances: 0,
          goals: 0,
          assists: 0,
        });
      } else {
        const existing = byId.get(club.clubId);
        byId.set(club.clubId, {
          ...existing,
          role: existing?.role || club.userRole,
          club: {
            ...existing?.club,
            logo: existing?.club?.logo || club.logo || null,
          },
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
    setEditError(null);
    setShowEditModal(true);
  };

  const handleEditInputChange = (e) => {
    setEditFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setEditError(null);
  };

  const handleSaveProfile = async () => {
    if (!player?.userId) return;
    setEditLoading(true);
    setEditError(null);

    try {
      await updatePlayerById(player.userId, {
        firstName: editFormData.firstName.trim(),
        lastName: editFormData.lastName.trim(),
        Phone: editFormData.Phone.trim(),
        location: editFormData.location.trim(),
        gender: editFormData.gender || null,
        dateOfBirth: editFormData.dateOfBirth
          ? new Date(editFormData.dateOfBirth).toISOString()
          : null,
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

    if (!file.type.startsWith("image/")) {
      setUploadError("Please select an image file");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      setUploadError("Image size should be less than 5MB");
      return;
    }

    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }

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
      if (photoPreview) {
        URL.revokeObjectURL(photoPreview);
      }
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
    if (photoPreview) {
      URL.revokeObjectURL(photoPreview);
    }
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
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-6 text-gray-500">
              {isOwnProfileRoute ? "Loading profile..." : "Loading player..."}
            </div>
          )}

          {player && (
            <>
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  <div className="relative w-28 h-28 flex-shrink-0">
                    <div className="w-full h-full rounded-full bg-blue-100 flex items-center justify-center overflow-hidden">
                      {profilePhotoUrl ? (
                        <img src={profilePhotoUrl} alt={player.firstName} className="w-full h-full object-cover" />
                      ) : (
                        <span className="text-4xl font-bold text-blue-700">{initials}</span>
                      )}
                    </div>
                    {isOwnProfileRoute && (
                      <label className="absolute -bottom-1 -right-1 w-9 h-9 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg border-2 border-white">
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                          <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                          <circle cx="12" cy="13" r="4" />
                        </svg>
                        <input type="file" accept="image/*" onChange={handlePhotoChange} className="hidden" />
                      </label>
                    )}
                  </div>

                  <div className="flex-1">
                    <div className="flex items-start justify-between gap-4 mb-2">
                      <h1 className="text-3xl font-bold text-gray-900">
                        {player.firstName} {player.lastName}
                      </h1>
                      {isOwnProfileRoute && (
                        <button
                          onClick={handleOpenEditModal}
                          className="bg-blue-50 text-blue-700 px-4 py-2 rounded-lg text-sm font-medium hover:bg-blue-100 flex items-center gap-2"
                        >
                          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                          </svg>
                          Edit Profile
                        </button>
                      )}
                    </div>

                    <div className="flex flex-wrap gap-2 mb-4">
                      {displayPosition && (
                        <span className="bg-slate-900 text-white text-sm px-3 py-1 rounded-full">
                          {displayPosition}
                        </span>
                      )}
                      {player.gender && (
                        <span className="bg-gray-100 text-gray-700 text-sm px-3 py-1 rounded-full">
                          {player.gender}
                        </span>
                      )}
                      {player.preferredFoot && (
                        <span className="bg-blue-50 text-blue-700 text-sm px-3 py-1 rounded-full capitalize">
                          {player.preferredFoot.toLowerCase()} foot
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
                          <span className="text-xl font-bold text-gray-900">{s.value}</span>
                          <span className="text-xs text-gray-500">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {photoFile && isOwnProfileRoute && (
                  <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-sm font-medium text-blue-900">New photo selected</span>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelPhotoUpload}
                          className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          disabled={uploadingPhoto}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUploadPhoto}
                          disabled={uploadingPhoto}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadingPhoto ? "Uploading..." : "Upload Photo"}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {uploadError && (
                  <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {uploadError}
                  </div>
                )}
              </div>

              <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
                <div className="flex border-b border-gray-200">
                  {tabs.map((tab) => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveTab(tab.id)}
                      className={`flex-1 px-4 py-4 text-sm font-semibold transition-all relative ${
                        activeTab === tab.id
                          ? "text-blue-600 bg-blue-50"
                          : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                      }`}
                    >
                      {tab.label}
                      {activeTab === tab.id && (
                        <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-blue-600" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {activeTab === "details" && (
                <div className="space-y-6">
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard label="Matches Played" value={player.stats?.matchesPlayed} />
                    <StatCard label="Goals" value={player.stats?.goals} color="text-green-600" />
                    <StatCard label="Assists" value={player.stats?.assists} color="text-blue-600" />
                    <StatCard label="Win Rate" value={`${player.stats?.winRate ?? 0}%`} color="text-purple-600" />
                    <StatCard label="Wins" value={player.stats?.wins} color="text-green-600" />
                    <StatCard label="Draws" value={player.stats?.draws} color="text-yellow-600" />
                    <StatCard label="Losses" value={player.stats?.losses} color="text-red-600" />
                    <StatCard label="Yellow Cards" value={player.stats?.yellowCards} color="text-yellow-500" />
                  </div>

                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">Personal Information</h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12">
                      {[
                        { label: "Full Name", value: `${player.firstName} ${player.lastName}` },
                        { label: "Age", value: age != null ? `${age} years old` : null },
                        {
                          label: "Date of Birth",
                          value: player.dateOfBirth
                            ? new Date(player.dateOfBirth).toLocaleDateString()
                            : null,
                        },
                        { label: "Gender", value: player.gender },
                        { label: "Location / Nationality", value: player.location },
                        {
                          label: "Preferred Foot",
                          value: player.preferredFoot
                            ? player.preferredFoot.charAt(0) + player.preferredFoot.slice(1).toLowerCase()
                            : null,
                        },
                        { label: "Primary Position", value: displayPosition },
                        {
                          label: "Clubs",
                          value: clubsForDisplay.length ? `${clubsForDisplay.length} club(s)` : "None",
                        },
                        {
                          label: "Member Since",
                          value: player.createdAt ? new Date(player.createdAt).toLocaleDateString() : null,
                        },
                      ]
                        .filter((r) => r.value)
                        .map((row) => (
                          <div key={row.label} className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              {row.label}
                            </span>
                            <span className="text-sm text-gray-800 font-medium">{row.value}</span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {activeTab === "clubs" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">
                    Clubs <span className="text-gray-400 font-normal text-sm">({clubsForDisplay.length})</span>
                  </h2>
                  {clubsForDisplay.length > 0 ? (
                    <div className="space-y-3">
                      {clubsForDisplay.map((uc) => (
                        <div
                          key={uc.club.clubId}
                          onClick={() => navigate(`/club/${uc.club.clubId}`)}
                          className="grid grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-4 p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-4 min-w-0">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden">
                              {toMediaUrl(uc.club.logo) ? (
                                <img src={toMediaUrl(uc.club.logo)} alt={uc.club.name} className="w-full h-full object-cover" />
                              ) : (
                                <svg width="22" height="18" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                  <path d="M4 22h16" />
                                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                                </svg>
                              )}
                            </div>
                            <div className="min-w-0">
                              <div className="font-semibold text-gray-900 flex items-center gap-2 min-w-0">
                                <span className="truncate">{uc.club.name}</span>
                                {uc.role === "OWNER" && (
                                  <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full font-medium">
                                    Owner
                                  </span>
                                )}
                                {uc.role === "ADMIN" && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>
                              {uc.club.location && (
                                <div className="text-sm text-gray-500 mt-0.5">{uc.club.location}</div>
                              )}
                              {uc.position && (
                                <div className="text-sm text-blue-600 font-medium mt-0.5">{uc.position}</div>
                              )}
                            </div>
                          </div>

                          <div className="hidden sm:flex items-center gap-8 mr-4 text-center">
                            {[
                              { label: "Apps", value: uc.appearances ?? 0 },
                              { label: "Goals", value: uc.goals ?? 0 },
                              { label: "Assists", value: uc.assists ?? 0 },
                            ].map((s) => (
                              <div key={s.label}>
                                <div className="text-lg font-bold text-gray-900">{s.value}</div>
                                <div className="text-xs text-gray-500">{s.label}</div>
                              </div>
                            ))}
                          </div>

                          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 flex-shrink-0">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      {isOwnProfileRoute
                        ? "You have not joined any clubs yet."
                        : "This player hasn't joined any clubs yet."}
                    </p>
                  )}
                </div>
              )}

              {activeTab === "matches" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">
                    Match History <span className="text-gray-400 font-normal text-sm">({player.matches?.length ?? 0} games)</span>
                  </h2>
                  {player.matches && player.matches.length > 0 ? (
                    <div className="space-y-3">
                      {player.matches.map((m, idx) => (
                        <div
                          key={m.matchId ?? idx}
                          onClick={() => m.scheduleId && navigate(`/schedule/${m.scheduleId}`)}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1">
                              {m.teamOne?.name ?? "Team 1"} vs {m.teamTwo?.name ?? "Team 2"}
                            </div>
                            <div className="text-base font-bold text-gray-700 mb-1">
                              {m.teamOneGoals} - {m.teamTwoGoals}
                            </div>
                            <div className="text-sm text-gray-500">
                              {m.date ? new Date(m.date).toLocaleDateString() : "Date TBD"}
                              {m.location ? ` | ${m.location}` : ""}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 ml-4">
                            <span className={`text-xs font-semibold px-2 py-1 rounded-full ${resultStyle(m.result)}`}>
                              {m.result || "Pending"}
                            </span>
                            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400">
                              <path d="M9 18l6-6-6-6" />
                            </svg>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">No match history yet.</p>
                  )}
                </div>
              )}

              {activeTab === "achievements" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">Achievements</h2>
                  {achievements.length > 0 ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      {achievements.map((achievement, idx) => (
                        <div key={achievement.id || `${achievement.title}-${idx}`} className="rounded-xl border border-gray-200 bg-gradient-to-br from-white to-slate-50 p-4">
                          <div className="flex items-center justify-between gap-3 mb-2">
                            <div className="text-xl" aria-hidden="true">{achievement.icon || "🏅"}</div>
                            <span className="text-[11px] uppercase tracking-wide px-2 py-1 rounded-full bg-slate-100 text-slate-700 font-semibold">
                              {achievement.tier || "Unlocked"}
                            </span>
                          </div>
                          <h3 className="font-bold text-gray-900 mb-1">{achievement.title}</h3>
                          <p className="text-sm text-gray-600">{achievement.description}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="rounded-xl border border-gray-200 bg-gray-50 p-8 text-center text-gray-500">
                      Play more matches to unlock achievements.
                    </div>
                  )}
                </div>
              )}
            </>
          )}
        </main>
      </div>

      {showEditModal && isOwnProfileRoute && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">Edit Profile</h2>
              <button onClick={() => setShowEditModal(false)} className="text-gray-400 hover:text-gray-600">
                <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {editError && (
              <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">
                {editError}
              </div>
            )}

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">First Name</label>
                  <input
                    type="text"
                    name="firstName"
                    value={editFormData.firstName}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Last Name</label>
                  <input
                    type="text"
                    name="lastName"
                    value={editFormData.lastName}
                    onChange={handleEditInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                <input
                  type="tel"
                  name="Phone"
                  value={editFormData.Phone}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <input
                  type="text"
                  name="location"
                  value={editFormData.location}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                <select
                  name="gender"
                  value={editFormData.gender}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Select Gender</option>
                  <option value="MALE">Male</option>
                  <option value="FEMALE">Female</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                <input
                  type="date"
                  name="dateOfBirth"
                  value={editFormData.dateOfBirth}
                  onChange={handleEditInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div className="flex gap-3 mt-6">
              <button
                onClick={() => setShowEditModal(false)}
                className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleSaveProfile}
                disabled={editLoading}
                className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
              >
                {editLoading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
