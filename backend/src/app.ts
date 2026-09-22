import express from "express";
import authRouter from "./modules/auth/auth.route.js";
import userRouter from "./modules/user/user.route.js";
import ticketRouter from "./modules/tickets/ticket.route.js";
import ticketCommentRouter from "./modules/tickets_comments/ticket-comment.route.js";
import ticketAttachment from "./modules/ticket-attachment/ticketAttachment.routes.js";
import notificationRoutes from "./modules/notification/notification.routes.js";
import dashboardRoute from "./modules/Dashboard/admin.routes.js";
import { setupSwagger } from "./swagger/swagger.js";
const app = express();
app.use(express.json());

const PREFIX_URL = "/api/v1";

app.use(PREFIX_URL, authRouter);
app.use(PREFIX_URL, userRouter);
app.use(PREFIX_URL, ticketRouter);
app.use(PREFIX_URL, ticketCommentRouter);
app.use(PREFIX_URL, ticketAttachment);
app.use(PREFIX_URL, notificationRoutes);
app.use(PREFIX_URL, dashboardRoute);

setupSwagger(app);
export default app;
