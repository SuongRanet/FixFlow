import type { Request, Response } from "express";
import {
  getNotificationsService,
  getUnreadNotificationCountService,
  markAllNotificationsAsReadService,
  markNotificationAsReadService,
} from "./notification.service.js";

export const getNotificationsController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notifications = await getNotificationsService(req.user.id);

    return res.status(200).json({
      success: true,
      data: notifications,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get notifications",
    });
  }
};
export const getUnreadNotificationCountController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const count = await getUnreadNotificationCountService(req.user.id);

    return res.status(200).json({
      success: true,
      data: {
        count,
      },
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to get unread notification count",
    });
  }
};
export const markNotificationAsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const notificationId = Number(req.params.id);

    const notification = await markNotificationAsReadService(
      notificationId,
      req.user.id,
    );

    if (!notification) {
      return res.status(404).json({
        success: false,
        message: "Notification not found",
      });
    }

    return res.status(200).json({
      success: true,
      data: notification,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notification as read",
    });
  }
};
export const markAllNotificationsAsReadController = async (
  req: Request,
  res: Response,
) => {
  try {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    await markAllNotificationsAsReadService(req.user.id);

    return res.status(200).json({
      success: true,
      message: "All notifications marked as read",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to mark notifications as read",
    });
  }
};
