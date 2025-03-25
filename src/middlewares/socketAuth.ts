import { Socket } from "socket.io";
import jwt from "jsonwebtoken";
import User from "../models/User";

export const socketAuthMiddleware = async (
  socket: Socket,
  next: (err?: Error) => void
) => {
  try {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET_KEY!) as {
      id: string;
    };
    const user = await User.findByPk(decoded.id);

    if (!user) {
      return next(new Error("Authentication error: User not found"));
    }

    socket.data.user = user; // Attach user data to socket
    next();
  } catch (error) {
    next(new Error("Authentication error: Invalid token"));
  }
};
