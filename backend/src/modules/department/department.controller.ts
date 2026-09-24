import type { Request, Response } from "express";
import { getDepartmentsService } from "./department.service.js";

export const getDepartmentsController = async (req: Request, res: Response) => {
  try {
    const departments = await getDepartmentsService();

    return res.status(200).json({ success: true, data: departments });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to get departments" });
  }
};
