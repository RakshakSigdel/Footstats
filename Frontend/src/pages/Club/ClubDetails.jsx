import React, { useState, useEffect } from "react";
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

// EditClub Modal Component
const EditClub = ({ isOpen, onClose, onEditClub, clubData }) => {
  const [formData, setFormData] = useState({
    clubName: "",
    description: "",
    location: "",
  });

  useEffect(() => {
    if (clubData) {
      setFormData({
        clubName: clubData.name ?? "",
        description: clubData.description ?? "",
        location: clubData.location ?? "",
      });
    }
  }, [clubData]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    onEditClub({
      name: formData.clubName,
      description: formData.description,
      location: formData.location,
    });
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Edit Club</h2>
          <p className="text-sm text-gray-500 mt-1">Update club information</p>
          <button
            onClick={onClose}
            className="absolute top-5 right-5 text-gray-400 hover:text-gray-700"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
              />
            </svg>
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Club Name
            </label>
            <input
              type="text"
              name="clubName"
              value={formData.clubName}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Description
            </label>
            <textarea
              name="description"
              value={formData.description}
              onChange={handleInputChange}
              rows={4}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button
              type="button"
              onClick={onClose}
              className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 bg-slate-900 text-white rounded-lg hover:bg-slate-800"
            >
              Save Changes
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};


// JoinRequest Modal Component
const JoinRequestModal = ({ isOpen, onClose, onSubmit }) => {
  const [formData, setFormData] = useState({
    preferredPosition: "",
    whyJoin: "",
    additionalMessage: "",
  });
  const [submitting, setSubmitting] = useState(false);
  const [formError, setFormError] = useState("");

  const positions = [
    "Goalkeeper",
    "Center Back",
    "Left Back",
    "Right Back",
    "Defensive Midfielder",
    "Central Midfielder",
    "Attacking Midfielder",
    "Left Midfielder",
    "Right Midfielder",
    "Left Winger",
    "Right Winger",
    "Striker",
  ];

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.preferredPosition) {
      setFormError("Preferred position is required.");
      return;
    }
    setFormError("");
    setSubmitting(true);
    try {
      await onSubmit(formData.preferredPosition, formData.whyJoin, formData.additionalMessage);
      setFormData({ preferredPosition: "", whyJoin: "", additionalMessage: "" });
      onClose();
    } catch (err) {
      setFormError(err?.message || "Failed to send request");
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-lg mx-4 shadow-2xl overflow-hidden">
        <div className="relative px-6 pt-6 pb-4 border-b border-gray-200">
          <h2 className="text-2xl font-bold text-gray-900">Request to Join Club</h2>
          <p className="text-sm text-gray-500 mt-1">Fill in the form below to send your join request</p>
          <button onClick={onClose} className="absolute top-5 right-5 text-gray-400 hover:text-gray-700">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {formError && <div className="p-3 rounded-lg bg-red-50 border border-red-200 text-red-700 text-sm">{formError}</div>}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Preferred Position <span className="text-red-500">*</span>
            </label>
            <select
              name="preferredPosition"
              value={formData.preferredPosition}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select your position</option>
              {positions.map((pos) => (
                <option key={pos} value={pos}>{pos}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Why do you want to join this club? <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              name="whyJoin"
              value={formData.whyJoin}
              onChange={handleChange}
              rows={3}
              placeholder="Tell the club why you'd be a great fit..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1.5">
              Any other important message? <span className="text-gray-400 text-xs">(optional)</span>
            </label>
            <textarea
              name="additionalMessage"
              value={formData.additionalMessage}
              onChange={handleChange}
              rows={2}
              placeholder="Anything else you'd like us to know..."
              className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500 resize-none"
            />
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-gray-200">
            <button type="button" onClick={onClose} className="px-6 py-2.5 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50">
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="px-6 py-2.5 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-60"
            >
              {submitting ? "Sending..." : "Send Request"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

// Confirm Modal Component
const ConfirmModal = ({ isOpen, title, message, confirmLabel = "Confirm", confirmStyle = "red", onConfirm, onCancel }) => {
  if (!isOpen) return null;
  const btnClass =
    confirmStyle === "red"
      ? "bg-red-600 hover:bg-red-700 text-white"
      : confirmStyle === "yellow"
      ? "bg-yellow-500 hover:bg-yellow-600 text-white"
      : "bg-slate-800 hover:bg-slate-900 text-white";
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="bg-white rounded-2xl w-full max-w-sm mx-4 shadow-2xl overflow-hidden">
        <div className="px-6 pt-6 pb-4 border-b border-gray-100">
          <h2 className="text-lg font-bold text-gray-900">{title}</h2>
          {message && <p className="text-sm text-gray-500 mt-1">{message}</p>}
        </div>
        <div className="flex justify-end gap-3 px-6 py-4">
          <button
            onClick={onCancel}
            className="px-5 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 font-medium text-sm"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            className={`px-5 py-2 rounded-lg font-medium text-sm ${btnClass}`}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
};

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
  const [matchesTab, setMatchesTab] = useState("upcoming"); // 'upcoming' | 'played'
  const [myRequestStatus, setMyRequestStatus] = useState(null); // null | 'PENDING'
  const [memberActionLoading, setMemberActionLoading] = useState(null);
  const [confirmModal, setConfirmModal] = useState(null); // { title, message, confirmLabel, confirmStyle, onConfirm }
  const [editingPositionForUser, setEditingPositionForUser] = useState(null);
  const [positionDraft, setPositionDraft] = useState("");
  const [seeAllModal, setSeeAllModal] = useState(null); // { label, icon, unit, color, sorted }
  
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

  const getResultColor = (result) => {
    switch (result) {
      case "Win": return "bg-green-100 text-green-700";
      case "Draw": return "bg-yellow-100 text-yellow-700";
      case "Loss": return "bg-red-100 text-red-700";
      default: return "bg-gray-100 text-gray-700";
    }
  };

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
          <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 md:p-8 mb-6 relative">
            <div className="absolute top-6 right-6 md:top-8 md:right-8 text-right">
              <div className="text-4xl md:text-5xl font-bold text-gray-900">{clubSchedules.length}</div>
              <div className="text-sm md:text-base text-gray-500">Schedules</div>
            </div>

            <div className="flex items-start gap-5 md:gap-6 pr-32 md:pr-48">
              {/* Club Logo with Upload */}
              <div className="relative flex-shrink-0">
                <div className="w-16 h-16 md:w-20 md:h-20 bg-green-600 rounded-xl flex items-center justify-center overflow-hidden">
                  {getClubLogoUrl() ? (
                    <img
                      src={getClubLogoUrl()}
                      alt={`${clubData.name} logo`}
                      className="w-full h-full object-cover"
                    />
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
                {/* Logo Upload Button for Admins */}
                {isClubAdmin && (
                  <label className="absolute bottom-0 right-0 w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center cursor-pointer hover:bg-blue-700 transition-colors shadow-lg">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2">
                      <path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z" />
                      <circle cx="12" cy="13" r="4" />
                    </svg>
                    <input 
                      type="file" 
                      accept="image/*" 
                      onChange={handleLogoChange}
                      className="hidden"
                    />
                  </label>
                )}
              </div>
              <div className="flex-1">
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl md:text-3xl font-bold text-gray-900">{clubData.name}</h1>
                  <span className="text-yellow-500 text-2xl">●</span>
                </div>
                <p className="text-sm md:text-base text-gray-600 mb-4">
                  {clubData.foundedDate ? `Founded ${new Date(clubData.foundedDate).getFullYear()} • ` : ""}{clubData.location ?? ""}
                </p>

                {/* Buttons - visible based on user role */}
                <div className="flex flex-wrap gap-3">
                  {/* Request to Join button for non-members */}
                  {!isClubAdmin && !isClubMember && (
                    <button 
                      onClick={() => myRequestStatus !== 'PENDING' && setIsJoinModalOpen(true)}
                      disabled={myRequestStatus === 'PENDING'}
                      className={`px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors ${
                        myRequestStatus === 'PENDING'
                          ? 'bg-yellow-500 text-white cursor-not-allowed' 
                          : 'bg-green-600 hover:bg-green-700 text-white'
                      }`}
                    >
                      <svg
                        width="16"
                        height="16"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2"
                      >
                        <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                        <circle cx="8.5" cy="7" r="4" />
                        <line x1="20" y1="8" x2="20" y2="14" />
                        <line x1="23" y1="11" x2="17" y2="11" />
                      </svg>
                      {myRequestStatus === 'PENDING' ? 'Request Pending' : 'Request to Join Club'}
                    </button>
                  )}

                  {/* Leave Club button for non-admin members */}
                  {isClubMember && !isClubAdmin && (
                    <button
                      onClick={handleLeaveClub}
                      className="px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors bg-red-50 text-red-600 border border-red-200 hover:bg-red-100"
                    >
                      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
                        <polyline points="16 17 21 12 16 7" />
                        <line x1="21" y1="12" x2="9" y2="12" />
                      </svg>
                      Leave Club
                    </button>
                  )}

                  {/* Admin-only buttons */}
                  {isClubAdmin && (
                    <>
                      <button className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors">
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                          <circle cx="9" cy="7" r="4" />
                          <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
                          <path d="M16 3.13a4 4 0 0 1 0 7.75" />
                        </svg>
                        Invite Members
                      </button>

                      <button
                        onClick={() => setIsEditModalOpen(true)}
                        className="bg-slate-800 hover:bg-slate-900 text-white px-5 py-2.5 md:px-6 md:py-3 rounded-lg font-medium flex items-center gap-2 transition-colors"
                      >
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                        >
                          <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                          <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                        </svg>
                        Edit Club
                      </button>
                    </>
                  )}
                </div>

                {/* Logo Upload Confirmation */}
                {logoFile && isClubAdmin && (
                  <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                        </svg>
                        <span className="text-sm font-medium text-blue-900">New logo selected</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          onClick={handleCancelLogoUpload}
                          className="px-3 py-1.5 text-sm text-gray-700 border border-gray-300 rounded-lg hover:bg-gray-50"
                          disabled={uploadingLogo}
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleUploadLogo}
                          disabled={uploadingLogo}
                          className="px-3 py-1.5 text-sm bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                        >
                          {uploadingLogo ? 'Uploading...' : 'Upload Logo'}
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* Logo Upload Error */}
                {uploadLogoError && (
                  <div className="mt-3 p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                    {uploadLogoError}
                  </div>
                )}
              </div>
            </div>
          </div>

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
                  {activeTab === tab.id && <div className="absolute bottom-0 left-0 right-0 h-1 bg-blue-600"></div>}
                </button>
              ))}
            </div>
          </div>

          {activeTab === "overview" && (
            <>
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
                {[
                  { label: "Schedules", value: clubSchedules.length, sub: "Total" },
                  { label: "Location", value: clubData.location ?? "—", sub: "Club" },
                  { label: "Founded", value: clubData.foundedDate ? new Date(clubData.foundedDate).getFullYear() : "—", sub: "Year" },
                  { label: "Description", value: clubData.description ? "Set" : "—", sub: "" },
                ].map((stat, index) => (
                  <div key={index} className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 text-center">
                    <div className="text-base font-medium text-gray-700 mb-2">{stat.label}</div>
                    <div className="text-2xl md:text-3xl font-bold text-gray-900 truncate" title={stat.value}>{stat.value}</div>
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
                          {s.date ? new Date(s.date).toLocaleString() : "—"} • {s.location ?? ""}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </>
          )}

          {activeTab === "members" && (
            <div className="bg-white rounded-xl shadow-sm p-6 border border-gray-100">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Team Members</h2>
                <span className="text-sm text-gray-500">{clubMembers.length} member{clubMembers.length !== 1 ? 's' : ''}</span>
              </div>
              {clubMembers.length === 0 ? (
                <p className="text-gray-500">No members in this club yet.</p>
              ) : (
                <div className="space-y-3">
                  {clubMembers.map((member) => {
                    const isCreator = clubData && member.user?.userId === clubData.createdBy;
                    const isCurrentUser = member.user?.userId === currentUser?.userId;
                    const canManageMember = isClubAdmin && !isCreator && !isCurrentUser;
                    return (
                      <div key={member.user?.userId || member.userId} className={`flex items-center justify-between p-4 border rounded-lg transition-colors ${isCurrentUser ? "border-blue-300 bg-blue-50 hover:bg-blue-100" : "border-gray-200 hover:bg-gray-50"}`}>
                        <div className="flex items-center gap-4 flex-1">
                          <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center flex-shrink-0">
                            {getProfilePhotoUrl(member.user?.profilePhoto) ? (
                              <img src={getProfilePhotoUrl(member.user.profilePhoto)} alt={member.user?.firstName} className="w-full h-full rounded-full object-cover" />
                            ) : (
                              <span className="text-white font-bold text-lg">
                                {member.user?.firstName?.[0]}{member.user?.lastName?.[0]}
                              </span>
                            )}
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center gap-2 mb-1 flex-wrap">
                              <h3
                                className="font-semibold text-gray-900 hover:text-blue-600 cursor-pointer transition-colors"
                                onClick={() => navigate(`/player/${member.user?.userId}`)}
                              >
                                {member.user?.firstName} {member.user?.lastName}
                              </h3>
                              {isCurrentUser && (
                                <span className="bg-blue-600 text-white px-2 py-0.5 rounded-full text-xs font-bold">You</span>
                              )}
                              {isCreator && (
                                <span className="bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full text-xs font-medium">Owner</span>
                              )}
                              {member.role === "ADMIN" && !isCreator && (
                                <span className="bg-yellow-100 text-yellow-700 px-2 py-0.5 rounded-full text-xs font-medium">Admin</span>
                              )}
                            </div>
                            <p className="text-sm text-gray-600">{member.user?.position || 'No position assigned'}</p>
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-4">
                          {/* Stats */}
                          <div className="hidden sm:flex items-center gap-6 text-center mr-4">
                            <div>
                              <div className="text-xl font-bold text-gray-900">{member.user?.appearances || 0}</div>
                              <div className="text-xs text-gray-500">Apps</div>
                            </div>
                            <div>
                              <div className="text-xl font-bold text-blue-600">{member.user?.goals || 0}</div>
                              <div className="text-xs text-gray-500">Goals</div>
                            </div>
                          </div>

                          {/* Admin actions */}
                          {canManageMember && (
                            <div className="flex flex-col items-end gap-2">
                              <div className="flex items-center gap-2">
                                {/* Position inline editor */}
                                {editingPositionForUser === member.user?.userId ? (
                                  <div className="flex items-center gap-1">
                                    <select
                                      value={positionDraft}
                                      onChange={(e) => setPositionDraft(e.target.value)}
                                      className="text-xs border border-gray-300 rounded px-2 py-1 bg-white"
                                    >
                                      <option value="">Select position</option>
                                      {POSITIONS.map((p) => (
                                        <option key={p} value={p}>{p}</option>
                                      ))}
                                    </select>
                                    <button
                                      onClick={() => handleChangePosition(member.user?.userId)}
                                      disabled={!positionDraft || memberActionLoading === member.user?.userId}
                                      className="px-2 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 disabled:opacity-50"
                                    >
                                      {memberActionLoading === member.user?.userId ? "..." : "Save"}
                                    </button>
                                    <button
                                      onClick={() => { setEditingPositionForUser(null); setPositionDraft(""); }}
                                      className="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300"
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
                                    className="px-3 py-1.5 bg-blue-50 text-blue-700 hover:bg-blue-100 rounded-lg text-xs font-medium transition-colors"
                                    title="Change position"
                                  >
                                    ⚽ Position
                                  </button>
                                )}
                                <button
                                  onClick={() => handleToggleAdminRole(member.user?.userId, member.role)}
                                  disabled={memberActionLoading === member.user?.userId}
                                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-colors ${
                                    member.role === "ADMIN"
                                      ? "bg-gray-100 text-gray-700 hover:bg-gray-200"
                                      : "bg-yellow-100 text-yellow-700 hover:bg-yellow-200"
                                  }`}
                                  title={member.role === "ADMIN" ? "Demote to Member" : "Promote to Admin"}
                                >
                                  {memberActionLoading === member.user?.userId ? "..." : member.role === "ADMIN" ? "Demote" : "Make Admin"}
                                </button>
                                <button
                                  onClick={() => handleRemoveMember(member.user?.userId)}
                                  disabled={memberActionLoading === member.user?.userId}
                                  className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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
          )}

          {activeTab === "topPlayers" && (
            <div className="space-y-5">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-5">
                <h2 className="text-xl font-bold text-gray-900">Top Players</h2>
                <p className="text-sm text-gray-500 mt-1">Rankings based on in-club performance stats</p>
              </div>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 items-start">
                {[
                  { key: "appearances", label: "Most Appearances", icon: "🏅", unit: "Apps", color: "text-purple-600", bg: "bg-purple-50" },
                  { key: "goals", label: "Most Goals", icon: "⚽", unit: "Goals", color: "text-green-600", bg: "bg-green-50" },
                  { key: "assists", label: "Most Assists", icon: "🎯", unit: "Assists", color: "text-blue-600", bg: "bg-blue-50" },
                  { key: "yellowCards", label: "Most Yellow Cards", icon: "🟨", unit: "Cards", color: "text-yellow-600", bg: "bg-yellow-50" },
                  { key: "redCards", label: "Most Red Cards", icon: "🟥", unit: "Cards", color: "text-red-600", bg: "bg-red-50" },
                ].map(({ key, label, icon, unit, color, bg }) => {
                  const sorted = [...clubPlayers].sort((a, b) => (b[key] ?? 0) - (a[key] ?? 0));
                  const top3 = sorted.slice(0, 3);
                  const hasData = sorted.some((p) => (p[key] ?? 0) > 0);
                  const rankIcons = ["🥇", "🥈", "🥉"];
                  const PlayerRow = ({ player, idx }) => (
                    <div
                      key={player.userId}
                      onClick={() => navigate(`/player/${player.userId}`)}
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
                            {player.firstName?.[0]}{player.lastName?.[0]}
                          </span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                          {player.firstName} {player.lastName}
                        </div>
                        {player.position && (
                          <div className="text-xs text-gray-500 truncate">{player.position}</div>
                        )}
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

              {/* See All Modal */}
              {seeAllModal && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm" onClick={() => setSeeAllModal(null)}>
                  <div className="bg-white rounded-2xl w-full max-w-md mx-4 shadow-2xl overflow-hidden max-h-[80vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
                    <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
                      <div className="flex items-center gap-2">
                        <span className="text-2xl">{seeAllModal.icon}</span>
                        <h2 className="text-lg font-bold text-gray-900">{seeAllModal.label}</h2>
                      </div>
                      <button onClick={() => setSeeAllModal(null)} className="text-gray-400 hover:text-gray-700 p-1 rounded-lg hover:bg-gray-100 transition-colors">
                        <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                          <line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>
                    <div className="overflow-y-auto p-4 space-y-1">
                      {seeAllModal.sorted.slice(0, 20).map((player, idx) => (
                        <div
                          key={player.userId}
                          onClick={() => { setSeeAllModal(null); navigate(`/player/${player.userId}`); }}
                          className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors group"
                        >
                          <div className="w-7 text-center flex-shrink-0">
                            {idx === 0 ? <span className="text-base">🥇</span>
                              : idx === 1 ? <span className="text-base">🥈</span>
                              : idx === 2 ? <span className="text-base">🥉</span>
                              : <span className="text-xs font-bold text-gray-400">#{idx + 1}</span>}
                          </div>
                          <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                            {getProfilePhotoUrl(player.profilePhoto) ? (
                              <img src={getProfilePhotoUrl(player.profilePhoto)} alt="" className="w-full h-full object-cover" />
                            ) : (
                              <span className="text-blue-700 font-bold text-sm">{player.firstName?.[0]}{player.lastName?.[0]}</span>
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-semibold text-gray-900 text-sm truncate group-hover:text-blue-600 transition-colors">
                              {player.firstName} {player.lastName}
                            </div>
                            {player.position && <div className="text-xs text-gray-500 truncate">{player.position}</div>}
                          </div>
                          <div className="flex-shrink-0 text-right">
                            <div className={`text-lg font-bold leading-tight ${seeAllModal.color}`}>{player[seeAllModal.statKey] ?? 0}</div>
                            <div className="text-xs text-gray-400">{seeAllModal.unit}</div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {activeTab === "matches" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900">Club Matches</h2>
                <div className="inline-flex bg-gray-100 rounded-full p-1">
                  <button 
                    onClick={() => setMatchesTab('upcoming')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                      matchesTab === 'upcoming' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Upcoming
                  </button>
                  <button 
                    onClick={() => setMatchesTab('played')}
                    className={`px-4 py-1.5 text-sm font-semibold rounded-full transition-all ${
                      matchesTab === 'played' ? 'bg-white shadow-sm' : 'text-gray-500 hover:text-gray-700'
                    }`}
                  >
                    Played
                  </button>
                </div>
              </div>

              {matchesTab === 'upcoming' && (
                clubSchedules.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No matches scheduled yet.</p>
                ) : upcomingMatches.length === 0 ? (
                  <p className="text-gray-500 text-center py-8">No upcoming matches.</p>
                ) : (
                  <div className="space-y-3">
                    {upcomingMatches.map((s) => (
                      <div 
                        key={s.scheduleId} 
                        onClick={() => navigate(`/schedule/${s.scheduleId}`)}
                        className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group"
                      >
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-2">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              s.scheduleType === 'Knockout' ? 'bg-red-100 text-red-700' :
                              s.scheduleType === 'League' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {s.scheduleType ?? 'Match'}
                            </span>
                          </div>
                          <div className="font-bold text-gray-900 mb-2 text-lg group-hover:text-blue-600 transition-colors">
                            {clubsMap[s.teamOneId] ?? `Team ${s.teamOneId}`} <span className="text-gray-400 font-normal">vs</span> {clubsMap[s.teamTwoId] ?? `Team ${s.teamTwoId}`}
                          </div>
                          <div className="flex items-center gap-4 text-sm text-gray-600">
                            <div className="flex items-center gap-1.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                                <line x1="16" y1="2" x2="16" y2="6" />
                                <line x1="8" y1="2" x2="8" y2="6" />
                                <line x1="3" y1="10" x2="21" y2="10" />
                              </svg>
                              <span className="font-medium">{s.date ? new Date(s.date).toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' }) : "TBD"}</span>
                            </div>
                            <span>•</span>
                            <div className="flex items-center gap-1.5">
                              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                                <circle cx="12" cy="12" r="10" />
                                <polyline points="12 6 12 12 16 14" />
                              </svg>
                              <span className="font-medium">{s.date ? new Date(s.date).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : "TBD"}</span>
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
                        <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-blue-600 transition-colors">
                          <path d="M9 18l6-6-6-6" />
                        </svg>
                      </div>
                    ))}
                  </div>
                )
              )}

              {matchesTab === 'played' && (
                playedMatches.length === 0 ? (
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
                          onClick={() => navigate(`/schedule/${s.scheduleId}`)}
                          className="flex items-center justify-between p-5 border border-gray-200 rounded-lg hover:bg-gray-50 hover:border-blue-300 cursor-pointer transition-all group"
                        >
                          <div className="flex items-center gap-6 flex-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              s.scheduleType === 'Knockout' ? 'bg-red-100 text-red-700' :
                              s.scheduleType === 'League' ? 'bg-blue-100 text-blue-700' :
                              'bg-green-100 text-green-700'
                            }`}>
                              {s.scheduleType ?? 'Match'}
                            </span>
                            <div className="flex-1">
                              <div className="flex items-center justify-between mb-2">
                                <span className={`text-lg font-bold ${
                                  isTeamOneWinner ? 'text-green-600' : isDraw ? 'text-gray-700' : 'text-gray-500'
                                }`}>
                                  {clubsMap[s.teamOneId] ?? `Team ${s.teamOneId}`}
                                </span>
                                <span className="text-3xl font-bold text-gray-900 mx-4">{teamOneGoals}</span>
                              </div>
                              <div className="flex items-center justify-between">
                                <span className={`text-lg font-bold ${
                                  isTeamTwoWinner ? 'text-green-600' : isDraw ? 'text-gray-700' : 'text-gray-500'
                                }`}>
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
                                  <span>{s.date ? new Date(s.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' }) : "TBD"}</span>
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
                          <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0">
                            <path d="M9 18l6-6-6-6" />
                          </svg>
                        </div>
                      );
                    })}
                  </div>
                )
              )}
            </div>
          )}

          {activeTab === "requests" && (
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
                          <span className="text-blue-700 font-bold text-lg">
                            {request.user?.firstName?.charAt(0) || '?'}
                          </span>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="font-semibold text-gray-900">
                            {request.user?.firstName} {request.user?.lastName}
                          </div>
                          <div className="text-sm text-blue-700 font-medium mt-0.5">
                            Position: {request.preferredPosition || '—'}
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
          )}

          {activeTab === "chat" && (
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6">
              <h2 className="text-xl font-bold text-gray-900 mb-6">Club Chat</h2>
              <p className="text-gray-600">Chat feature coming soon!</p>
            </div>
          )}

          <EditClub
            isOpen={isEditModalOpen}
            onClose={() => setIsEditModalOpen(false)}
            onEditClub={handleEditClub}
            clubData={{ name: clubData.name, description: clubData.description, location: clubData.location }}
          />
          <JoinRequestModal
            isOpen={isJoinModalOpen}
            onClose={() => setIsJoinModalOpen(false)}
            onSubmit={handleRequestToJoin}
          />
          <ConfirmModal
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