import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { upload } from "../../middleware/upload.middleware.js";
import {
  createAttachmentController,
  getAttachmentsController,
} from "./ticketAttachment.controller.js";

const ticketAttachment = express.Router();
const path = "/tickets";

ticketAttachment.post(
  `${path}/:ticketId/attachments`,
  authMiddleware,
  upload.single("file"),
  createAttachmentController,
);
ticketAttachment.get(
  `${path}/:ticketId/attachments`,
  authMiddleware,
  getAttachmentsController,
);

export default ticketAttachment;
