import argon2 from "argon2";
import {
  getUserByEmailRepository,
  loginRepository,
  registerRepository,
} from "./auth.repository.js";
import jwt from "jsonwebtoken";
import { broadcastUserRegistered } from "../../realtime/broadcast.js";

export const registerService = async (
  firstName: string,
  lastName: string,
  username: string,
  email: string,
  password: string,
) => {
  const existingUser = await getUserByEmailRepository(email);

  if (existingUser) {
    throw new Error("Email already exists");
  }

  const hashedPassword = await argon2.hash(password);

  const user = await registerRepository(
    firstName,
    lastName,
    username,
    email,
    hashedPassword,
  );

  broadcastUserRegistered({
    id: user.id,
    username: user.username,
    email: user.email,
    role: user.role,
    departmentId: user.department_id ?? null,
    createdAt: user.created_at,
  });

  return user;
};

export const loginService = async (email: string, password: string) => {
  const user = await loginRepository(email);

  if (!user) {
    throw new Error("Invalid email or password");
  }

  if (!user.is_active) {
    throw new Error("Account is inactive");
  }

  const validPassword = await argon2.verify(user.password_hash, password);

  if (!validPassword) {
    throw new Error("Invalid email or password");
  }

  const token = jwt.sign(
    {
      id: user.id,
      email: user.email,
      role: user.role,
    },
    process.env.JWT_SECRET as string,
    {
      expiresIn: "1d",
    },
  );

  return {
    user: {
      id: user.id,
      firstName: user.first_name,
      lastName: user.last_name,
      username: user.username,
      email: user.email,
      role: user.role,
      departmentId: user.department_id,
    },
    token,
  };
};
