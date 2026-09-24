import pool from "../../config/db.js";

export const createRepository = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  passwordHash: string,
  department_id?: number | null,
  role: "ADMIN" | "IT_SUPPORT" | "USER" = "USER",
) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      first_name,
      last_name,
      username,
      email,
      password_hash,
      department_id,
      role
    )
    VALUES ($1, $2, $3, $4, $5, $6, $7::user_role)
    RETURNING
      id,
      first_name,
      last_name,
      username,
      email,
      role,
      department_id,
      is_active,
      created_at
    `,
    [
      firstName,
      lastName,
      username,
      email,
      passwordHash,
      department_id ?? null,
      role,
    ],
  );

  return result.rows[0];
};
export const getUserByEmailRepository = async (email: string) => {
  const result = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      username,
      email,
      password_hash,
      role,
      department_id,
      is_active,
      created_at
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
};

export const getUserRepository = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      username,
      email,
      role,
      department_id,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE is_active = true
    `,
  );

  return result.rows;
};

export const getUserByIdRepository = async (id: number) => {
  const result = await pool.query(
    `
    SELECT
      id,
      first_name,
      last_name,
      username,
      email,
      role,
      department_id,
      is_active,
      created_at,
      updated_at
    FROM users
    WHERE id = $1
    `,
    [id],
  );

  return result.rows[0];
};
export const updateRepository = async (
  id: number,
  firstName: string,
  lastName: string,
  username: string,
  departmentId: number | null | undefined,
  role: "ADMIN" | "IT_SUPPORT" | "USER",
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      first_name = $1,
      last_name = $2,
      username = $3,
      department_id = $4,
      role = $6,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $5
    RETURNING
      id,
      first_name,
      last_name,
      username,
      email,
      role,
      department_id,
      is_active,
      created_at,
      updated_at
    `,
    [firstName, lastName, username, departmentId ?? null, id, role],
  );

  return result.rows[0];
};
export const deleteRepository = async (id: number) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      is_active = false,
      updated_at = CURRENT_TIMESTAMP
    WHERE id = $1
    RETURNING
      id,
      first_name,
      last_name,
      username,
      email,
      role,
      department_id,
      is_active,
      updated_at
    `,
    [id],
  );

  return result.rows[0];
};

/** Admin ids, used to fan a stored notification out to every administrator. */
export const getAdminIdsRepository = async () => {
  const result = await pool.query(
    `
    SELECT id
    FROM users
    WHERE role = 'ADMIN'
      AND is_active = true
    `,
  );

  return result.rows.map((row) => Number(row.id));
};
