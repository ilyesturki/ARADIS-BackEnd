import { Server as SocketIOServer } from "socket.io";
import Notification from "../models/Notification";

interface NotificationData {
  userId: string;
  fpsId: string;
  title: string;
  message: string;
  sender: string;
  priority: "low" | "medium" | "high";
}

export const sendNotification = async (
  io: SocketIOServer,
  data: NotificationData
) => {
  try {
    // Save to database
    const notification = await Notification.create({
      ...data,
      actionLink: `/fps/${data.fpsId}`,
    });

    // Emit notification via WebSocket
    io.to(`user_${data.userId}`).emit("newNotification", notification);
  } catch (error) {
    console.error("Error sending notification:", error);
  }
};
