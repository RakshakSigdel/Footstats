import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useSidebar } from "../../context/SidebarContext";
import {
  Home, Search, CalendarDays, Users, Trophy, User, Settings, LogOut, X, AlertTriangle
} from "lucide-react";

const navItems = [
  { to: "/dashboard", icon: Home, label: "Home" },
  { to: "/discover", icon: Search, label: "Discover" },
  { to: "/schedules", icon: CalendarDays, label: "Schedules" },
  { divider: true },
  { to: "/clubs", icon: Users, label: "My Clubs" },
  { to: "/tournaments", icon: Trophy, label: "Tournaments" },
  { divider: true },
  { to: "/profile", icon: User, label: "Profile" },
];

export default function Sidebar() {
  const location = useLocation();
  const navigate = useNavigate();
  const { isOpen, isMobile, closeSidebar } = useSidebar();
  const [isEmailVerified, setIsEmailVerified] = useState(true);

  useEffect(() => {
    const syncEmailVerificationStatus = () => {
      try {
        const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
        setIsEmailVerified(storedUser?.emailVerified !== false);
      } catch {
        setIsEmailVerified(true);
      }
    };

    syncEmailVerificationStatus();
    window.addEventListener("storage", syncEmailVerificationStatus);
    window.addEventListener("user-updated", syncEmailVerificationStatus);

    return () => {
      window.removeEventListener("storage", syncEmailVerificationStatus);
      window.removeEventListener("user-updated", syncEmailVerificationStatus);
    };
  }, []);
  
  const isActive = (path) => location.pathname === path;

  const handleLogout = () => {
    const confirmed = window.confirm("Do you really want to logout from FootStats?");
    if (!confirmed) return;
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    closeSidebar();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (isMobile) closeSidebar();
  };

  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-72 flex flex-col transform transition-transform duration-300 ease-[cubic-bezier(0.22,1,0.36,1)] ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "w-72 z-40 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto";

  return (
    <>
      {/* Overlay for mobile */}
      <AnimatePresence>
        {isMobile && isOpen && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-40"
            onClick={closeSidebar}
          />
        )}
      </AnimatePresence>
      
      <div
        className={sidebarClasses}
        style={{
          background: "linear-gradient(180deg, #0f172a 0%, #0c1a2e 40%, #062016 100%)",
          color: "#f1f5f9",
        }}
      >
        {/* Logo Section */}
        <div className="flex items-center gap-3 px-6 pt-7 pb-6">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-emerald-400 to-emerald-600 flex items-center justify-center shadow-lg shadow-emerald-500/25">
            <img src="/images/NoLogo.png" alt="FootStats logo" className="w-7 h-7 object-contain" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight font-['Outfit']">FootStats</h1>
            <p className="text-[11px] text-emerald-400/80 font-medium">गल्ली देखि गोल सम्म</p>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <button 
              onClick={closeSidebar}
              className="ml-auto text-slate-400 hover:text-white p-1.5 rounded-lg hover:bg-white/10 transition-colors"
              aria-label="Close sidebar"
            >
              <X size={18} />
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="flex-1 px-3 space-y-1">
          {navItems.map((item, idx) => {
            if (item.divider) {
              return (
                <div key={`divider-${idx}`} className="py-3 px-3">
                  <div className="border-t border-white/[0.07]" />
                </div>
              );
            }

            const Icon = item.icon;
            const active = isActive(item.to);

            return (
              <motion.div key={item.to} whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
                <Link 
                  to={item.to} 
                  onClick={handleNavClick}
                  className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                    active
                      ? "text-white bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                      : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
                  }`}
                >
                  {active && (
                    <motion.div
                      layoutId="sidebar-active-pill"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                      transition={{ type: "spring", stiffness: 350, damping: 30 }}
                    />
                  )}
                  <Icon size={18} strokeWidth={active ? 2.2 : 1.8} />
                  <span>{item.label}</span>
                </Link>
              </motion.div>
            );
          })}

          {/* Settings - separate because of email verification badge */}
          <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <Link 
              to="/settings" 
              onClick={handleNavClick}
              className={`relative flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 ${
                isActive('/settings')
                  ? "text-white bg-gradient-to-r from-emerald-500/20 to-emerald-600/10 shadow-[inset_0_0_0_1px_rgba(16,185,129,0.2)]"
                  : "text-slate-400 hover:text-slate-200 hover:bg-white/[0.05]"
              }`}
            >
              {isActive('/settings') && (
                <motion.div
                  layoutId="sidebar-active-pill"
                  className="absolute left-0 top-1/2 -translate-y-1/2 w-[3px] h-5 rounded-full bg-emerald-400 shadow-[0_0_12px_rgba(52,211,153,0.6)]"
                  transition={{ type: "spring", stiffness: 350, damping: 30 }}
                />
              )}
              <Settings size={18} strokeWidth={isActive('/settings') ? 2.2 : 1.8} />
              <span className="flex items-center gap-2">
                Settings
                {!isEmailVerified && (
                  <AlertTriangle size={14} className="text-amber-400" />
                )}
              </span>
            </Link>
          </motion.div>

          {/* Divider */}
          <div className="py-3 px-3">
            <div className="border-t border-white/[0.07]" />
          </div>

          {/* Logout Button */}
          <motion.div whileHover={{ x: 4 }} transition={{ type: "spring", stiffness: 400, damping: 25 }}>
            <button 
              onClick={handleLogout}
              className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-medium transition-all duration-200 text-slate-400 hover:text-red-400 hover:bg-red-500/10 w-full"
            >
              <LogOut size={18} />
              <span>Logout</span>
            </button>
          </motion.div>
        </nav>

        {/* Bottom gradient fade */}
        <div className="h-6 bg-gradient-to-t from-[#062016] to-transparent pointer-events-none" />
      </div>
    </>
  );
}