import api from "./api";

export const createClub = async (body, logoFile = null) => {
  try {
    let requestData;
    let config = {};
    
    if (logoFile) {
      // If logo file is provided, use FormData
      const formData = new FormData();
      formData.append('name', body.name);
      formData.append('description', body.description);
      formData.append('location', body.location);
      formData.append('foundedDate', body.foundedDate);
      formData.append('logo', logoFile);
      
      requestData = formData;
      config.headers = { 'Content-Type': 'multipart/form-data' };
    } else {
      // Otherwise send JSON
      requestData = body;
    }
    
    const response = await api.post("/clubs", requestData, config);
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

// Update member role and/or position
export const updateMemberRole = async (clubId, userId, role) => {
  try {
    const response = await api.put(`/clubs/${clubId}/members/${userId}`, { role });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update member role" };
  }
};

// Update member position
export const updateMemberPosition = async (clubId, userId, position) => {
  try {
    const response = await api.put(`/clubs/${clubId}/members/${userId}`, { position });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update member position" };
  }
};

// Leave a club (current user leaves themselves)
export const leaveClub = async (clubId) => {
  try {
    const response = await api.delete(`/clubs/${clubId}/leave`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to leave club" };
  }
};

// Upload club logo
export const uploadClubLogo = async (clubId, file) => {
  try {
    const formData = new FormData();
    formData.append('logo', file);
    
    const response = await api.post(`/clubs/${clubId}/upload-logo`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload club logo" };
  }
};
