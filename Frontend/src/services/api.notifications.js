import api from "./api";

export const getMyNotifications = async (limit = 30) => {
  try {
    const response = await api.get(`/notifications/me?limit=${limit}`);
    return response.data.notifications;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notifications" };
  }
};

export const getUnreadNotificationCount = async () => {
  try {
    const response = await api.get("/notifications/unread-count");
    return response.data.unreadCount || 0;
  } catch (error) {
    throw error.response?.data || { message: "Failed to fetch notification count" };
  }
};

export const markNotificationAsRead = async (notificationId) => {
  try {
    const response = await api.patch(`/notifications/${notificationId}/read`);
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark notification as read" };
  }
};

export const markAllNotificationsAsRead = async () => {
  try {
    const response = await api.patch("/notifications/read-all");
    return response.data;
  } catch (error) {
    throw error.response?.data || { message: "Failed to mark all notifications as read" };
  }
};
