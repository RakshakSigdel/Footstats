import { useEffect, useState, useMemo } from "react";
import { Link, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import { getMyProfile, getMyStats } from "../../services/api.player";
import { getMySchedules } from "../../services/api.schedules";
import { getMyClubs } from "../../services/api.clubs";
import { getMyTournaments } from "../../services/api.tournaments";
import { getAllClubs } from "../../services/api.clubs";

export default function Dashboard() {
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
          if (c?.clubId) map[c.clubId] = c.name || "Unknown";
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

  const handleViewAllSchedules = () => navigate("/schedules");
  const openDashboardScheduleDetails = (schedule) => {
    navigate(`/schedule/${schedule.scheduleId}`, { state: { schedule } });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />
        <div className="border-t border-gray-200"></div>

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          {error && (
            <div className="mb-4 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">
              {error}
            </div>
          )}
          {loading && (
            <div className="mb-4 text-gray-500">Loading...</div>
          )}
          {/* Welcome Header */}
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-1">
              Welcome back, {profile?.firstName ?? "Player"}!
            </h2>
            <p className="text-sm md:text-base text-gray-500">
              Here's what's happening with your football journey
            </p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
            {/* Appearance Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#3b82f6" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Matches</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{appearanceCount}</h3>
              <p className="text-xs text-gray-500">Played</p>
            </div>

            {/* Goals Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-green-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#22c55e" strokeWidth="2">
                    <circle cx="12" cy="12" r="10" />
                    <circle cx="12" cy="12" r="6" />
                    <circle cx="12" cy="12" r="2" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Goals</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{goalsCount}</h3>
              <p className="text-xs text-gray-500">Scored</p>
            </div>

            {/* Assists Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-purple-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#a855f7" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Assists</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{assistsCount}</h3>
              <p className="text-xs text-gray-500">Provided</p>
            </div>

            {/* Win Rate Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-amber-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" strokeWidth="2">
                    <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                    <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                    <path d="M4 22h16" />
                    <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                    <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                    <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Win Rate</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{winRate}%</h3>
              <p className="text-xs text-gray-500">{winsCount}W {drawsCount}D {lossesCount}L</p>
            </div>

            {/* Cards Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-red-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#ef4444" strokeWidth="2">
                    <rect x="3" y="2" width="18" height="20" rx="2" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Cards</p>
              <div className="flex gap-2 items-baseline">
                <span className="text-2xl font-bold text-yellow-500">{yellowCards}</span>
                <span className="text-gray-400">/</span>
                <span className="text-2xl font-bold text-red-500">{redCards}</span>
              </div>
              <p className="text-xs text-gray-500">Yellow / Red</p>
            </div>

            {/* Clubs Card */}
            <div className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all cursor-pointer">
              <div className="flex justify-between items-start mb-3">
                <div className="w-10 h-10 bg-cyan-100 rounded-lg flex items-center justify-center">
                  <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#06b6d4" strokeWidth="2">
                    <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                    <circle cx="9" cy="7" r="4" />
                    <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                    <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                  </svg>
                </div>
              </div>
              <p className="text-sm text-gray-600 mb-1">Clubs</p>
              <h3 className="text-2xl font-bold text-gray-900 mb-1">{clubsCount}</h3>
              {clubsCount === 0 ? (
                <Link to="/clubs" className="text-xs text-blue-600 hover:text-blue-700 font-medium">
                  Join Now
                </Link>
              ) : (
                <p className="text-xs text-gray-500">Active</p>
              )}
            </div>
          </div>

          {/* Upcoming Matches Section */}
          <div className="mb-8">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-gray-900">Upcoming Matches</h3>
              <button
                type="button"
                onClick={handleViewAllSchedules}
                className="text-sm text-blue-600 hover:text-blue-700 font-medium"
              >
                View All
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {upcomingSchedules.length === 0 && !loading && (
                <div className="col-span-full text-center py-8 text-gray-500">
                  No upcoming matches. <Link to="/schedules" className="text-blue-600 hover:underline">View schedules</Link>
                </div>
              )}
              {upcomingSchedules.map((schedule) => {
                const teamOne = clubsMap[schedule.teamOneId] || `Team ${schedule.teamOneId}`;
                const teamTwo = clubsMap[schedule.teamTwoId] || `Team ${schedule.teamTwoId}`;
                const typeColor = schedule.scheduleType === "Knockout" ? "bg-red-100 text-red-700" : schedule.scheduleType === "League" ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700";
                return (
                  <div key={schedule.id} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 hover:shadow-lg hover:scale-105 transition-all">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2 text-sm text-gray-500">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                          <line x1="16" y1="2" x2="16" y2="6" />
                          <line x1="8" y1="2" x2="8" y2="6" />
                          <line x1="3" y1="10" x2="21" y2="10" />
                        </svg>
                        <span>{formatScheduleDate(schedule.date)}</span>
                      </div>
                      <span className="text-xs text-green-600 bg-green-50 px-2 py-1 rounded-full font-semibold">
                        UPCOMING
                      </span>
                    </div>
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center text-gray-700 font-bold text-lg">
                          {teamOne.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 text-center truncate w-full">{teamOne}</span>
                      </div>
                      <div className="px-4">
                        <span className="text-gray-400 font-bold text-sm">VS</span>
                      </div>
                      <div className="flex flex-col items-center gap-2 flex-1">
                        <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center text-green-700 font-bold text-lg">
                          {teamTwo.charAt(0)}
                        </div>
                        <span className="text-sm font-semibold text-gray-900 text-center truncate w-full">{teamTwo}</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between text-sm text-gray-500 mb-4 pb-4 border-t pt-4">
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{formatScheduleTime(schedule.date)}</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>{schedule.location || "TBD"}</span>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => openDashboardScheduleDetails(schedule)}
                      className="w-full border border-gray-300 rounded-lg py-2 text-sm font-medium text-gray-700 hover:bg-green-600 hover:text-white hover:border-green-600 transition-all"
                    >
                      View Details
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Bottom Section - Profile summary (backend does not provide top scorers / full stats) */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Your Profile</h3>
              <div className="space-y-4">
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Position</span>
                  <span className="text-lg font-bold text-gray-900">{profile?.position ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between py-3 border-b border-gray-100">
                  <span className="text-gray-600">Location</span>
                  <span className="text-lg font-bold text-gray-900">{profile?.location ?? "—"}</span>
                </div>
                <div className="flex items-center justify-between py-3">
                  <span className="text-gray-600">Gender</span>
                  <span className="text-lg font-bold text-gray-900">{profile?.gender ?? "—"}</span>
                </div>
              </div>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-sm border border-gray-100">
              <h3 className="text-xl font-bold text-gray-900 mb-6">Quick Links</h3>
              <div className="space-y-3">
                <Link to="/Profile" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-900">
                  View full profile →
                </Link>
                <Link to="/clubs" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-900">
                  My clubs ({clubsCount}) →
                </Link>
                <Link to="/tournaments" className="block p-3 rounded-lg hover:bg-gray-50 transition-colors font-medium text-gray-900">
                  My tournaments ({tournamentsCount}) →
                </Link>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
