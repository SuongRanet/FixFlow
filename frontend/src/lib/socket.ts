import Cookies from "js-cookie";
import { io } from "socket.io-client";

import env from "../config/env";
import { TOKEN_COOKIE } from "./token";


const socketUrl = new URL(env.apiUrl).origin;

export const socket = io(socketUrl, {
  withCredentials: true,
  autoConnect: false,
  // The server verifies this in its handshake middleware.
  auth: (callback) => callback({ token: Cookies.get(TOKEN_COOKIE) }),
});


export const connectSocket = () => {
  if (!Cookies.get(TOKEN_COOKIE)) return;
  if (socket.connected) return;

  socket.connect();
};

export const disconnectSocket = () => {
  if (socket.connected) socket.disconnect();
};

if (import.meta.env.DEV) {
  socket.on("connect_error", (error) =>
    console.warn("Socket connection refused:", error.message),
  );
}
