import api from "./api";

export const createMatch = async (body) => {
  try {
    const response = await api.post("/matches", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create match" };
  }
};

export const getAllMatches = async () => {
  try {
    const response = await api.get("/matches");
    return response.data.matches;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch matches" };
  }
};

export const getMatchesByScheduleId = async (scheduleId) => {
  try {
    const response = await api.get(`/matches/${scheduleId}`);
    return response.data.matches;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch matches for schedule" };
  }
};

export const updateMatch = async (matchId, body) => {
  try {
    const response = await api.put(`/matches/${matchId}`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update match" };
  }
};

export const deleteMatch = async (matchId) => {
  try {
    const response = await api.delete(`/matches/${matchId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete match" };
  }
};
