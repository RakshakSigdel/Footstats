import api from "./api";

export const getMyRequestStatus = async (clubId) => {
  try {
    const response = await api.get(`/requests/my-status/${clubId}`);
    return response.data.request; // null or { requestId, status }
  } catch (error) {
    return null;
  }
};

export const createJoinRequest = async (clubId, preferredPosition, whyJoin, additionalMessage) => {
  try {
    const response = await api.post("/requests/join", { clubId, preferredPosition, whyJoin, additionalMessage });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create join request" };
  }
};

export const getClubRequests = async (clubId) => {
  try {
    const response = await api.get(`/requests/club/${clubId}`);
    return response.data.requests;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch club requests" };
  }
};

export const approveJoinRequest = async (requestId) => {
  try {
    const response = await api.post(`/requests/approve/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('API Error approving request:', error);
    const errorMsg = error.response?.data?.message || error.message || "Failed to approve request";
    throw { message: errorMsg };
  }
};

export const rejectJoinRequest = async (requestId) => {
  try {
    const response = await api.delete(`/requests/reject/${requestId}`);
    return response.data;
  } catch (error) {
    console.error('API Error rejecting request:', error);
    const errorMsg = error.response?.data?.message || error.message || "Failed to reject request";
    throw { message: errorMsg };
  }
};
