import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "./middlewares/socketAuth";
import Notification from "./models/Notification";
import { fn, col } from "sequelize";
export const setupWebSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    try {
      console.log(`🟢 User connected: ${socket.data.user.id}`);
      const userId = socket.data.user.id;

      socket.join(`user_${userId}`);

      Notification.count({ where: { userId, status: "unread" } })
        .then((unreadCount) =>
          socket.emit("unreadNotificationCount", unreadCount)
        )
        .catch((error) => console.error("Error fetching unread count:", error));

      Notification.findAll({
        where: { userId },
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
          "createdAt", 
          [
            fn("DATE_FORMAT", col("createdAt"), "%Y-%m-%d %H:%i:%s"),
            "formattedDate",
          ], 
        ],
      })
        .then((notifications) =>
          socket.emit("updatedNotifications", notifications)
        )
        .catch((error) =>
          console.error("Error fetching notifications:", error)
        );

      socket.on("disconnect", () => {
        console.log(`🔴 User disconnected: ${userId}`);
      });
    } catch (error) {
      console.error("Socket connection error:", error);
    }
  });

  return io;
};

