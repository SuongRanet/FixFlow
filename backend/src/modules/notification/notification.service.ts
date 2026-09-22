import { CreateNotificationInput } from "../../types/type.js";
import {
  createNotificationRepository,
  getNotificationsRepository,
  getUnreadNotificationCountRepository,
  markAllNotificationsAsReadRepository,
  markNotificationAsReadRepository,
} from "./notification.repository.js";

export const createNotificationService = async (
  data: CreateNotificationInput,
) => {
  return await createNotificationRepository(data);
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
