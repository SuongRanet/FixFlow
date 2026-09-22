import { dashboardRepository } from "./admin.repository.js";

export const getDashboardService = async () => {
  const dashboard = await dashboardRepository();

  return {
    users: {
      total: Number(dashboard.total_users),
      active: Number(dashboard.active_users),
      inactive: Number(dashboard.inactive_users),
    },

    tickets: {
      total: Number(dashboard.total_tickets),
      open: Number(dashboard.open_tickets),
      assigned: Number(dashboard.assigned_tickets),
      in_progress: Number(dashboard.in_progress_tickets),
      waiting_for_user: Number(dashboard.waiting_for_user_tickets),
      resolved: Number(dashboard.resolved_tickets),
      closed: Number(dashboard.closed_tickets),
      cancelled: Number(dashboard.cancelled_tickets),
    },

    priority: {
      high: Number(dashboard.high_priority),
      medium: Number(dashboard.medium_priority),
      low: Number(dashboard.low_priority),
    },
  };
};
