import { Router } from "express";
import { protect } from "../services/authService";
import { getAllLoggedUserNotifications, getUnreadNotificationsCount } from "../services/notificationsService";

const router = Router();

// ✅ Get User's Notifications
router.get("/:id", protect, getAllLoggedUserNotifications);

// ✅ Get Unread Notifications Count (NEW)
router.get("/:id/unread-count", protect, getUnreadNotificationsCount);

export default router;
