import type { Request, Response } from "express";
import {
  createAttachmentService,
  getAttachmentsByTicketService,
} from "./ticketAttachment.service.js";

/** Cloudinary rejections carry their own message; surface it to the client. */
const describeError = (error: unknown) => {
  if (error && typeof error === "object") {
    const candidate = error as {
      message?: string;
      error?: { message?: string };
      http_code?: number;
    };
    return {
      message:
        candidate.error?.message ?? candidate.message ?? "Upload failed",
      httpCode: candidate.http_code,
    };
  }
  return { message: "Upload failed", httpCode: undefined };
};

export const createAttachmentController = async (
  req: Request,
  res: Response,
) => {
  try {
    const ticketId = Number(req.params.ticketId);

    if (!Number.isInteger(ticketId) || ticketId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ticket ID" });
    }

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
    const { message, httpCode } = describeError(error);

    console.error("Attachment upload failed:", message);

    // A rejected Cloudinary credential is a server misconfiguration,
    // so report it as 502 rather than pretending the request was bad.
    const status = httpCode === 401 || httpCode === 403 ? 502 : 500;

    return res.status(status).json({
      success: false,
      message:
        status === 502
          ? `File storage rejected the upload: ${message}`
          : message,
    });
  }
};

export const getAttachmentsController = async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.ticketId);

    if (!Number.isInteger(ticketId) || ticketId < 1) {
      return res
        .status(400)
        .json({ success: false, message: "Invalid ticket ID" });
    }

    const attachments = await getAttachmentsByTicketService(ticketId);

    return res.status(200).json({
      success: true,
      data: attachments,
    });
  } catch (error) {
    console.error(error);

    return res
      .status(500)
      .json({ success: false, message: "Failed to get attachments" });
  }
};
