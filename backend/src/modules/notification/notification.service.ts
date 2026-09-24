import { emitToUser } from "../../config/socket.js";
import { CreateNotificationInput } from "../../types/type.js";
import {
  createNotificationRepository,
  getNotificationsRepository,
  getUnreadNotificationCountRepository,
  markAllNotificationsAsReadRepository,
  markNotificationAsReadRepository,
} from "./notification.repository.js";

/**
 * Every notification in the app is created here, so this is the one place
 * that needs to push to the socket — new callers get live delivery free.
 */
export const createNotificationService = async (
  data: CreateNotificationInput,
) => {
  const notification = await createNotificationRepository(data);

  emitToUser(data.userId, "notification:new", notification);

  return notification;
};

export const getNotificationsService = async (userId: number) => {
  return await getNotificationsRepository(userId);
};

export const getUnreadNotificationCountService = async (userId: number) => {
  return await getUnreadNotificationCountRepository(userId);
};

export const markNotificationAsReadService = async (
  notificationId: number,
  userId: number,
) => {
  return await markNotificationAsReadRepository(notificationId, userId);
};

export const markAllNotificationsAsReadService = async (userId: number) => {
  return await markAllNotificationsAsReadRepository(userId);
};
