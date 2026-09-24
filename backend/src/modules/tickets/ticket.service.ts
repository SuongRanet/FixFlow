import { emitTicketChanged } from "../../config/socket.js";
import { broadcastTicketCreated } from "../../realtime/broadcast.js";
import { getAdminIdsRepository } from "../user/user.repository.js";
import { createNotificationService } from "../notification/notification.service.js";
import {
  assignTicketRepository,
  assignTicketToMeRepository,
  createTicketRepository,
  generateTicketCode,
  getMyTicketsRepository,
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

  const ticket = await createTicketRepository(
    await ticketCode,
    title,
    description,
    priority,
    categoryId,
    departmentId,
    createdBy,
  );

  // Live feed for the staff queue plus refreshed admin counters.
  broadcastTicketCreated({
    id: ticket.id,
    ticketCode: ticket.ticket_code,
    title: ticket.title,
    priority: ticket.priority,
    status: ticket.status,
    categoryId: ticket.category_id ?? null,
    departmentId: ticket.department_id ?? null,
    createdBy: { id: createdBy, username: ticket.creator_username ?? null },
    createdAt: ticket.created_at,
  });

  // Ticket creation is the only event that also leaves a stored
  // notification, so an admin who was offline still sees it.
  const adminIds = await getAdminIdsRepository();
  await Promise.all(
    adminIds
      .filter((adminId) => adminId !== createdBy)
      .map((adminId) =>
        createNotificationService({
          userId: adminId,
          ticketId: ticket.id,
          title: "New ticket",
          message: `${ticket.ticket_code} — ${ticket.title}`,
        }),
      ),
  );

  return ticket;
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

  // No notification row is written for a status change, so tell any open
  // ticket page directly that it should refresh.
  emitTicketChanged(ticket.id, { status: ticket.status });

  return ticket;
};
export const getTicketsService = async (filters: TicketFilters) => {
  console.log("FILTERS:", filters);
  return await getTicketsFilterRepository(filters);
};
export const getMyTicketsService = async (userId: number) => {
  return await getMyTicketsRepository(userId);
};
