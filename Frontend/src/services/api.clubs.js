import api from "./api";

export const createClub = async (body) => {
  try {
    const response = await api.post("/clubs", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create club" };
  }
};

export const getMyClubs = async () => {
  try {
    const response = await api.get("/clubs/me");
    return response.data.clubs;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch my clubs" };
  }
};

export const getAllClubs = async () => {
  try {
    const response = await api.get("/clubs");
    return response.data.clubs;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch clubs" };
  }
};

export const getClubById = async (id) => {
  try {
    const response = await api.get(`/clubs/${id}`);
    return response.data.club;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch club" };
  }
};

export const updateClub = async (id, body) => {
  try {
    const response = await api.put(`/clubs/${id}`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update club" };
  }
};

export const deleteClub = async (id) => {
  try {
    const response = await api.delete(`/clubs/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete club" };
  }
};

// Get clubs where current user is admin/creator (for schedule creation)
export const getAdminClubs = async () => {
  try {
    const response = await api.get("/clubs/admin");
    return response.data.clubs;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch admin clubs" };
  }
};

// Search clubs by name (top 10)
export const searchClubs = async (query) => {
  try {
    const response = await api.get(`/clubs/search?q=${encodeURIComponent(query)}`);
    return response.data.clubs;
  } catch (error) {
    throw error.response?.data || { message: "Failed to search clubs" };
  }
};

// Get all members of a club
export const getClubMembers = async (clubId) => {
  try {
    const response = await api.get(`/clubs/${clubId}/members`);
    return response.data.members;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch club members" };
  }
};

// Add a member to a club
export const addClubMember = async (clubId, userId, role = "member") => {
  try {
    const response = await api.post(`/clubs/${clubId}/members`, { userId, role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to add member" };
  }
};

// Remove a member from a club
export const removeClubMember = async (clubId, userId) => {
  try {
    const response = await api.delete(`/clubs/${clubId}/members/${userId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to remove member" };
  }
};

// Update member role
export const updateMemberRole = async (clubId, userId, role) => {
  try {
    const response = await api.put(`/clubs/${clubId}/members/${userId}`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update member role" };
  }
};
