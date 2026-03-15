import { Router } from "express";
import { verifyToken } from "../middleware/verifyToken.js";
import {
  getMyNotifications,
  getUnreadNotificationCount,
  markNotificationAsRead,
  markAllNotificationsAsRead,
} from "../controllers/notificationController.js";

const router = Router();

router.get("/me", verifyToken, getMyNotifications);
router.get("/unread-count", verifyToken, getUnreadNotificationCount);
router.patch("/:id/read", verifyToken, markNotificationAsRead);
router.patch("/read-all", verifyToken, markAllNotificationsAsRead);

export default router;
