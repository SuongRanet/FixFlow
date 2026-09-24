import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getDepartmentsController } from "./department.controller.js";

const departmentRouter = express.Router();
const PREFIX = "/departments";

departmentRouter.get(PREFIX, authMiddleware, getDepartmentsController);

export default departmentRouter;
