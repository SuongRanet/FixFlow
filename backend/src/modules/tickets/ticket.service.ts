import { createNotificationService } from "../notification/notification.service.js";
import {
  assignTicketRepository,
  assignTicketToMeRepository,
  createTicketRepository,
  generateTicketCode,
  getTicketById,
  getTicketsFilterRepository,
  getTicketsRepository,
  updateTicketStatusRepository,
} from "./ticket.repository.js";
import { TicketFilters } from "./ticket.schema.js";

export const createTicketService = async (
  title: string,
  description: string,
  priority: "LOW" | "MEDIUM" | "HIGH" | "URGENT",
  categoryId: number,
  departmentId: number,
  createdBy: number,
) => {
  const ticketCode = generateTicketCode();

  return await createTicketRepository(
    await ticketCode,
    title,
    description,
    priority,
    categoryId,
    departmentId,
    createdBy,
  );
};
export const getTicketService = async (id: number, role: string) => {
  const ticket = await getTicketsRepository(id, role);
  return ticket;
};

export const getTicketByIdService = async (id: number) => {
  const ticket = await getTicketById(id);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return ticket;
};

export const assignTicketService = async (
  ticketId: number,
  assignedTo: number,
) => {
  const ticket = await assignTicketRepository(ticketId, assignedTo);

  if (!ticket) {
    throw new Error("Ticket not found");
  }
  await createNotificationService({
    userId: assignedTo,
    ticketId: ticket.id,
    title: "Ticket Assigned",
    message: `Ticket ${ticket.ticket_code} has been assigned to you.`,
  });
  return ticket;
};
export const assignTicketToMeService = async (
  ticketId: number,
  userId: number,
) => {
  const ticket = await assignTicketToMeRepository(ticketId, userId);

  if (!ticket) {
    throw new Error("Ticket not found");
  }
  await createNotificationService({
    userId,
    ticketId: ticket.id,
    title: "Ticket Assigned",
    message: `Ticket ${ticket.ticket_code} has been assigned to you.`,
  });
  return ticket;
};
export const updateTicketStatusService = async (
  ticketId: number,
  status:
    | "OPEN"
    | "ASSIGNED"
    | "IN_PROGRESS"
    | "WAITING_FOR_USER"
    | "RESOLVED"
    | "CLOSED"
    | "CANCELLED",
) => {
  const ticket = await updateTicketStatusRepository(ticketId, status);

  if (!ticket) {
    throw new Error("Ticket not found");
  }

  return ticket;
};
export const getTicketsService = async (filters: TicketFilters) => {
  console.log("FILTERS:", filters);
  return await getTicketsFilterRepository(filters);
};
