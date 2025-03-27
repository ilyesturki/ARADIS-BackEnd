import asyncHandler from "express-async-handler";
import Notification from "../models/Notification";

export const getAllLoggedUserNotifications = asyncHandler(async (req, res) => {
  // try {
  const notifications = await Notification.findAll({
    where: { userId: req.params.id },
    order: [["createdAt", "DESC"]],
  });
  res.json(notifications);
  // } catch (error) {
  //   res.status(500).json({ message: "Failed to fetch notifications" });
  // }
});


export const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
  const userId = req.params.id;
  
  const unreadCount = await Notification.count({
    where: { userId, status: "unread" },
  });

  res.json({ unreadCount });
});