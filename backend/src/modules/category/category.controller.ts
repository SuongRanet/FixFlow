import type { Request, Response } from "express";
import { getCategoriesService } from "./category.service.js";

export const getCategoriesController = async (req: Request, res: Response) => {
  try {
    const categories = await getCategoriesService();

    return res.status(200).json({ success: true, data: categories });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to get categories" });
  }
};
