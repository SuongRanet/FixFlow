import pool from "../../config/db.js";

export const dashboardRepository = async () => {
  const result = await pool.query(`
    SELECT
      -- Users
      (SELECT COUNT(*) FROM users) AS total_users,
      (SELECT COUNT(*) FROM users WHERE is_active = true) AS active_users,
      (SELECT COUNT(*) FROM users WHERE is_active = false) AS inactive_users,

      -- Tickets
      (SELECT COUNT(*) FROM tickets) AS total_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'OPEN') AS open_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'ASSIGNED') AS assigned_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'IN_PROGRESS') AS in_progress_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'WAITING_FOR_USER') AS waiting_for_user_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'RESOLVED') AS resolved_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'CLOSED') AS closed_tickets,
      (SELECT COUNT(*) FROM tickets WHERE status = 'CANCELLED') AS cancelled_tickets,

      -- Priority
      (SELECT COUNT(*) FROM tickets WHERE priority = 'HIGH') AS high_priority,
      (SELECT COUNT(*) FROM tickets WHERE priority = 'MEDIUM') AS medium_priority,
      (SELECT COUNT(*) FROM tickets WHERE priority = 'LOW') AS low_priority
  `);

  return result.rows[0];
};
