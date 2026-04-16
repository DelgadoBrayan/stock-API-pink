import express from "express";
import { authRouter } from "./modules/auth/auth.router";
import { marketRouter } from "./modules/market/market.router";
import { storageRouter } from "./modules/storage/storage.router";
import { errorMiddleware } from "./shared/middlewares/error.middleware";

export const app = express();

app.use(express.json());

app.use("/auth", authRouter);
app.use("/", marketRouter);
app.use("/storage", storageRouter);

app.use(errorMiddleware);
