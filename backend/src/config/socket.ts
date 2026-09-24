import type http from "http";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";

import { allowedOrigins } from "./origins.js";
import type { AuthPayload } from "../types/auth.types.js";

/**
 * Held at module scope so any service can emit without being handed the
 * server instance. It stays null until server.ts calls initSocket().
 */
let io: Server | null = null;

/** Every connection joins this room, so we can target one person. */
const roomForUser = (userId: number) => `user:${userId}`;

export const initSocket = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: {
      origin: allowedOrigins,
      credentials: true,
    },
  });

  // Reject the handshake unless it carries a valid token. Without this
  // any stranger could connect and listen in.
  io.use((socket: Socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) {
      return next(new Error("Unauthorized"));
    }

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as AuthPayload;

      socket.data.user = decoded;
      socket.join(roomForUser(decoded.id));

      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = socket.data.user as AuthPayload;

    console.log(`Socket connected: user ${user.id} (${socket.id})`);

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${user.id} (${socket.id})`);
    });
  });

  return io;
};

/** Sends an event to one user, across every tab they have open. */
export const emitToUser = (
  userId: number,
  event: string,
  payload: unknown,
) => {
  // A missing server is not worth failing a request over: the HTTP
  // response still succeeds, the client just misses the live update.
  if (!io) {
    console.warn(`Socket not initialised; dropped "${event}"`);
    return;
  }

  io.to(roomForUser(userId)).emit(event, payload);
};

/**
 * Sends an event to everyone watching a ticket. Every authenticated
 * client listens, so this carries no private data — only that the
 * ticket changed, which the client then refetches under its own auth.
 */
export const emitTicketChanged = (ticketId: number, payload: unknown) => {
  if (!io) return;
  io.emit("ticket:updated", { ticketId, ...(payload as object) });
};

export const getIO = () => io;
