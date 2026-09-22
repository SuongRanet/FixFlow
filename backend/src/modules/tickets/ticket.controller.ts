import type { Request, Response, NextFunction } from "express";
import {
  assignTicketService,
  assignTicketToMeService,
  createTicketService,
  getTicketByIdService,
  getTicketService,
  getTicketsService,
  updateTicketStatusService,
} from "./ticket.service.js";
import {
  ticketFilterSchema,
  updateTicketStatusSchema,
} from "./ticket.schema.js";
import z from "zod";

export const createTicketController = async (req: Request, res: Response) => {
  try {
    const { title, description, priority, categoryId, departmentId } = req.body;

    if (!req.user) {
      return res.status(401).json({
        message: "Unauthorized",
      });
    }
    const createdBy = req.user.id;

    const ticket = await createTicketService(
      title,
      description,
      priority,
      categoryId,
      departmentId,
      createdBy,
    );

    return res.status(201).json({
      message: "Ticket created successfully",
      data: ticket,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      message: "Failed to create ticket",
    });
  }
};

export const getTicketsController = async (req: Request, res: Response) => {
  const userId = req.user!.id;
  const role = req.user!.role;
  try {
    const tickets = await getTicketService(userId, role);

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    // console.error("Get tickets error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to get tickets",
    });
  }
};

export const getTicketByIdController = async (req: Request, res: Response) => {
  const id = Number(req.params.id);
  if (isNaN(id)) {
    return res.status(400).json({ message: "Invalid user ID" });
  }
  try {
    const tickets = await getTicketByIdService(id);
    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    // console.error("Get tickets error:", error);
    if (error instanceof Error && error.message === "Ticket not found") {
      return res.status(404).json({ succes: false, message: error.message });
    }
    return res.status(500).json({ message: "Failed to get Ticket" });
  }
};

export const assignTicketController = async (req: Request, res: Response) => {
  try {
    const ticketId = Number(req.params.id);
    const { assignedTo } = req.body;

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    if (!Number.isInteger(assignedTo)) {
      return res.status(400).json({
        success: false,
        message: "Invalid assigned user ID",
      });
    }

    const ticket = await assignTicketService(ticketId, assignedTo);

    return res.status(200).json({
      success: true,
      message: "Ticket assigned successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Assign ticket error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign ticket",
    });
  }
};
export const assignTicketToMeController = async (
  req: Request,
  res: Response,
) => {
  try {
    const ticketId = Number(req.params.id);

    if (!req.user) {
      return res.status(401).json({
        success: false,
        message: "Unauthorized",
      });
    }

    const ticket = await assignTicketToMeService(ticketId, req.user.id);

    return res.status(200).json({
      success: true,
      message: "Ticket assigned to you successfully",
      data: ticket,
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Failed to assign ticket",
    });
  }
};
export const updateTicketStatusController = async (
  req: Request,
  res: Response,
) => {
  try {
    const ticketId = Number(req.params.id);
    const { status } = updateTicketStatusSchema.parse(req.body);

    if (!Number.isInteger(ticketId)) {
      return res.status(400).json({
        success: false,
        message: "Invalid ticket ID",
      });
    }

    if (!status) {
      return res.status(400).json({
        success: false,
        message: "Status is required",
      });
    }

    const ticket = await updateTicketStatusService(ticketId, status);
    return res.status(200).json({
      success: true,
      message: "Ticket status updated successfully",
      data: ticket,
    });
  } catch (error) {
    console.error("Update ticket status error:", error);

    if (error instanceof z.ZodError) {
      return res.status(400).json({
        success: false,
        message: "Validation error",
        errors: error.issues,
      });
    }

    return res.status(500).json({
      success: false,
      message: "Failed to update ticket status",
    });
  }
};
export const getTicketsFillterController = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  try {
    const filters = ticketFilterSchema.parse(req.query);
    
    const tickets = await getTicketsService(filters);

    return res.status(200).json({
      success: true,
      data: tickets,
    });
  } catch (error) {
    next(error);
  }
};
