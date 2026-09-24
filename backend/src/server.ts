import http from "http";

import app from "./app.js";
import { initSocket } from "./config/socket.js";

const PORT = process.env.PORT || 3000;

const httpServer = http.createServer(app);

// Socket.IO shares the HTTP server, so both run on the same port.
initSocket(httpServer);

httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
