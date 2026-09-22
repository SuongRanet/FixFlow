import express from "express";
import {
  createUserController,
  deleteUserController,
  getUserByIdController,
  getUserController,
  updateUserController,
} from "./user.controller.js";

import { requireRole } from "../../middleware/role.middleware.js";
import { authMiddleware   } from "../../middleware/auth.middleware.js";

const userRouter = express.Router();

const PREFIX_URL = "/user";

userRouter.post(
  PREFIX_URL,
  authMiddleware,
  requireRole("ADMIN"),
  createUserController,
);
userRouter.get(
  `${PREFIX_URL}/:id`,
  authMiddleware,
  requireRole("ADMIN"),
  getUserByIdController,
);
userRouter.get(
  PREFIX_URL,
  authMiddleware,
  requireRole("ADMIN"),
  getUserController,
);
userRouter.put(
  `${PREFIX_URL}/:id`,
  authMiddleware,
  requireRole("ADMIN"),
  updateUserController,
);
userRouter.delete(
  `${PREFIX_URL}/:id`,
  authMiddleware,
  requireRole("ADMIN"),
  deleteUserController,
);

export default userRouter;
