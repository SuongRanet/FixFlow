import express from "express";
import {
  assignTicketController,
  assignTicketToMeController,
  createTicketController,
  getTicketByIdController,
  getTicketsController,
  getTicketsFillterController,
  updateTicketStatusController,
} from "./ticket.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const ticketRouter = express.Router();
const PREFIX = "/ticket";

ticketRouter.post(PREFIX, authMiddleware, createTicketController);
ticketRouter.get(PREFIX, authMiddleware, getTicketsController);
ticketRouter.get(
  `${PREFIX}/fillter`,
  authMiddleware,
  getTicketsFillterController,
);
ticketRouter.get(`${PREFIX}/:id`, authMiddleware, getTicketByIdController);
ticketRouter.patch(
  `${PREFIX}/:id/assign`,
  authMiddleware,
  assignTicketController,
);
ticketRouter.patch(
  `${PREFIX}/:id/assign-to-me`,
  authMiddleware,
  assignTicketToMeController,
);
ticketRouter.patch(
  `${PREFIX}/:id/status`,
  authMiddleware,
  updateTicketStatusController,
);

export default ticketRouter;
