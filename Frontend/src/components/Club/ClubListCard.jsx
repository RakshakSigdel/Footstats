import { motion } from "framer-motion";
import { MapPin, CalendarDays, ChevronRight } from "lucide-react";
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

  const roleBadge = {
    OWNER: { bg: "bg-purple-100 dark:bg-purple-500/20", text: "text-purple-700 dark:text-purple-300", label: "Owner" },
    ADMIN: { bg: "bg-amber-100 dark:bg-amber-500/20", text: "text-amber-700 dark:text-amber-300", label: "Admin" },
    MEMBER: { bg: "bg-sky-50 dark:bg-sky-500/20", text: "text-sky-700 dark:text-sky-300", label: "Member" },
  };

  const badge = roleBadge[club?.userRole];

  return (
    <motion.div
      whileHover={{ y: -3, scale: 1.005, transition: { duration: 0.2 } }}
      onClick={onClick}
      className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100/80 cursor-pointer group relative overflow-hidden transition-all"
    >
      {/* Accent strip */}
      <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-sky-400 to-cyan-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      <div className="flex items-center justify-between gap-6">
        <div className="flex items-center gap-4 flex-1 min-w-0">
          <div className="w-12 h-12 bg-gradient-to-br from-sky-500 to-sky-600 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden shadow-md shadow-sky-500/20">
            {logoUrl ? (
              <img src={logoUrl} alt={club?.name || "Club logo"} className="w-full h-full object-cover" />
            ) : (
              <span className="text-white font-bold text-lg">{(club?.name || "C")[0]}</span>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2.5 mb-1.5 flex-wrap">
              <h3 className="text-base font-bold text-slate-900 truncate">{club?.name || "Club"}</h3>
              {showRole && badge && (
                <span className={`${badge.bg} ${badge.text} text-xs px-2.5 py-0.5 rounded-full font-semibold whitespace-nowrap`}>
                  {badge.label}
                </span>
              )}
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 text-xs text-slate-500">
              {club?.location && (
                <div className="flex items-center gap-1.5">
                  <MapPin size={13} />
                  <span>{club.location}</span>
                </div>
              )}

              {showFounded && club?.foundedDate && (
                <div className="flex items-center gap-1.5">
                  <CalendarDays size={13} />
                  <span>Since {new Date(club.foundedDate).getFullYear()}</span>
                </div>
              )}
            </div>

            {metaLines.length > 0 && (
              <div className="mt-2 space-y-1">
                {metaLines.map((line) => (
                  <p key={line.label} className="text-xs text-slate-500">
                    <span className="font-semibold text-slate-600">{line.label}:</span> {line.value}
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
          className="flex items-center gap-1.5 bg-sky-50 text-sky-700 rounded-xl px-4 py-2 text-sm font-semibold hover:bg-sky-100 transition-colors whitespace-nowrap"
        >
          {actionLabel}
          <ChevronRight size={14} />
        </button>
      </div>
    </motion.div>
  );
}
