import { useState } from "react";

export default function ClubTopPlayers({ clubPlayers, getProfilePhotoUrl, onNavigateToPlayer }) {
	const [seeAllModal, setSeeAllModal] = useState(null);

	return (
		<div className="space-y-5">
			<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
				<h2 className="text-xl font-bold text-gray-900">Top Players</h2>
				<p className="text-sm text-gray-500 mt-1">Rankings based on in-club performance stats</p>
			</div>

			<div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
				{[
					{
						key: "appearances",
						label: "Most Appearances",
						icon: "🏅",
						unit: "Apps",
						color: "text-purple-600",
						bg: "bg-purple-50",
					},
					{ key: "goals", label: "Most Goals", icon: "⚽", unit: "Goals", color: "text-green-600", bg: "bg-green-50" },
					{
						key: "assists",
						label: "Most Assists",
						icon: "🎯",
						unit: "Assists",
						color: "text-blue-600",
						bg: "bg-blue-50",
					},
					{
						key: "yellowCards",
						label: "Most Yellow Cards",
						icon: "🟨",
						unit: "Cards",
						color: "text-yellow-600",
						bg: "bg-yellow-50",
					},
					{
						key: "redCards",
						label: "Most Red Cards",
						icon: "🟥",
						unit: "Cards",
						color: "text-red-600",
						bg: "bg-red-50",
					},
				].map(({ key, label, icon, unit, color, bg }) => {
					const sorted = [...clubPlayers].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
					const top3 = sorted.slice(0, 3);
					const hasData = sorted.some((p) => (p[key] ?? 0) > 0);
					const rankIcons = ["🥇", "🥈", "🥉"];

					const PlayerRow = ({ player, idx }) => (
						<div
							key={player.userId}
							onClick={() => onNavigateToPlayer(player.userId)}
							className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
						>
							<div className="w-6 text-center flex-shrink-0">
								{idx < 3 ? (
									<span className="text-base leading-none">{rankIcons[idx]}</span>
								) : (
									<span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
								)}
							</div>
							<div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
								{getProfilePhotoUrl(player.profilePhoto) ? (
									<img src={getProfilePhotoUrl(player.profilePhoto)} alt="" className="w-full h-full object-cover" />
								) : (
									<span className="text-blue-700 font-bold text-sm">
										{player.firstName?.[0]}
										{player.lastName?.[0]}
									</span>
								)}
							</div>
							<div className="flex-1 min-w-0">
								<div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
									{player.firstName} {player.lastName}
								</div>
								{player.position && <div className="text-xs text-gray-500 truncate">{player.position}</div>}
							</div>
							<div className="flex-shrink-0 text-right">
								<div className={`text-lg font-bold leading-tight ${color}`}>{player[key] ?? 0}</div>
								<div className="text-xs text-gray-400 font-normal">{unit}</div>
							</div>
						</div>
					);

					return (
						<div key={key} className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
							<div className="flex items-center gap-2 mb-4">
								<div className={`w-9 h-9 rounded-lg ${bg} flex items-center justify-center flex-shrink-0 text-lg`}>{icon}</div>
								<h3 className="font-bold text-gray-900">{label}</h3>
							</div>

							{!hasData ? (
								<p className="text-sm text-gray-400 py-3 text-center">No data yet.</p>
							) : (
								<div className="space-y-1">
									{top3.map((player, idx) => (
										<PlayerRow key={player.userId} player={player} idx={idx} />
									))}
								</div>
							)}

							{sorted.length > 3 && (
								<button
									onClick={() => setSeeAllModal({ label, icon, unit, color, sorted, statKey: key })}
									className="mt-3 w-full py-2 text-sm text-blue-600 hover:text-blue-700 font-semibold hover:bg-blue-50 rounded-lg transition-colors border border-blue-100"
								>
									See All ({sorted.length} players)
								</button>
							)}
						</div>
					);
				})}
			</div>

			{seeAllModal && (
				<div
					className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
					onClick={() => setSeeAllModal(null)}
				>
					<div
						className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col"
						onClick={(e) => e.stopPropagation()}
					>
						<div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
							<div className="flex items-center gap-2">
								<span className="text-2xl">{seeAllModal.icon}</span>
								<h2 className="text-lg font-bold text-gray-900">{seeAllModal.label}</h2>
							</div>
							<button
								onClick={() => setSeeAllModal(null)}
								className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors"
							>
								<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<line x1="18" y1="6" x2="6" y2="18" />
									<line x1="6" y1="6" x2="18" y2="18" />
								</svg>
							</button>
						</div>
						<div className="overflow-y-auto p-4 space-y-1">
							{seeAllModal.sorted.slice(0, 20).map((player, idx) => (
								<div
									key={player.userId}
									onClick={() => {
										setSeeAllModal(null);
										onNavigateToPlayer(player.userId);
									}}
									className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
								>
									<div className="w-7 text-center flex-shrink-0">
										{idx === 0 ? (
											<span className="text-base">🥇</span>
										) : idx === 1 ? (
											<span className="text-base">🥈</span>
										) : idx === 2 ? (
											<span className="text-base">🥉</span>
										) : (
											<span className="text-xs font-bold text-gray-400">#{idx + 1}</span>
										)}
									</div>
									<div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
										{getProfilePhotoUrl(player.profilePhoto) ? (
											<img src={getProfilePhotoUrl(player.profilePhoto)} alt="" className="w-full h-full object-cover" />
										) : (
											<span className="text-blue-700 font-bold text-sm">
												{player.firstName?.[0]}
												{player.lastName?.[0]}
											</span>
										)}
									</div>
									<div className="flex-1 min-w-0">
										<div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
											{player.firstName} {player.lastName}
										</div>
										{player.position && <div className="text-xs text-gray-500 truncate">{player.position}</div>}
									</div>
									<div className="flex-shrink-0 text-right">
										<div className={`text-lg font-bold leading-tight ${seeAllModal.color}`}>
											{player[seeAllModal.statKey] ?? 0}
										</div>
										<div className="text-xs text-gray-400">{seeAllModal.unit}</div>
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			)}
		</div>
	);
}
