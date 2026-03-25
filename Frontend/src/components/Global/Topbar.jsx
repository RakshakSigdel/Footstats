import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../../context/SidebarContext";
import { useTheme } from "../../context/ThemeContext";
import { Bell, Menu, Sun, Moon, CheckCheck } from "lucide-react";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markAllNotificationsAsRead,
  markNotificationAsRead,
} from "../../services/api.notifications";

export default function Topbar() {
  const navigate = useNavigate();
  const { isMobile, toggleSidebar } = useSidebar();
  const { isDarkMode, toggleDarkMode } = useTheme();
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [isNotificationOpen, setIsNotificationOpen] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const panelRef = useRef(null);
  
  // Get user from localStorage for avatar initials
  const user = JSON.parse(localStorage.getItem("user") || "{}");
  const initials = user.firstName && user.lastName 
    ? `${user.firstName[0]}${user.lastName[0]}`.toUpperCase()
    : "U";

  const formatTime = (isoDate) => {
    if (!isoDate) return "";
    const diff = Date.now() - new Date(isoDate).getTime();
    const minutes = Math.floor(diff / 60000);
    if (minutes < 1) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    const hours = Math.floor(minutes / 60);
    if (hours < 24) return `${hours}h ago`;
    const days = Math.floor(hours / 24);
    return `${days}d ago`;
  };

  const refreshUnreadCount = async () => {
    try {
      const count = await getUnreadNotificationCount();
      setUnreadCount(count);
    } catch {
      setUnreadCount(0);
    }
  };

  const openNotifications = async () => {
    setIsNotificationOpen((open) => !open);
    if (!isNotificationOpen) {
      setLoadingNotifications(true);
      try {
        const list = await getMyNotifications(40);
        setNotifications(Array.isArray(list) ? list : []);
      } catch {
        setNotifications([]);
      } finally {
        setLoadingNotifications(false);
      }
    }
  };

  const onNotificationClick = async (notification) => {
    if (!notification?.isRead) {
      await markNotificationAsRead(notification.notificationId).catch(() => null);
      setNotifications((prev) =>
        prev.map((item) =>
          item.notificationId === notification.notificationId
            ? { ...item, isRead: true }
            : item,
        ),
      );
      setUnreadCount((prev) => Math.max(0, prev - 1));
    }

    setIsNotificationOpen(false);
    if (notification?.link) {
      navigate(notification.link);
    }
  };

  const markAllRead = async () => {
    await markAllNotificationsAsRead().catch(() => null);
    setNotifications((prev) => prev.map((item) => ({ ...item, isRead: true })));
    setUnreadCount(0);
  };

  useEffect(() => {
    refreshUnreadCount();
    const timer = setInterval(refreshUnreadCount, 30000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const onDocClick = (event) => {
      if (panelRef.current && !panelRef.current.contains(event.target)) {
        setIsNotificationOpen(false);
      }
    };

    document.addEventListener("mousedown", onDocClick);
    return () => document.removeEventListener("mousedown", onDocClick);
  }, []);

  return (
    <div className="sticky top-0 z-40 isolate border-b border-white/20 dark:border-white/[0.06] px-4 py-3 md:px-8 md:py-3"
      style={{
        background: isDarkMode
          ? "rgba(12, 18, 34, 0.8)"
          : "rgba(255, 255, 255, 0.7)",
        backdropFilter: "blur(20px) saturate(180%)",
        WebkitBackdropFilter: "blur(20px) saturate(180%)",
      }}
    >
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger menu (mobile only) */}
        <div className="flex items-center">
          {isMobile && (
            <motion.button 
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={toggleSidebar}
              className="p-2 text-slate-600 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-colors mr-2"
              aria-label="Toggle menu"
            >
              <Menu size={22} />
            </motion.button>
          )}
          
          {/* Logo on mobile */}
          {isMobile && (
            <Link to="/dashboard" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-400 to-sky-600 flex items-center justify-center shadow-md shadow-sky-500/20">
                <img src="/images/NoLogo.png" alt="FootStats" className="w-5 h-5 object-contain" />
              </div>
              <span className="font-bold text-slate-900 dark:text-white font-['Outfit']">FootStats</span>
            </Link>
          )}
        </div>

        {/* Right side - Dark Mode, Notifications and Avatar */}
        <div className="flex items-center gap-2 md:gap-3">
          {/* Dark Mode Toggle */}
          <motion.button 
            whileHover={{ scale: 1.1 }} 
            whileTap={{ scale: 0.9, rotate: 15 }}
            onClick={toggleDarkMode}
            className="p-2.5 text-slate-500 dark:text-slate-300 hover:text-amber-500 dark:hover:text-amber-400 hover:bg-amber-50 dark:hover:bg-amber-500/10 rounded-xl transition-colors"
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            <AnimatePresence mode="wait">
              {isDarkMode ? (
                <motion.div
                  key="sun"
                  initial={{ scale: 0, rotate: -90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: 90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Sun size={18} />
                </motion.div>
              ) : (
                <motion.div
                  key="moon"
                  initial={{ scale: 0, rotate: 90 }}
                  animate={{ scale: 1, rotate: 0 }}
                  exit={{ scale: 0, rotate: -90 }}
                  transition={{ duration: 0.2 }}
                >
                  <Moon size={18} />
                </motion.div>
              )}
            </AnimatePresence>
          </motion.button>

          {/* Notification Bell */}
          <div className="relative" ref={panelRef}>
            <motion.button 
              whileHover={{ scale: 1.1 }} 
              whileTap={{ scale: 0.9 }}
              onClick={openNotifications}
              className="relative p-2.5 text-slate-500 dark:text-slate-300 hover:text-sky-600 dark:hover:text-sky-400 hover:bg-sky-50 dark:hover:bg-sky-500/10 rounded-xl transition-colors"
              aria-label="Notifications"
            >
              <Bell size={18} />
              {unreadCount > 0 && (
                <motion.span 
                  initial={{ scale: 0 }}
                  animate={{ scale: 1 }}
                  className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-gradient-to-r from-red-500 to-rose-500 text-white text-[10px] font-bold flex items-center justify-center shadow-lg shadow-red-500/30"
                >
                  {unreadCount > 99 ? "99+" : unreadCount}
                </motion.span>
              )}
            </motion.button>

            <AnimatePresence>
              {isNotificationOpen && (
                <motion.div
                  initial={{ opacity: 0, y: 8, scale: 0.95 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 8, scale: 0.95 }}
                  transition={{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }}
                  className="absolute right-0 mt-2 w-[360px] max-w-[90vw] rounded-2xl border border-white/40 dark:border-white/[0.08] shadow-xl z-50 overflow-hidden"
                  style={{
                    background: isDarkMode
                      ? "rgba(24, 33, 57, 0.95)"
                      : "rgba(255, 255, 255, 0.95)",
                    backdropFilter: "blur(20px)",
                    WebkitBackdropFilter: "blur(20px)",
                  }}
                >
                  <div className="px-5 py-4 border-b border-slate-100 dark:border-white/[0.06] flex items-center justify-between">
                    <p className="text-sm font-bold text-slate-900 dark:text-white font-['Outfit']">Notifications</p>
                    <button
                      onClick={markAllRead}
                      className="flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:text-sky-700 transition-colors"
                    >
                      <CheckCheck size={14} />
                      Mark all read
                    </button>
                  </div>

                  <div className="max-h-[420px] overflow-y-auto">
                    {loadingNotifications && (
                      <div className="p-6 flex items-center justify-center">
                        <motion.div
                          animate={{ rotate: 360 }}
                          transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                          className="w-6 h-6 rounded-full border-2 border-slate-200 dark:border-slate-600 border-t-sky-500"
                        />
                      </div>
                    )}

                    {!loadingNotifications && notifications.length === 0 && (
                      <div className="p-8 text-center">
                        <div className="text-3xl mb-2">🔔</div>
                        <p className="text-sm text-slate-500 dark:text-slate-400">No notifications yet</p>
                        <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">You're all caught up!</p>
                      </div>
                    )}

                    {!loadingNotifications && notifications.map((notification, idx) => (
                      <motion.button
                        key={notification.notificationId}
                        initial={{ opacity: 0, x: -8 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: idx * 0.03 }}
                        onClick={() => onNotificationClick(notification)}
                        className={`w-full text-left px-5 py-3.5 border-b border-slate-100/60 dark:border-white/[0.04] hover:bg-sky-50/50 dark:hover:bg-sky-500/5 transition-colors ${
                          notification.isRead ? "" : "bg-sky-50/40 dark:bg-sky-500/[0.06]"
                        }`}
                      >
                        <div className="flex items-start justify-between gap-3">
                          <div>
                            <p className="text-sm font-semibold text-slate-900 dark:text-white">{notification.title}</p>
                            <p className="text-xs text-slate-600 dark:text-slate-400 mt-1 leading-relaxed">{notification.message}</p>
                          </div>
                          {!notification.isRead && (
                            <span className="w-2 h-2 rounded-full bg-sky-500 mt-2 flex-shrink-0 shadow-sm shadow-sky-500/50" />
                          )}
                        </div>
                        <p className="text-[11px] text-slate-400 dark:text-slate-500 mt-2">{formatTime(notification.createdAt)}</p>
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>

          {/* User Avatar / Initial */}
          <Link 
            to="/profile" 
            className="group flex items-center gap-3"
          >
            <motion.div 
              whileHover={{ scale: 1.08 }}
              whileTap={{ scale: 0.95 }}
              className="w-9 h-9 rounded-full overflow-hidden flex items-center justify-center border-2 border-sky-200 dark:border-sky-500/30 shadow-md"
              style={{
                background: "linear-gradient(135deg, #0284c7, #0ea5e9)",
              }}
            >
              <span className="text-white font-bold text-sm">{initials}</span>
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}