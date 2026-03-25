import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { addPlayerToLineup, updateLineup, removeFromLineup } from '../../../services/api.matchLineups'
import { toMediaUrl } from '../../../services/media'

export default function ScheduleMatchLineup({
	schedule,
	match,
	teamOneName,
	teamTwoName,
	matchSize,
	teamOneLineup,
	teamTwoLineup,
	canManage,
	getPlayersForClub,
	onReload,
	onError,
}) {
	const navigate = useNavigate()
	const [showLineupModal, setShowLineupModal] = useState(false)
	const [editingLineup, setEditingLineup] = useState(null)
	const [modalLoading, setModalLoading] = useState(false)
	const [modalError, setModalError] = useState(null)
	const [lineupForm, setLineupForm] = useState({
		clubId: '',
		userId: '',
		position: '',
		isStarter: true,
	})

	const openAddLineupModal = (teamId) => {
		setEditingLineup(null)
		setLineupForm({
			clubId: teamId?.toString() || '',
			userId: '',
			position: '',
			isStarter: true,
		})
		setModalError(null)
		setShowLineupModal(true)
	}

	const openEditLineupModal = (lineup) => {
		setEditingLineup(lineup)
		setLineupForm({
			clubId: lineup.club?.clubId?.toString() || '',
			userId: lineup.user?.userId?.toString() || '',
			position: lineup.position || '',
			isStarter: lineup.isStarter ?? true,
		})
		setModalError(null)
		setShowLineupModal(true)
	}

	const handleLineupSubmit = async () => {
		if (!lineupForm.clubId || !lineupForm.userId) {
			setModalError('Please select a team and player')
			return
		}

		setModalLoading(true)
		setModalError(null)
		try {
			const data = {
				matchId: match.matchId,
				clubId: Number(lineupForm.clubId),
				userId: Number(lineupForm.userId),
				position: lineupForm.position || null,
				isStarter: lineupForm.isStarter,
			}

			if (editingLineup) {
				await updateLineup(editingLineup.matchLineupId, data)
			} else {
				await addPlayerToLineup(data)
			}

			setShowLineupModal(false)
			await onReload()
		} catch (err) {
			setModalError(err?.response?.data?.message || err?.message || 'Failed to save lineup')
		} finally {
			setModalLoading(false)
		}
	}

	const handleRemoveFromLineup = async (lineupId) => {
		if (!window.confirm('Remove this player from lineup?')) return

		try {
			await removeFromLineup(lineupId)
			await onReload()
		} catch (err) {
			onError(err?.message || 'Failed to remove from lineup')
		}
	}

	const getProfilePhotoUrl = (photoPath) => toMediaUrl(photoPath)

	const getAvailablePlayersForClub = (clubId) => {
		const players = getPlayersForClub(clubId)
		const selectedClubId = Number(clubId)
		const activeLineup = selectedClubId === Number(schedule?.teamOneId)
			? teamOneLineup
			: selectedClubId === Number(schedule?.teamTwoId)
				? teamTwoLineup
				: []

		const lineupUserIds = new Set(
			activeLineup
				.filter((lineup) => lineup.matchLineupId !== editingLineup?.matchLineupId)
				.map((lineup) => Number(lineup.user?.userId))
		)

		return players.filter((player) => !lineupUserIds.has(Number(player.userId)))
	}

	const goToPlayerProfile = (userId) => {
		if (!userId) return
		navigate(`/player/${userId}`)
	}

	// Get formation layout based on match size
	const getFormationLayout = (size) => {
		const formations = {
			5: [1, 2, 2], // GK, 2 DEF, 2 FWD
			6: [1, 2, 3], // GK, 2 DEF, 3 FWD
			7: [1, 2, 1, 3], // GK, 2 DEF, 1 MID, 3 FWD
			8: [1, 2, 2, 3], // GK, 2 DEF, 2 MID, 3 FWD
			9: [1, 3, 2, 3], // GK, 3 DEF, 2 MID, 3 FWD
			10: [1, 3, 3, 3], // GK, 3 DEF, 3 MID, 3 FWD
			11: [1, 4, 3, 3], // GK, 4 DEF, 3 MID, 3 FWD (4-3-3)
		}
		return formations[size] || [1, 2, 2]
	}

	// Organize players by position for formation display
	const organizeByPosition = (lineup) => {
		const organized = {
			Goalkeeper: [],
			Defender: [],
			Midfielder: [],
			Forward: [],
			Unassigned: []
		}

		lineup.forEach(player => {
			if (player.isStarter) {
				const pos = player.position || 'Unassigned'
				if (organized[pos]) {
					organized[pos].push(player)
				} else {
					organized.Unassigned.push(player)
				}
			}
		})

		return organized
	}

	const renderPlayerCard = (player, teamColor, isFormation = false) => {
		const bgColor = teamColor === 'blue' ? 'bg-blue-600' : 'bg-red-600'
		
		return (
			<div 
				key={player.matchLineupId} 
				onClick={() => goToPlayerProfile(player.user?.userId)}
				className={`relative group ${isFormation ? 'flex flex-col items-center' : 'flex items-center gap-3 p-3 border border-gray-200 rounded-lg hover:border-gray-300 transition-all'} cursor-pointer`}
			>
				{canManage() && !isFormation && (
					<div className="absolute -top-2 -right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1 z-10">
						<button
							onClick={(e) => {
								e.stopPropagation()
								openEditLineupModal(player)
							}}
							className="bg-white shadow-md rounded-full p-1.5 text-blue-600 hover:bg-blue-50"
							title="Edit player"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
								<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
							</svg>
						</button>
						<button
							onClick={(e) => {
								e.stopPropagation()
								handleRemoveFromLineup(player.matchLineupId)
							}}
							className="bg-white shadow-md rounded-full p-1.5 text-red-600 hover:bg-red-50"
							title="Remove player"
						>
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<line x1="18" y1="6" x2="6" y2="18" />
								<line x1="6" y1="6" x2="18" y2="18" />
							</svg>
						</button>
					</div>
				)}
				
				<div className={`${isFormation ? 'w-16 h-16 mb-2' : 'w-12 h-12'} ${bgColor} rounded-full flex items-center justify-center flex-shrink-0 overflow-hidden shadow-lg border-4 border-white`}>
					{getProfilePhotoUrl(player.user?.profilePhoto) ? (
						<img src={getProfilePhotoUrl(player.user?.profilePhoto)} alt={`${player.user?.firstName || ""} ${player.user?.lastName || ""}`.trim()} className="w-full h-full object-cover" />
					) : (
						<span className="text-white font-bold text-sm">
							{player.user?.firstName?.[0]}{player.user?.lastName?.[0]}
						</span>
					)}
				</div>
				
				<div className={`${isFormation ? 'text-center' : 'flex-1 min-w-0'}`}>
					<p className={`font-semibold text-gray-900 ${isFormation ? 'text-sm' : 'truncate'}`}>
						{isFormation ? player.user?.firstName || player.user?.lastName : `${player.user?.firstName} ${player.user?.lastName}`}
					</p>
					{!isFormation && (
						<div className="flex items-center gap-2 text-xs text-gray-600 mt-0.5">
							{player.position && <span className="bg-gray-100 px-2 py-0.5 rounded">{player.position}</span>}
							{player.isStarter && <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded font-medium">Starter</span>}
						</div>
					)}
				</div>
			</div>
		)
	}

	const renderFormationView = (lineup, teamColor) => {
		const organized = organizeByPosition(lineup)
		const formation = getFormationLayout(matchSize)
		const remainingPlayers = [
			...(organized.Goalkeeper || []),
			...(organized.Defender || []),
			...(organized.Midfielder || []),
			...(organized.Forward || []),
			...(organized.Unassigned || []),
		]

		const takePlayers = (predicate, count) => {
			const selected = []
			for (let i = 0; i < remainingPlayers.length && selected.length < count; ) {
				if (predicate(remainingPlayers[i])) {
					selected.push(remainingPlayers[i])
					remainingPlayers.splice(i, 1)
				} else {
					i += 1
				}
			}
			return selected
		}

		const rows = formation.map((playersInRow, rowIndex) => {
			const isThreeRowPitch = formation.length === 3
			const preferredPositions = rowIndex === 0
				? ['Goalkeeper']
				: rowIndex === formation.length - 1
					? isThreeRowPitch ? ['Forward', 'Midfielder'] : ['Forward']
					: rowIndex === 1
						? isThreeRowPitch ? ['Defender', 'Midfielder'] : ['Defender']
						: ['Midfielder']

			let rowPlayers = takePlayers(
				(player) => preferredPositions.includes(player.position || 'Unassigned'),
				playersInRow
			)

			if (rowPlayers.length < playersInRow) {
				rowPlayers = [...rowPlayers, ...takePlayers(() => true, playersInRow - rowPlayers.length)]
			}

			const rowLabel = rowIndex === 0
				? 'Goalkeeper'
				: rowIndex === formation.length - 1
					? 'Forward'
					: rowIndex === 1
						? 'Defender'
						: 'Midfielder'

			return { rowPlayers, playersInRow, rowLabel, rowIndex }
		})
		
		return (
			<div className="relative bg-gradient-to-b from-blue-600 to-blue-700 rounded-xl p-6 min-h-[400px]" 
				style={{
					backgroundImage: `
						repeating-linear-gradient(0deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 50px),
						repeating-linear-gradient(90deg, rgba(255,255,255,0.03) 0px, rgba(255,255,255,0.03) 2px, transparent 2px, transparent 50px)
					`
				}}
			>
				{/* Field markings */}
				<div className="absolute inset-0 pointer-events-none">
					<div className="absolute top-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-white opacity-30"></div>
					<div className="absolute bottom-0 left-1/2 -translate-x-1/2 w-24 h-1 bg-white opacity-30"></div>
					<div className="absolute top-1/2 left-0 right-0 h-0.5 bg-white opacity-20"></div>
				</div>

				{/* Formation rows */}
				<div className="relative z-10 flex flex-col justify-between h-full gap-8">
					{rows.map(({ rowPlayers, playersInRow, rowLabel, rowIndex }) => {
						const emptySlots = Math.max(0, playersInRow - rowPlayers.length)

						return (
							<div key={rowIndex} className="flex justify-center items-center gap-4">
								{rowPlayers.map(player => renderPlayerCard(player, teamColor, true))}
								{[...Array(emptySlots)].map((_, i) => (
									<div key={`empty-${i}`} className="flex flex-col items-center opacity-40">
										<div className="w-16 h-16 mb-2 border-4 border-dashed border-white rounded-full flex items-center justify-center">
											<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
												<circle cx="12" cy="12" r="10" />
												<line x1="12" y1="8" x2="12" y2="16" />
												<line x1="8" y1="12" x2="16" y2="12" />
											</svg>
										</div>
										<p className="text-white text-xs font-medium">{rowLabel}</p>
									</div>
								))}
							</div>
						)
					})}
				</div>
			</div>
		)
	}

	const renderSubstitutesBench = (lineup, teamColor) => {
		const substitutes = lineup.filter(p => !p.isStarter)
		
		if (substitutes.length === 0 && !canManage()) return null

		return (
			<div className="mt-4">
				<div className="flex items-center justify-between mb-3">
					<h4 className="text-sm font-bold text-gray-700 flex items-center gap-2">
						<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
							<rect x="3" y="3" width="18" height="18" rx="2" ry="2"/>
							<line x1="9" y1="3" x2="9" y2="21"/>
						</svg>
						Substitutes Bench
					</h4>
					<span className="text-xs text-gray-500 font-medium">{substitutes.length} player{substitutes.length !== 1 ? 's' : ''}</span>
				</div>
				<div className="grid grid-cols-1 gap-2">
					{substitutes.map(player => renderPlayerCard(player, teamColor, false))}
					{substitutes.length === 0 && (
						<p className="text-gray-400 text-sm italic">No substitutes</p>
					)}
				</div>
			</div>
		)
	}

	return (
		<>
			<div className="bg-white rounded-xl shadow-sm overflow-hidden">
				{/* Header */}
				<div className="bg-gradient-to-r from-gray-900 to-gray-800 px-6 py-4">
					<div className="flex items-center justify-between">
						<h2 className="text-xl md:text-2xl font-bold text-white flex items-center gap-2">
							<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
								<circle cx="12" cy="12" r="10"/>
								<path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/>
							</svg>
							Match Lineups
						</h2>
						<div className="text-white text-sm font-medium bg-white/10 px-3 py-1 rounded-full">
							{matchSize}v{matchSize}
						</div>
					</div>
				</div>

				<div className="p-6">
					<div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
						{/* Team One */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
										{toMediaUrl(schedule?.teamOne?.logo) ? (
											<img src={toMediaUrl(schedule?.teamOne?.logo)} alt={teamOneName} className="w-full h-full object-cover" />
										) : (
											teamOneName?.[0]
										)}
									</div>
									<div>
										<h3 className="text-lg font-bold text-gray-900">{teamOneName}</h3>
										<span className={`text-xs font-semibold ${
											teamOneLineup.filter(p => p.isStarter).length >= matchSize ? 'text-blue-600' : 'text-gray-500'
										}`}>
											{teamOneLineup.filter(p => p.isStarter).length}/{matchSize} starters
										</span>
									</div>
								</div>
								{canManage() && match && (
									<button
										onClick={() => openAddLineupModal(schedule.teamOneId)}
										className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium flex items-center gap-2 shadow-md transition-all"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<line x1="12" y1="5" x2="12" y2="19" />
											<line x1="5" y1="12" x2="19" y2="12" />
										</svg>
										Add Player
									</button>
								)}
							</div>

							{teamOneLineup.length === 0 ? (
								<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
									<svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<p className="text-gray-500 font-medium">No lineup set yet</p>
									{canManage() && (
										<button
											onClick={() => openAddLineupModal(schedule.teamOneId)}
											className="mt-3 text-blue-600 hover:text-blue-700 text-sm font-medium"
										>
											Add first player
										</button>
									)}
								</div>
							) : (
								<>
									{renderFormationView(teamOneLineup, 'blue')}
									{renderSubstitutesBench(teamOneLineup, 'blue')}
								</>
							)}
						</div>

						{/* Team Two */}
						<div className="space-y-4">
							<div className="flex justify-between items-center">
								<div className="flex items-center gap-3">
									<div className="w-10 h-10 bg-red-600 rounded-full flex items-center justify-center text-white font-bold shadow-lg overflow-hidden">
										{toMediaUrl(schedule?.teamTwo?.logo) ? (
											<img src={toMediaUrl(schedule?.teamTwo?.logo)} alt={teamTwoName} className="w-full h-full object-cover" />
										) : (
											teamTwoName?.[0]
										)}
									</div>
									<div>
										<h3 className="text-lg font-bold text-gray-900">{teamTwoName}</h3>
										<span className={`text-xs font-semibold ${
											teamTwoLineup.filter(p => p.isStarter).length >= matchSize ? 'text-blue-600' : 'text-gray-500'
										}`}>
											{teamTwoLineup.filter(p => p.isStarter).length}/{matchSize} starters
										</span>
									</div>
								</div>
								{canManage() && match && (
									<button
										onClick={() => openAddLineupModal(schedule.teamTwoId)}
										className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm font-medium flex items-center gap-2 shadow-md transition-all"
									>
										<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
											<line x1="12" y1="5" x2="12" y2="19" />
											<line x1="5" y1="12" x2="19" y2="12" />
										</svg>
										Add Player
									</button>
								)}
							</div>

							{teamTwoLineup.length === 0 ? (
								<div className="text-center py-12 bg-gray-50 rounded-xl border-2 border-dashed border-gray-300">
									<svg className="mx-auto h-12 w-12 text-gray-400 mb-3" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z" />
									</svg>
									<p className="text-gray-500 font-medium">No lineup set yet</p>
									{canManage() && (
										<button
											onClick={() => openAddLineupModal(schedule.teamTwoId)}
											className="mt-3 text-red-600 hover:text-red-700 text-sm font-medium"
										>
											Add first player
										</button>
									)}
								</div>
							) : (
								<>
									{renderFormationView(teamTwoLineup, 'red')}
									{renderSubstitutesBench(teamTwoLineup, 'red')}
								</>
							)}
						</div>
					</div>
				</div>
			</div>

			{/* Modal */}
			{showLineupModal && (
				<div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
					<div className="bg-white rounded-2xl shadow-2xl w-full max-w-md transform transition-all">
						<div className="bg-gradient-to-r from-blue-600 to-blue-700 px-6 py-4 rounded-t-2xl">
							<div className="flex items-center justify-between">
								<h2 className="text-xl font-bold text-white flex items-center gap-2">
									<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"/>
										<circle cx="12" cy="7" r="4"/>
									</svg>
									{editingLineup ? 'Edit Player' : 'Add Player to Lineup'}
								</h2>
								<button 
									onClick={() => setShowLineupModal(false)} 
									className="text-white/80 hover:text-white transition-colors"
								>
									<svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
								</button>
							</div>
						</div>

						<div className="p-6">
							{modalError && (
								<div className="mb-4 p-4 rounded-lg bg-red-50 border-l-4 border-red-500 flex items-start gap-3">
									<svg className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
										<path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
									</svg>
									<p className="text-red-700 text-sm font-medium">{modalError}</p>
								</div>
							)}

							<div className="space-y-5">
								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">Team *</label>
									<select
										value={lineupForm.clubId}
										onChange={(e) => setLineupForm({ ...lineupForm, clubId: e.target.value, userId: '' })}
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										disabled={!!editingLineup}
									>
										<option value="">Select Team</option>
										<option value={schedule?.teamOneId}>{teamOneName}</option>
										<option value={schedule?.teamTwoId}>{teamTwoName}</option>
									</select>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">Player *</label>
									<select
										value={lineupForm.userId}
										onChange={(e) => setLineupForm({ ...lineupForm, userId: e.target.value })}
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
										disabled={!lineupForm.clubId || !!editingLineup}
									>
										<option value="">Select Player</option>
										{getAvailablePlayersForClub(lineupForm.clubId).map((p) => (
											<option key={p.userId} value={p.userId}>{p.firstName} {p.lastName}</option>
										))}
										{!editingLineup && lineupForm.clubId && getAvailablePlayersForClub(lineupForm.clubId).length === 0 && (
											<option value="" disabled>All players from this team are already in lineup</option>
										)}
									</select>
								</div>

								<div>
									<label className="block text-sm font-semibold text-gray-700 mb-2">Position</label>
									<select
										value={lineupForm.position}
										onChange={(e) => setLineupForm({ ...lineupForm, position: e.target.value })}
										className="w-full px-4 py-3 border-2 border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
									>
										<option value="">Select Position</option>
										<option value="Goalkeeper">🥅 Goalkeeper</option>
										<option value="Defender">🛡️ Defender</option>
										<option value="Midfielder">⚡ Midfielder</option>
										<option value="Forward">⚽ Forward</option>
									</select>
								</div>

								<div className="bg-gray-50 rounded-xl p-4 border-2 border-gray-200">
									<div className="flex items-center gap-3">
										<input
											type="checkbox"
											id="isStarter"
											checked={lineupForm.isStarter}
											onChange={(e) => setLineupForm({ ...lineupForm, isStarter: e.target.checked })}
											className="w-5 h-5 text-blue-600 border-gray-300 rounded focus:ring-blue-500 cursor-pointer"
										/>
										<label htmlFor="isStarter" className="text-sm font-semibold text-gray-700 cursor-pointer flex items-center gap-2">
											<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
												<polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
											</svg>
											Starting XI Player
										</label>
									</div>
									<p className="text-xs text-gray-500 mt-2 ml-8">Uncheck to add as substitute</p>
								</div>
							</div>

							<div className="flex gap-3 mt-6">
								<button
									onClick={() => setShowLineupModal(false)}
									className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
								>
									Cancel
								</button>
								<button
									onClick={handleLineupSubmit}
									disabled={modalLoading}
									className="flex-1 px-4 py-3 bg-gradient-to-r from-blue-600 to-blue-700 text-white font-semibold rounded-xl hover:from-blue-700 hover:to-blue-800 disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg"
								>
									{modalLoading ? (
										<span className="flex items-center justify-center gap-2">
											<svg className="animate-spin h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor">
												<circle className="opacity-25" cx="12" cy="12" r="10" strokeWidth="4"/>
												<path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"/>
											</svg>
											Saving...
										</span>
									) : editingLineup ? 'Update Player' : 'Add to Lineup'}
								</button>
							</div>
						</div>
					</div>
				</div>
			)}
		</>
	)
}