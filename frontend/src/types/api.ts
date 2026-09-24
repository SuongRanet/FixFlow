/**
 * Shapes returned by the FixFlow backend (backend/src/modules/**).
 * Field names are snake_case because the API returns raw Postgres rows.
 */

export type UserRole = "ADMIN" | "IT_SUPPORT" | "USER";

export type TicketStatus =
  | "OPEN"
  | "ASSIGNED"
  | "IN_PROGRESS"
  | "WAITING_FOR_USER"
  | "RESOLVED"
  | "CLOSED"
  | "CANCELLED";

export type TicketPriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/** Priorities the /ticket/fillter endpoint currently accepts (ticket.schema.ts). */
export type FilterablePriority = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * GET /departments and GET /categories return dropdown-ready entries:
 * `name` is the label, `id` is the value.
 */
export interface Option {
  name: string;
  id: number;
}

export interface CategoryOption extends Option {
  description: string | null;
}

/** Envelope used by most endpoints: { message, data } or { success, data }. */
export interface ApiEnvelope<T> {
  success?: boolean;
  message?: string;
  data: T;
}

/** POST /auth/login — the only place that returns camelCase. */
export interface AuthUser {
  id: number;
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  role: UserRole;
  departmentId: number | null;
}

export interface LoginResponse {
  message: string;
  data: AuthUser;
  token: string;
}

/** Rows from /user endpoints. */
export interface User {
  id: number;
  first_name: string;
  last_name: string;
  username: string;
  email: string;
  role: UserRole;
  department_id: number | null;
  is_active: boolean;
  created_at: string;
  updated_at?: string;
}

/** Rows from GET /ticket and GET /ticket/fillter. */
export interface TicketListItem {
  id: number;
  ticket_code: string;
  title: string;
  status: TicketStatus;
  priority: TicketPriority;
  category_name: string | null;
  department_name: string | null;
  creator_username: string | null;
  /** Only present on the filter endpoint. */
  assignee_username?: string | null;
  created_at: string;
  updated_at?: string;
}

/** GET /ticket/:id — includes description and resolves both usernames. */
export interface TicketDetail {
  id: number;
  ticket_code: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  category_name: string | null;
  department_name: string | null;
  creator_name: string | null;
  assigned_to: string | null;
  created_at: string;
  updated_at: string;
}

/** GET /ticket/my — tickets the signed-in user opened themselves. */
export interface MyTicket {
  id: number;
  ticket_code: string;
  title: string;
  description: string;
  status: TicketStatus;
  priority: TicketPriority;
  created_at: string;
  updated_at: string;
  category_name: string | null;
  department_name: string | null;
  creator_username: string | null;
  assigned_to_username: string | null;
}

export interface TicketFilters {
  search?: string;
  status?: TicketStatus;
  priority?: FilterablePriority;
  categoryId?: number;
  departmentId?: number;
  assignedTo?: number;
}

export interface CreateTicketPayload {
  title: string;
  description: string;
  priority: TicketPriority;
  categoryId: number;
  departmentId: number;
}

export interface TicketComment {
  id: number;
  ticket_id: number;
  user_id: number;
  content: string;
  is_internal: boolean;
  created_at: string;
}

export interface TicketAttachment {
  id: number;
  ticket_id: number;
  comment_id: number | null;
  uploaded_by: number;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  created_at: string;
  uploaded_by_first_name: string | null;
  uploaded_by_last_name: string | null;
  uploaded_by_username: string | null;
}

export interface Notification {
  id: number;
  user_id: number;
  ticket_id: number | null;
  title: string;
  message: string;
  is_read: boolean;
  created_at: string;
  ticket_code: string | null;
}

/** GET /dashboard — admin.service.ts nests the counts and converts to numbers. */
export interface DashboardStats {
  users: {
    total: number;
    active: number;
    inactive: number;
  };
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
  priority: {
    high: number;
    medium: number;
    low: number;
  };
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  departmentId: number | null;
}

export interface UpdateUserPayload {
  firstName: string;
  lastName: string;
  username: string;
  departmentId?: number | null;
  /** Omit to leave the current role untouched. */
  role?: UserRole;
}
