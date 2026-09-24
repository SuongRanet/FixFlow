import express from "express";
import authRouter from "./modules/auth/auth.route.js";
import userRouter from "./modules/user/user.route.js";
import ticketRouter from "./modules/tickets/ticket.route.js";
import ticketCommentRouter from "./modules/tickets_comments/ticket-comment.route.js";
import ticketAttachment from "./modules/ticket-attachment/ticketAttachment.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import dashboardRoute from "./modules/Dashboard/admin.routes.js";
import departmentRouter from "./modules/department/department.route.js";
import categoryRouter from "./modules/category/category.route.js";
import { setupSwagger } from "./swagger/swagger.js";
import { allowedOrigins } from "./config/origins.js";
import path from "path";
import multer from "multer";
import type { NextFunction, Request, Response } from "express";
const app = express();
app.use(express.json());
import cors from "cors";
const PREFIX_URL = "/api/v1";

app.use(
  cors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

// Attachments uploaded before the Cloudinary switch still live on disk,
// and their rows hold a /uploads/... path. Serve them so those older
// tickets keep working; new uploads go straight to Cloudinary.
app.use("/uploads", express.static(path.join(process.cwd(), "uploads")));

app.use(PREFIX_URL, authRouter);
app.use(PREFIX_URL, userRouter);
app.use(PREFIX_URL, ticketRouter);
app.use(PREFIX_URL, ticketCommentRouter);
app.use(PREFIX_URL, ticketAttachment);
app.use(PREFIX_URL, notificationRoutes);
app.use(PREFIX_URL, dashboardRoute);
app.use(PREFIX_URL, departmentRouter);
app.use(PREFIX_URL, categoryRouter);

setupSwagger(app);

/**
 * Last-resort handler so a thrown error becomes JSON the client can read,
 * instead of Express's default HTML page.
 */
app.use(
  (error: unknown, _req: Request, res: Response, next: NextFunction) => {
    if (res.headersSent) return next(error);

    if (error instanceof multer.MulterError) {
      const message =
        error.code === "LIMIT_FILE_SIZE"
          ? "File is larger than the 10 MB limit"
          : error.message;

      return res.status(413).json({ success: false, message });
    }

    console.error("Unhandled error:", error);

    return res
      .status(500)
      .json({ success: false, message: "Internal server error" });
  },
);
export default app;
