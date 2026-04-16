import { Router } from "express";
import { marketController } from "./market.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export const marketRouter = Router();

marketRouter.get("/external-data", authMiddleware, marketController.getExternalData);
marketRouter.get("/external-data/history", authMiddleware, marketController.getHistory);
