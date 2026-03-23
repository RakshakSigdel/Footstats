import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
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

const statCards = [
  { key: "matches", label: "Matches", subtitle: "Played", icon: CalendarDays, gradient: "from-blue-500 to-indigo-600", iconBg: "bg-blue-500/10", iconColor: "text-blue-500" },
  { key: "goals", label: "Goals", subtitle: "Scored", icon: Target, gradient: "from-emerald-500 to-teal-600", iconBg: "bg-emerald-500/10", iconColor: "text-emerald-500" },
  { key: "assists", label: "Assists", subtitle: "Provided", icon: Users, gradient: "from-purple-500 to-violet-600", iconBg: "bg-purple-500/10", iconColor: "text-purple-500" },
  { key: "winRate", label: "Win Rate", subtitle: "", icon: Trophy, gradient: "from-amber-500 to-orange-600", iconBg: "bg-amber-500/10", iconColor: "text-amber-500" },
  { key: "cards", label: "Cards", subtitle: "Yellow / Red", icon: CreditCard, gradient: "from-red-500 to-rose-600", iconBg: "bg-red-500/10", iconColor: "text-red-500" },
  { key: "clubs", label: "Clubs", subtitle: "Active", icon: Shield, gradient: "from-cyan-500 to-blue-600", iconBg: "bg-cyan-500/10", iconColor: "text-cyan-500" },
];

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
  const goalsCount = stats?.goalsScored ?? 0;
  const assistsCount = stats?.assists ?? 0;
  const winsCount = stats?.wins ?? 0;
  const drawsCount = stats?.draws ?? 0;
  const lossesCount = stats?.losses ?? 0;
  const winRate = stats?.winRate ?? 0;
  const yellowCards = stats?.yellowCards ?? 0;
  const redCards = stats?.redCards ?? 0;
  const clubsCount = myClubsCount;
  const tournamentsCount = myTournamentsCount;

  const statValues = {
    matches: appearanceCount,
    goals: goalsCount,
    assists: assistsCount,
    winRate: `${winRate}%`,
    cards: null,
    clubs: clubsCount,
  };

  const handleViewAllSchedules = () => navigate("/schedules");
  const openDashboardScheduleDetails = (schedule) => {
    navigate(`/schedule/${schedule.scheduleId}`, { state: { schedule } });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
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

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {statCards.map((card, idx) => {
              const Icon = card.icon;
              return (
                <motion.div
                  key={card.key}
                  custom={idx}
                  variants={cardVariants}
                  initial="hidden"
                  animate="visible"
                  whileHover={{ y: -6, scale: 1.03, transition: { duration: 0.2 } }}
                  className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80 cursor-pointer group relative overflow-hidden"
                >
                  {/* Subtle gradient accent at top */}
                  <div className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.gradient} opacity-0 group-hover:opacity-100 transition-opacity duration-300`} />
                  
                  <div className="flex justify-between items-start mb-3">
                    <div className={`w-10 h-10 ${card.iconBg} rounded-xl flex items-center justify-center`}>
                      <Icon size={20} className={card.iconColor} />
                    </div>
                  </div>
                  <p className="text-sm text-slate-500 mb-1">{card.label}</p>
                  {card.key === "cards" ? (
                    <>
                      <div className="flex gap-1.5 items-baseline">
                        <span className="text-2xl font-bold text-amber-500">{yellowCards}</span>
                        <span className="text-slate-300">/</span>
                        <span className="text-2xl font-bold text-red-500">{redCards}</span>
                      </div>
                      <p className="text-xs text-slate-400">{card.subtitle}</p>
                    </>
                  ) : card.key === "winRate" ? (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{winRate}%</h3>
                      <p className="text-xs text-slate-400">{winsCount}W {drawsCount}D {lossesCount}L</p>
                    </>
                  ) : card.key === "clubs" && clubsCount === 0 ? (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">0</h3>
                      <Link to="/clubs" className="text-xs text-emerald-600 hover:text-emerald-700 font-semibold">
                        Join Now
                      </Link>
                    </>
                  ) : (
                    <>
                      <h3 className="text-2xl font-bold text-slate-900 mb-1">{statValues[card.key]}</h3>
                      <p className="text-xs text-slate-400">{card.subtitle}</p>
                    </>
                  )}
                </motion.div>
              );
            })}
          </div>

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
