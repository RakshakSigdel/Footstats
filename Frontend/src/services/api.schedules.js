import api from "./api";

export const createSchedule = async (body) => {
  try {
    const response = await api.post("/schedules", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to create schedule" };
  }
};

export const getAllSchedules = async () => {
  try {
    const response = await api.get("/schedules");
    return response.data.schedules;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch schedules" };
  }
};

export const getScheduleById = async (id) => {
  try {
    const response = await api.get(`/schedules/${id}`);
    return response.data.schedule;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch schedule" };
  }
};

export const getMySchedules = async () => {
  try {
    const response = await api.get("/schedules/me");
    return response.data.schedules;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch my schedules" };
  }
};

export const getClubSchedules = async (clubId) => {
  try {
    const response = await api.get(`/schedules/club/${clubId}`);
    return response.data.schedules;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch club schedules" };
  }
};

export const getTournamentSchedules = async (tournamentId) => {
  try {
    const response = await api.get(`/schedules/tournament/${tournamentId}`);
    return response.data.schedules;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch tournament schedules" };
  }
};

export const updateSchedule = async (id, body) => {
  try {
    const response = await api.put(`/schedules/${id}`, body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to update schedule" };
  }
};

export const deleteSchedule = async (id) => {
  try {
    const response = await api.delete(`/schedules/${id}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete schedule" };
  }
};
