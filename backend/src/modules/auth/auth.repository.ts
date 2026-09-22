import pool from "../../config/db.js";

// REGISTER
export const registerRepository = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  passwordHash: string,
) => {
  const result = await pool.query(
    `
    INSERT INTO users (
      first_name,
      last_name,
      username,
      email,
      password_hash
    )
    VALUES ($1, $2, $3, $4, $5)
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
    [firstName, lastName, username, email, passwordHash],
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

// LOGIN
export const loginRepository = async (email: string) => {
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
      is_active
    FROM users
    WHERE email = $1
    `,
    [email],
  );

  return result.rows[0];
};

export const createPasswordResetTokenRepository = async (
  userId: number,
  tokenHash: string,
  expiresAt: Date,
) => {
  const result = await pool.query(
    ` INSERT INTO password_reset_tokens ( user_id, token_hash, expires_at ) VALUES ($1, $2, $3) RETURNING id, user_id, token_hash, expires_at, created_at `,
    [userId, tokenHash, expiresAt],
  );
  return result.rows[0];
};

export const getPasswordResetTokenRepository = async (tokenHash: string) => {
  const result = await pool.query(
    ` SELECT id, user_id, token_hash, expires_at, used_at, created_at FROM password_reset_tokens WHERE token_hash = $1 AND used_at IS NULL AND expires_at > CURRENT_TIMESTAMP `,
    [tokenHash],
  );
  return result.rows[0];
};

export const markPasswordResetTokenUsedRepository = async (id: number) => {
  const result = await pool.query(
    ` UPDATE password_reset_tokens SET used_at = CURRENT_TIMESTAMP WHERE id = $1 RETURNING id, used_at `,
    [id],
  );
  return result.rows[0];
};

export const updatePasswordRepository = async (
  userId: number,
  passwordHash: string,
) => {
  const result = await pool.query(
    ` UPDATE users SET password_hash = $1, updated_at = CURRENT_TIMESTAMP WHERE id = $2 RETURNING id, email, updated_at `,
    [passwordHash, userId],
  );
  return result.rows[0];
};
