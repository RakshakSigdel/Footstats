import { MotionButton } from "../../../components/ui/motion";

export default function ClubRequests({ isClubAdmin, clubRequests, handleApproveRequest, handleRejectRequest }) {
	return (
		<div className="app-card p-6">
			<h2 className="text-xl font-bold text-gray-900 mb-6 font-['Outfit']">Join Requests</h2>
			{!isClubAdmin ? (
				<p className="text-surface-500 text-center py-6">Only club admins can view join requests.</p>
			) : clubRequests.length === 0 ? (
				<p className="text-surface-500 text-center py-6">No pending join requests.</p>
			) : (
				<div className="space-y-3">
					{clubRequests.map((request) => (
						<div
							key={request.requestId}
							className="flex items-center justify-between p-4 border border-surface-200 rounded-xl hover:border-primary-200 hover:bg-primary-50/30 transition-all"
						>
							<div className="flex items-start gap-4 flex-1">
								<div className="w-12 h-12 bg-primary-100 rounded-xl flex items-center justify-center flex-shrink-0 border border-primary-200">
									<span className="text-primary-700 font-bold text-lg">{request.user?.firstName?.charAt(0) || "?"}</span>
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-gray-900">
										{request.user?.firstName} {request.user?.lastName}
									</div>
									<div className="text-sm text-primary-700 font-medium mt-0.5">
										Position: {request.preferredPosition || "-"}
									</div>
									{request.whyJoin && (
										<div className="mt-2">
											<span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Why they want to join</span>
											<p className="text-sm text-surface-700 mt-0.5">{request.whyJoin}</p>
										</div>
									)}
									{request.additionalMessage && (
										<div className="mt-2">
											<span className="text-xs font-semibold text-surface-500 uppercase tracking-wide">Additional message</span>
											<p className="text-sm text-surface-700 mt-0.5">{request.additionalMessage}</p>
										</div>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2 flex-shrink-0">
								<MotionButton
									onClick={() => handleApproveRequest(request.requestId)}
									className="btn-primary px-4 py-2 rounded-xl text-sm font-medium flex items-center gap-1"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<polyline points="20 6 9 17 4 12" />
									</svg>
									Accept
								</MotionButton>
								<MotionButton
									onClick={() => handleRejectRequest(request.requestId)}
									className="px-4 py-2 rounded-xl text-sm font-medium text-red-600 border border-red-200 bg-red-50 hover:bg-red-100 transition-colors flex items-center gap-1"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
									Deny
								</MotionButton>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
