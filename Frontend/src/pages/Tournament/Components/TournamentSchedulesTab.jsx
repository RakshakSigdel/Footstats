import { MotionButton } from "../../../components/ui/motion";

export default function TournamentSchedulesTab({
  isTournamentAdmin,
  onOpenCreateSchedule,
  tournamentSchedules,
  onScheduleClick,
}) {
  return (
    <section className="space-y-4">
      {isTournamentAdmin && (
        <div className="app-card p-6">
          <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Create Tournament Schedule</h2>
          <p className="mt-1 text-sm text-surface-600">
            Create match schedules directly from this tournament with both clubs selected from accepted registrations.
          </p>
          <MotionButton onClick={onOpenCreateSchedule} className="btn-primary mt-4 rounded-xl px-4 py-2 text-sm">
            Open Create Schedule
          </MotionButton>
        </div>
      )}

      <div className="app-card p-6">
        <h2 className="text-lg font-bold text-gray-900 font-['Outfit']">Tournament Matches</h2>
        {tournamentSchedules.length === 0 ? (
          <p className="mt-3 text-sm text-surface-600">No schedules created yet.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {tournamentSchedules.map((schedule) => (
              <div
                key={schedule.scheduleId}
                onClick={() => onScheduleClick(schedule.scheduleId)}
                className="cursor-pointer rounded-xl border border-surface-200 p-4 hover:border-primary-200 hover:bg-primary-50/30 transition-all"
              >
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="font-semibold text-gray-900">
                    {schedule.teamOne?.name || `Club ${schedule.teamOneId}`} vs {schedule.teamTwo?.name || `Club ${schedule.teamTwoId}`}
                  </div>
                  <div className="text-xs font-medium text-surface-500 bg-surface-100 px-2.5 py-1 rounded-full">
                    {schedule.scheduleStatus}
                  </div>
                </div>
                <div className="mt-1 text-xs text-surface-500">
                  {schedule.date ? new Date(schedule.date).toLocaleString() : "TBD"} at {schedule.location}
                </div>
                {schedule.match && (
                  <div className="mt-2 text-sm font-bold text-gray-900 font-['Outfit']">
                    Score: {schedule.match.teamOneGoals} - {schedule.match.teamTwoGoals}
                  </div>
                )}
                <p className="mt-2 text-xs font-semibold text-primary-700">Open Schedule Details -&gt;</p>
              </div>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
