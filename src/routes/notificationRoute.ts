import { Router } from "express";
import { protect } from "../services/authService";
import {
  getAllLoggedUserNotifications,
  getUnreadNotificationsCount,
  markNotificationAsRead,
} from "../services/notificationsService";

const router = Router();

router.get("/:id", protect, getAllLoggedUserNotifications);

router.get("/:id/unread-count", protect, getUnreadNotificationsCount);

router.put("/:id/read", protect, markNotificationAsRead);

export default router;
