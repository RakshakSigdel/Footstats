//Route - URL/club/{clubid}

import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import Sidebar from "../../components/Global/Sidebar";
import Topbar from "../../components/Global/Topbar";
import { getClubById, updateClub, getClubMembers, removeClubMember, updateMemberRole, updateMemberPosition, leaveClub, uploadClubLogo } from "../../services/api.clubs";
import { getClubSchedules } from "../../services/api.schedules";
import { getAllClubs } from "../../services/api.clubs";
import { getAllMatches } from "../../services/api.matches";
import { getPlayersByClubId } from "../../services/api.player";
import { getMyProfile } from "../../services/api.player";
import { getClubRequests, approveJoinRequest, rejectJoinRequest, createJoinRequest, getMyRequestStatus } from "../../services/api.requests";

import JoinClubRequest from './Components/JoinClubReqest';
import ConfirmClubRequest from './Components/ConfirmClubRequest';
import EditClub from './Components/EditClub';
import ClubOverview from './Components/ClubOverview';
import ClubMembers from './Components/ClubMembers';
import ClubTopPlayers from './Components/ClubTopPlayers';
import ClubMatches from './Components/ClubMatches';
import ClubRequests from './Components/ClubRequests';
import ClubChat from './Components/ClubChat';
import ClubDetailHeader from './Components/ClubDetailHeader';
import { getClubMessages } from '../../services/api.messages';


// Main ClubDetails Component
export default function ClubDetails() {
  const { clubId } = useParams();
  const navigate = useNavigate();
  const [clubData, setClubData] = useState(null);
  const [clubSchedules, setClubSchedules] = useState([]);
  const [clubsMap, setClubsMap] = useState({});
  const [clubPlayers, setClubPlayers] = useState([]);
  const [clubMembers, setClubMembers] = useState([]);
  const [clubRequests, setClubRequests] = useState([]);
  const [matches, setMatches] = useState([]);
  const [currentUser, setCurrentUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isJoinModalOpen, setIsJoinModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("overview");
  const [myRequestStatus, setMyRequestStatus] = useState(null); // null | 'PENDING'
  const [memberActionLoading, setMemberActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, confirmLabel, confirmStyle, onConfirm }
  const [editingPositionForUser, setEditingPositionForUser] = useState(null);
  const [positionDraft, setPositionDraft] = useState("");
  const [unreadChatCount, setUnreadChatCount] = useState(0);
  
  // Logo upload state
  const [logoFile, setLogoFile] = useState(null);
  const [logoPreview, setLogoPreview] = useState(null);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadLogoError, setUploadLogoError] = useState(null);

  const POSITIONS = [
    "Goalkeeper", "Center Back", "Left Back", "Right Back",
    "Defensive Midfielder", "Central Midfielder", "Attacking Midfielder",
    "Left Midfielder", "Right Midfielder", "Left Winger", "Right Winger", "Striker",
  ];

  useEffect(() => {
    if (!clubId) return;
    const load = async () => {
      setLoading(true);
      setError(null);
      try {
        const [club, schedules, allClubs, players, members, user, allMatches] = await Promise.all([
          getClubById(clubId),
          getClubSchedules(clubId).catch(() => []),
          getAllClubs().catch(() => []),
          getPlayersByClubId(clubId).catch(() => []),
          getClubMembers(clubId).catch(() => []),
          getMyProfile().catch(() => null),
          getAllMatches().catch(() => []),
        ]);
        setClubData(club);
        setClubSchedules(Array.isArray(schedules) ? schedules : []);
        setClubPlayers(Array.isArray(players) ? players : []);
        setClubMembers(Array.isArray(members) ? members : []);
        setCurrentUser(user);
        setMatches(Array.isArray(allMatches) ? allMatches : []);
        const map = {};
        (Array.isArray(allClubs) ? allClubs : []).forEach((c) => { if (c?.clubId) map[c.clubId] = c.name; });
        setClubsMap(map);

        // Check the current user's own request status (works for any logged-in user)
        if (user) {
          const myReq = await getMyRequestStatus(clubId).catch(() => null);
          setMyRequestStatus(myReq?.status || null);
        }

        // Load requests for admin (club creator or ADMIN role member)
        const isUserAdmin = user && (
          club?.createdBy === user.userId ||
          (Array.isArray(members) ? members : []).some(
            (m) => m.user?.userId === user.userId && m.role === "ADMIN"
          )
        );
        if (isUserAdmin) {
          const requests = await getClubRequests(clubId).catch(() => []);
          setClubRequests(Array.isArray(requests) ? requests : []);
        }
      } catch (err) {
        setError(err?.message || "Failed to load club");
        throw err;
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [clubId]);

  // Check if current user is a member of the club
  const isClubMember = currentUser && (
    clubPlayers.some(player => player.userId === currentUser.userId) ||
    clubMembers.some(member => member.user?.userId === currentUser.userId)
  );
  const currentMemberRole = clubMembers.find(m => m.user?.userId === currentUser?.userId)?.role;
  const isClubCreator = currentUser && clubData && currentUser.userId === clubData.createdBy;
  const isClubAdmin = isClubCreator || currentMemberRole === "ADMIN";

  // Filter tabs based on user role
  const allTabs = [
    { id: "overview", label: "Overview", icon: "📊" },
    { id: "members", label: "Members", icon: "👥" },
    { id: "topPlayers", label: "Top Players", icon: "🏆" },
    { id: "matches", label: "Matches", icon: "⚽" },
    { id: "requests", label: "Requests", icon: "📬", adminOnly: true },
    { id: "chat", label: "Chat", icon: "💬", memberOnly: true },
  ];
  
  const tabs = allTabs.filter(tab =>
    (!tab.adminOnly || isClubAdmin) &&
    (!tab.memberOnly || isClubMember || isClubAdmin)
  );

  const chatReadStorageKey = currentUser?.userId && clubId
    ? `footstats_chat_last_read_${currentUser.userId}_${clubId}`
    : null;

  const chatThresholdStorageKey = currentUser?.userId && clubId
    ? `footstats_chat_threshold_notified_${currentUser.userId}_${clubId}`
    : null;

  const markChatAsRead = (timestamp) => {
    if (!chatReadStorageKey) return;
    const readAt = timestamp || new Date().toISOString();
    localStorage.setItem(chatReadStorageKey, readAt);
    if (chatThresholdStorageKey) {
      localStorage.setItem(chatThresholdStorageKey, "0");
    }
    setUnreadChatCount(0);
  };

  useEffect(() => {
    if (!clubId || !currentUser?.userId || !(isClubMember || isClubAdmin)) return;

    let isMounted = true;

    const requestBrowserNotificationPermission = async () => {
      if (!("Notification" in window)) return;
      if (Notification.permission === "default") {
        try {
          await Notification.requestPermission();
        } catch {
          // Ignore permission request errors to keep chat polling resilient.
        }
      }
    };

    const pollUnreadChat = async () => {
      try {
        const data = await getClubMessages(clubId);
        const allMessages = Array.isArray(data) ? data : [];
        const latestMessageAt = allMessages.length > 0
          ? allMessages.reduce((latest, message) => {
              const messageDate = new Date(message.createdAt || 0);
              return messageDate > latest ? messageDate : latest;
            }, new Date(0))
          : null;

        if (activeTab === "chat") {
          if (latestMessageAt) {
            markChatAsRead(latestMessageAt.toISOString());
          } else {
            markChatAsRead();
          }
          return;
        }

        const lastReadRaw = chatReadStorageKey ? localStorage.getItem(chatReadStorageKey) : null;
        const lastReadAt = lastReadRaw ? new Date(lastReadRaw) : new Date(0);

        const unreadCount = allMessages.filter((message) => {
          const messageUserId = Number(message?.userId ?? message?.user?.userId);
          if (messageUserId === Number(currentUser.userId)) return false;
          const createdAt = new Date(message?.createdAt || 0);
          return createdAt > lastReadAt;
        }).length;

        if (!isMounted) return;
        setUnreadChatCount(unreadCount);

        const hasAlreadyNotified = chatThresholdStorageKey
          ? localStorage.getItem(chatThresholdStorageKey) === "1"
          : false;

        if (unreadCount >= 10 && !hasAlreadyNotified) {
          await requestBrowserNotificationPermission();
          if ("Notification" in window && Notification.permission === "granted") {
            new Notification("FootStats Chat Alert", {
              body: `You have ${unreadCount} unread messages in club chat.`,
              icon: "/images/NoLogo.png",
            });
          }
          if (chatThresholdStorageKey) {
            localStorage.setItem(chatThresholdStorageKey, "1");
          }
        }

        if (unreadCount < 10 && chatThresholdStorageKey) {
          localStorage.setItem(chatThresholdStorageKey, "0");
        }
      } catch {
        // Silent fail to avoid noisy UI when chat fetch fails intermittently.
      }
    };

    pollUnreadChat();
    const interval = setInterval(pollUnreadChat, 8000);

    return () => {
      isMounted = false;
      clearInterval(interval);
    };
  }, [
    clubId,
    currentUser?.userId,
    activeTab,
    isClubMember,
    isClubAdmin,
    chatReadStorageKey,
    chatThresholdStorageKey,
  ]);

  const getProfilePhotoUrl = (photoPath) => {
    if (!photoPath) return null;
    return photoPath.startsWith('http') ? photoPath : `http://localhost:5555${photoPath}`;
  };

  const handleEditClub = async (updatedData) => {
    if (!clubId) return;
    try {
      await updateClub(clubId, updatedData);
      const updated = await getClubById(clubId);
      setClubData(updated);
      setIsEditModalOpen(false);
    } catch (err) {
      setError(err?.message || "Failed to update club");
      throw err;
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      // Validate file type
      if (!file.type.startsWith('image/')) {
        setUploadLogoError('Please select an image file');
        return;
      }
      // Validate file size (5MB)
      if (file.size > 5 * 1024 * 1024) {
        setUploadLogoError('Image size should be less than 5MB');
        return;
      }
      setLogoFile(file);
      setLogoPreview(URL.createObjectURL(file));
      setUploadLogoError(null);
    }
  };

  const handleUploadLogo = async () => {
    if (!logoFile || !clubId) return;
    setUploadingLogo(true);
    setUploadLogoError(null);
    try {
      await uploadClubLogo(clubId, logoFile);
      // Refresh club data to get the new logo URL
      const updated = await getClubById(clubId);
      setClubData(updated);
      setLogoFile(null);
      setLogoPreview(null);
    } catch (err) {
      setUploadLogoError(err?.message || 'Failed to upload logo');
    } finally {
      setUploadingLogo(false);
    }
  };

  const handleCancelLogoUpload = () => {
    setLogoFile(null);
    setLogoPreview(null);
    setUploadLogoError(null);
  };

  const getClubLogoUrl = () => {
    if (logoPreview) return logoPreview;
    if (clubData?.logo) {
      return clubData.logo.startsWith('http') 
        ? clubData.logo 
        : `http://localhost:5555${clubData.logo}`;
    }
    return null;
  };

  // Helper functions for matches
  const getMatchForSchedule = (scheduleId) => matches.find((m) => m.scheduleId === scheduleId);
  
  const now = new Date();
  const upcomingMatches = clubSchedules.filter((s) => !s.date || new Date(s.date) >= now).sort((a, b) => new Date(a.date) - new Date(b.date));
  const playedMatches = clubSchedules.filter((s) => s.date && new Date(s.date) < now).sort((a, b) => new Date(b.date) - new Date(a.date));

  const handleApproveRequest = async (requestId) => {
    try {
      console.log('Approving request:', requestId);
      await approveJoinRequest(requestId);
      // Reload requests and players
      const [requests, players] = await Promise.all([
        getClubRequests(clubId),
        getPlayersByClubId(clubId),
      ]);
      setClubRequests(Array.isArray(requests) ? requests : []);
      setClubPlayers(Array.isArray(players) ? players : []);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error approving request:', err);
      setError(err?.message || "Failed to approve request");
    }
  };

  const handleRejectRequest = async (requestId) => {
    try {
      console.log('Rejecting request:', requestId);
      await rejectJoinRequest(requestId);
      // Reload requests
      const requests = await getClubRequests(clubId);
      setClubRequests(Array.isArray(requests) ? requests : []);
      setError(null); // Clear any previous errors
    } catch (err) {
      console.error('Error rejecting request:', err);
      setError(err?.message || "Failed to reject request");
    }
  };

  const handleRequestToJoin = async (preferredPosition, whyJoin, additionalMessage) => {
    if (!clubId || !currentUser) return;
    await createJoinRequest(Number(clubId), preferredPosition, whyJoin, additionalMessage);
    setMyRequestStatus('PENDING');
  };

  const handleLeaveClub = () => {
    setConfirmModal({
      title: "Leave Club",
      message: "Are you sure you want to leave this club? You will need to request to join again.",
      confirmLabel: "Yes, Leave",
      confirmStyle: "red",
      onConfirm: async () => {
        setConfirmModal(null);
        try {
          await leaveClub(clubId);
          navigate("/clubs");
        } catch (err) {
          setError(err?.message || "Failed to leave club");
        }
      },
    });
  };

  const handleRemoveMember = (userId) => {    setConfirmModal({
      title: "Remove Member",
      message: "Are you sure you want to remove this member from the club?",
      confirmLabel: "Yes, Remove",
      confirmStyle: "red",
      onConfirm: async () => {
        setConfirmModal(null);
        setMemberActionLoading(userId);
        try {
              await removeClubMember(clubId, userId);
          const [players, members] = await Promise.all([
            getPlayersByClubId(clubId).catch(() => []),
            getClubMembers(clubId).catch(() => []),
          ]);
          setClubPlayers(Array.isArray(players) ? players : []);
          setClubMembers(Array.isArray(members) ? members : []);
          setError(null);
        } catch (err) {
          setError(err?.message || "Failed to remove member");
        } finally {
          setMemberActionLoading(null);
        }
      },
    });
  };

  const handleChangePosition = async (userId) => {
    if (!clubId || !positionDraft) return;
    setMemberActionLoading(userId);
    try {
      await updateMemberPosition(clubId, userId, positionDraft);
      const members = await getClubMembers(clubId).catch(() => []);
      setClubMembers(Array.isArray(members) ? members : []);
      setEditingPositionForUser(null);
      setPositionDraft("");
    } catch (err) {
      setError(err?.message || "Failed to update position");
    } finally {
      setMemberActionLoading(null);
    }
  };

  const handleToggleAdminRole = (userId, currentRole) => {
    if (!clubId) return;
    const newRole = currentRole === "ADMIN" ? "MEMBER" : "ADMIN";
    const isPromoting = newRole === "ADMIN";
    setConfirmModal({
      title: isPromoting ? "Make Admin" : "Demote to Member",
      message: isPromoting
        ? "This member will be able to manage other members and review join requests."
        : "This member will lose admin privileges.",
      confirmLabel: isPromoting ? "Yes, Make Admin" : "Yes, Demote",
      confirmStyle: isPromoting ? "yellow" : "default",
      onConfirm: async () => {
        setConfirmModal(null);
        setMemberActionLoading(userId);
        try {
          await updateMemberRole(clubId, userId, newRole);
          const [players, members] = await Promise.all([
            getPlayersByClubId(clubId).catch(() => []),
            getClubMembers(clubId).catch(() => []),
          ]);
          setClubPlayers(Array.isArray(players) ? players : []);
          setClubMembers(Array.isArray(members) ? members : []);
          setError(null);
        } catch (err) {
          setError(err?.message || "Failed to update member role");
        } finally {
          setMemberActionLoading(null);
        }
      },
    });
  };

  return (
    <div className="flex min-h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Topbar />

        <main className="flex-1 p-6 md:p-8 overflow-auto bg-[#eef1f6]">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-blue-600 hover:text-blue-700 mb-6 font-medium"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M19 12H5M12 19l-7-7 7-7" />
            </svg>
            Back
          </button>

          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-700">{error}</div>
          )}
          {loading && <div className="mb-6 text-gray-500">Loading club...</div>}
          {!clubData && !loading && (
            <div className="mb-6 text-gray-500">Club not found.</div>
          )}

          {clubData && (
          <>
          <ClubDetailHeader
            clubData={clubData}
            clubSchedules={clubSchedules}
            isClubAdmin={isClubAdmin}
            isClubMember={isClubMember}
            myRequestStatus={myRequestStatus}
            logoFile={logoFile}
            uploadingLogo={uploadingLogo}
            uploadLogoError={uploadLogoError}
            getClubLogoUrl={getClubLogoUrl}
            onLogoChange={handleLogoChange}
            onCancelLogoUpload={handleCancelLogoUpload}
            onUploadLogo={handleUploadLogo}
            onOpenJoinModal={() => setIsJoinModalOpen(true)}
            onLeaveClub={handleLeaveClub}
            onOpenEditModal={() => setIsEditModalOpen(true)}
          />

          <div className="bg-white rounded-xl shadow-sm border border-gray-100 mb-6 overflow-hidden">
            <div className="flex items-center border-b border-gray-200">
              {tabs.map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex-1 px-6 py-4 text-sm font-semibold transition-all relative flex items-center justify-center gap-2 ${
                    activeTab === tab.id ? "text-blue-600 bg-blue-50" : "text-gray-600 hover:text-gray-900 hover:bg-gray-50"
                  }`}
                >
                  <span className="text-lg">{tab.icon}</span>
                  <span>{tab.label}</span>
                  {tab.id === "requests" && clubRequests.length > 0 && (
                    <span className="ml-1 min-w-[1.25rem] h-5 px-1 flex items-center justify-center rounded-full bg-red-500 text-white text-xs font-bold leading-none">
                      {clubRequests.length > 99 ? "99+" : clubRequests.length}
                    </span>
                  )}
                  {tab.id === "chat" && unreadChatCount > 0 && (
                    <span className="ml-1 min-w-[1.25rem] h-5 px-1.5 flex items-center justify-center rounded-full bg-blue-600 text-white text-xs font-bold leading-none shadow-sm">
                      {unreadChatCount > 99 ? "99+" : unreadChatCount}
                    </span>
                  )}
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <ClubOverview
              clubData={clubData}
              clubSchedules={clubSchedules}
              clubsMap={clubsMap}
            />
          )}

          {activeTab === "members" && (
            <ClubMembers
              clubMembers={clubMembers}
              clubData={clubData}
              currentUser={currentUser}
              isClubAdmin={isClubAdmin}
              getProfilePhotoUrl={getProfilePhotoUrl}
              editingPositionForUser={editingPositionForUser}
              setEditingPositionForUser={setEditingPositionForUser}
              positionDraft={positionDraft}
              setPositionDraft={setPositionDraft}
              POSITIONS={POSITIONS}
              memberActionLoading={memberActionLoading}
              handleChangePosition={handleChangePosition}
              handleToggleAdminRole={handleToggleAdminRole}
              handleRemoveMember={handleRemoveMember}
              onNavigateToPlayer={(userId) => navigate(`/player/${userId}`)}
            />
          )}

          {activeTab === "topPlayers" && (
            <ClubTopPlayers
              clubPlayers={clubPlayers}
              getProfilePhotoUrl={getProfilePhotoUrl}
              onNavigateToPlayer={(userId) => navigate(`/player/${userId}`)}
            />
          )}

          {activeTab === "matches" && (
            <ClubMatches
              clubSchedules={clubSchedules}
              upcomingMatches={upcomingMatches}
              playedMatches={playedMatches}
              clubsMap={clubsMap}
              getMatchForSchedule={getMatchForSchedule}
              onNavigateToSchedule={(scheduleId) => navigate(`/schedule/${scheduleId}`)}
            />
          )}

          {activeTab === "requests" && (
            <ClubRequests
              isClubAdmin={isClubAdmin}
              clubRequests={clubRequests}
              handleApproveRequest={handleApproveRequest}
              handleRejectRequest={handleRejectRequest}
            />
          )}

          {activeTab === "chat" && (
            <ClubChat
              clubId={clubId}
              currentUser={currentUser}
              onMarkRead={markChatAsRead}
            />
          )}

          <EditClub
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onEditClub={handleEditClub}
            clubData={{ name: clubData.name, description: clubData.description, location: clubData.location }}
          />
          <JoinClubRequest
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            onSubmit={handleRequestToJoin}
          />
          <ConfirmClubRequest
            isOpen={!!confirmModal}
            title={confirmModal?.title}
            message={confirmModal?.message}
            confirmLabel={confirmModal?.confirmLabel}
            confirmStyle={confirmModal?.confirmStyle}
            onConfirm={confirmModal?.onConfirm}
            onCancel={() => setConfirmModal(null)}
          />
          </>
          )}
        </main>
      </div>
    </div>
  );
}