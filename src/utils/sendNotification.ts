import { Server as SocketIOServer } from "socket.io";
import Notification from "../models/Notification";

interface NotificationData {
  userId: string;
  fpsId?: string;
  tagId?: string;
  title: string;
  message: string;
  sender: string;
  priority: "Low" | "Medium" | "High";
}

export const sendNotification = async (
  io: SocketIOServer,
  data: NotificationData
) => {
  try {
    // Save to database
    const notification = await Notification.create({
      ...data,
      actionLink: data.fpsId
        ? `/dashboard?fpsId=${data.fpsId}`
        : data.tagId
        ? `/dashboard?tagId=${data.tagId}`
        : null,
    });

    // Count unread notifications for the user
    const unreadCount = await Notification.count({
      where: { userId: data.userId, status: "unread" },
    });

    const notifications = await Notification.findAll({
      where: { userId: data.userId },
      order: [["createdAt", "DESC"]],
    });
    // Emit notification via WebSocket
    io.to(`user_${data.userId}`).emit("updatedNotifications", notifications);
    io.to(`user_${data.userId}`).emit("unreadNotificationCount", unreadCount);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
