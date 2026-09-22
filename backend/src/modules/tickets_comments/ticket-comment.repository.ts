import pool from "../../config/db.js";

export const createComment = async (
  ticketId: number,
  userId: number,
  content: string,
  isInternal: boolean,
) => {
  const result = await pool.query(
    `
    INSERT INTO ticket_comments
      (ticket_id, user_id, content, is_internal)
    VALUES ($1, $2, $3, $4)
    RETURNING *
    `,
    [ticketId, userId, content, isInternal],
  );

  return result.rows[0];
};
