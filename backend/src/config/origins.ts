import dotenv from "dotenv";

dotenv.config();

/**
 * The browser origins allowed to call the API and open a socket.
 * Set CORS_ORIGIN to a comma-separated list to override the dev default.
 */
export const allowedOrigins = process.env.CORS_ORIGIN?.split(",").map((origin) =>
  origin.trim(),
) ?? ["http://localhost:5173"];
