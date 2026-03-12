import { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../components/Global/Sidebar";
import Topbar from "../components/Global/Topbar";
import { getPlayerById } from "../services/api.player";

function StatCard({ label, value, color = "text-gray-900" }) {
  return (
    <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 text-center">
      <div className={`text-3xl font-bold mb-1 ${color}`}>{value ?? "—"}</div>
      <div className="text-sm font-medium text-gray-700">{label}</div>
    </div>
  );
}

export default function PlayerProfile() {
  const { playerId } = useParams();
  const navigate = useNavigate();
  const [player, setPlayer] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [activeTab, setActiveTab] = useState("details");

  useEffect(() => {
    if (!playerId) return;
    setLoading(true);
    setError(null);
    getPlayerById(playerId)
      .then(setPlayer)
      .catch((err) => setError(err?.message || "Failed to load player profile"))
      .finally(() => setLoading(false));
  }, [playerId]);

  const age =
    player?.dateOfBirth
      ? Math.floor(
          (Date.now() - new Date(player.dateOfBirth)) /
            (365.25 * 24 * 60 * 60 * 1000)
        )
      : null;

  const displayPosition =
    player?.userClubs?.find((uc) => uc.position)?.position || null;

  const initials = player
    ? `${player.firstName?.[0] || ""}${player.lastName?.[0] || ""}`.toUpperCase()
    : "?";

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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Topbar />
        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {/* Back */}
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg
              width="20"
              height="20"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-6 text-gray-500">Loading player...</div>
          )}

          {player && (
            <>
              {/* ── Hero Card ── */}
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-6">
                <div className="flex flex-col sm:flex-row items-start gap-6">
                  {/* Avatar */}
                  <div className="w-28 h-28 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                    {player.profilePhoto ? (
                      <img
                        src={player.profilePhoto}
                        alt={player.firstName}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-4xl font-bold text-blue-700">
                        {initials}
                      </span>
                    )}
                  </div>

                  <div className="flex-1">
                    <h1 className="text-3xl font-bold text-gray-900 mb-2">
                      {player.firstName} {player.lastName}
                    </h1>

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

                    {/* Quick stats strip */}
                    <div className="flex flex-wrap gap-6">
                      {[
                        { label: "Matches", value: player.stats?.matchesPlayed ?? 0 },
                        { label: "Goals", value: player.stats?.goals ?? 0 },
                        { label: "Assists", value: player.stats?.assists ?? 0 },
                        { label: "Win Rate", value: `${player.stats?.winRate ?? 0}%` },
                      ].map((s) => (
                        <div key={s.label} className="flex flex-col items-center">
                          <span className="text-xl font-bold text-gray-900">
                            {s.value}
                          </span>
                          <span className="text-xs text-gray-500">{s.label}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* ── Tab Bar ── */}
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

              {/* ══ DETAILS TAB ══ */}
              {activeTab === "details" && (
                <div className="space-y-6">
                  {/* Stats grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <StatCard
                      label="Matches Played"
                      value={player.stats?.matchesPlayed}
                    />
                    <StatCard
                      label="Goals"
                      value={player.stats?.goals}
                      color="text-green-600"
                    />
                    <StatCard
                      label="Assists"
                      value={player.stats?.assists}
                      color="text-blue-600"
                    />
                    <StatCard
                      label="Win Rate"
                      value={`${player.stats?.winRate ?? 0}%`}
                      color="text-purple-600"
                    />
                    <StatCard
                      label="Wins"
                      value={player.stats?.wins}
                      color="text-green-600"
                    />
                    <StatCard
                      label="Draws"
                      value={player.stats?.draws}
                      color="text-yellow-600"
                    />
                    <StatCard
                      label="Losses"
                      value={player.stats?.losses}
                      color="text-red-600"
                    />
                    <StatCard
                      label="Yellow Cards"
                      value={player.stats?.yellowCards}
                      color="text-yellow-500"
                    />
                  </div>

                  {/* Personal info */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                      Personal Information
                    </h2>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-y-5 gap-x-12">
                      {[
                        {
                          label: "Full Name",
                          value: `${player.firstName} ${player.lastName}`,
                        },
                        {
                          label: "Age",
                          value: age != null ? `${age} years old` : null,
                        },
                        {
                          label: "Date of Birth",
                          value: player.dateOfBirth
                            ? new Date(player.dateOfBirth).toLocaleDateString()
                            : null,
                        },
                        { label: "Gender", value: player.gender },
                        {
                          label: "Location / Nationality",
                          value: player.location,
                        },
                        {
                          label: "Preferred Foot",
                          value: player.preferredFoot
                            ? player.preferredFoot.charAt(0) +
                              player.preferredFoot.slice(1).toLowerCase()
                            : null,
                        },
                        { label: "Primary Position", value: displayPosition },
                        {
                          label: "Clubs",
                          value: player.userClubs?.length
                            ? `${player.userClubs.length} club(s)`
                            : "None",
                        },
                        {
                          label: "Member Since",
                          value: player.createdAt
                            ? new Date(player.createdAt).toLocaleDateString()
                            : null,
                        },
                      ]
                        .filter((r) => r.value)
                        .map((row) => (
                          <div key={row.label} className="flex flex-col gap-0.5">
                            <span className="text-xs font-semibold uppercase tracking-wide text-gray-400">
                              {row.label}
                            </span>
                            <span className="text-sm text-gray-800 font-medium">
                              {row.value}
                            </span>
                          </div>
                        ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ══ CLUBS TAB ══ */}
              {activeTab === "clubs" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">
                    Clubs{" "}
                    <span className="text-gray-400 font-normal text-sm">
                      ({player.userClubs?.length ?? 0})
                    </span>
                  </h2>
                  {player.userClubs && player.userClubs.length > 0 ? (
                    <div className="space-y-3">
                      {player.userClubs.map((uc) => (
                        <div
                          key={uc.club.clubId}
                          onClick={() => navigate(`/club/${uc.club.clubId}`)}
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-4">
                            <div className="w-12 h-12 bg-green-600 rounded-xl flex items-center justify-center flex-shrink-0">
                              <svg
                                width="22"
                                height="18"
                                viewBox="0 0 24 24"
                                fill="none"
                                stroke="white"
                                strokeWidth="2"
                              >
                                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                                <path d="M4 22h16" />
                                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                              </svg>
                            </div>
                            <div>
                              <div className="font-semibold text-gray-900 flex items-center gap-2">
                                {uc.club.name}
                                {uc.role === "ADMIN" && (
                                  <span className="text-xs bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full font-medium">
                                    Admin
                                  </span>
                                )}
                              </div>
                              {uc.club.location && (
                                <div className="text-sm text-gray-500 mt-0.5">
                                  {uc.club.location}
                                </div>
                              )}
                              {uc.position && (
                                <div className="text-sm text-blue-600 font-medium mt-0.5">
                                  {uc.position}
                                </div>
                              )}
                            </div>
                          </div>

                          {/* Per-club stats */}
                          <div className="hidden sm:flex items-center gap-8 mr-4 text-center">
                            {[
                              { label: "Apps", value: uc.appearances ?? 0 },
                              { label: "Goals", value: uc.goals ?? 0 },
                              { label: "Assists", value: uc.assists ?? 0 },
                            ].map((s) => (
                              <div key={s.label}>
                                <div className="text-lg font-bold text-gray-900">
                                  {s.value}
                                </div>
                                <div className="text-xs text-gray-500">
                                  {s.label}
                                </div>
                              </div>
                            ))}
                          </div>

                          <svg
                            width="20"
                            height="20"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2"
                            className="text-gray-400 flex-shrink-0"
                          >
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-gray-500">
                      This player hasn't joined any clubs yet.
                    </p>
                  )}
                </div>
              )}

              {/* ══ MATCHES TAB ══ */}
              {activeTab === "matches" && (
                <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                  <h2 className="text-lg font-bold text-gray-900 mb-5">
                    Match History{" "}
                    <span className="text-gray-400 font-normal text-sm">
                      ({player.matches?.length ?? 0} games)
                    </span>
                  </h2>
                  {player.matches && player.matches.length > 0 ? (
                    <div className="space-y-3">
                      {player.matches.map((m, idx) => (
                        <div
                          key={m.matchId ?? idx}
                          onClick={() =>
                            m.scheduleId &&
                            navigate(`/schedule/${m.scheduleId}`)
                          }
                          className="flex items-center justify-between p-4 border border-gray-200 rounded-xl hover:bg-gray-50 hover:border-gray-300 cursor-pointer transition-all"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 mb-1">
                              {m.teamOne?.name ?? "Team 1"} vs{" "}
                              {m.teamTwo?.name ?? "Team 2"}
                            </div>
                            <div className="text-base font-bold text-gray-700 mb-1">
                              {m.teamOneGoals} – {m.teamTwoGoals}
                            </div>
                            <div className="flex flex-wrap items-center gap-2 text-xs text-gray-500">
                              {m.date && (
                                <span>
                                  {new Date(m.date).toLocaleDateString()}
                                </span>
                              )}
                              {m.location && <span>• {m.location}</span>}
                              {m.position && <span>• {m.position}</span>}
                              {m.isStarter != null && (
                                <span
                                  className={`px-1.5 py-0.5 rounded text-xs font-medium ${
                                    m.isStarter
                                      ? "bg-blue-50 text-blue-700"
                                      : "bg-gray-100 text-gray-600"
                                  }`}
                                >
                                  {m.isStarter ? "Starter" : "Sub"}
                                </span>
                              )}
                              {m.minutesPlayed > 0 && (
                                <span>{m.minutesPlayed} mins</span>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-3 flex-shrink-0 ml-4">
                            {m.result && (
                              <span
                                className={`px-3 py-1 rounded-full text-xs font-bold ${resultStyle(m.result)}`}
                              >
                                {m.result}
                              </span>
                            )}
                            {m.scheduleType && (
                              <span className="hidden sm:inline px-2 py-1 bg-gray-100 text-gray-600 rounded text-xs">
                                {m.scheduleType}
                              </span>
                            )}
                            <svg
                              width="18"
                              height="18"
                              viewBox="0 0 24 24"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="2"
                              className="text-gray-400"
                            >
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

              {/* ══ ACHIEVEMENTS TAB ══ */}
              {activeTab === "achievements" && (
                <div className="space-y-6">
                  {/* Milestone badges */}
                  {player.stats && (
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      {player.stats.goals >= 10 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                            ⚽
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {player.stats.goals}+ Goals
                            </div>
                            <div className="text-sm text-gray-500">
                              Career goals milestone
                            </div>
                          </div>
                        </div>
                      )}
                      {player.stats.assists >= 5 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                            🎯
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {player.stats.assists}+ Assists
                            </div>
                            <div className="text-sm text-gray-500">
                              Career assists milestone
                            </div>
                          </div>
                        </div>
                      )}
                      {player.stats.matchesPlayed >= 10 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                            🏅
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {player.stats.matchesPlayed} Appearances
                            </div>
                            <div className="text-sm text-gray-500">
                              Matches played milestone
                            </div>
                          </div>
                        </div>
                      )}
                      {player.stats.winRate >= 60 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-yellow-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                            🏆
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {player.stats.winRate}% Win Rate
                            </div>
                            <div className="text-sm text-gray-500">
                              Consistent winner
                            </div>
                          </div>
                        </div>
                      )}
                      {player.userClubs?.length >= 2 && (
                        <div className="bg-white rounded-xl border border-gray-100 shadow-sm p-5 flex items-center gap-4">
                          <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-2xl flex-shrink-0">
                            🦺
                          </div>
                          <div>
                            <div className="font-bold text-gray-900">
                              {player.userClubs.length} Clubs
                            </div>
                            <div className="text-sm text-gray-500">
                              Multi-club player
                            </div>
                          </div>
                        </div>
                      )}
                      {player.stats.goals === 0 &&
                        player.stats.assists === 0 &&
                        player.stats.matchesPlayed === 0 &&
                        player.stats.winRate < 60 &&
                        (player.userClubs?.length ?? 0) < 2 && (
                          <div className="col-span-full text-gray-500 text-sm">
                            No milestones unlocked yet. Play more matches to earn achievements!
                          </div>
                        )}
                    </div>
                  )}

                  {/* Career summary */}
                  <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
                    <h2 className="text-lg font-bold text-gray-900 mb-5">
                      Career Summary
                    </h2>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 text-center">
                      {[
                        {
                          label: "Total Goals",
                          value: player.stats?.goals ?? 0,
                          color: "text-green-600",
                        },
                        {
                          label: "Total Assists",
                          value: player.stats?.assists ?? 0,
                          color: "text-blue-600",
                        },
                        {
                          label: "Appearances",
                          value: player.stats?.matchesPlayed ?? 0,
                          color: "text-gray-900",
                        },
                        {
                          label: "Clubs Played For",
                          value: player.userClubs?.length ?? 0,
                          color: "text-purple-600",
                        },
                        {
                          label: "Wins",
                          value: player.stats?.wins ?? 0,
                          color: "text-green-600",
                        },
                        {
                          label: "Draws",
                          value: player.stats?.draws ?? 0,
                          color: "text-yellow-600",
                        },
                        {
                          label: "Losses",
                          value: player.stats?.losses ?? 0,
                          color: "text-red-600",
                        },
                        {
                          label: "Win Rate",
                          value: `${player.stats?.winRate ?? 0}%`,
                          color: "text-purple-600",
                        },
                      ].map((s) => (
                        <div key={s.label}>
                          <div className={`text-2xl font-bold ${s.color}`}>
                            {s.value}
                          </div>
                          <div className="text-xs text-gray-500 mt-1">
                            {s.label}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </>
          )}
        </main>
      </div>
    </div>
  );
}
