import { Router } from "express";
import multer from "multer";
import { storageController } from "./storage.controller";
import { authMiddleware } from "../../shared/middlewares/auth.middleware";

export const storageRouter = Router();
const upload = multer({ storage: multer.memoryStorage() });

storageRouter.post("/upload", authMiddleware, upload.single("file"), storageController.upload);
