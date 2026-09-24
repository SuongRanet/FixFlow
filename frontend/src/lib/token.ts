/**
 * The cookie the JWT lives in. Kept in its own module so the axios client,
 * the socket client and the auth store can share it without importing
 * each other in a cycle.
 */
export const TOKEN_COOKIE = "accessToken";
