import type http from "http";
import jwt from "jsonwebtoken";
import { Server, type Socket } from "socket.io";

import { allowedOrigins } from "./origins.js";
import { getTicketParticipantsRepository } from "../modules/tickets/ticket.repository.js";
import { CLIENT_EVENTS, type SubscribeAck } from "../realtime/events.js";
import type { AuthPayload } from "../types/auth.types.js";
import { isStaff, type UserRole } from "../types/realtime.types.js";

/**
 * Held at module scope so any service can emit without being handed the
 * server instance. It stays null until server.ts calls initSocket().
 */
let io: Server | null = null;

/* -------------------------------------------------------------------------- */
/* Room topology                                                              */
/*                                                                            */
/*   user:<id>              one person, every tab they have open              */
/*   role:<ROLE>            everyone holding that role                        */
/*   staff                  ADMIN + IT_SUPPORT                                */
/*   ticket:<id>:public     owner, assignee and staff following the ticket    */
/*   ticket:<id>:internal   staff following the ticket — internal notes only  */
/*                                                                            */
/* Internal notes are addressed to the internal room and nowhere else, so a   */
/* standard user has no room through which one could reach them.              */
/* -------------------------------------------------------------------------- */

export const ROOMS = {
  user: (userId: number) => `user:${userId}`,
  role: (role: UserRole) => `role:${role}`,
  staff: "staff",
  ticketPublic: (ticketId: number) => `ticket:${ticketId}:public`,
  ticketInternal: (ticketId: number) => `ticket:${ticketId}:internal`,
} as const;

interface SocketUser {
  id: number;
  email: string;
  role: UserRole;
}

/** Reads the verified user a connection was authenticated with. */
const currentUser = (socket: Socket): SocketUser =>
  socket.data.user as SocketUser;

export const initSocket = (httpServer: http.Server) => {
  io = new Server(httpServer, {
    cors: { origin: allowedOrigins, credentials: true },
  });

  /* ---------------------------------------------------------------------- */
  /* Authentication — no valid token, no connection.                         */
  /* ---------------------------------------------------------------------- */
  io.use((socket, next) => {
    const token =
      (socket.handshake.auth?.token as string | undefined) ??
      socket.handshake.headers.authorization?.replace("Bearer ", "");

    if (!token) return next(new Error("Unauthorized"));

    try {
      const decoded = jwt.verify(
        token,
        process.env.JWT_SECRET as string,
      ) as AuthPayload;

      // The role is taken from the signed token, never from anything the
      // client sends afterwards, so it cannot be claimed by a caller.
      socket.data.user = {
        id: decoded.id,
        email: decoded.email,
        role: decoded.role as UserRole,
      } satisfies SocketUser;

      return next();
    } catch {
      return next(new Error("Invalid or expired token"));
    }
  });

  io.on("connection", (socket) => {
    const user = currentUser(socket);

    // Standing rooms, decided entirely by the token's role claim.
    socket.join(ROOMS.user(user.id));
    socket.join(ROOMS.role(user.role));
    if (isStaff(user.role)) socket.join(ROOMS.staff);

    console.log(
      `Socket connected: user ${user.id} (${user.role}) ${socket.id}`,
    );

    /* -------------------------------------------------------------------- */
    /* Following one ticket. The server decides the scopes, not the client.  */
    /* -------------------------------------------------------------------- */
    socket.on(
      CLIENT_EVENTS.TICKET_SUBSCRIBE,
      async (
        payload: { ticketId?: number } | undefined,
        ack?: (result: SubscribeAck) => void,
      ) => {
        const reply = (result: SubscribeAck) => ack?.(result);
        const ticketId = Number(payload?.ticketId);

        if (!Number.isInteger(ticketId) || ticketId < 1) {
          return reply({ ok: false, scopes: [], reason: "bad-request" });
        }

        const staff = isStaff(user.role);

        // Staff may follow any ticket; everyone else must be a participant,
        // which is checked against the database rather than trusted.
        let participants: { created_by: number; assigned_to: number | null } | undefined;

        if (!staff) {
          participants = await getTicketParticipantsRepository(ticketId);

          if (!participants) {
            return reply({ ok: false, scopes: [], reason: "not-found" });
          }

          const isParticipant =
            participants.created_by === user.id ||
            participants.assigned_to === user.id;

          if (!isParticipant) {
            return reply({ ok: false, scopes: [], reason: "forbidden" });
          }
        }

        socket.join(ROOMS.ticketPublic(ticketId));

        // The internal room is joined by staff only. This is the single
        // place that grants it, so there is one line to audit.
        if (staff) socket.join(ROOMS.ticketInternal(ticketId));

        return reply({
          ok: true,
          scopes: staff ? ["public", "internal"] : ["public"],
        });
      },
    );

    socket.on(
      CLIENT_EVENTS.TICKET_UNSUBSCRIBE,
      (payload: { ticketId?: number } | undefined) => {
        const ticketId = Number(payload?.ticketId);
        if (!Number.isInteger(ticketId)) return;

        socket.leave(ROOMS.ticketPublic(ticketId));
        socket.leave(ROOMS.ticketInternal(ticketId));
      },
    );

    socket.on("disconnect", () => {
      console.log(`Socket disconnected: user ${user.id} (${socket.id})`);
    });
  });

  return io;
};

/* -------------------------------------------------------------------------- */
/* Emit helpers — the only sanctioned way to push an event                    */
/* -------------------------------------------------------------------------- */

/**
 * A missing server must never fail a request: the HTTP response still
 * succeeds and the client simply misses the live update.
 */
const withIO = (send: (server: Server) => void, event: string) => {
  if (!io) {
    console.warn(`Socket not initialised; dropped "${event}"`);
    return;
  }
  send(io);
};

/** One person, across every tab they have open. */
export const emitToUser = (userId: number, event: string, payload: unknown) =>
  withIO((server) => server.to(ROOMS.user(userId)).emit(event, payload), event);

/** Everyone holding a given role. */
export const emitToRole = (role: UserRole, event: string, payload: unknown) =>
  withIO((server) => server.to(ROOMS.role(role)).emit(event, payload), event);

/** ADMIN + IT_SUPPORT. */
export const emitToStaff = (event: string, payload: unknown) =>
  withIO((server) => server.to(ROOMS.staff).emit(event, payload), event);

/** ADMIN only — used for the dashboard feed. */
export const emitToAdmins = (event: string, payload: unknown) =>
  emitToRole("ADMIN", event, payload);

/** Owner, assignee and staff following the ticket. */
export const emitTicketPublic = (
  ticketId: number,
  event: string,
  payload: unknown,
) =>
  withIO(
    (server) => server.to(ROOMS.ticketPublic(ticketId)).emit(event, payload),
    event,
  );

/**
 * Staff following the ticket. Addressed to the internal room only, which
 * no standard user is ever placed in.
 */
export const emitTicketInternal = (
  ticketId: number,
  event: string,
  payload: unknown,
) =>
  withIO(
    (server) => server.to(ROOMS.ticketInternal(ticketId)).emit(event, payload),
    event,
  );

/** Kept for the existing status-change callers. */
export const emitTicketChanged = (ticketId: number, payload: unknown) =>
  emitTicketPublic(ticketId, "ticket:updated", {
    ticketId,
    ...(payload as object),
    at: new Date().toISOString(),
  });

export const getIO = () => io;
