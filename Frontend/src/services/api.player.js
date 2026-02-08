import api from "./api";

export const getAllPlayers = async (params = {}) => {
  const response = await api.get("/players", { params });
};

export const getMyProfile = async () => {
  const response = await api.get(`/players/me`);
  return response.data.profile;
};

export const getPlayerById = async (id) => {
  const response = await api.get(`/players/${id}`);
  return response.data;
};
export const updatePlayerById = async (id) => {
  return api.put(`/players/${id}`);
};

export const deletePlayer = async (id) => {
  return api.delete(`/players/${id}`);
};
