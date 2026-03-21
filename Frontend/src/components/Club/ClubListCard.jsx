import { toMediaUrl } from "../../services/media";

export default function ClubListCard({
  club,
  onClick,
  showRole = true,
  showFounded = true,
  metaLines = [],
  actionLabel = "View Details",
}) {
  const logoUrl = toMediaUrl(club?.logo);

  return (
    <div
      onClick={onClick}
      className="bg-white p-5 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:shadow-md hover:-translate-y-1 transition-all duration-200"
    >
      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-green-600 rounded-lg flex items-center justify-center flex-shrink-0 overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={club?.name || "Club logo"} className="w-full h-full object-cover" />
            ) : (
              <svg width="30" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
                <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
                <path d="M4 22h16" />
                <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
                <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
                <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
              </svg>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-3 mb-2 flex-wrap">
              <h3 className="text-base font-bold text-gray-900 truncate">{club?.name || "Club"}</h3>
              {showRole && club?.userRole === "OWNER" && (
                <span className="bg-purple-100 text-purple-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">Owner</span>
              )}
              {showRole && club?.userRole === "ADMIN" && (
                <span className="bg-yellow-100 text-yellow-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">Admin</span>
              )}
              {showRole && club?.userRole === "MEMBER" && (
                <span className="bg-blue-50 text-blue-700 text-xs px-2.5 py-0.5 rounded-full font-medium whitespace-nowrap">Member</span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-gray-600">
              {club?.location && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                    <circle cx="12" cy="10" r="3" />
                  </svg>
                  <span>{club.location}</span>
                </div>
              )}

              {showFounded && club?.foundedDate && (
                <div className="flex items-center gap-1.5">
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                    <line x1="16" y1="2" x2="16" y2="6" />
                    <line x1="8" y1="2" x2="8" y2="6" />
                    <line x1="3" y1="10" x2="21" y2="10" />
                  </svg>
                  <span>Since {new Date(club.foundedDate).getFullYear()}</span>
                </div>
              )}
            </div>

            {metaLines.length > 0 && (
              <div className="mt-2 space-y-1">
                {metaLines.map((line) => (
                  <p key={line.label} className="text-xs text-gray-600">
                    <span className="font-semibold text-gray-700">{line.label}:</span> {line.value}
                  </p>
                ))}
              </div>
            )}
          </div>
        </div>

        <button
          onClick={(e) => {
            e.stopPropagation();
            onClick?.();
          }}
          className="bg-blue-50 text-blue-700 rounded-lg px-5 py-2 text-sm font-medium hover:bg-blue-100 transition-colors whitespace-nowrap"
        >
          {actionLabel}
        </button>
      </div>
    </div>
  );
}
