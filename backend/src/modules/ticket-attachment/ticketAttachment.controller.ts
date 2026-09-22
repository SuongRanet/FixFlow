import type { Request, Response, NextFunction } from "express";
import { createAttachmentService, getAttachmentsByTicketService } from "./ticketAttachment.service.js";

export const createAttachmentController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = Number(req.params.ticketId);

    const commentId = req.body.commentId ? Number(req.body.commentId) : null;

    const uploadedBy = req.user!.id;

    const file = req.file;

    if (!file) {
      return res.status(400).json({
        success: false,
        message: "File is required",
      });
    }

    const attachment = await createAttachmentService(
      ticketId,
      commentId,
      uploadedBy,
      file,
    );

    return res.status(201).json({
      success: true,
      message: "Attachment uploaded successfully",
      data: attachment,
    });
  } catch (error) {
    next(error);
  }
};
export const getAttachmentsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const ticketId = Number(req.params.ticketId);

    const attachments = await getAttachmentsByTicketService(ticketId);

    return res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    next(error);
  }
};
