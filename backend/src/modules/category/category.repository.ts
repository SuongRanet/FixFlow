import pool from "../../config/db.js";

export const getCategoriesRepository = async () => {
  const result = await pool.query(
    `
    SELECT
      id,
      name,
      description
    FROM categories
    WHERE is_active = true
    ORDER BY name ASC
    `,
  );

  return result.rows;
};
