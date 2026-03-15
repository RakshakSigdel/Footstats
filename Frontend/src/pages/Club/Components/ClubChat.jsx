import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { createClubMessage, deleteClubMessage, getClubMessages } from "../../../services/api.messages";

const CHAT_REFRESH_MS = 5000;

export default function ClubChat({ clubId, currentUser }) {
	const [messages, setMessages] = useState([]);
	const [newMessage, setNewMessage] = useState("");
	const [loading, setLoading] = useState(true);
	const [sending, setSending] = useState(false);
	const [deletingId, setDeletingId] = useState(null);
	const [error, setError] = useState(null);
	const messageEndRef = useRef(null);

	const sortedMessages = useMemo(
		() => [...messages].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt)),
		[messages]
	);

	const loadMessages = useCallback(async (isInitial = false) => {
		if (!clubId) return;

		if (isInitial) {
			setLoading(true);
			setError(null);
		}

		try {
			const data = await getClubMessages(clubId);
			setMessages(Array.isArray(data) ? data : []);
		} catch (err) {
			if (isInitial) {
				setError(err?.message || "Failed to load chat");
			}
		} finally {
			if (isInitial) setLoading(false);
		}
	}, [clubId]);

	useEffect(() => {
		loadMessages(true);
		const interval = setInterval(() => loadMessages(false), CHAT_REFRESH_MS);
		return () => clearInterval(interval);
	}, [loadMessages]);

	useEffect(() => {
		if (!messageEndRef.current) return;
		messageEndRef.current.scrollIntoView({ behavior: "smooth" });
	}, [sortedMessages.length]);

	const getProfilePhotoUrl = (photoPath) => {
		if (!photoPath) return null;
		return photoPath.startsWith("http") ? photoPath : `http://localhost:5555${photoPath}`;
	};

	const getSenderName = (message) => {
		const firstName = message?.user?.firstName || "User";
		const lastName = message?.user?.lastName || "";
		return `${firstName} ${lastName}`.trim();
	};

	const formatMessageTime = (dateValue) => {
		if (!dateValue) return "";
		const date = new Date(dateValue);
		return date.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
	};

	const isOwnMessage = (message) => {
		const messageUserId = message?.userId ?? message?.user?.userId;
		return Number(messageUserId) === Number(currentUser?.userId);
	};

	const handleSend = async () => {
		const content = newMessage.trim();
		if (!content || !clubId || sending) return;

		setSending(true);
		setError(null);
		try {
			const createdMessage = await createClubMessage(clubId, content);
			setMessages((prev) => [...prev, createdMessage]);
			setNewMessage("");
		} catch (err) {
			setError(err?.message || "Failed to send message");
		} finally {
			setSending(false);
		}
	};

	const handleDelete = async (messageId) => {
		if (!messageId || deletingId) return;

		setDeletingId(messageId);
		setError(null);
		try {
			await deleteClubMessage(messageId);
			setMessages((prev) => prev.filter((message) => message.messageId !== messageId));
		} catch (err) {
			setError(err?.message || "Failed to delete message");
		} finally {
			setDeletingId(null);
		}
	};

	const handleKeyDown = (event) => {
		if (event.key === "Enter" && !event.shiftKey) {
			event.preventDefault();
			handleSend();
		}
	};

	return (
		<div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
			<h2 className="text-xl font-bold text-gray-900 mb-4">Club Chat</h2>

			{error && (
				<div className="mb-4 p-3 rounded-lg border border-red-200 bg-red-50 text-red-700 text-sm">
					{error}
				</div>
			)}

			<div className="h-104 overflow-y-auto border border-gray-200 rounded-xl p-4 bg-gray-50 space-y-3">
				{loading ? (
					<p className="text-gray-500 text-sm">Loading messages...</p>
				) : sortedMessages.length === 0 ? (
					<p className="text-gray-500 text-sm">No messages yet. Start the conversation.</p>
				) : (
					sortedMessages.map((message) => {
						const ownMessage = isOwnMessage(message);
						const avatar = getProfilePhotoUrl(message?.user?.profilePhoto);

						return (
							<div
								key={message.messageId}
								className={`flex ${ownMessage ? "justify-end" : "justify-start"}`}
							>
								<div
									className={`max-w-[80%] rounded-xl px-3 py-2 border ${
										ownMessage
											? "bg-blue-600 text-white border-blue-600"
											: "bg-white text-gray-900 border-gray-200"
									}`}
								>
									<div className="flex items-center gap-2 mb-1">
										{avatar ? (
											<img
												src={avatar}
												alt={getSenderName(message)}
												className="w-5 h-5 rounded-full object-cover"
											/>
										) : (
											<div
												className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-bold ${
													ownMessage ? "bg-blue-500 text-white" : "bg-gray-200 text-gray-700"
												}`}
											>
												{getSenderName(message).charAt(0).toUpperCase()}
											</div>
										)}
										<span className={`text-xs font-semibold ${ownMessage ? "text-blue-100" : "text-gray-700"}`}>
											{getSenderName(message)}
										</span>
										<span className={`text-[11px] ${ownMessage ? "text-blue-100" : "text-gray-500"}`}>
											{formatMessageTime(message.createdAt)}
										</span>
									</div>

									  <p className="text-sm whitespace-pre-wrap wrap-break-word">{message.content}</p>

									{ownMessage && (
										<div className="mt-2 flex justify-end">
											<button
												type="button"
												onClick={() => handleDelete(message.messageId)}
												disabled={deletingId === message.messageId}
												className="text-xs text-red-100 hover:text-white disabled:opacity-60"
											>
												{deletingId === message.messageId ? "Deleting..." : "Delete"}
											</button>
										</div>
									)}
								</div>
							</div>
						);
					})
				)}

				<div ref={messageEndRef} />
			</div>

			<div className="mt-4 flex gap-3">
				<textarea
					value={newMessage}
					onChange={(event) => setNewMessage(event.target.value)}
					onKeyDown={handleKeyDown}
					placeholder="Type your message..."
					  className="flex-1 min-h-12 max-h-28 resize-y rounded-xl border border-gray-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-200"
				/>
				<button
					type="button"
					onClick={handleSend}
					disabled={!newMessage.trim() || sending}
					className="px-5 py-2 rounded-xl bg-blue-600 text-white text-sm font-semibold hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed"
				>
					{sending ? "Sending..." : "Send"}
				</button>
			</div>
		</div>
	);
}
