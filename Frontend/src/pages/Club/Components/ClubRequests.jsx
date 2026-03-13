export default function ClubRequests({ isClubAdmin, clubRequests, handleApproveRequest, handleRejectRequest }) {
	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h2 className="text-xl font-bold text-gray-900 mb-6">Join Requests</h2>
			{!isClubAdmin ? (
				<p className="text-gray-500">Only club admins can view join requests.</p>
			) : clubRequests.length === 0 ? (
				<p className="text-gray-500">No pending join requests.</p>
			) : (
				<div className="space-y-3">
					{clubRequests.map((request) => (
						<div
							key={request.requestId}
							className="flex items-center justify-between p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
						>
							<div className="flex items-start gap-4 flex-1">
								<div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
									<span className="text-blue-700 font-bold text-lg">{request.user?.firstName?.charAt(0) || "?"}</span>
								</div>
								<div className="flex-1 min-w-0">
									<div className="font-semibold text-gray-900">
										{request.user?.firstName} {request.user?.lastName}
									</div>
									<div className="text-sm text-blue-700 font-medium mt-0.5">
										Position: {request.preferredPosition || "-"}
									</div>
									{request.whyJoin && (
										<div className="mt-2">
											<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Why they want to join</span>
											<p className="text-sm text-gray-700 mt-0.5">{request.whyJoin}</p>
										</div>
									)}
									{request.additionalMessage && (
										<div className="mt-2">
											<span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Additional message</span>
											<p className="text-sm text-gray-700 mt-0.5">{request.additionalMessage}</p>
										</div>
									)}
								</div>
							</div>
							<div className="flex items-center gap-2 flex-shrink-0">
								<button
									onClick={() => handleApproveRequest(request.requestId)}
									className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<polyline points="20 6 9 17 4 12" />
									</svg>
									Accept
								</button>
								<button
									onClick={() => handleRejectRequest(request.requestId)}
									className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded-lg font-medium transition-colors flex items-center gap-1"
								>
									<svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
										<line x1="18" y1="6" x2="6" y2="18" />
										<line x1="6" y1="6" x2="18" y2="18" />
									</svg>
									Deny
								</button>
							</div>
						</div>
					))}
				</div>
			)}
		</div>
	);
}
