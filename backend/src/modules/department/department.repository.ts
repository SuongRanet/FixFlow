import pool from "../../config/db.js";

export const getDepartmentsRepository = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      name
    FROM departments
    ORDER BY name ASC
    `,
  );

  return result.rows;
};
