import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import {
  getNotificationsController,
  getUnreadNotificationCountController,
  markAllNotificationsAsReadController,
  markNotificationAsReadController,
} from "./notification.controller.js";

const notificationRoute = express.Router();

const path = "/notifications";

notificationRoute.get(path, authMiddleware, getNotificationsController);
notificationRoute.get(
  `${path}/unread-count`,
  authMiddleware,
  getUnreadNotificationCountController,
);
notificationRoute.patch(
  `${path}/:id/read`,
  authMiddleware,
  markNotificationAsReadController,
);
notificationRoute.patch(
  `${path}/read-all`,
  authMiddleware,
  markAllNotificationsAsReadController,
);

export default notificationRoute;
