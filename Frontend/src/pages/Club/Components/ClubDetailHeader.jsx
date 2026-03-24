import { motion } from "framer-motion";
import { MotionButton } from "../../../components/ui/motion";

export default function ClubDetailHeader({
	clubData,
	clubSchedules,
	isClubAdmin,
	isClubMember,
	myRequestStatus,
	logoFile,
	uploadingLogo,
	uploadLogoError,
	getClubLogoUrl,
	onLogoChange,
	onCancelLogoUpload,
	onUploadLogo,
	onOpenJoinModal,
	onLeaveClub,
	onOpenEditModal,
}) {
	return (
		<motion.div
			initial={{ opacity: 0, y: 16 }}
			animate={{ opacity: 1, y: 0 }}
			transition={{ delay: 0.1 }}
			className="app-card p-6 md:p-8 mb-6 relative"
		>
			<div className="absolute top-6 right-6 md:top-8 md:right-8 text-right">
				<div className="text-4xl md:text-5xl font-bold gradient-text font-['Outfit']">{clubSchedules.length}</div>
				<div className="text-sm text-surface-500">Schedules</div>
			</div>

			<div className="flex items-start gap-5 md:gap-6 pr-32 md:pr-48">
				<div className="relative flex-shrink-0">
					<div className="w-16 h-16 md:w-20 md:h-20 bg-gradient-to-br from-primary-600 to-primary-700 rounded-2xl flex items-center justify-center overflow-hidden shadow-lg shadow-primary-600/20">
						{getClubLogoUrl() ? (
							<img src={getClubLogoUrl()} alt={`${clubData.name} logo`} className="w-full h-full object-cover" />
						) : (
							<svg width="40" height="32" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
								<path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6" />
								<path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18" />
								<path d="M4 22h16" />
								<path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22" />
								<path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22" />
								<path d="M18 2H6v7a6 6 0 0 0 12 0V2Z" />
							</svg>
						)}
					</div>

					{isClubAdmin && (
						<label className="absolute bottom-0 right-0 w-7 h-7 bg-primary-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-primary-700 transition-colors shadow-lg">
							<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
								<path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
								<circle cx="12" cy="13" r="4" />
							</svg>
							<input type="file" accept="image/*" onChange={onLogoChange} className="hidden" />
						</label>
					)}
				</div>

				<div className="flex-1">
					<div className="flex items-center gap-3 mb-2">
						<h1 className="text-2xl md:text-3xl font-bold text-gray-900 font-['Outfit']">{clubData.name}</h1>
						<span className="text-accent-400 text-2xl">●</span>
					</div>

					<p className="text-sm md:text-base text-surface-600 mb-4">
						{clubData.foundedDate ? `Founded ${new Date(clubData.foundedDate).getFullYear()} • ` : ""}
						{clubData.location ?? ""}
					</p>

					<div className="flex flex-wrap gap-3">
						{!isClubAdmin && !isClubMember && (
							<MotionButton
								onClick={() => myRequestStatus !== "PENDING" && onOpenJoinModal()}
								disabled={myRequestStatus === "PENDING"}
								className={`px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-medium flex items-center gap-2 transition-colors ${
									myRequestStatus === "PENDING"
										? "bg-accent-400 text-white cursor-not-allowed"
										: "btn-primary"
								}`}
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
									<circle cx="8.5" cy="7" r="4" />
									<line x1="20" y1="8" x2="20" y2="14" />
									<line x1="23" y1="11" x2="17" y2="11" />
								</svg>
								{myRequestStatus === "PENDING" ? "Request Pending" : "Request to Join Club"}
							</MotionButton>
						)}

						{isClubMember && !isClubAdmin && (
							<MotionButton
								onClick={onLeaveClub}
								className="px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-medium flex items-center gap-2 transition-colors bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
							>
								<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
									<path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
									<polyline points="16 17 21 12 16 7" />
									<line x1="21" y1="12" x2="9" y2="12" />
								</svg>
								Leave Club
							</MotionButton>
						)}

						{isClubAdmin && (
							<>
								<MotionButton className="btn-primary px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-medium flex items-center gap-2">
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
										<circle cx="9" cy="7" r="4" />
										<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
										<path d="M16 3.13a4 4 0 0 1 0 7.75" />
									</svg>
									Invite Members
								</MotionButton>

								<MotionButton
									onClick={onOpenEditModal}
									className="bg-surface-800 hover:bg-surface-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-xl font-medium flex items-center gap-2 transition-colors"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
										<path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
									</svg>
									Edit Club
								</MotionButton>
							</>
						)}
					</div>

					{logoFile && isClubAdmin && (
						<div className="mt-4 p-3 bg-primary-50 border border-primary-200 rounded-xl">
							<div className="flex items-center justify-between">
								<div className="flex items-center gap-2">
									<svg className="w-5 h-5 text-primary-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
										<path
											strokeLinecap="round"
											strokeLinejoin="round"
											strokeWidth={2}
											d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
										/>
									</svg>
									<span className="text-sm font-medium text-primary-900">New logo selected</span>
								</div>
								<div className="flex gap-2">
									<button
										onClick={onCancelLogoUpload}
										className="btn-secondary px-3 py-1.5 text-sm"
										disabled={uploadingLogo}
									>
										Cancel
									</button>
									<MotionButton
										onClick={onUploadLogo}
										disabled={uploadingLogo}
										className="btn-primary px-3 py-1.5 text-sm disabled:opacity-50"
									>
										{uploadingLogo ? "Uploading..." : "Upload Logo"}
									</MotionButton>
								</div>
							</div>
						</div>
					)}

					{uploadLogoError && (
						<div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-xl text-sm text-red-700">{uploadLogoError}</div>
					)}
				</div>
			</div>
		</motion.div>
	);
}
