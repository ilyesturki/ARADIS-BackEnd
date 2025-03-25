import { Router } from "express";
import { protect } from "../services/authService";
import { getAllLoggedUserNotifications } from "../services/notificationsService";

const router = Router();

// ✅ Get User's Notifications
router.get("/:id", protect, getAllLoggedUserNotifications);

export default router;
