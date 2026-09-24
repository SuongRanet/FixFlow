/** Shared unions used by the realtime contract. */
export type UserRole = "ADMIN" | "IT_SUPPORT" | "USER";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

/** Roles allowed to see internal notes and the admin dashboard feed. */
export const STAFF_ROLES: UserRole[] = ["ADMIN", "IT_SUPPORT"];

export const isStaff = (role: UserRole | undefined): boolean =>
  role === "ADMIN" || role === "IT_SUPPORT";
