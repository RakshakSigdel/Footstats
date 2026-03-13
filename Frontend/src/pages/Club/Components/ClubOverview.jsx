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
					<div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
						<div className="text-base font-medium text-gray-700 mb-2">{stat.label}</div>
						<div className="text-2xl md:text-3xl font-bold text-gray-900 truncate" title={stat.value}>
							{stat.value}
						</div>
						{stat.sub && <div className="text-xs text-gray-500">{stat.sub}</div>}
					</div>
				))}
			</div>

			{clubData.description && (
				<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8">
					<h2 className="text-xl font-bold text-gray-900 mb-4">About</h2>
					<p className="text-gray-700">{clubData.description}</p>
				</div>
			)}

			<div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
				<h2 className="text-xl font-bold text-gray-900 mb-6">Club Schedules</h2>
				{clubSchedules.length === 0 ? (
					<p className="text-gray-500">No schedules yet.</p>
				) : (
					<div className="space-y-3">
						{clubSchedules.slice(0, 10).map((s) => (
							<div key={s.id} className="flex items-center justify-between p-4 border border-gray-100 rounded-lg">
								<span className="font-medium text-gray-900">
									{clubsMap[s.teamOneId] ?? s.teamOneId} vs {clubsMap[s.teamTwoId] ?? s.teamTwoId}
								</span>
								<span className="text-sm text-gray-600">
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
