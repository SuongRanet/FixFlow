import type { Request, Response } from "express";
import { getDashboardService } from "./admin.service.js";

export const dashboardController = async (req: Request, res: Response) => {
  try {
    const dashboard = await getDashboardService();
    return res.status(200).json({ success: true, data: dashboard });
  } catch (error) {
    console.error("Dashboard error:", error);
    return res
      .status(500)
      .json({ success: false, message: "Failed to get dashboard data" });
  }
};
