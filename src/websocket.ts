import { Server as SocketIOServer } from "socket.io";
import { Server } from "http";
import { socketAuthMiddleware } from "./middlewares/socketAuth";
import Notification from "./models/Notification";

export const setupWebSocket = (server: Server) => {
  const io = new SocketIOServer(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use(socketAuthMiddleware);

  io.on("connection", async (socket) => {
    console.log(`🟢 User connected: ${socket.data.user.id}`);
    const userId = socket.data.user.id;

    socket.join(`user_${userId}`);

    // ✅ Send unread notifications count when user connects
    const unreadCount = await Notification.count({
      where: { userId, status: "unread" },
    });
    socket.emit("unreadNotificationCount", unreadCount);

    socket.on("disconnect", () => {
      console.log(`🔴 User disconnected: ${userId}`);
    });
  });

  return io;
};

// import { Server as SocketIOServer } from "socket.io";
// import { Server } from "http";
// import { socketAuthMiddleware } from "./middlewares/socketAuth";

// export const setupWebSocket = (server: Server) => {
//   const io = new SocketIOServer(server, {
//     cors: {
//       origin: "*",
//       methods: ["GET", "POST"],
//     },
//   });

//   io.use(socketAuthMiddleware);

//   io.on("connection", (socket) => {
//     console.log(`🟢 User connected: ${socket.data.user.id}`);
//     socket.join(`user_${socket.data.user.id}`);

//     socket.on("disconnect", () => {
//       console.log(`🔴 User disconnected: ${socket.data.user.id}`);
//     });
//   });

//   return io;
// };
