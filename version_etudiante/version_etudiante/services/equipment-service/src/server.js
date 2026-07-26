import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import createRoutes from "./routes.js";
import EquipmentModel from "./models/EquipmentModel.js";
import EquipmentRepository from "./domain/EquipmentRepository.js";
import EquipmentService from "./domain/EquipmentService.js";
import { errorHandler } from "./errors.js";

export function createApp() {
  const app = express();
  const service = new EquipmentService(new EquipmentRepository(EquipmentModel));
  app.use(cors());
  app.use(express.json());
  app.get("/health", (req, res) => res.json({ service: "equipment-service", status: "UP" }));
  app.use("/api/equipments", createRoutes(service));
  app.use(errorHandler);
  return app;
}

export async function start() {
  const port = Number(process.env.PORT || 4002);
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_equipments");
  return createApp().listen(port, () => console.log(`equipment-service sur le port ${port}`));
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Impossible de démarrer equipment-service:", error.message);
    process.exitCode = 1;
  });
}
