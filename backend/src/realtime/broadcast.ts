import {
  emitTicketInternal,
  emitTicketPublic,
  emitToAdmins,
  emitToStaff,
} from "../config/socket.js";
import { getDashboardService } from "../modules/Dashboard/admin.service.js";
import {
  SERVER_EVENTS,
  type CommentEvent,
  type DashboardMetricsEvent,
  type TicketCreatedEvent,
  type UserRegisteredEvent,
} from "./events.js";

/**
 * Every realtime broadcast in the application goes through this module.
 *
 * Keeping them together means the audience of each event is declared once,
 * beside the payload it carries — services call a named function and never
 * choose a room themselves.
 */

/* -------------------------------------------------------------------------- */
/* Admin dashboard                                                            */
/* -------------------------------------------------------------------------- */

/**
 * Pushes a fresh metrics snapshot to admins. Failures are swallowed: a
 * dashboard that misses one refresh is far better than a request that
 * fails because a broadcast could not be computed.
 */
export const broadcastDashboardMetrics = async () => {
  try {
    const stats = await getDashboardService();

    const payload: DashboardMetricsEvent = {
      ...stats,
      at: new Date().toISOString(),
    };

    emitToAdmins(SERVER_EVENTS.DASHBOARD_METRICS, payload);
  } catch (error) {
    console.error("Failed to broadcast dashboard metrics:", error);
  }
};

/** A ticket was opened — staff see it land on the queue immediately. */
export const broadcastTicketCreated = (payload: TicketCreatedEvent) => {
  emitToStaff(SERVER_EVENTS.TICKET_CREATED, payload);

  // Counters move with it, so refresh the admin dashboard too.
  void broadcastDashboardMetrics();
};

/** Someone registered — admin dashboard only, no notification row. */
export const broadcastUserRegistered = (payload: UserRegisteredEvent) => {
  emitToAdmins(SERVER_EVENTS.USER_REGISTERED, payload);

  void broadcastDashboardMetrics();
};

/* -------------------------------------------------------------------------- */
/* Comments                                                                   */
/* -------------------------------------------------------------------------- */

/**
 * Routes a comment to the right audience.
 *
 * The decision is made here, from the stored `is_internal` flag, and is
 * expressed as a room: an internal note is addressed to the ticket's
 * internal room, which only staff are ever joined to, and is sent under a
 * different event name so a client listening for public comments cannot
 * receive one even by accident.
 */
export const broadcastComment = (comment: CommentEvent) => {
  if (comment.isInternal) {
    emitTicketInternal(
      comment.ticketId,
      SERVER_EVENTS.COMMENT_INTERNAL,
      comment,
    );
    return;
  }

  emitTicketPublic(comment.ticketId, SERVER_EVENTS.COMMENT_NEW, comment);
};
