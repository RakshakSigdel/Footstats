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

export const joinTournament = async (tournamentId, body) => {
  try {
    const response = await api.post(`/tournaments/${tournamentId}/join`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to submit join request" };
  }
};

export const getTournamentRegistrations = async (tournamentId, status) => {
  try {
    const query = status ? `?status=${encodeURIComponent(status)}` : "";
    const response = await api.get(`/tournaments/${tournamentId}/registrations${query}`);
    return response.data.registrations;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tournament registrations" };
  }
};

export const reviewTournamentRegistration = async (registrationId, body) => {
  try {
    const response = await api.patch(`/tournaments/registrations/${registrationId}/review`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to review tournament registration" };
  }
};

export const updateTournamentStatus = async (tournamentId, body) => {
  try {
    const response = await api.patch(`/tournaments/${tournamentId}/status`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update tournament status" };
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
