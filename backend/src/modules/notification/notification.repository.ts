import pool from "../../config/db.js";
import { CreateNotificationInput } from "../../types/type.js";

export const createNotificationRepository = async (
  data: CreateNotificationInput,
) => {
  const result = await pool.query(
    `
    INSERT INTO notifications (
      user_id,
      ticket_id,
      title,
      message
    )
    VALUES ($1, $2, $3, $4)
    RETURNING
      id,
      user_id,
      ticket_id,
      title,
      message,
      is_read,
      created_at
    `,
    [data.userId, data.ticketId ?? null, data.title, data.message],
  );

  return result.rows[0];
};

export const getNotificationsRepository = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT
      n.id,
      n.user_id,
      n.ticket_id,
      n.title,
      n.message,
      n.is_read,
      n.created_at,

      t.ticket_code

    FROM notifications n

    LEFT JOIN tickets t
      ON n.ticket_id = t.id

    WHERE n.user_id = $1

    ORDER BY n.created_at DESC
    `,
    [userId],
  );

  return result.rows;
};
export const getUnreadNotificationCountRepository = async (userId: number) => {
  const result = await pool.query(
    `
    SELECT COUNT(*)::int AS count
    FROM notifications
    WHERE user_id = $1
      AND is_read = false
    `,
    [userId],
  );

  return result.rows[0].count;
};

export const markNotificationAsReadRepository = async (
  notificationId: number,
  userId: number,
) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE id = $1
      AND user_id = $2
    RETURNING *
    `,
    [notificationId, userId],
  );

  return result.rows[0];
};
export const markAllNotificationsAsReadRepository = async (userId: number) => {
  const result = await pool.query(
    `
    UPDATE notifications
    SET is_read = true
    WHERE user_id = $1
      AND is_read = false
    RETURNING *
    `,
    [userId],
  );

  return result.rows;
};
