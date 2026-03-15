import api from "./api";

export const getClubMessages = async (clubId) => {
  try {
    const response = await api.get(`/messages/club/${clubId}`);
    return response.data.messages;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch club messages" };
  }
};

export const createClubMessage = async (clubId, content) => {
  try {
    const response = await api.post(`/messages/club/${clubId}`, { content });
    return response.data.message;
  } catch (error) {
    throw error.response?.data || { message: "Failed to send message" };
  }
};

export const deleteClubMessage = async (messageId) => {
  try {
    const response = await api.delete(`/messages/${messageId}`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to delete message" };
  }
};
