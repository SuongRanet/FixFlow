/**
 * The realtime contract between server and client.
 *
 * Every payload the server pushes is declared here so both ends agree on
 * the shape, and so the visibility rule of each event is written down next
 * to the event itself rather than living only in the emitting code.
 */

import type { TicketPriority, UserRole } from "../types/realtime.types.js";

/* -------------------------------------------------------------------------- */
/* Event names                                                                */
/* -------------------------------------------------------------------------- */

export const SERVER_EVENTS = {
  /** Admin dashboard: a ticket was opened. Staff rooms only. */
  TICKET_CREATED: "ticket:created",
  /** Admin dashboard: someone registered. Admin room only. */
  USER_REGISTERED: "user:registered",
  /** Admin dashboard: refreshed counters. Admin room only. */
  DASHBOARD_METRICS: "dashboard:metrics",
  /** A public comment. Ticket owner, assignee and staff. */
  COMMENT_NEW: "comment:new",
  /**
   * An internal note. Staff only — deliberately a different name from
   * COMMENT_NEW so a client listening for public comments can never
   * receive an internal one, even if a room were joined by mistake.
   */
  COMMENT_INTERNAL: "comment:internal",
  /** A ticket's status or content changed. */
  TICKET_UPDATED: "ticket:updated",
  /** A stored notification row was created for this user. */
  NOTIFICATION_NEW: "notification:new",
} as const;

export const CLIENT_EVENTS = {
  /** Ask to follow one ticket; the server decides which rooms to join. */
  TICKET_SUBSCRIBE: "ticket:subscribe",
  TICKET_UNSUBSCRIBE: "ticket:unsubscribe",
} as const;

/* -------------------------------------------------------------------------- */
/* Payload schemas                                                            */
/* -------------------------------------------------------------------------- */

/** SERVER_EVENTS.TICKET_CREATED — visibility: ADMIN + IT_SUPPORT. */
export interface TicketCreatedEvent {
  id: number;
  ticketCode: string;
  title: string;
  priority: TicketPriority;
  status: string;
  categoryId: number | null;
  departmentId: number | null;
  createdBy: {
    id: number;
    username: string | null;
  };
  createdAt: string;
}

/** SERVER_EVENTS.USER_REGISTERED — visibility: ADMIN only. */
export interface UserRegisteredEvent {
  id: number;
  username: string;
  email: string;
  role: UserRole;
  departmentId: number | null;
  createdAt: string;
}

/** SERVER_EVENTS.DASHBOARD_METRICS — visibility: ADMIN only. */
export interface DashboardMetricsEvent {
  users: { total: number; active: number; inactive: number };
  tickets: {
    total: number;
    open: number;
    assigned: number;
    in_progress: number;
    waiting_for_user: number;
    resolved: number;
    closed: number;
    cancelled: number;
  };
  priority: { high: number; medium: number; low: number };
  /** When the snapshot was taken, so a late event can be discarded. */
  at: string;
}

/**
 * SERVER_EVENTS.COMMENT_NEW — visibility: ticket owner, assignee, staff.
 * SERVER_EVENTS.COMMENT_INTERNAL — visibility: staff only.
 *
 * `isInternal` is carried so a client can style the note, never as the
 * thing that decides delivery: routing is done by room on the server.
 */
export interface CommentEvent {
  id: number;
  ticketId: number;
  content: string;
  isInternal: boolean;
  author: {
    id: number;
    username: string | null;
  };
  createdAt: string;
}

/** SERVER_EVENTS.TICKET_UPDATED — visibility: subscribers of that ticket. */
export interface TicketUpdatedEvent {
  ticketId: number;
  status?: string;
  commentId?: number;
  at: string;
}

/** Reply to CLIENT_EVENTS.TICKET_SUBSCRIBE. */
export interface SubscribeAck {
  ok: boolean;
  /** Which rooms were granted; "internal" only ever appears for staff. */
  scopes: ("public" | "internal")[];
  reason?: "unauthenticated" | "not-found" | "forbidden" | "bad-request";
}
