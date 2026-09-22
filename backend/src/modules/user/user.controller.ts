import { Request, Response } from "express";
import {
  createUserService,
  deleteUserService,
  getUserByIdService,
  getUserService,
  updateUserService,
} from "./user.service.js";
import { createSchema, updateUserSchema } from "./user.schema.js";

export const createUserController = async (req: Request, res: Response) => {
  try {
    const result = createSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({ message: "Validation failed", errors: result.error.issues });
    }
    const { firstName, lastName, username, email, password, departmentId } =
      result.data;
    const user = await createUserService(
      firstName,
      lastName,
      username,
      email,
      password,
      departmentId,
    );
    return res
      .status(201)
      .json({ message: "User created successfully", data: user });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(409).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to create user" });
  }
};

export const getUserController = async (req: Request, res: Response) => {
  try {
    const users = await getUserService();
    return res
      .status(200)
      .json({ message: "Users retrieved successfully", data: users });
  } catch (error) {
    console.error(error);
    return res.status(500).json({ message: "Failed to get users" });
  }
};

export const getUserByIdController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await getUserByIdService(id);
    return res
      .status(200)
      .json({ message: "User retrieved successfully", data: user });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to get user" });
  }
};

export const updateUserController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const result = updateUserSchema.safeParse(req.body);
    if (!result.success) {
      return res
        .status(400)
        .json({
          message: "Validation failed",
          errors: result.error.flatten().fieldErrors,
        });
    }
    const { firstName, lastName, username, departmentId } = result.data;
    const user = await updateUserService(
      id,
      firstName,
      lastName,
      username,
      departmentId,
    );
    return res
      .status(200)
      .json({ message: "User updated successfully", data: user });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to update user" });
  }
};

export const deleteUserController = async (req: Request, res: Response) => {
  try {
    const id = Number(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid user ID" });
    }
    const user = await deleteUserService(id);
    return res
      .status(200)
      .json({ message: "User deleted successfully", data: user });
  } catch (error) {
    console.error(error);
    if (error instanceof Error && error.message === "User not found") {
      return res.status(404).json({ message: error.message });
    }
    return res.status(500).json({ message: "Failed to delete user" });
  }
};
