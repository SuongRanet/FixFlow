import express from "express";
import { authMiddleware } from "../../middleware/auth.middleware.js";
import { getCategoriesController } from "./category.controller.js";

const categoryRouter = express.Router();
const PREFIX = "/categories";

categoryRouter.get(PREFIX, authMiddleware, getCategoriesController);

export default categoryRouter;
