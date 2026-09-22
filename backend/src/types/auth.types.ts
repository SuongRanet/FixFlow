import { Request } from "express";
import { JwtPayload } from "jsonwebtoken";

export interface AuthPayload extends JwtPayload {
  id: number;
  email: string;
  role: string;
}

export interface AuthRequest extends Request {
  user: AuthPayload;
}