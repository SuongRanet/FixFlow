import express from "express";
import { createCommentController } from "./ticket-comment.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";
const ticketCommentRouter = express.Router();
const PREFIX = "/ticket";

ticketCommentRouter.post(
  `${PREFIX}/:ticketId/comments`,
  authMiddleware,
  createCommentController,
);

export default ticketCommentRouter;
