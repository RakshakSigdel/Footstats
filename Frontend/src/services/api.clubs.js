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
