import pool from "../../config/db.js";

export const createRepository = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  passwordHash: string,
  department_id?: number | null,
) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      first_name,
      last_name,
      username,
      email,
      password_hash
      department_id,
    )
    VALUES ($1, $2, $3, $4, $5 ,$6)
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
    [firstName, lastName, username, email, passwordHash, department_id ?? null],
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
  departmentId?: number | null,
) => {
  const result = await pool.query(
    `
    UPDATE users
    SET
      first_name = $1,
      last_name = $2,
      username = $3,
      department_id = $4,
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
    [firstName, lastName, username, departmentId ?? null, id],
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
