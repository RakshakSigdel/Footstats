import { Link } from "react-router-dom";

export default function Topbar() {
  // You can later receive props like userName, avatarUrl, notificationCount, etc.
  // For now keeping it simple as per your current design

  return (
    <div className="bg-white px-6 py-4 md:px-8 md:py-4 border-b border-gray-200 sticky top-0 z-10">
      <div className="flex items-center justify-end gap-4">
        {/* Notification Bell */}
        <button 
          className="p-2 text-gray-600 hover:text-gray-900 hover:bg-gray-100 rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
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
          {/* Optional: red dot for unread notifications */}
          {/* <span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full"></span> */}
        </button>

        {/* User Avatar / Initial */}
        <Link 
          to="/profile" 
          className="flex items-center gap-3 hover:opacity-90 transition-opacity"
        >
          <div className="w-9 h-9 rounded-full overflow-hidden bg-slate-900 flex items-center justify-center border border-gray-300">
            <span className="text-white font-semibold text-sm">RS</span>
            {/* Later replace with real avatar:
            <img 
              src={user.avatarUrl} 
              alt="User avatar" 
              className="w-full h-full object-cover"
            /> */}
          </div>

          {/* Optional: show name on larger screens */}
          {/* <span className="hidden md:inline text-sm font-medium text-gray-800">Rajesh</span> */}
        </Link>
      </div>
    </div>
  );
}