import asyncHandler from "express-async-handler";
import { Op, fn, col } from "sequelize";
import Notification from "../models/Notification";
import { io } from "../index";
import ApiError from "../utils/ApiError";

export const getAllLoggedUserNotifications = asyncHandler(async (req, res) => {
  // try {
  const notifications = await Notification.findAll({
    where: { userId: req.params.id },
    order: [["createdAt", "DESC"]],
    attributes: [
      "id",
      "title",
      "message",
      "sender",
      "fpsId",
      "status",
      "priority",
      "actionLink",
      "createdAt", // Include createdAt
      [
        fn("DATE_FORMAT", col("createdAt"), "%Y-%m-%d %H:%i:%s"),
        "formattedDate",
      ], // Format date
    ],
  });
  res.status(200).json(notifications);
  // } catch (error) {
  //   res.status(500).json({ message: "Failed to fetch notifications" });
  // }
});

export const getUnreadNotificationsCount = asyncHandler(async (req, res) => {
  const userId = req.params.id;

  const unreadCount = await Notification.count({
    where: { userId, status: "unread" },
  });

  res.status(200).json({ unreadCount });
});

export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
  const { id } = req.params;

  const notification = await Notification.findByPk(id);
  if (!notification) {
    return next(new ApiError("Notification not found", 404));
  }

  notification.status = "read";
  await notification.save();

  // ✅ Fetch updated notifications for the user
  const userNotifications = await Notification.findAll({
    where: { userId: notification.userId },
    order: [["createdAt", "DESC"]],
    attributes: [
      "id",
      "title",
      "message",
      "sender",
      "fpsId",
      "status",
      "priority",
      "actionLink",
      "createdAt", // Include createdAt
      [
        fn("DATE_FORMAT", col("createdAt"), "%Y-%m-%d %H:%i:%s"),
        "formattedDate",
      ], // Format date
    ],
  });

  // ✅ Count unread notifications
  const unreadCount = await Notification.count({
    where: { userId: notification.userId, status: "unread" },
  });

  // ✅ Emit updates to the frontend via WebSockets
  io.to(`user_${notification.userId}`).emit(
    "unreadNotificationCount",
    unreadCount
  );
  io.to(`user_${notification.userId}`).emit(
    "updatedNotifications",
    userNotifications
  );

  res.status(200).json({
    message: "Notification marked as read",
    unreadCount,
    userNotifications,
  });
});

// export const markNotificationAsRead = asyncHandler(async (req, res, next) => {
//   const { id } = req.params;

//   const notification = await Notification.findByPk(id);
//   if (!notification) {
//     return next(new ApiError("Notification not found", 404));
//   }

//   notification.status = "read";
//   await notification.save();

//   // ✅ Emit updated unread count via WebSocket
//   const unreadCount = await Notification.count({
//     where: { userId: notification.userId, status: "unread" },
//   });
//   io.to(`user_${notification.userId}`).emit(
//     "unreadNotificationCount",
//     unreadCount
//   );

//   res.json({ message: "Notification marked as read" });
// });
