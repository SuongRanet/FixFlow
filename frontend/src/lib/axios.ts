import axios, { AxiosError } from "axios";
import Cookies from "js-cookie";

import env from "../config/env";
import { TOKEN_COOKIE } from "./token";

const baseURL = env.apiUrl;

const serverRest = axios.create({
  baseURL,
  withCredentials: true,
  headers: {
    "Content-Type": "application/json",
  },
});

serverRest.interceptors.request.use(
  (config) => {
    const token = Cookies.get(TOKEN_COOKIE);
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error),
);

serverRest.interceptors.response.use(
  (response) => response,
  (error: AxiosError) => {
    // A 401 means the JWT is gone or expired; drop it and let the router
    // bounce the user back to the sign-in page.
    if (error.response?.status === 401) {
      Cookies.remove(TOKEN_COOKIE);
      localStorage.removeItem("fixflow-auth");

      if (!window.location.pathname.startsWith("/login")) {
        window.location.href = "/login?expired=1";
      }
    }
    return Promise.reject(error);
  },
);

/**
 * Turns an axios failure into the message the API sent, so pages can show
 * the backend's own wording instead of "Request failed with status code 400".
 */
export const getApiErrorMessage = (error: unknown): string | undefined => {
  if (axios.isAxiosError(error)) {
    if (!error.response) return undefined; // network / server down
    const data = error.response.data as
      | { message?: string; errors?: Record<string, string[]> }
      | undefined;

    if (data?.errors) {
      const first = Object.values(data.errors).flat()[0];
      if (first) return first;
    }
    return data?.message;
  }
  return undefined;
};

export const isNetworkError = (error: unknown): boolean =>
  axios.isAxiosError(error) && !error.response;

export default serverRest;
