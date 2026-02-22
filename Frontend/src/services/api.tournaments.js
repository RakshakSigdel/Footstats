import api from "./api";

export const createTournament = async (body) => {
  try {
    const response = await api.post("/tournaments", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create tournament" };
  }
};

export const getMyTournaments = async () => {
  try {
    const response = await api.get("/tournaments/me");
    return response.data.tournaments;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch my tournaments" };
  }
};

export const getAllTournaments = async () => {
  try {
    const response = await api.get("/tournaments");
    return response.data.tournaments;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tournaments" };
  }
};

export const getTournamentById = async (id) => {
  try {
    const response = await api.get(`/tournaments/${id}`);
    return response.data.tournament;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tournament" };
  }
};

export const updateTournament = async (id, body) => {
  try {
    const response = await api.put(`/tournaments/${id}`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update tournament" };
  }
};

export const deleteTournament = async (id) => {
  try {
    const response = await api.delete(`/tournaments/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete tournament" };
  }
};
