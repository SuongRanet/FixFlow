import pool from "../../config/db.js";
import { TicketFilters } from "./ticket.schema.js";

export const createTicketRepository = async (
  ticketCode: string,
  title: string,
  description: string,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  categoryId: number,
  departmentId: number,
  createdBy: number,
) => {
  const query = `
    INSERT INTO tickets (
      ticket_code,
      title,
      description,
      priority,
      category_id,
      department_id,
      created_by
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7)
    RETURNING *;
  `;

  const values = [
    ticketCode,
    title,
    description,
    priority,
    categoryId,
    departmentId,
    createdBy,
  ];

  const result = await pool.query(query, values);

  return result.rows[0];
};
export const generateTicketCode = async (): Promise<string> => {
  const result = await pool.query(`SELECT nextval('ticket_code') AS number`);

  const number = result.rows[0].number;

  return `#TK-${String(number).padStart(6, "0")}`;
};

export const getTicketsRepository = async (userId: number, role: string) => {
  const values: number[] = [];

  let query = `
    SELECT
      t.id,
      t.ticket_code,
      t.title,
      t.status,
      t.priority,

      c.name AS category_name,
      d.name AS department_name,

      u.username AS creator_username,

      t.created_at
    FROM tickets t
    LEFT JOIN categories c
      ON t.category_id = c.id
    LEFT JOIN departments d
      ON t.department_id = d.id
    LEFT JOIN users u
      ON t.created_by = u.id
  `;

  if (role !== "ADMIN") {
    query += `
      WHERE t.assigned_to = $1
    `;

    values.push(userId);
  }

  query += `
    ORDER BY t.created_at DESC
  `;

  const result = await pool.query(query, values);

  return result.rows;
};

export const getTicketById = async (id: number) => {
  const result = await pool.query(
    `
  SELECT
    t.id,
    t.ticket_code,
    t.title,
    t.description,
    t.status,
    t.priority,

    c.name AS category_name,
    d.name AS department_name,

    -- Creator
    creator.username AS creator_name,

    -- Assigned user
    assignee.username AS assigned_to,

    t.created_at,
    t.updated_at

  FROM tickets t

  LEFT JOIN categories c
    ON t.category_id = c.id

  LEFT JOIN departments d
    ON t.department_id = d.id

  -- User who created the ticket
  LEFT JOIN users creator
    ON t.created_by = creator.id

  -- User assigned to the ticket
  LEFT JOIN users assignee
    ON t.assigned_to = assignee.id

  WHERE t.id = $1
  `,
    [id],
  );

  return result.rows[0];
};

export const assignTicketRepository = async (
  ticketId: number,
  assignedTo: number,
) => {
  const result = await pool.query(
    `
    UPDATE tickets
    SET
      assigned_to = $1,
      status = 'ASSIGNED',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      ticket_code,
      title,
      status,
      assigned_to,
      updated_at
    `,
    [assignedTo, ticketId],
  );

  return result.rows[0];
};
export const assignTicketToMeRepository = async (
  ticketId: number,
  userId: number,
) => {
  const result = await pool.query(
    `
    UPDATE tickets
    SET
      assigned_to = $1,
      status = 'ASSIGNED',
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $2
    RETURNING
      id,
      ticket_code,
      title,
      status,
      assigned_to,
      updated_at
    `,
    [userId, ticketId],
  );

  return result.rows[0];
};
export const updateTicketStatusRepository = async (
  ticketId: number,
  status:
    | "OPEN"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "WAITING_FOR_USER"
    | "RESOLVED"
    | "CLOSED"
    | "CANCELLED",
) => {
  const result = await pool.query(
    `
    UPDATE tickets
    SET
      status = $1::ticket_status,

      resolved_at = CASE
        WHEN $1::ticket_status = 'RESOLVED'::ticket_status
          THEN CURRENT_TIMESTAMP
        ELSE resolved_at
      END,

      closed_at = CASE
        WHEN $1::ticket_status = 'CLOSED'::ticket_status
          THEN CURRENT_TIMESTAMP
        ELSE closed_at
      END,

      updated_at = CURRENT_TIMESTAMP

    WHERE id = $2

    RETURNING
      id,
      ticket_code,
      title,
      status,
      assigned_to,
      resolved_at,
      closed_at,
      updated_at
    `,
    [status, ticketId],
  );

  return result.rows[0];
};
export const getTicketsFilterRepository = async (filters: TicketFilters) => {
  const conditions: string[] = [];
  const values: any[] = [];

  let paramIndex = 1;

  // Search
  if (filters.search) {
    conditions.push(`
      (
        t.ticket_code ILIKE $${paramIndex}
        OR t.title ILIKE $${paramIndex}
        OR creator.username ILIKE $${paramIndex}
        OR creator.first_name ILIKE $${paramIndex}
        OR creator.last_name ILIKE $${paramIndex}
      )
    `);

    values.push(`%${filters.search}%`);
    paramIndex++;
  }

  // Status
  if (filters.status) {
    conditions.push(`t.status = $${paramIndex}`);
    values.push(filters.status);
    paramIndex++;
  }

  // Priority
  if (filters.priority) {
    conditions.push(`t.priority = $${paramIndex}`);
    values.push(filters.priority);
    paramIndex++;
  }

  // Category
  if (filters.categoryId) {
    conditions.push(`t.category_id = $${paramIndex}`);
    values.push(filters.categoryId);
    paramIndex++;
  }

  // Department
  if (filters.departmentId) {
    conditions.push(`t.department_id = $${paramIndex}`);
    values.push(filters.departmentId);
    paramIndex++;
  }

  // Assignee
  if (filters.assignedTo) {
    conditions.push(`t.assigned_to = $${paramIndex}`);
    values.push(filters.assignedTo);
    paramIndex++;
  }

  const whereClause =
    conditions.length > 0 ? `WHERE ${conditions.join(" AND ")}` : "";

  const result = await pool.query(
    `
    SELECT
      t.id,
      t.ticket_code,
      t.title,
      t.status,
      t.priority,

      c.name AS category_name,
      d.name AS department_name,

      creator.username AS creator_username,

      assignee.username AS assignee_username,

      t.created_at,
      t.updated_at

    FROM tickets t

    LEFT JOIN categories c
      ON t.category_id = c.id

    LEFT JOIN departments d
      ON t.department_id = d.id

    LEFT JOIN users creator
      ON t.created_by = creator.id

    LEFT JOIN users assignee
      ON t.assigned_to = assignee.id

    ${whereClause}

    ORDER BY t.created_at DESC
    `,
    values,
  );

  return result.rows;
};
