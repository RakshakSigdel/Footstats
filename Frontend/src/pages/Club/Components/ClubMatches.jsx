import { useState } from "react";

export default function ClubMatches({
	clubSchedules,
	upcomingMatches,
	playedMatches,
	clubsMap,
	getMatchForSchedule,
	onNavigateToSchedule,
}) {
	const [matchesTab, setMatchesTab] = useState("upcoming");

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900">Club Matches</h2>
				<div className="inline-flex bg-gray-100 rounded-full p-1">
					<button
						onClick={() => setMatchesTab("upcoming")}
						className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
							matchesTab === "upcoming" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
						}`}
					>
						Upcoming
					</button>
					<button
						onClick={() => setMatchesTab("played")}
						className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
							matchesTab === "played" ? "bg-white shadow-sm" : "text-gray-500 hover:text-gray-700"
						}`}
					>
						Played
					</button>
				</div>
			</div>

			{matchesTab === "upcoming" &&
				(clubSchedules.length === 0 ? (
					<p className="text-gray-500 text-center py-8">No matches scheduled yet.</p>
				) : upcomingMatches.length === 0 ? (
					<p className="text-gray-500 text-center py-8">No upcoming matches.</p>
				) : (
					<div className="space-y-3">
						{upcomingMatches.map((s) => (
							<div
								key={s.scheduleId}
								onClick={() => onNavigateToSchedule(s.scheduleId)}
								className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group"
							>
								<div className="flex-1">
									<div className="flex items-center gap-2 mb-2">
										<span
											className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
												s.scheduleType === "Knockout"
													? "bg-red-100 text-red-700"
													: s.scheduleType === "League"
														? "bg-blue-100 text-blue-700"
														: "bg-green-100 text-green-700"
											}`}
										>
											{s.scheduleType ?? "Match"}
										</span>
									</div>
									<div className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
										{clubsMap[s.teamOneId] ?? `Team ${s.teamOneId}`} <span className="text-gray-400 font-normal">vs</span>{" "}
										{clubsMap[s.teamTwoId] ?? `Team ${s.teamTwoId}`}
									</div>
									<div className="flex items-center gap-4 text-sm text-gray-600">
										<div className="flex items-center gap-1.5">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
												<line x1="16" y1="2" x2="16" y2="6" />
												<line x1="8" y1="2" x2="8" y2="6" />
												<line x1="3" y1="10" x2="21" y2="10" />
											</svg>
											<span className="font-medium">
												{s.date
													? new Date(s.date).toLocaleDateString("en-US", {
															weekday: "short",
															month: "short",
															day: "numeric",
														})
													: "TBD"}
											</span>
										</div>
										<span>•</span>
										<div className="flex items-center gap-1.5">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<circle cx="12" cy="12" r="10" />
												<polyline points="12 6 12 12 16 14" />
											</svg>
											<span className="font-medium">
												{s.date ? new Date(s.date).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }) : "TBD"}
											</span>
										</div>
										{s.location && (
											<>
												<span>•</span>
												<div className="flex items-center gap-1.5">
													<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
														<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
														<circle cx="12" cy="10" r="3" />
													</svg>
													<span>{s.location}</span>
												</div>
											</>
										)}
									</div>
								</div>
								<svg
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
									stroke="currentColor"
									strokeWidth="2"
									className="text-gray-400 group-hover:text-blue-600 transition-colors"
								>
									<path d="M9 18l6-6-6-6" />
								</svg>
							</div>
						))}
					</div>
				))}

			{matchesTab === "played" &&
				(playedMatches.length === 0 ? (
					<p className="text-gray-500 text-center py-8">No played matches yet.</p>
				) : (
					<div className="space-y-3">
						{playedMatches.map((s) => {
							const matchResult = getMatchForSchedule(s.scheduleId);
							const teamOneGoals = matchResult?.teamOneGoals ?? 0;
							const teamTwoGoals = matchResult?.teamTwoGoals ?? 0;
							const isTeamOneWinner = teamOneGoals > teamTwoGoals;
							const isTeamTwoWinner = teamTwoGoals > teamOneGoals;
							const isDraw = teamOneGoals === teamTwoGoals;

							return (
								<div
									key={s.scheduleId}
									onClick={() => onNavigateToSchedule(s.scheduleId)}
									className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group"
								>
									<div className="flex items-center gap-6 flex-1">
										<span
											className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
												s.scheduleType === "Knockout"
													? "bg-red-100 text-red-700"
													: s.scheduleType === "League"
														? "bg-blue-100 text-blue-700"
														: "bg-green-100 text-green-700"
											}`}
										>
											{s.scheduleType ?? "Match"}
										</span>
										<div className="flex-1">
											<div className="flex items-center justify-between mb-2">
												<span
													className={`text-lg font-bold ${
														isTeamOneWinner ? "text-green-600" : isDraw ? "text-gray-700" : "text-gray-500"
													}`}
												>
													{clubsMap[s.teamOneId] ?? `Team ${s.teamOneId}`}
												</span>
												<span className="text-3xl font-bold text-gray-900 mx-4">{teamOneGoals}</span>
											</div>
											<div className="flex items-center justify-between">
												<span
													className={`text-lg font-bold ${
														isTeamTwoWinner ? "text-green-600" : isDraw ? "text-gray-700" : "text-gray-500"
													}`}
												>
													{clubsMap[s.teamTwoId] ?? `Team ${s.teamTwoId}`}
												</span>
												<span className="text-3xl font-bold text-gray-900 mx-4">{teamTwoGoals}</span>
											</div>
											<div className="flex items-center gap-3 text-sm text-gray-500 mt-2">
												<div className="flex items-center gap-1.5">
													<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
														<rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
														<line x1="16" y1="2" x2="16" y2="6" />
														<line x1="8" y1="2" x2="8" y2="6" />
														<line x1="3" y1="10" x2="21" y2="10" />
													</svg>
													<span>
														{s.date
															? new Date(s.date).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })
															: "TBD"}
													</span>
												</div>
												{s.location && (
													<>
														<span>•</span>
														<div className="flex items-center gap-1.5">
															<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
																<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
																<circle cx="12" cy="10" r="3" />
															</svg>
															<span>{s.location}</span>
														</div>
													</>
												)}
											</div>
										</div>
									</div>
									<svg
										width="24"
										height="24"
										viewBox="0 0 24 24"
										fill="none"
										stroke="currentColor"
										strokeWidth="2"
										className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0"
									>
										<path d="M9 18l6-6-6-6" />
									</svg>
								</div>
							);
						})}
					</div>
				))}
		</div>
	);
}
