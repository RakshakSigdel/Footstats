import { useEffect, useState, useMemo, useRef } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import { AnimatedBeam, Circle } from "./Components/animated-beam";
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
      iconClass: "text-emerald-600",
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

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="relative flex-1 overflow-auto bg-[#eef1f6] p-6 md:p-8">
          {error && (
            <motion.div initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }} className="mb-4 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </motion.div>
          )}
          {loading && (
            <div className="mb-4 flex items-center gap-3 text-slate-500">
              <motion.div animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: "linear" }} className="w-5 h-5 rounded-full border-2 border-slate-200 border-t-emerald-500" />
              Loading your stats...
            </div>
          )}

          {/* Welcome Header */}
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }} className="mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-slate-900 mb-1 font-['Outfit']">
              Welcome back, <span className="gradient-text">{profile?.firstName ?? storedUser?.firstName ?? "Player"}</span>! ⚽
            </h2>
            <p className="text-sm md:text-base text-slate-500">
              Here's what's happening with your football journey
            </p>
          </motion.div>

          {/* Animated Stats Network */}
          <motion.section
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.45, delay: 0.1 }}
            className="mb-8"
          >
            <div className="mb-4 flex items-center justify-between gap-2">
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit']">Live Performance Network</h3>
              <span className="rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                Real-time season metrics
              </span>
            </div>

            <div className="rounded-3xl border border-slate-200 bg-gradient-to-br from-white via-slate-50 to-emerald-50/40 p-3 md:p-5 shadow-sm">
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
                    pathColor="#94a3b8"
                    pathOpacity={0.22}
                    gradientStartColor="#10b981"
                    gradientStopColor="#0ea5e9"
                    dotted={idx % 4 === 0}
                  />
                ))}

                <div className="absolute inset-0">
                  <Circle
                    ref={centerRef}
                    className="absolute left-1/2 top-1/2 h-40 w-40 -translate-x-1/2 -translate-y-1/2 border-emerald-200 bg-gradient-to-br from-white to-emerald-50"
                  >
                    <div className="text-center px-3">
                      <p className="text-[11px] font-semibold uppercase tracking-wide text-slate-500">Contribution</p>
                      <p className="text-3xl font-bold text-slate-900">{contributionCount}</p>
                      <p className="text-xs text-slate-500">Goals + Assists</p>
                      <p className="mt-1 text-xs font-semibold text-emerald-700">Win Rate {winRate}%</p>
                    </div>
                  </Circle>

                  {metricNodes.map((node, idx) => {
                    const NodeIcon = node.Icon;
                    return (
                      <motion.div
                        key={node.key}
                        className={`absolute ${node.className}`}
                        initial={{ opacity: 0, scale: 0.7 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.12 + idx * 0.06, duration: 0.35 }}
                      >
                        <Circle ref={node.ref} className="h-full w-full border-slate-200 bg-white/95">
                          <div className="text-center">
                            <NodeIcon size={16} className={`mx-auto mb-1 ${node.iconClass}`} />
                            <p className="text-[10px] font-semibold uppercase tracking-wide text-slate-500">{node.label}</p>
                            <p className="text-lg md:text-xl font-bold text-slate-900 leading-none mt-1">{node.value}</p>
                          </div>
                        </Circle>
                      </motion.div>
                    );
                  })}

                  <div className="absolute right-3 top-3 rounded-full border border-slate-200 bg-white/80 px-3 py-1 text-xs font-medium text-slate-500">
                    Clubs: <span className="font-semibold text-slate-900">{clubsCount}</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.section>

          {/* Upcoming Matches Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-5">
              <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                <Zap size={20} className="text-emerald-500" />
                Upcoming Matches
              </h3>
              <button
                type="button"
                onClick={handleViewAllSchedules}
                className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold flex items-center gap-1 transition-colors"
              >
                View All <ChevronRight size={16} />
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {upcomingSchedules.length === 0 && !loading && (
                <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="col-span-full text-center py-12 bg-white rounded-2xl border border-slate-100">
                  <div className="text-4xl mb-3">🏟️</div>
                  <p className="text-slate-500 font-medium">No upcoming matches</p>
                  <Link to="/schedules" className="text-sm text-emerald-600 hover:text-emerald-700 font-semibold mt-1 inline-block">
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
                return (
                  <motion.div
                    key={schedule.id}
                    custom={idx}
                    variants={cardVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover={{ y: -4, scale: 1.01, transition: { duration: 0.2 } }}
                    className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80 group relative overflow-hidden"
                  >
                    <div className="absolute top-0 left-0 right-0 h-1 bg-gradient-to-r from-emerald-400 to-teal-500" />
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-slate-500">
                        <CalendarDays size={14} />
                        <span>{formatScheduleDate(schedule.date)}</span>
                      </div>
                      <span className="text-xs text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full font-semibold border border-emerald-100">
                        UPCOMING
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-700 font-bold text-lg overflow-hidden">
                          {teamOneLogo ? (
                            <img src={teamOneLogo} alt={teamOne} className="w-full h-full object-cover" />
                          ) : (
                            teamOne.charAt(0)
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 text-center truncate w-full">{teamOne}</span>
                      </div>
                      <div className="px-4">
                        <span className="text-slate-300 font-extrabold text-sm tracking-wider">VS</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-emerald-50 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-lg overflow-hidden">
                          {teamTwoLogo ? (
                            <img src={teamTwoLogo} alt={teamTwo} className="w-full h-full object-cover" />
                          ) : (
                            teamTwo.charAt(0)
                          )}
                        </div>
                        <span className="text-sm font-semibold text-slate-900 text-center truncate w-full">{teamTwo}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-slate-500 mb-4 pb-4 border-t border-slate-100 pt-4">
                      <div className="flex items-center gap-1.5">
                        <Clock size={14} />
                        <span>{formatScheduleTime(schedule.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <MapPin size={14} />
                        <span>{schedule.location || "TBD"}</span>
                      </div>
                    </div>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      type="button"
                      onClick={() => openDashboardScheduleDetails(schedule)}
                      className="w-full btn-primary py-2.5 rounded-xl text-sm font-semibold"
                    >
                      View Details
                    </motion.button>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* Bottom Section - performance and actions */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <motion.div
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.3, duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80"
            >
              <div className="flex items-center justify-between mb-6">
                <h3 className="text-xl font-bold text-slate-900 font-['Outfit'] flex items-center gap-2">
                  <TrendingUp size={20} className="text-emerald-500" />
                  Performance Snapshot
                </h3>
                <span className="text-xs font-semibold px-3 py-1.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-100">Season Form</span>
              </div>
              <div className="space-y-5">
                <div>
                  <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-slate-600 font-medium">Win Rate</span>
                    <span className="text-slate-900 font-bold">{winRate}%</span>
                  </div>
                  <div className="h-3 rounded-full bg-slate-100 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(0, Math.min(100, Number(winRate) || 0))}%` }}
                      transition={{ duration: 1, delay: 0.5, ease: "easeOut" }}
                      className="h-full rounded-full bg-gradient-to-r from-emerald-400 to-teal-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-emerald-50/50 to-white p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Goal Contributions</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{goalsCount + assistsCount}</div>
                    <div className="text-xs text-slate-500 mt-1">{goalsCount} goals + {assistsCount} assists</div>
                  </div>
                  <div className="rounded-2xl border border-slate-100 bg-gradient-to-br from-amber-50/50 to-white p-4">
                    <div className="text-xs uppercase tracking-wide text-slate-500 font-semibold">Discipline</div>
                    <div className="mt-1 text-2xl font-bold text-slate-900">{yellowCards + redCards}</div>
                    <div className="text-xs text-slate-500 mt-1">{yellowCards} yellow, {redCards} red</div>
                  </div>
                </div>

                <div className="rounded-2xl border border-emerald-100 bg-gradient-to-br from-emerald-50 to-emerald-50/30 p-4">
                  <div className="text-xs uppercase tracking-wide text-emerald-700 font-semibold">Next Steps</div>
                  <p className="text-sm text-emerald-900 mt-1">
                    {upcomingSchedules.length > 0
                      ? `You have ${upcomingSchedules.length} upcoming match${upcomingSchedules.length > 1 ? "es" : ""}. Stay sharp and check venue/time details.`
                      : "No upcoming matches. Create or accept a schedule to keep your momentum going."}
                  </p>
                </div>
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.4, duration: 0.5 }}
              className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100/80"
            >
              <h3 className="text-xl font-bold text-slate-900 mb-6 font-['Outfit']">Action Center</h3>
              <div className="space-y-3">
                {[
                  { to: "/profile", title: "Profile Insights", desc: "Review stats, clubs, and achievements", color: "emerald", badge: "Open" },
                  { to: "/schedules", title: "Schedule Board", desc: "Track fixtures and match outcomes", color: "blue", badge: `${upcomingSchedules.length} upcoming` },
                  { to: "/clubs", title: "Club Hub", desc: "Manage your clubs and lineups", color: "amber", badge: `${clubsCount} clubs` },
                  { to: "/tournaments", title: "Tournament Zone", desc: "Join, manage, and compete", color: "purple", badge: `${tournamentsCount} active` },
                ].map((action, idx) => (
                  <motion.div key={action.to} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                    <Link to={action.to} className={`flex items-center justify-between p-4 rounded-2xl border border-slate-100 hover:border-${action.color}-200 hover:bg-${action.color}-50/30 transition-all group`}>
                      <div>
                        <p className="font-semibold text-slate-900">{action.title}</p>
                        <p className="text-xs text-slate-500 mt-0.5">{action.desc}</p>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className={`text-${action.color}-700 text-sm font-semibold`}>{action.badge}</span>
                        <ChevronRight size={16} className="text-slate-300 group-hover:text-slate-500 transition-colors" />
                      </div>
                    </Link>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </div>
        </main>
      </div>
    </div>
  );
}
