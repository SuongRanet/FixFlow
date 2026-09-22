import argon2 from "argon2";
import {
  createRepository,
  deleteRepository,
  getUserByEmailRepository,
  getUserByIdRepository,
  getUserRepository,
  updateRepository,
} from "./user.repository.js";

export const createUserService = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
  departmentId?: number | null,
) => {
  const existingUser = await getUserByEmailRepository(email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const passwordHash = await argon2.hash(password);

  const user = await createRepository(
    firstName,
    lastName,
    username,
    email,
    passwordHash,
    departmentId,
  );

  return user;
};

export const getUserService = async () => {
  const user = await getUserRepository();

  return user;
};

export const getUserByIdService = async (id: number) => {
  const user = await getUserByIdRepository(id);

  if (!user) {
    throw new Error("User not found");
  }

  return user;
};

export const updateUserService = async (
  id: number,
  firstName: string,
  lastName: string,
  username: string,
  departmentId?: number | null,
) => {
  const existingUser = await getUserByIdRepository(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const user = await updateRepository(
    id,
    firstName,
    lastName,
    username,
    departmentId === undefined ? existingUser.department_id : departmentId,
  );

  return user;
};

export const deleteUserService = async (id: number) => {
  const existingUser = await getUserByIdRepository(id);

  if (!existingUser) {
    throw new Error("User not found");
  }

  const user = await deleteRepository(id);

  return user;
};
