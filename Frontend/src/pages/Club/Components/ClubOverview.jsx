export default function ClubOverview({ clubData, clubSchedules, clubsMap }) {
	return (
		<>
			<div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
				{[
					{ label: "Schedules", value: clubSchedules.length, sub: "Total" },
					{ label: "Location", value: clubData.location ?? "-", sub: "Club" },
					{
						label: "Founded",
						value: clubData.foundedDate ? new Date(clubData.foundedDate).getFullYear() : "-",
						sub: "Year",
					},
					{ label: "Description", value: clubData.description ? "Set" : "-", sub: "" },
				].map((stat, index) => (
					<div key={index} className="app-card p-6 text-center">
						<div className="text-xs font-semibold uppercase tracking-wide text-surface-500 mb-2">{stat.label}</div>
						<div className="text-2xl md:text-3xl font-bold text-gray-900 truncate font-['Outfit']" title={stat.value}>
							{stat.value}
						</div>
						{stat.sub && <div className="text-xs text-surface-400 mt-1">{stat.sub}</div>}
					</div>
				))}
			</div>

			{clubData.description && (
				<div className="app-card p-6 mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4 font-['Outfit']">About</h2>
					<p className="text-surface-700 leading-relaxed">{clubData.description}</p>
				</div>
			)}

			<div className="app-card p-6">
				<h2 className="text-xl font-bold text-gray-900 mb-6 font-['Outfit']">Club Schedules</h2>
				{clubSchedules.length === 0 ? (
					<p className="text-surface-500 text-center py-6">No schedules yet.</p>
				) : (
					<div className="space-y-3">
						{clubSchedules.slice(0, 10).map((s) => (
							<div key={s.id} className="flex items-center justify-between p-4 border border-surface-200 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all">
								<span className="font-semibold text-gray-900">
									{clubsMap[s.teamOneId] ?? s.teamOneId} <span className="text-surface-400 font-normal">vs</span> {clubsMap[s.teamTwoId] ?? s.teamTwoId}
								</span>
								<span className="text-sm text-surface-600">
									{s.date ? new Date(s.date).toLocaleString() : "-"} - {s.location ?? ""}
								</span>
							</div>
						))}
					</div>
				)}
			</div>
		</>
	);
}
