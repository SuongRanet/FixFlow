import { createCommentService } from "./ticket-comment.service.js";

import { Request, Response, NextFunction } from "express";

export const createCommentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = Number(req.params.ticketId);
    const userId = req.user!.id;
    const { content, isInternal } = req.body;

    // Basic Validation
    if (isNaN(ticketId)) {
      return res.status(400).json({ message: "Invalid ticket ID" });
    }

    if (!content || typeof content !== "string") {
      return res.status(400).json({ message: "Content is required" });
    }

    const comment = await createCommentService(
      ticketId,
      userId,
      content,
      Boolean(isInternal),
    );

    return res.status(201).json({
      message: "Comment created successfully",
      data: comment,
    });
  } catch (error) {
    next(error); // Passes the error to your global Express error-handling middleware
  }
};
