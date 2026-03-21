import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { useSidebar } from "../../context/SidebarContext";

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
  
  const isActive = (path) => {
    return location.pathname === path;
  };

  const handleLogout = () => {
    const confirmed = window.confirm("Do you really want to logout from FootStats?");
    if (!confirmed) return;

    localStorage.removeItem("token");
    localStorage.removeItem("user");
    closeSidebar();
    navigate("/login");
  };

  const handleNavClick = () => {
    if (isMobile) {
      closeSidebar();
    }
  };

  // On desktop: always show sidebar
  // On mobile: show only when isOpen is true (overlay style)
  const sidebarClasses = isMobile
    ? `fixed inset-y-0 left-0 z-50 w-64 bg-slate-900 text-white p-6 flex flex-col transform transition-transform duration-300 ease-in-out ${
        isOpen ? "translate-x-0" : "-translate-x-full"
      }`
    : "w-64 bg-slate-900 text-white p-6 flex flex-col min-h-screen sticky top-0 h-screen overflow-y-auto";

  return (
    <>
      {/* Overlay for mobile */}
      {isMobile && isOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40"
          onClick={closeSidebar}
        />
      )}
      
      <div className={sidebarClasses}>
        {/* Logo Section */}
        <div className="flex items-center gap-3 mb-8">
          <img src="/images/NoLogo.png" alt="FootStats logo" className="w-10 h-10 object-contain" />
          <div>
            <h1 className="text-lg font-bold">FootStats</h1>
            <p className="text-xs text-gray-400">Gully To Glory</p>
          </div>
          {/* Close button for mobile */}
          {isMobile && (
            <button 
              onClick={closeSidebar}
              className="ml-auto text-gray-400 hover:text-white p-1"
              aria-label="Close sidebar"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>
          )}
        </div>

        {/* Navigation */}
        <nav className="space-y-2 flex-1">
          {/* Top Group */}
          <Link 
            to="/dashboard" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/dashboard') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
              <polyline points="9 22 9 12 15 12 15 22" />
            </svg>
            <span className="text-sm">Home</span>
          </Link>
          
          <Link 
            to="/discover" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/discover') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.35-4.35" />
            </svg>
            <span className="text-sm">Discover</span>
          </Link>
          
          <Link 
            to="/schedules" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/schedules') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
              <line x1="16" y1="2" x2="16" y2="6" />
              <line x1="8" y1="2" x2="8" y2="6" />
              <line x1="3" y1="10" x2="21" y2="10" />
            </svg>
            <span className="text-sm">Schedules</span>
          </Link>

          {/* First Horizontal Divider with Left Gap */}
          <div className="flex items-center py-3 px-3">
            <div className="w-5"></div>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Middle Group */}
          <Link 
            to="/clubs" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/clubs') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
              <circle cx="9" cy="7" r="4" />
              <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
              <path d="M16 3.13a4 4 0 0 1 0 7.75" />
            </svg>
            <span className="text-sm">My Clubs</span>
          </Link>
          
          <Link 
            to="/tournaments" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/tournaments') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
              <path d="M4 22h16" />
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
            </svg>
            <span className="text-sm">Tournaments</span>
          </Link>

          {/* Second Horizontal Divider with Left Gap */}
          <div className="flex items-center py-3 px-3">
            <div className="w-5"></div>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Bottom Group */}
          <Link 
            to="/profile" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/profile') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
              <circle cx="12" cy="7" r="4" />
            </svg>
            <span className="text-sm">Profile</span>
          </Link>
          
          <Link 
            to="/settings" 
            onClick={handleNavClick}
            className={`flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
              isActive('/settings') ? 'text-white bg-slate-800' : 'text-gray-400 hover:text-white hover:bg-slate-800'
            }`}
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M12.22 2h-.44a2 2 0 0 0-2 2v.18a2 2 0 0 1-1 1.73l-.43.25a2 2 0 0 1-2 0l-.15-.08a2 2 0 0 0-2.73.73l-.22.38a2 2 0 0 0 .73 2.73l.15.1a2 2 0 0 1 1 1.72v.51a2 2 0 0 1-1 1.74l-.15.09a2 2 0 0 0-.73 2.73l.22.38a2 2 0 0 0 2.73.73l.15-.08a2 2 0 0 1 2 0l.43.25a2 2 0 0 1 1 1.73V20a2 2 0 0 0 2 2h.44a2 2 0 0 0 2-2v-.18a2 2 0 0 1 1-1.73l.43-.25a2 2 0 0 1 2 0l.15.08a2 2 0 0 0 2.73-.73l.22-.39a2 2 0 0 0-.73-2.73l-.15-.08a2 2 0 0 1-1-1.74v-.5a2 2 0 0 1 1-1.74l.15-.09a2 2 0 0 0 .73-2.73l-.22-.38a2 2 0 0 0-2.73-.73l-.15.08a2 2 0 0 1-2 0l-.43-.25a2 2 0 0 1-1-1.73V4a2 2 0 0 0-2-2z" />
              <circle cx="12" cy="12" r="3" />
            </svg>
            <span className="text-sm flex items-center gap-2">
              Settings
              {!isEmailVerified && (
                <span className="inline-flex items-center" title="Email not verified">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-amber-400">
                    <path d="M10.29 3.86 1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
                    <line x1="12" y1="9" x2="12" y2="13" />
                    <line x1="12" y1="17" x2="12.01" y2="17" />
                  </svg>
                </span>
              )}
            </span>
          </Link>

          {/* Third Horizontal Divider with Left Gap */}
          <div className="flex items-center py-3 px-3">
            <div className="w-5"></div>
            <div className="flex-1 border-t border-gray-700"></div>
          </div>

          {/* Logout Button */}
          <button 
            onClick={handleLogout}
            className="flex items-center gap-3 px-3 py-2 rounded-lg transition-colors text-gray-400 hover:text-red-400 hover:bg-slate-800 w-full"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
              <polyline points="16 17 21 12 16 7" />
              <line x1="21" y1="12" x2="9" y2="12" />
            </svg>
            <span className="text-sm">Logout</span>
          </button>
        </nav>
      </div>
    </>
  );
}