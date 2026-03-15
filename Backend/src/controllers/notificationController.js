import NotificationService from "../services/notificationService.js";

export const getMyNotifications = async (req, res) => {
  try {
    const notifications = await NotificationService.getMyNotifications(
      req.user.userId,
      req.query,
    );
    res.status(200).json({ notifications });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch notifications",
      error: error.message,
    });
  }
};

export const getUnreadNotificationCount = async (req, res) => {
  try {
    const unreadCount = await NotificationService.getUnreadCount(req.user.userId);
    res.status(200).json({ unreadCount });
  } catch (error) {
    res.status(500).json({
      message: "Failed to fetch unread notification count",
      error: error.message,
    });
  }
};

export const markNotificationAsRead = async (req, res) => {
  try {
    await NotificationService.markAsRead(req.params.id, req.user.userId);
    res.status(200).json({ message: "Notification marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark notification as read",
      error: error.message,
    });
  }
};

export const markAllNotificationsAsRead = async (req, res) => {
  try {
    await NotificationService.markAllAsRead(req.user.userId);
    res.status(200).json({ message: "All notifications marked as read" });
  } catch (error) {
    res.status(500).json({
      message: "Failed to mark all notifications as read",
      error: error.message,
    });
  }
};
