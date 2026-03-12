import api from "./api";

export const getAllPlayers = async (params = {}) => {
  try {
    const response = await api.get("/players", { params });
    return response.data.players;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch players" };
  }
};

export const getMyProfile = async () => {
  try {
    const response = await api.get("/players/me");
    return response.data.profile;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch profile" };
  }
};

export const getPlayerById = async (id) => {
  try {
    const response = await api.get(`/players/${id}`);
    return response.data.player;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch player" };
  }
};

export const updatePlayerById = async (id, body) => {
  try {
    const response = await api.put(`/players/${id}`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update player" };
  }
};

export const deletePlayer = async (id) => {
  try {
    const response = await api.delete(`/players/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete player" };
  }
};

export const getPlayersByClubId = async (clubId) => {
  try {
    const response = await api.get(`/players/club/${clubId}`);
    return response.data.players;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch club players" };
  }
};

export const getMyStats = async () => {
  try {
    const response = await api.get("/players/me/stats");
    return response.data.stats;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch player stats" };
  }
};

export const uploadProfilePhoto = async (file) => {
  try {
    const formData = new FormData();
    formData.append('profilePhoto', file);
    
    const response = await api.post("/players/me/upload-photo", formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to upload profile photo" };
  }
};
