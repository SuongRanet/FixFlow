import express from "express";
import {
  forgotPasswordController,
  loginController,
  logoutController,
  registerController,
  resetPasswordController,
} from "./auth.controller.js";

const authRouter = express.Router();
const path = "/auth";

authRouter.post(`${path}/register`, registerController);
authRouter.post(`${path}/login`, loginController);
authRouter.post(`${path}/logout`, logoutController);
authRouter.post(`${path}/forgot-password`, forgotPasswordController);
authRouter.post(`${path}/reset-password`, resetPasswordController);
export default authRouter;
