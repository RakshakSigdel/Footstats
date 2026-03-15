import { useEffect, useRef, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";
import { useTheme } from "../../context/ThemeContext";
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
    <div className="bg-white px-4 py-4 md:px-8 md:py-4 border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-between">
        {/* Left side - Hamburger menu (mobile only) */}
        <div className="flex items-center">
          {isMobile && (
            <button 
              onClick={toggleSidebar}
              className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300 mr-2"
              aria-label="Toggle menu"
            >
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="3" y1="6" x2="21" y2="6" />
                <line x1="3" y1="12" x2="21" y2="12" />
                <line x1="3" y1="18" x2="21" y2="18" />
              </svg>
            </button>
          )}
          
          {/* Logo on mobile */}
          {isMobile && (
            <Link to="/dashboard" className="flex items-center gap-2">
              <div className="w-8 h-8 bg-slate-900 rounded-lg flex items-center justify-center">
                <svg viewBox="0 0 40 40" className="w-6 h-6" fill="none">
                  <circle cx="20" cy="20" r="12" fill="white"/>
                </svg>
              </div>
              <span className="font-bold text-gray-900">FootStats</span>
            </Link>
          )}
        </div>

        {/* Right side - Dark Mode, Notifications and Avatar */}
        <div className="flex items-center gap-3 md:gap-4">
          {/* Dark Mode Toggle */}
          <button 
            onClick={toggleDarkMode}
            className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
            aria-label="Toggle dark mode"
            title={isDarkMode ? "Switch to light mode" : "Switch to dark mode"}
          >
            {isDarkMode ? (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <circle cx="12" cy="12" r="5" />
                <line x1="12" y1="1" x2="12" y2="3" />
                <line x1="12" y1="21" x2="12" y2="23" />
                <line x1="4.22" y1="4.22" x2="5.64" y2="5.64" />
                <line x1="18.36" y1="18.36" x2="19.78" y2="19.78" />
                <line x1="1" y1="12" x2="3" y2="12" />
                <line x1="21" y1="12" x2="23" y2="12" />
                <line x1="4.22" y1="19.78" x2="5.64" y2="18.36" />
                <line x1="18.36" y1="5.64" x2="19.78" y2="4.22" />
              </svg>
            ) : (
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
            )}
          </button>

          {/* Notification Bell */}
          <div className="relative" ref={panelRef}>
            <button 
              onClick={openNotifications}
              className="relative p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              aria-label="Notifications"
            >
              <svg 
                width="20" 
                height="20" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2" 
                strokeLinecap="round" 
                strokeLinejoin="round"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9" />
                <path d="M13.73 21a2 2 0 0 1-3.46 0" />
              </svg>
              {unreadCount > 0 && (
                <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 rounded-full bg-red-500 text-white text-[10px] font-bold flex items-center justify-center">
                  {unreadCount > 99 ? "99+" : unreadCount}
                </span>
              )}
            </button>

            {isNotificationOpen && (
              <div className="absolute right-0 mt-2 w-[340px] max-w-[90vw] bg-white rounded-xl border border-gray-200 shadow-xl z-50 overflow-hidden">
                <div className="px-4 py-3 border-b border-gray-100 flex items-center justify-between">
                  <p className="text-sm font-semibold text-gray-900">Notifications</p>
                  <button
                    onClick={markAllRead}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                  >
                    Mark all read
                  </button>
                </div>

                <div className="max-h-[420px] overflow-y-auto">
                  {loadingNotifications && (
                    <div className="p-4 text-sm text-gray-500">Loading...</div>
                  )}

                  {!loadingNotifications && notifications.length === 0 && (
                    <div className="p-4 text-sm text-gray-500">No notifications yet.</div>
                  )}

                  {!loadingNotifications && notifications.map((notification) => (
                    <button
                      key={notification.notificationId}
                      onClick={() => onNotificationClick(notification)}
                      className={`w-full text-left px-4 py-3 border-b border-gray-100 hover:bg-gray-50 ${
                        notification.isRead ? "bg-white" : "bg-blue-50/60"
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <p className="text-sm font-semibold text-gray-900">{notification.title}</p>
                          <p className="text-xs text-gray-600 mt-1">{notification.message}</p>
                        </div>
                        {!notification.isRead && (
                          <span className="w-2 h-2 rounded-full bg-blue-600 mt-2" />
                        )}
                      </div>
                      <p className="text-[11px] text-gray-400 mt-2">{formatTime(notification.createdAt)}</p>
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Avatar / Initial */}
          <Link 
            to="/profile" 
            className="flex items-center gap-3 hover:opacity-90 transition-opacity"
          >
            <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center border border-gray-300">
              <span className="text-white font-semibold text-sm">{initials}</span>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
}