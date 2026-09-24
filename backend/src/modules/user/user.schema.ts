import { z } from "zod";

export const createSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters"),

  lastName: z.string().trim().min(2, "Last name must be at least 2 characters"),

  username: z
    .string()
    .trim()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),

  email: z.string().trim().toLowerCase().email("Invalid email address"),

  password: z.string().min(8, "Password must be at least 8 characters"),

  role: z.enum(["ADMIN", "IT_SUPPORT", "USER"]).default("USER"),

  departmentId: z.number().int().positive().nullable(),
});

export const updateUserSchema = z.object({
  firstName: z
    .string()
    .min(1, "First name is required")
    .max(50, "First name must be at most 50 characters"),
  lastName: z
    .string()
    .min(1, "Last name is required")
    .max(50, "Last name must be at most 50 characters"),
  username: z
    .string()
    .min(3, "Username must be at least 3 characters")
    .max(50, "Username must be at most 50 characters"),
//   email: z
//     .string()
//     .email("Invalid email address")
//     .max(100, "Email must be at most 100 characters"),
  departmentId: z.number().int().positive().nullable().optional(),
  role: z.enum(["ADMIN", "IT_SUPPORT", "USER"]).optional(),
});
