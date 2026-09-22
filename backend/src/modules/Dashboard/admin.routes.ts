import express from "express";
import { dashboardController } from "./admin.controller.js";
import { authMiddleware } from "../../middleware/auth.middleware.js";

const dashboardRoute = express.Router();

dashboardRoute.get("/dashboard", authMiddleware, dashboardController);

export default dashboardRoute;
