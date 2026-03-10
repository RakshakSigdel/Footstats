import api from "./api";

export const createScheduleRequest = async (body) => {
  try {
    const response = await api.post("/schedule-requests", body);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to send schedule request" };
  }
};

export const getMyScheduleRequests = async () => {
  try {
    const response = await api.get("/schedule-requests/my");
    return response.data.requests;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch schedule requests" };
  }
};

export const approveScheduleRequest = async (requestId) => {
  try {
    const response = await api.post(`/schedule-requests/approve/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to approve schedule request" };
  }
};

export const rejectScheduleRequest = async (requestId) => {
  try {
    const response = await api.post(`/schedule-requests/reject/${requestId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to reject schedule request" };
  }
};
