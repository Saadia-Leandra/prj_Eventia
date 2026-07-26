import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import createRoutes from "./routes.js";
import NotificationModel from "./models/NotificationModel.js";
import NotificationRepository from "./domain/NotificationRepository.js";
import NotificationService from "./domain/NotificationService.js";
import { errorHandler } from "./errors.js";

export function createApp() {
  const app = express();
  const service = new NotificationService(new NotificationRepository(NotificationModel));
  app.use(cors());
  app.use(express.json());
  app.get("/health", (req, res) =>
    res.json({ service: "notification-service", status: "UP" }));
  app.use("/api/notifications", createRoutes(service));
  app.use(errorHandler);
  return app;
}

export async function start() {
  const port = Number(process.env.PORT || 4004);
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_notifications",
  );
  return createApp().listen(port, () =>
    console.log(`notification-service sur le port ${port}`));
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Impossible de démarrer notification-service:", error.message);
    process.exitCode = 1;
  });
}
