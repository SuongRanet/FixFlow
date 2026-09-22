import { z } from "zod";

export const ticketStatusSchema = z.enum([
  "OPEN",
  "IN_PROGRESS",
  "RESOLVED",
  "CLOSED",
]);
export const updateTicketStatusSchema = z.object({
  status: z.preprocess(
    (val) => {
      if (typeof val === "string") {
        return val.toUpperCase();
      }

      return val;
    },
    z.enum(
      [
        "OPEN",
        "ASSIGNED",
        "IN_PROGRESS",
        "WAITING_FOR_USER",
        "RESOLVED",
        "CLOSED",
        "CANCELLED",
      ],
      {
        message: "Invalid ticket status provided.",
      },
    ),
  ),
});

export const ticketPrioritySchema = z.enum(["LOW", "MEDIUM", "HIGH", "URGENT"]);

export const createTicketSchema = z.object({
  title: z.string().min(1).max(255),

  description: z.string().min(1),

  priority: ticketPrioritySchema.default("MEDIUM"),

  categoryId: z.number().int().positive(),

  departmentId: z.number().int().positive(),
});

export type CreateTicketInput = z.infer<typeof createTicketSchema>;

export type TicketStatus = z.infer<typeof ticketStatusSchema>;

export type TicketPriority = z.infer<typeof ticketPrioritySchema>;

export const ticketFilterSchema = z.object({
  search: z.string().optional(),

  status: z
    .enum([
      "OPEN",
      "ASSIGNED",
      "IN_PROGRESS",
      "WAITING_FOR_USER",
      "RESOLVED",
      "CLOSED",
      "CANCELLED",
    ])
    .optional(),

  priority: z.enum(["LOW", "MEDIUM", "HIGH", "CRITICAL"]).optional(),

  categoryId: z.coerce.number().int().positive().optional(),

  departmentId: z.coerce.number().int().positive().optional(),

  assignedTo: z.coerce.number().int().positive().optional(),
});
export type TicketFilters = z.infer<typeof ticketFilterSchema>;