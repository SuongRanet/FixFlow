import type { Request, Response } from "express";
import {
  forgotPasswordSchema,
  loginSchema,
  registerSchema,
  resetPasswordSchema,
} from "./auth.schema.js";
import { loginService, registerService } from "./auth.service.js";
import {
  forgotPasswordService,
  resetPasswordService,
} from "./password-reset.service.js";
import { log } from "node:console";
export const registerController = async (req: Request, res: Response) => {
  try {
    const result = registerSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { firstName, lastName, username, email, password } = result.data;

    const user = await registerService(
      firstName,
      lastName,
      username,
      email,
      password,
    );

    return res.status(201).json({
      message: "User created successfully",
      data: user,
    });
  } catch (error) {
    console.error(error);

    if (error instanceof Error && error.message === "Email already exists") {
      return res.status(409).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Failed to create user",
    });
  }
};

export const loginController = async (req: Request, res: Response) => {
  try {
    const result = loginSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.issues.map((issue) => issue.message),
      });
    }

    const { email, password } = result.data;

    const resultLogin = await loginService(email, password);
    res.cookie("token", resultLogin.token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60 * 1000,
    });
    return res.status(200).json({
      message: "Login successful",
      data: resultLogin.user,
      token: resultLogin.token,
    });
  } catch (error) {
    console.error(error);

    if (
      error instanceof Error &&
      error.message === "Invalid email or password"
    ) {
      return res.status(401).json({
        message: error.message,
      });
    }

    if (error instanceof Error && error.message === "Account is inactive") {
      return res.status(403).json({
        message: error.message,
      });
    }

    return res.status(500).json({
      message: "Login failed",
    });
  }
};
export const forgotPasswordController = async (req: Request, res: Response) => {
  try {
    const result = forgotPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { email } = result.data;

    // Trigger service asynchronously without leaking existence info
    await forgotPasswordService(email);

    return res.status(200).json({
      message: "If the email exists, a password reset link has been sent.",
    });
  } catch (error) {
    console.error("Forgot password error:", error);

    return res.status(500).json({
      message: "Failed to process password reset request",
    });
  }
};
interface ResetPasswordParams {
  token: string;
}
export const resetPasswordController = async (
  req: Request<ResetPasswordParams>,
  res: Response,
) => {
  try {
    const { token } = req.query;

    if (typeof token !== "string" || !token) {
      return res.status(400).json({
        message: "Reset token is required",
      });
    }

    const result = resetPasswordSchema.safeParse(req.body);

    if (!result.success) {
      return res.status(400).json({
        message: "Validation failed",
        errors: result.error.flatten().fieldErrors,
      });
    }

    const { newPassword } = result.data;

    await resetPasswordService(token, newPassword);

    return res.status(200).json({
      message: "Password reset successfully",
    });
  } catch (error) {
    console.error("Reset password error:", error);

    if (error) {
      return res.status(400).json({
        message: "Reset password fail",
      });
    }

    return res.status(500).json({
      message: "Failed to reset password",
    });
  }
};
export const logoutController = async (req: Request, res: Response) => {
  try {
    res.clearCookie("token", {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
    });

    return res.status(200).json({
      success: true,
      message: "Logout successful",
    });
  } catch (error) {
    console.error(error);

    return res.status(500).json({
      success: false,
      message: "Logout failed",
    });
  }
};
