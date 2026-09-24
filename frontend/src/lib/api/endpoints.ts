import serverRest from "../axios";
import type {
  ApiEnvelope,
  CategoryOption,
  CreateTicketPayload,
  CreateUserPayload,
  DashboardStats,
  LoginResponse,
  MyTicket,
  Notification,
  Option,
  TicketAttachment,
  TicketComment,
  TicketDetail,
  TicketFilters,
  TicketListItem,
  TicketStatus,
  UpdateUserPayload,
  User,
} from "../../types/api";

/* -------------------------------------------------------------------------- */
/* Auth — /auth/*                                                             */
/* -------------------------------------------------------------------------- */

export const authApi = {
  login: async (email: string, password: string) => {
    const { data } = await serverRest.post<LoginResponse>("/auth/login", {
      email,
      password,
    });
    return data;
  },

  register: async (payload: {
    firstName: string;
    lastName: string;
    username: string;
    email: string;
    password: string;
  }) => {
    const { data } = await serverRest.post("/auth/register", payload);
    return data;
  },

  logout: async () => {
    await serverRest.post("/auth/logout");
  },

  forgotPassword: async (email: string) => {
    const { data } = await serverRest.post("/auth/forgot-password", { email });
    return data;
  },

  resetPassword: async (token: string, newPassword: string) => {
    const { data } = await serverRest.post(
      "/auth/reset-password",
      { newPassword },
      { params: { token } },
    );
    return data;
  },
};

/* -------------------------------------------------------------------------- */
/* Tickets — /ticket/*                                                        */
/* -------------------------------------------------------------------------- */

export const ticketApi = {
  list: async () => {
    const { data } =
      await serverRest.get<ApiEnvelope<TicketListItem[]>>("/ticket");
    return data.data;
  },

  /** GET /ticket/fillter — note the backend's spelling. */
  filter: async (filters: TicketFilters) => {
    const params = Object.fromEntries(
      Object.entries(filters).filter(
        ([, value]) => value !== undefined && value !== "",
      ),
    );
    const { data } = await serverRest.get<ApiEnvelope<TicketListItem[]>>(
      "/ticket/fillter",
      { params },
    );
    return data.data;
  },

  /** GET /ticket/my — only the tickets this user created. */
  mine: async () => {
    const { data } =
      await serverRest.get<ApiEnvelope<MyTicket[]>>("/ticket/my");
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await serverRest.get<ApiEnvelope<TicketDetail>>(
      `/ticket/${id}`,
    );
    return data.data;
  },

  create: async (payload: CreateTicketPayload) => {
    const { data } = await serverRest.post<ApiEnvelope<TicketDetail>>(
      "/ticket",
      payload,
    );
    return data.data;
  },

  assign: async (id: number, assignedTo: number) => {
    const { data } = await serverRest.patch<ApiEnvelope<TicketListItem>>(
      `/ticket/${id}/assign`,
      { assignedTo },
    );
    return data.data;
  },

  assignToMe: async (id: number) => {
    const { data } = await serverRest.patch<ApiEnvelope<TicketListItem>>(
      `/ticket/${id}/assign-to-me`,
    );
    return data.data;
  },

  updateStatus: async (id: number, status: TicketStatus) => {
    const { data } = await serverRest.patch<ApiEnvelope<TicketListItem>>(
      `/ticket/${id}/status`,
      { status },
    );
    return data.data;
  },

  addComment: async (
    ticketId: number,
    content: string,
    isInternal: boolean,
  ) => {
    const { data } = await serverRest.post<ApiEnvelope<TicketComment>>(
      `/ticket/${ticketId}/comments`,
      { content, isInternal },
    );
    return data.data;
  },
};

/* -------------------------------------------------------------------------- */
/* Attachments — /tickets/:ticketId/attachments                               */
/* -------------------------------------------------------------------------- */

export const attachmentApi = {
  list: async (ticketId: number) => {
    const { data } = await serverRest.get<ApiEnvelope<TicketAttachment[]>>(
      `/tickets/${ticketId}/attachments`,
    );
    return data.data;
  },

  upload: async (ticketId: number, file: File, commentId?: number) => {
    const form = new FormData();
    form.append("file", file);
    if (commentId) form.append("commentId", String(commentId));

    const { data } = await serverRest.post<ApiEnvelope<TicketAttachment>>(
      `/tickets/${ticketId}/attachments`,
      form,
      { headers: { "Content-Type": "multipart/form-data" } },
    );
    return data.data;
  },
};

/* -------------------------------------------------------------------------- */
/* Users — /user/* (ADMIN only)                                               */
/* -------------------------------------------------------------------------- */

export const userApi = {
  list: async () => {
    const { data } = await serverRest.get<ApiEnvelope<User[]>>("/user");
    return data.data;
  },

  getById: async (id: number) => {
    const { data } = await serverRest.get<ApiEnvelope<User>>(`/user/${id}`);
    return data.data;
  },

  create: async (payload: CreateUserPayload) => {
    const { data } = await serverRest.post<ApiEnvelope<User>>(
      "/auth/register",
      payload,
    );
    return data.data;
  },

  update: async (id: number, payload: UpdateUserPayload) => {
    const { data } = await serverRest.put<ApiEnvelope<User>>(
      `/user/${id}`,
      payload,
    );
    return data.data;
  },

  deactivate: async (id: number) => {
    const { data } = await serverRest.delete<ApiEnvelope<User>>(`/user/${id}`);
    return data.data;
  },
};

/* -------------------------------------------------------------------------- */
/* Notifications — /notifications/*                                           */
/* -------------------------------------------------------------------------- */

export const notificationApi = {
  list: async () => {
    const { data } =
      await serverRest.get<ApiEnvelope<Notification[]>>("/notifications");
    return data.data;
  },

  unreadCount: async () => {
    const { data } = await serverRest.get<ApiEnvelope<{ count: number }>>(
      "/notifications/unread-count",
    );
    return data.data.count;
  },

  markRead: async (id: number) => {
    await serverRest.patch(`/notifications/${id}/read`);
  },

  markAllRead: async () => {
    await serverRest.patch("/notifications/read-all");
  },
};

/* -------------------------------------------------------------------------- */
/* Departments & categories — dropdown options                                */
/* -------------------------------------------------------------------------- */

export const departmentApi = {
  list: async () => {
    const { data } =
      await serverRest.get<ApiEnvelope<Option[]>>("/departments");
    return data.data;
  },
};

export const categoryApi = {
  list: async () => {
    const { data } =
      await serverRest.get<ApiEnvelope<CategoryOption[]>>("/categories");
    return data.data;
  },
};

/* -------------------------------------------------------------------------- */
/* Dashboard — /dashboard                                                     */
/* -------------------------------------------------------------------------- */

export const dashboardApi = {
  stats: async () => {
    const { data } =
      await serverRest.get<ApiEnvelope<DashboardStats>>("/dashboard");
    return data.data;
  },
};
