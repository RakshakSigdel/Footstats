export default function ClubMembers({
	clubMembers,
	clubData,
	currentUser,
	isClubAdmin,
	getProfilePhotoUrl,
	editingPositionForUser,
	setEditingPositionForUser,
	positionDraft,
	setPositionDraft,
	POSITIONS,
	memberActionLoading,
	handleChangePosition,
	handleToggleAdminRole,
	handleRemoveMember,
	onNavigateToPlayer,
}) {
	return (
		<div className="app-card p-6">
			<div className="flex items-center justify-between mb-6">
				<h2 className="text-xl font-bold text-gray-900 font-['Outfit']">Team Members</h2>
				<span className="text-sm text-surface-500 bg-surface-100 px-3 py-1 rounded-full font-medium">
					{clubMembers.length} member{clubMembers.length !== 1 ? "s" : ""}
				</span>
			</div>

			{clubMembers.length === 0 ? (
				<p className="text-surface-500 text-center py-6">No members in this club yet.</p>
			) : (
				<div className="space-y-3">
					{clubMembers.map((member) => {
						const isCreator = clubData && member.user?.userId === clubData.createdBy;
						const isCurrentUser = member.user?.userId === currentUser?.userId;
						const canManageMember = isClubAdmin && !isCreator && !isCurrentUser;

						return (
							<div
								key={member.user?.userId || member.userId}
								className={`flex items-center justify-between p-4 border rounded-xl transition-all ${
									isCurrentUser ? "border-primary-300 bg-primary-50/50" : "border-surface-200 hover:border-primary-200 hover:bg-primary-50/30"
								}`}
							>
								<div className="flex items-center gap-4 flex-1">
									<div className="w-12 h-12 bg-gradient-to-br from-primary-600 to-primary-700 rounded-xl flex items-center justify-center flex-shrink-0 shadow-md shadow-primary-600/10">
										{getProfilePhotoUrl(member.user?.profilePhoto) ? (
											<img
												src={getProfilePhotoUrl(member.user.profilePhoto)}
												alt={member.user?.firstName}
												className="w-full h-full rounded-xl object-cover"
											/>
										) : (
											<span className="text-white font-bold text-lg">
												{member.user?.firstName?.[0]}
												{member.user?.lastName?.[0]}
											</span>
										)}
									</div>

									<div className="flex-1">
										<div className="flex items-center gap-2 mb-1 flex-wrap">
											<h3
												className="font-semibold text-gray-900 hover:text-primary-600 cursor-pointer transition-colors"
												onClick={() => onNavigateToPlayer(member.user?.userId)}
											>
												{member.user?.firstName} {member.user?.lastName}
											</h3>
											{isCurrentUser && (
												<span className="bg-primary-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">You</span>
											)}
											{isCreator && (
												<span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">
													Owner
												</span>
											)}
											{member.role === "ADMIN" && !isCreator && (
												<span className="bg-accent-400/20 text-accent-600 px-2 py-0.5 rounded-full text-xs font-medium">
													Admin
												</span>
											)}
										</div>
										<p className="text-sm text-surface-600">{member.user?.position || "No position assigned"}</p>
									</div>
								</div>

								<div className="flex items-center gap-4">
									<div className="hidden sm:flex items-center gap-6 text-center mr-4">
										<div>
											<div className="text-xl font-bold text-gray-900 font-['Outfit']">{member.user?.appearances || 0}</div>
											<div className="text-xs text-surface-500">Apps</div>
										</div>
										<div>
											<div className="text-xl font-bold text-primary-600 font-['Outfit']">{member.user?.goals || 0}</div>
											<div className="text-xs text-surface-500">Goals</div>
										</div>
									</div>

									{canManageMember && (
										<div className="flex flex-col items-end gap-2">
											<div className="flex items-center gap-2">
												{editingPositionForUser === member.user?.userId ? (
													<div className="flex items-center gap-1">
														<select
															value={positionDraft}
															onChange={(e) => setPositionDraft(e.target.value)}
															className="text-xs px-2 py-1"
														>
															<option value="">Select position</option>
															{POSITIONS.map((p) => (
																<option key={p} value={p}>
																	{p}
																</option>
															))}
														</select>
														<button
															onClick={() => handleChangePosition(member.user?.userId)}
															disabled={!positionDraft || memberActionLoading === member.user?.userId}
															className="btn-primary px-2 py-1 text-xs disabled:opacity-50"
														>
															{memberActionLoading === member.user?.userId ? "..." : "Save"}
														</button>
														<button
															onClick={() => {
																setEditingPositionForUser(null);
																setPositionDraft("");
															}}
															className="btn-secondary px-2 py-1 text-xs"
														>
															Cancel
														</button>
													</div>
												) : (
													<button
														onClick={() => {
															setEditingPositionForUser(member.user?.userId);
															setPositionDraft(member.user?.position || "");
														}}
														className="px-3 py-1.5 bg-primary-50 text-primary-700 hover:bg-primary-100 rounded-xl text-xs font-medium transition-colors border border-primary-200"
														title="Change position"
													>
														⚽ Position
													</button>
												)}

												<button
													onClick={() => handleToggleAdminRole(member.user?.userId, member.role)}
													disabled={memberActionLoading === member.user?.userId}
													className={`px-3 py-1.5 rounded-xl text-xs font-medium transition-colors border ${
														member.role === "ADMIN"
															? "bg-surface-50 text-surface-700 hover:bg-surface-100 border-surface-200"
															: "bg-accent-400/10 text-accent-600 hover:bg-accent-400/20 border-accent-400/30"
													}`}
													title={member.role === "ADMIN" ? "Demote to Member" : "Promote to Admin"}
												>
													{memberActionLoading === member.user?.userId
														? "..."
														: member.role === "ADMIN"
															? "Demote"
															: "Make Admin"}
												</button>

												<button
													onClick={() => handleRemoveMember(member.user?.userId)}
													disabled={memberActionLoading === member.user?.userId}
													className="p-1.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
													title="Remove from club"
												>
													<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
														<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
														<circle cx="8.5" cy="7" r="4" />
														<line x1="18" y1="8" x2="23" y2="13" />
														<line x1="23" y1="8" x2="18" y2="13" />
													</svg>
												</button>
											</div>
										</div>
									)}
								</div>
							</div>
						);
					})}
				</div>
			)}
		</div>
	);
}
