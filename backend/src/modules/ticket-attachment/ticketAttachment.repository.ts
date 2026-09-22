import pool from "../../config/db.js";

export const createAttachmentRepository = async (
  ticketId: number,
  commentId: number | null,
  uploadedBy: number,
  fileName: string,
  filePath: string,
  fileType: string,
  fileSize: number,
) => {
  const result = await pool.query(
    `
    INSERT INTO ticket_attachments (
      ticket_id,
      comment_id,
      uploaded_by,
      file_name,
      file_path,
      file_type,
      file_size
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING
      id,
      ticket_id,
      comment_id,
      uploaded_by,
      file_name,
      file_path,
      file_type,
      file_size,
      created_at
    `,
    [ticketId, commentId, uploadedBy, fileName, filePath, fileType, fileSize],
  );

  return result.rows[0];
};
export const getAttachmentsByTicketRepository = async (ticketId: number) => {
  const result = await pool.query(
    `
    SELECT
      a.id,
      a.ticket_id,
      a.comment_id,
      a.uploaded_by,

      a.file_name,
      a.file_path,
      a.file_type,
      a.file_size,

      a.created_at,

      u.first_name AS uploaded_by_first_name,
      u.last_name AS uploaded_by_last_name,
      u.username AS uploaded_by_username

    FROM ticket_attachments a

    LEFT JOIN users u
      ON a.uploaded_by = u.id

    WHERE a.ticket_id = $1

    ORDER BY a.created_at DESC
    `,
    [ticketId],
  );

  return result.rows;
};
