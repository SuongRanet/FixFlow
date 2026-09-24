import { Express } from "express";
import swaggerUi from "swagger-ui-express";

const PORT = process.env.PORT || 3000;

const ticketStatuses = [
  "OPEN",
  "ASSIGNED",
  "IN_PROGRESS",
  "WAITING_FOR_USER",
  "RESOLVED",
  "CLOSED",
  "CANCELLED",
];

const idParam = (name: string, description: string) => ({
  name,
  in: "path",
  required: true,
  description,
  schema: { type: "integer", example: 1 },
});

const json = (schema: object) => ({
  required: true,
  content: { "application/json": { schema } },
});

const res = (description: string) => ({
  description,
  content: {
    "application/json": { schema: { $ref: "#/components/schemas/Message" } },
  },
});

const unauthorized = { 401: res("Missing, invalid or expired token") };
const forbidden = { 403: res("Requires ADMIN role") };

export const swaggerSpec = {
  openapi: "3.0.3",
  info: {
    title: "FixFlow API",
    version: "1.0.0",
    description:
      "Login via **POST /auth/login**, copy the `token` from the response, then click **Authorize** and paste it.",
  },
  servers: [{ url: `http://localhost:${PORT}/api/v1` }],
  tags: [
    { name: "Auth" },
    { name: "User" },
    { name: "Ticket" },
    { name: "Ticket Comment" },
    { name: "Ticket Attachment" },
    { name: "Notification" },
    { name: "Dashboard" },
    { name: "Department" },
    { name: "Category" },
  ],
  components: {
    securitySchemes: {
      bearerAuth: { type: "http", scheme: "bearer", bearerFormat: "JWT" },
    },
    schemas: {
      Message: {
        type: "object",
        properties: { message: { type: "string" } },
      },
      Role: { type: "string", enum: ["ADMIN", "IT_SUPPORT", "USER"] },
      TicketStatus: { type: "string", enum: ticketStatuses },
      TicketPriority: {
        type: "string",
        enum: ["LOW", "MEDIUM", "HIGH", "URGENT"],
      },
      RegisterInput: {
        type: "object",
        required: ["firstName", "lastName", "username", "email", "password"],
        properties: {
          firstName: { type: "string", minLength: 2, example: "John" },
          lastName: { type: "string", minLength: 2, example: "Doe" },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "johndoe",
          },
          email: {
            type: "string",
            format: "email",
            example: "john@example.com",
          },
          password: { type: "string", minLength: 8, example: "password123" },
          role: { $ref: "#/components/schemas/Role" },
          departmentId: { type: "integer", nullable: true, example: 1 },
        },
      },
      LoginInput: {
        type: "object",
        required: ["email", "password"],
        properties: {
          email: { type: "string", example: "john@example.com" },
          password: { type: "string", example: "password123" },
        },
      },
      CreateUserInput: {
        type: "object",
        required: [
          "firstName",
          "lastName",
          "username",
          "email",
          "password",
          "departmentId",
        ],
        properties: {
          firstName: { type: "string", minLength: 2, example: "Jane" },
          lastName: { type: "string", minLength: 2, example: "Smith" },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "janesmith",
          },
          email: {
            type: "string",
            format: "email",
            example: "jane@example.com",
          },
          password: { type: "string", minLength: 8, example: "password123" },
          role: { $ref: "#/components/schemas/Role" },
          departmentId: { type: "integer", nullable: true, example: 1 },
        },
      },
      UpdateUserInput: {
        type: "object",
        required: ["firstName", "lastName", "username"],
        properties: {
          firstName: { type: "string", maxLength: 50, example: "Jane" },
          lastName: { type: "string", maxLength: 50, example: "Smith" },
          username: {
            type: "string",
            minLength: 3,
            maxLength: 50,
            example: "janesmith",
          },
          departmentId: {
            type: "integer",
            nullable: true,
            description: "Omit to keep current value, send null to clear",
            example: 1,
          },
        },
      },
      Option: {
        type: "object",
        description: "Dropdown entry: name is the label, id is the value.",
        properties: {
          name: { type: "string", example: "Engineering" },
          id: { type: "integer", example: 4 },
        },
      },
      CreateTicketInput: {
        type: "object",
        required: ["title", "description", "categoryId", "departmentId"],
        properties: {
          title: { type: "string", maxLength: 255, example: "Printer broken" },
          description: {
            type: "string",
            example: "The 2nd floor printer is jammed",
          },
          priority: { $ref: "#/components/schemas/TicketPriority" },
          categoryId: { type: "integer", example: 1 },
          departmentId: { type: "integer", example: 1 },
        },
      },
    },
  },
  security: [{ bearerAuth: [] }],
  paths: {
    // ---------- Auth ----------
    "/auth/register": {
      post: {
        tags: ["Auth"],
        summary: "Register a new account",
        security: [],
        requestBody: json({ $ref: "#/components/schemas/RegisterInput" }),
        responses: {
          201: res("Registered"),
          400: res("Validation failed"),
          409: res("Email already exists"),
        },
      },
    },
    "/auth/login": {
      post: {
        tags: ["Auth"],
        summary: "Login and receive a JWT",
        security: [],
        requestBody: json({ $ref: "#/components/schemas/LoginInput" }),
        responses: {
          200: {
            description: "Login successful (token also set as httpOnly cookie)",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    message: { type: "string" },
                    data: { type: "object" },
                    token: { type: "string" },
                  },
                },
              },
            },
          },
          400: res("Validation failed"),
          401: res("Invalid email or password"),
          403: res("Account is inactive"),
        },
      },
    },
    "/auth/logout": {
      post: {
        tags: ["Auth"],
        summary: "Logout (clears token cookie)",
        security: [],
        responses: { 200: res("Logout successful") },
      },
    },
    "/auth/forgot-password": {
      post: {
        tags: ["Auth"],
        summary: "Send password reset email",
        security: [],
        requestBody: json({
          type: "object",
          required: ["email"],
          properties: {
            email: {
              type: "string",
              format: "email",
              example: "john@example.com",
            },
          },
        }),
        responses: {
          200: res("Reset email sent"),
          400: res("Validation failed"),
        },
      },
    },
    "/auth/reset-password": {
      post: {
        tags: ["Auth"],
        summary: "Reset password using token from email",
        security: [],
        parameters: [
          {
            name: "token",
            in: "query",
            required: true,
            schema: { type: "string" },
          },
        ],
        requestBody: json({
          type: "object",
          required: ["newPassword"],
          properties: {
            newPassword: {
              type: "string",
              minLength: 8,
              maxLength: 100,
              example: "newpassword123",
            },
          },
        }),
        responses: {
          200: res("Password reset successfully"),
          400: res("Missing token, validation failed, or reset failed"),
        },
      },
    },

    // ---------- User (ADMIN) ----------
    "/user": {
      get: {
        tags: ["User"],
        summary: "List users",
        responses: {
          200: res("Users retrieved"),
          ...unauthorized,
          ...forbidden,
        },
      },
      post: {
        tags: ["User"],
        summary: "Create user",
        requestBody: json({ $ref: "#/components/schemas/CreateUserInput" }),
        responses: {
          201: res("User created"),
          400: res("Validation failed"),
          409: res("Email already exists"),
          ...unauthorized,
          ...forbidden,
        },
      },
    },
    "/user/{id}": {
      parameters: [idParam("id", "User ID")],
      get: {
        tags: ["User"],
        summary: "Get user by ID",
        responses: {
          200: res("User retrieved"),
          400: res("Invalid user ID"),
          404: res("User not found"),
          ...unauthorized,
          ...forbidden,
        },
      },
      put: {
        tags: ["User"],
        summary: "Update user",
        requestBody: json({ $ref: "#/components/schemas/UpdateUserInput" }),
        responses: {
          200: res("User updated"),
          400: res("Invalid user ID or validation failed"),
          404: res("User not found"),
          ...unauthorized,
          ...forbidden,
        },
      },
      delete: {
        tags: ["User"],
        summary: "Deactivate user",
        responses: {
          200: res("User deleted"),
          400: res("Invalid user ID"),
          404: res("User not found"),
          ...unauthorized,
          ...forbidden,
        },
      },
    },

    // ---------- Ticket ----------
    "/ticket": {
      get: {
        tags: ["Ticket"],
        summary: "List tickets",
        responses: { 200: res("Tickets retrieved"), ...unauthorized },
      },
      post: {
        tags: ["Ticket"],
        summary: "Create ticket",
        requestBody: json({ $ref: "#/components/schemas/CreateTicketInput" }),
        responses: { 201: res("Ticket created"), ...unauthorized },
      },
    },
    "/ticket/fillter": {
      get: {
        tags: ["Ticket"],
        summary: "Filter tickets",
        parameters: [
          { name: "search", in: "query", schema: { type: "string" } },
          {
            name: "status",
            in: "query",
            schema: { $ref: "#/components/schemas/TicketStatus" },
          },
          {
            name: "priority",
            in: "query",
            schema: {
              type: "string",
              enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
            },
          },
          { name: "categoryId", in: "query", schema: { type: "integer" } },
          { name: "departmentId", in: "query", schema: { type: "integer" } },
          { name: "assignedTo", in: "query", schema: { type: "integer" } },
        ],
        responses: { 200: res("Filtered tickets"), ...unauthorized },
      },
    },
    "/ticket/{id}": {
      get: {
        tags: ["Ticket"],
        summary: "Get ticket by ID",
        parameters: [idParam("id", "Ticket ID")],
        responses: {
          200: res("Ticket retrieved"),
          400: res("Invalid ID"),
          404: res("Ticket not found"),
          ...unauthorized,
        },
      },
    },
    "/ticket/{id}/assign": {
      patch: {
        tags: ["Ticket"],
        summary: "Assign ticket to a user",
        parameters: [idParam("id", "Ticket ID")],
        requestBody: json({
          type: "object",
          required: ["assignedTo"],
          properties: { assignedTo: { type: "integer", example: 2 } },
        }),
        responses: {
          200: res("Ticket assigned"),
          400: res("Invalid input"),
          ...unauthorized,
        },
      },
    },
    "/ticket/{id}/assign-to-me": {
      patch: {
        tags: ["Ticket"],
        summary: "Assign ticket to the current user",
        parameters: [idParam("id", "Ticket ID")],
        responses: { 200: res("Ticket assigned"), ...unauthorized },
      },
    },
    "/ticket/{id}/status": {
      patch: {
        tags: ["Ticket"],
        summary: "Update ticket status",
        parameters: [idParam("id", "Ticket ID")],
        requestBody: json({
          type: "object",
          required: ["status"],
          properties: { status: { $ref: "#/components/schemas/TicketStatus" } },
        }),
        responses: {
          200: res("Status updated"),
          400: res("Invalid input"),
          ...unauthorized,
        },
      },
    },

    // ---------- Ticket Comment ----------
    "/ticket/{ticketId}/comments": {
      post: {
        tags: ["Ticket Comment"],
        summary: "Add a comment to a ticket",
        parameters: [idParam("ticketId", "Ticket ID")],
        requestBody: json({
          type: "object",
          required: ["content"],
          properties: {
            content: { type: "string", example: "Looking into it" },
            isInternal: { type: "boolean", example: false },
          },
        }),
        responses: {
          201: res("Comment created"),
          400: res("Invalid ticket ID or missing content"),
          ...unauthorized,
        },
      },
    },

    // ---------- Ticket Attachment ----------
    "/tickets/{ticketId}/attachments": {
      parameters: [idParam("ticketId", "Ticket ID")],
      get: {
        tags: ["Ticket Attachment"],
        summary: "List attachments of a ticket",
        responses: { 200: res("Attachments retrieved"), ...unauthorized },
      },
      post: {
        tags: ["Ticket Attachment"],
        summary: "Upload an attachment to Cloudinary (max 10 MB)",
        description:
          "The file is streamed to Cloudinary under fixflow/tickets/<ticketId>; the stored file_path is the returned secure URL.",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                required: ["file"],
                properties: {
                  file: { type: "string", format: "binary" },
                  commentId: { type: "integer" },
                },
              },
            },
          },
        },
        responses: {
          201: res("Attachment uploaded"),
          400: res("File is required"),
          ...unauthorized,
        },
      },
    },

    // ---------- Notification ----------
    "/notifications": {
      get: {
        tags: ["Notification"],
        summary: "List my notifications",
        responses: { 200: res("Notifications retrieved"), ...unauthorized },
      },
    },
    "/notifications/unread-count": {
      get: {
        tags: ["Notification"],
        summary: "Get unread notification count",
        responses: { 200: res("Unread count"), ...unauthorized },
      },
    },
    "/notifications/{id}/read": {
      patch: {
        tags: ["Notification"],
        summary: "Mark a notification as read",
        parameters: [idParam("id", "Notification ID")],
        responses: {
          200: res("Marked as read"),
          404: res("Notification not found"),
          ...unauthorized,
        },
      },
    },
    "/notifications/read-all": {
      patch: {
        tags: ["Notification"],
        summary: "Mark all notifications as read",
        responses: { 200: res("All marked as read"), ...unauthorized },
      },
    },

    // ---------- Department & Category ----------
    "/departments": {
      get: {
        tags: ["Department"],
        summary: "List departments as { name, id } options",
        responses: {
          200: {
            description: "Departments",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: { $ref: "#/components/schemas/Option" },
                    },
                  },
                },
              },
            },
          },
          ...unauthorized,
        },
      },
    },
    "/categories": {
      get: {
        tags: ["Category"],
        summary: "List active categories as { name, id } options",
        responses: {
          200: {
            description: "Categories",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    success: { type: "boolean" },
                    data: {
                      type: "array",
                      items: {
                        allOf: [
                          { $ref: "#/components/schemas/Option" },
                          {
                            type: "object",
                            properties: {
                              description: { type: "string", nullable: true },
                            },
                          },
                        ],
                      },
                    },
                  },
                },
              },
            },
          },
          ...unauthorized,
        },
      },
    },

    // ---------- Dashboard ----------
    "/dashboard": {
      get: {
        tags: ["Dashboard"],
        summary: "Get dashboard stats",
        responses: { 200: res("Dashboard data"), ...unauthorized },
      },
    },
  },
};

export const setupSwagger = (app: Express) => {
  app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
  app.get("/api-docs.json", (_req, res) => res.json(swaggerSpec));
};
