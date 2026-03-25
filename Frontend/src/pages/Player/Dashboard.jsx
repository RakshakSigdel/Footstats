import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { AnimatedBeam, Circle } from "./Components/animated-beam";
import DynamicBackground from "../../components/ui/DynamicBackground";
import { useTheme } from "../../context/ThemeContext";
import { getMyProfile, getMyStats } from "../../services/api.player";
import { getMySchedules } from "../../services/api.schedules";
import { getMyClubs } from "../../services/api.clubs";
import { getMyTournaments } from "../../services/api.tournaments";
import { getAllClubs } from "../../services/api.clubs";
import { toMediaUrl } from "../../services/media";
import {
  CalendarDays, Target, Users, Trophy, CreditCard, Shield, Clock, MapPin, ChevronRight, Zap, TrendingUp
} from "lucide-react";

const cardVariants = {
  hidden: { opacity: 0, y: 20, scale: 0.96 },
  visible: (i) => ({
    opacity: 1, y: 0, scale: 1,
    transition: { duration: 0.45, delay: i * 0.06, ease: [0.22, 1, 0.36, 1] },
  }),
};

export default function Dashboard() {
  const { isDarkMode } = useTheme();
  const storedUser = useMemo(() => {
    try {
      return JSON.parse(localStorage.getItem("user") || "null");
    } catch {
      return null;
    }
  }, []);

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [schedules, setSchedules] = useState([]);
  const [clubsMap, setClubsMap] = useState({});
  const [myClubsCount, setMyClubsCount] = useState(0);
  const [myTournamentsCount, setMyTournamentsCount] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const statsNetworkRef = useRef(null);
  const centerRef = useRef(null);
  const matchesRef = useRef(null);
  const goalsRef = useRef(null);
  const assistsRef = useRef(null);
  const winRateRef = useRef(null);
  const winsRef = useRef(null);
  const drawsRef = useRef(null);
  const lossesRef = useRef(null);
  const cardsRef = useRef(null);
  const tournamentsRef = useRef(null);

  useEffect(() => {
    let isCurrent = true;

    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [profileData, statsData, schedulesData, myClubsData, myTournamentsData, allClubsData] = await Promise.all([
          getMyProfile().catch(() => null),
          getMyStats().catch(() => null),
          getMySchedules().catch(() => []),
          getMyClubs().catch(() => []),
          getMyTournaments().catch(() => []),
          getAllClubs().catch(() => []),
        ]);
        if (!isCurrent) return;
        setProfile(profileData);
        setStats(statsData);
        setSchedules(Array.isArray(schedulesData) ? schedulesData : []);
        setMyClubsCount(Array.isArray(myClubsData) ? myClubsData.length : 0);
        setMyTournamentsCount(Array.isArray(myTournamentsData) ? myTournamentsData.length : 0);
        const map = {};
        (Array.isArray(allClubsData) ? allClubsData : []).forEach((c) => {
          if (c?.clubId) {
            map[c.clubId] = {
              name: c.name || "Unknown",
              logo: c.logo || null,
            };
          }
        });
        setClubsMap(map);
      } catch (err) {
        if (isCurrent) setError(err?.message || "Failed to load dashboard");
        throw err;
      } finally {
        if (isCurrent) setLoading(false);
      }
    };

    load();
    return () => { isCurrent = false; };
  }, []);

  const now = new Date();
  const upcomingSchedules = useMemo(() => {
    return schedules
      .filter((s) => s?.date && new Date(s.date) >= now)
      .sort((a, b) => new Date(a.date) - new Date(b.date))
      .slice(0, 3);
  }, [schedules]);

  const formatScheduleDate = (dateStr) => {
    if (!dateStr) return "TBD";
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" });
  };
  const formatScheduleTime = (dateStr) => {
    if (!dateStr) return "";
    return new Date(dateStr).toLocaleTimeString("en-GB", { hour: "2-digit", minute: "2-digit" });
  };

  const appearanceCount = stats?.matchesPlayed ?? 0;
  const goalsCount = stats?.goals ?? stats?.goalsScored ?? 0;
  const assistsCount = stats?.assists ?? 0;
  const winsCount = stats?.wins ?? 0;
  const drawsCount = stats?.draws ?? 0;
  const lossesCount = stats?.losses ?? 0;
  const winRate = stats?.winRate ?? 0;
  const yellowCards = stats?.yellowCards ?? 0;
  const redCards = stats?.redCards ?? 0;
  const clubsCount = myClubsCount;
  const tournamentsCount = myTournamentsCount;
  const contributionCount = goalsCount + assistsCount;

  // Use explicit theme-driven text colors instead of relying only on Tailwind `dark:*`.
  // This prevents "stuck white text" issues when theme class application/order differs per page.
  const textHeading = isDarkMode ? "text-white" : "text-black";
  const textPrimary = isDarkMode ? "text-slate-100" : "text-black";
  const textMuted = isDarkMode ? "text-slate-300" : "text-black";
  const textMuted200 = isDarkMode ? "text-slate-200" : "text-black";
  const textSkyMuted300 = isDarkMode ? "text-sky-300" : "text-black";
  const textSky200 = isDarkMode ? "text-sky-200" : "text-black";
  const kickoffWindowText = isDarkMode ? "text-sky-300" : "text-sky-700";
  const chevronRightText = isDarkMode ? "text-slate-500 group-hover:text-slate-300" : "text-slate-300 group-hover:text-slate-500";

  const metricNodes = [
    {
      key: "matches",
      label: "Matches",
      value: appearanceCount,
      Icon: CalendarDays,
      ref: matchesRef,
      className: "left-[8%] top-[8%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-sky-600",
    },
    {
      key: "goals",
      label: "Goals",
      value: goalsCount,
      Icon: Target,
      ref: goalsRef,
      className: "left-[38%] top-[2%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-sky-600",
    },
    {
      key: "assists",
      label: "Assists",
      value: assistsCount,
      Icon: Users,
      ref: assistsRef,
      className: "right-[8%] top-[8%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-indigo-600",
    },
    {
      key: "wins",
      label: "Wins",
      value: winsCount,
      Icon: Trophy,
      ref: winsRef,
      className: "left-[5%] top-[42%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-amber-600",
    },
    {
      key: "draws",
      label: "Draws",
      value: drawsCount,
      Icon: Shield,
      ref: drawsRef,
      className: "left-[25%] bottom-[7%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-cyan-600",
    },
    {
      key: "losses",
      label: "Losses",
      value: lossesCount,
      Icon: Zap,
      ref: lossesRef,
      className: "left-[50%] bottom-[2%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-rose-600",
    },
    {
      key: "cards",
      label: "Cards",
      value: `${yellowCards}/${redCards}`,
      Icon: CreditCard,
      ref: cardsRef,
      className: "right-[24%] bottom-[7%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-orange-600",
    },
    {
      key: "tournaments",
      label: "Tournaments",
      value: tournamentsCount,
      Icon: TrendingUp,
      ref: tournamentsRef,
      className: "right-[5%] top-[42%] h-24 w-24 md:h-28 md:w-28",
      iconClass: "text-violet-600",
    },
  ];

  const handleViewAllSchedules = () => navigate("/schedules");
  const openDashboardScheduleDetails = (schedule) => {
    navigate(`/schedule/${schedule.scheduleId}`, { state: { schedule } });
  };
  const scrollRevealViewport = { once: true, amount: 0.2 };

  return (
    <main className="relative flex-1 overflow-auto bg-[#eef1f6] p-6 md:p-8">
          <DynamicBackground
            className="z-0"
            patternType="grid"
            patternSize={50}
            patternColor="rgba(15,23,42,0.035)"
            gradient="linear-gradient(135deg, rgba(255,255,255,0.98) 0%, rgba(241,245,249,0.92) 55%, rgba(224,242,254,0.9) 100%)"
            showAccents
          />

          <div className="relative z-10">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </motion.div>
          )}
          {loading && (
            <div className="mb-4 flex items-center gap-3 text-black">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-sky-500" />
              Loading your stats...
            </div>
          )}

          {/* Welcome Header */}
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollRevealViewport}
            transition={{ duration: 0.5 }}
            className="mb-8"
          >
            <h2 className={`text-2xl md:text-3xl font-bold ${textHeading} mb-1 font-['Outfit']`}>
              Welcome back, <span className="gradient-text">{profile?.firstName ?? storedUser?.firstName ?? "Player"}</span>! 
            </h2>
            <p className={`text-sm md:text-base ${textMuted}`}>
              Here's what's happening with your football journey
            </p>
          </motion.div>

          {/* Animated Stats Network */}
          <motion.section
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollRevealViewport}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className={`text-xl font-bold ${textPrimary} font-['Outfit']`}>Live Performance Network</h3>
              <span
                className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                  isDarkMode
                    ? "border-sky-700/60 bg-sky-900/30 text-sky-300"
                    : "border-sky-300 bg-sky-100 text-sky-800"
                }`}
              >
                Real-time season metrics
              </span>
            </div>

            <div className={`rounded-3xl border p-3 md:p-5 shadow-sm ${
              isDarkMode
                ? "border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900/90 to-sky-950/30"
                : "border-slate-200 bg-white"
            }`}>
              <div ref={statsNetworkRef} className="relative mx-auto h-[520px] w-full max-w-5xl overflow-hidden rounded-2xl">
                {metricNodes.map((node, idx) => (
                  <AnimatedBeam
                    key={`beam-${node.key}`}
                    containerRef={statsNetworkRef}
                    fromRef={centerRef}
                    toRef={node.ref}
                    curvature={28 + (idx % 3) * 14}
                    delay={idx * 0.1}
                    reverse={idx % 2 === 0}
                    pathColor={isDarkMode ? "#64748b" : "#94a3b8"}
                    pathOpacity={isDarkMode ? 0.35 : 0.22}
                    gradientStartColor="#0ea5e9"
                    gradientStopColor="#0ea5e9"
                    dotted={idx % 4 === 0}
                  />
                ))}

                <div className="absolute inset-0">
                  <Circle
                    ref={centerRef}
                    className={`absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 ${
                      isDarkMode
                        ? "!border-sky-500/55 !bg-gradient-to-br !from-[#0b1b34] !via-[#102a4a] !to-[#0a2338] !ring-1 !ring-cyan-300/25 !shadow-2xl !shadow-cyan-900/35"
                        : "border-sky-200 bg-white"
                    }`}
                  >
                    <div className="text-center px-3">
                      <p className={`text-[11px] font-semibold uppercase tracking-wide ${isDarkMode ? "text-sky-200" : textMuted}`}>Contribution</p>
                      <p className={`text-3xl font-bold ${isDarkMode ? "text-white" : textPrimary}`}>{contributionCount}</p>
                      <p className={`text-xs ${isDarkMode ? "text-slate-200" : textMuted}`}>Goals + Assists</p>
                      <p className={`mt-1 text-xs font-semibold ${isDarkMode ? "text-cyan-300" : textSkyMuted300}`}>Win Rate {winRate}%</p>
                    </div>
                  </Circle>

                  {metricNodes.map((node, idx) => {
                    const NodeIcon = node.Icon;
                    return (
                      <motion.div
                        key={node.key}
                        className={`absolute ${node.className}`}
                        initial={{ opacity: 1, scale: 1 }}
                        whileInView={{ opacity: 1, scale: 1 }}
                        viewport={{ once: true, amount: 0.55 }}
                        transition={{ delay: 0.12 + idx * 0.06, duration: 0.35 }}
                      >
                        <Circle
                          ref={node.ref}
                          className={`h-full w-full ${
                            isDarkMode
                              ? "!border-slate-700/60 !bg-slate-900/95"
                              : "border-slate-200 bg-white"
                          }`}
                        >
                          <div className="text-center">
                            <NodeIcon size={16} className={`mx-auto mb-1 ${node.iconClass}`} />
                            <p className={`text-[10px] font-semibold uppercase tracking-wide ${textMuted}`}>{node.label}</p>
                            <p className={`text-lg md:text-xl font-bold ${textPrimary} leading-none mt-1`}>{node.value}</p>
                          </div>
                        </Circle>
                      </motion.div>
                    );
                  })}

                  <div className={`absolute right-3 top-3 rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-medium ${textMuted} dark:border-slate-700 dark:bg-slate-900/85`}>
                    Clubs: <span className={`font-semibold ${textPrimary}`}>{clubsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Upcoming Matches Section */}
          <motion.div
            initial={{ opacity: 1, y: 0 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={scrollRevealViewport}
            transition={{ duration: 0.45 }}
            className="mb-8"
          >
            <div className="flex items-center justify-between mb-5">
              <h3 className={`text-xl font-bold ${textPrimary} font-['Outfit'] flex items-center gap-2`}>
                <Zap size={20} className="text-sky-500" />
                Upcoming Matches
              </h3>
              <button
                type="button"
                onClick={handleViewAllSchedules}
                className="text-sm text-sky-600 hover:text-sky-700 font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className={`relative overflow-hidden rounded-3xl border p-3 md:p-5 ${
              isDarkMode
                ? "border-slate-700/70 bg-gradient-to-br from-slate-900 via-slate-900/85 to-sky-950/30"
                : "border-slate-200 bg-white"
            }`}>
              <div className={`relative mb-4 flex items-center justify-between rounded-2xl border px-4 py-3 backdrop-blur ${
                isDarkMode ? "border-slate-700 bg-slate-900/80" : "border-slate-200 bg-white"
              }`}>
                <div>
                  <p className="text-[11px] font-semibold tracking-[0.1em] text-sky-600">Match Spotlight</p>
                  <p className={`text-sm ${textMuted}`}>
                    {upcomingSchedules.length > 0
                      ? `${upcomingSchedules.length} fixture${upcomingSchedules.length > 1 ? "s" : ""} scheduled soon`
                      : "No upcoming fixtures yet"}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`rounded-full border px-3 py-1 text-xs font-semibold ${
                      isDarkMode
                        ? "border-sky-700/60 bg-sky-900/30 text-sky-300"
                        : "border-sky-200 bg-sky-50 text-sky-700"
                    }`}
                  >
                    Upcoming
                  </span>
                  <span className={`rounded-full border border-slate-200 bg-white px-3 py-1 text-xs font-semibold ${textMuted} dark:border-slate-700 dark:bg-slate-800`}>Top 3</span>
                </div>
              </div>

              <div className="relative grid grid-cols-1 gap-5 md:grid-cols-2 lg:grid-cols-3">
              {upcomingSchedules.length === 0 && !loading && (
                <motion.div
                  initial={{ opacity: 0 }}
                  whileInView={{ opacity: 1 }}
                  viewport={{ once: true, amount: 0.35 }}
                  className="col-span-full rounded-2xl border border-slate-200 bg-white px-6 py-12 text-center dark:border-slate-700 dark:bg-slate-900/70"
                >
                  <div className="mb-3 text-4xl">🏟️</div>
                    <p className={`font-medium ${textMuted200}`}>No upcoming matches</p>
                  <Link to="/schedules" className="mt-1 inline-block text-sm font-semibold text-sky-600 hover:text-sky-700">
                    View schedules →
                  </Link>
                </motion.div>
              )}
              {upcomingSchedules.map((schedule, idx) => {
                const teamOneData = clubsMap[schedule.teamOneId] || { name: `Team ${schedule.teamOneId}`, logo: null };
                const teamTwoData = clubsMap[schedule.teamTwoId] || { name: `Team ${schedule.teamTwoId}`, logo: null };
                const teamOne = teamOneData.name;
                const teamTwo = teamTwoData.name;
                const teamOneLogo = toMediaUrl(teamOneData.logo);
                const teamTwoLogo = toMediaUrl(teamTwoData.logo);
                const matchDate = schedule?.date ? new Date(schedule.date) : null;
                const matchDay = matchDate
                  ? matchDate.toLocaleDateString("en-GB", { day: "2-digit" })
                  : "--";
                const matchMonth = matchDate
                  ? matchDate.toLocaleDateString("en-GB", { month: "short" })
                  : "TBD";
                return (
                  <motion.div
                    key={schedule.id}
                    custom={idx}
                    variants={cardVariants}
                    initial="visible"
                    whileInView="visible"
                    viewport={{ once: true, amount: 0.3 }}
                    whileHover={{ y: -6, scale: 1.012, transition: { duration: 0.22 } }}
                    className={`group relative flex min-h-[300px] flex-col overflow-hidden rounded-2xl border p-5 shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_16px_42px_rgba(15,23,42,0.14)] ${
                      isDarkMode
                        ? "border-slate-700 bg-slate-900/85 hover:border-sky-700/70"
                        : "border-slate-200 bg-white hover:border-sky-200"
                    }`}
                  >
                    <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.2),transparent_52%)]" />
                    <div className="pointer-events-none absolute inset-y-0 left-0 w-1 bg-gradient-to-b from-sky-300 via-cyan-400 to-cyan-400 opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
                    <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />

                    <div className="mb-5 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className={`grid h-14 w-14 place-content-center rounded-xl border text-center ${
                          isDarkMode ? "border-slate-700 bg-slate-800" : "border-slate-200 bg-slate-50"
                        }`}>
                          <p className={`text-lg font-bold leading-none ${textPrimary}`}>{matchDay}</p>
                          <p className={`text-[10px] font-semibold tracking-wide ${textMuted}`}>{matchMonth}</p>
                        </div>
                        <div>
                          <div className={`flex items-center gap-1.5 text-xs font-medium ${textMuted}`}>
                            <CalendarDays size={13} />
                            <span>{formatScheduleDate(schedule.date)}</span>
                          </div>
                          <p className={`mt-0.5 text-xs font-['Outfit'] font-semibold tracking-[0.04em] ${kickoffWindowText}`}>Kickoff window</p>
                        </div>
                      </div>
                      <span
                        className={`rounded-full border px-2.5 py-1 text-xs font-semibold ${
                          isDarkMode
                            ? "border-sky-700/60 bg-sky-900/30 text-sky-300"
                            : "border-sky-200 bg-sky-50 text-sky-700"
                        }`}
                      >
                        Upcoming
                      </span>
                    </div>

                    <div className={`mb-5 flex items-center justify-between rounded-xl border px-3 py-3 ${
                      isDarkMode ? "border-slate-700 bg-slate-800/80" : "border-slate-100 bg-slate-50/75"
                    }`}>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`h-12 w-12 overflow-hidden rounded-xl border flex items-center justify-center font-bold text-lg ${
                          isDarkMode
                            ? "border-slate-700 bg-slate-900 text-slate-100"
                            : "border-slate-200 bg-slate-100 text-black"
                        }`}>
                          {teamOneLogo ? (
                            <img src={teamOneLogo} alt={teamOne} className="w-full h-full object-cover" />
                          ) : (
                            teamOne.charAt(0)
                          )}
                        </div>
                        <span className={`w-full truncate text-center text-sm font-semibold ${textPrimary}`}>{teamOne}</span>
                      </div>
                      <div className="px-2">
                        <span className={`inline-flex h-8 items-center rounded-full border px-3 text-[11px] font-extrabold tracking-[0.1em] ${
                          isDarkMode
                            ? "border-slate-700 bg-slate-900 text-slate-300"
                            : "border-slate-200 bg-white text-black"
                        }`}>vs</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className={`h-12 w-12 overflow-hidden rounded-xl border flex items-center justify-center font-bold text-lg ${
                          isDarkMode
                            ? "border-sky-600/60 bg-sky-900/40 text-sky-300"
                            : "border-sky-400/40 bg-sky-50 text-sky-700"
                        }`}>
                          {teamTwoLogo ? (
                            <img src={teamTwoLogo} alt={teamTwo} className="w-full h-full object-cover" />
                          ) : (
                            teamTwo.charAt(0)
                          )}
                        </div>
                        <span className={`w-full truncate text-center text-sm font-semibold ${textPrimary}`}>{teamTwo}</span>
                      </div>
                    </div>

                    <div className="mb-4 grid grid-cols-2 gap-2 text-sm">
                      <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
                        isDarkMode
                          ? "border-slate-700 bg-slate-800 text-slate-300"
                          : "border-slate-200 bg-slate-50 text-black"
                      }`}>
                        <Clock size={14} />
                        <span>{formatScheduleTime(schedule.date)}</span>
                      </div>
                      <div className={`flex items-center gap-1.5 rounded-lg border px-3 py-2 ${
                        isDarkMode
                          ? "border-slate-700 bg-slate-800 text-slate-300"
                          : "border-slate-200 bg-slate-50 text-black"
                      }`}>
                        <MapPin size={14} />
                        <span className="truncate">{schedule.location || "TBD"}</span>
                      </div>
                    </div>

                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => openDashboardScheduleDetails(schedule)}
                      className={`mt-auto w-full rounded-xl border py-2.5 text-sm font-semibold transition-colors ${
                        isDarkMode
                          ? "border-sky-700/60 bg-gradient-to-r from-sky-900/45 to-cyan-900/35 text-sky-300 hover:from-sky-900/65 hover:to-cyan-900/55"
                          : "border-sky-300 bg-gradient-to-r from-sky-50 to-cyan-50 text-sky-800 hover:from-sky-100 hover:to-cyan-100"
                      }`}
                    >
                      View Details
                    </motion.button>
                  </motion.div>
                );
              })}
              </div>
            </div>
          </motion.div>

          {/* Bottom Section - performance and actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className={`p-6 rounded-2xl shadow-sm border ${
                isDarkMode ? "bg-slate-900/80 border-slate-700" : "bg-white border-slate-100/80"
              }`}
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className={`text-xl font-bold ${textPrimary} font-['Outfit'] flex items-center gap-2`}>
                  <TrendingUp size={20} className="text-sky-500" />
                  Performance Snapshot
                </h3>
                <span
                  className={`text-xs font-semibold px-3 py-1.5 rounded-full border ${
                    isDarkMode
                      ? "bg-sky-900/30 border-sky-700/60 text-sky-300"
                      : "bg-sky-50 border-sky-100 text-black"
                  }`}
                >
                  Season Form
                </span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className={`font-medium ${textMuted}`}>Win Rate</span>
                    <span className={`font-bold ${textPrimary}`}>{winRate}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 dark:bg-slate-800 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${Math.max(0, Math.min(100, Number(winRate) || 0))}%` }}
                      viewport={{ once: true, amount: 0.85 }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-sky-400 to-cyan-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className={`rounded-2xl border p-4 ${
                    isDarkMode
                      ? "border-sky-800/60 bg-gradient-to-br from-sky-950/45 to-slate-900"
                      : "border-slate-200 bg-gradient-to-br from-sky-100 to-white"
                  }`}>
                    <div className={`text-xs uppercase tracking-wide ${textMuted} font-semibold`}>Goal Contributions</div>
                    <div className={`mt-1 text-2xl font-bold ${textPrimary}`}>{goalsCount + assistsCount}</div>
                    <div className={`text-xs ${textMuted} mt-1`}>{goalsCount} goals + {assistsCount} assists</div>
                  </div>
                  <div className={`rounded-2xl border p-4 ${
                    isDarkMode
                      ? "border-amber-800/60 bg-gradient-to-br from-amber-950/35 to-slate-900"
                      : "border-slate-200 bg-gradient-to-br from-amber-100 to-white"
                  }`}>
                    <div className={`text-xs uppercase tracking-wide ${textMuted} font-semibold`}>Discipline</div>
                    <div className={`mt-1 text-2xl font-bold ${textPrimary}`}>{yellowCards + redCards}</div>
                    <div className={`text-xs ${textMuted} mt-1`}>{yellowCards} yellow, {redCards} red</div>
                  </div>
                </div>

                <div className={`rounded-2xl border p-4 ${
                  isDarkMode
                    ? "border-sky-700/60 bg-gradient-to-br from-sky-900/30 to-slate-900"
                    : "border-sky-200 bg-gradient-to-br from-sky-100 to-sky-50"
                }`}>
                  <div className={`text-xs uppercase tracking-wide ${textSkyMuted300} font-semibold`}>Next Steps</div>
                  <p className={`text-sm ${textSky200} mt-1`}>
                    {upcomingSchedules.length > 0
                      ? `You have ${upcomingSchedules.length} upcoming match${upcomingSchedules.length > 1 ? "es" : ""}. Stay sharp and check venue/time details.`
                      : "No upcoming matches. Create or accept a schedule to keep your momentum going."}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true, amount: 0.25 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className={`p-6 rounded-2xl shadow-sm border ${
                isDarkMode ? "bg-slate-900/80 border-slate-700" : "bg-white border-slate-100/80"
              }`}
            >
              <h3 className={`text-xl font-bold ${textPrimary} mb-6 font-['Outfit']`}>Action Center</h3>
              <div className="space-y-3">
                {[
                  { to: "/profile", title: "Profile Insights", desc: "Review stats, clubs, and achievements", badge: "Open" },
                  { to: "/schedules", title: "Schedule Board", desc: "Track fixtures and match outcomes", badge: `${upcomingSchedules.length} upcoming` },
                  { to: "/clubs", title: "Club Hub", desc: "Manage your clubs and lineups", badge: `${clubsCount} clubs` },
                  { to: "/tournaments", title: "Tournament Zone", desc: "Join, manage, and compete", badge: `${tournamentsCount} active` },
                ].map((action) => (
                  <motion.div key={action.to} whileHover={{ y: -3, scale: 1.01 }} transition={{ duration: 0.2 }}>
                    <Link
                      to={action.to}
                      className={`group relative flex items-center justify-between overflow-hidden rounded-2xl border p-4 shadow-sm transition-all hover:shadow-md ${
                        isDarkMode
                          ? "border-slate-700 bg-slate-900/70 hover:border-slate-500"
                          : "border-slate-200 bg-white hover:border-sky-200"
                      }`}
                    >
                      <div className="pointer-events-none absolute inset-0 opacity-0 transition-opacity duration-300 group-hover:opacity-100 bg-[radial-gradient(circle_at_top_left,rgba(14,165,233,0.18),transparent_52%)]" />
                      <div className="absolute left-0 right-0 top-0 h-px bg-gradient-to-r from-transparent via-sky-300 to-transparent" />

                      <div>
                        <p className={`font-semibold ${textPrimary}`}>{action.title}</p>
                        <p className={`text-xs ${textMuted} mt-0.5`}>{action.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="rounded-full border border-sky-200 bg-sky-50 px-2.5 py-1 text-xs font-semibold text-sky-700">{action.badge}</span>
                        <ChevronRight size={16} className={`${chevronRightText} transition-colors`} />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
          </div>
    </main>
  );
}
