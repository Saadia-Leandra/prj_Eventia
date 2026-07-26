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

async function seedInitialEquipment() {
  const count = await EquipmentModel.estimatedDocumentCount();
  if (count === 0) {
    await EquipmentModel.create([
      { name: "Projecteur", category: "Audio/Visuel", dailyPrice: 35, availableQuantity: 5 },
      { name: "Chaises pliantes", category: "Mobilier", dailyPrice: 3, availableQuantity: 50 },
      { name: "Enceinte portable", category: "Audio", dailyPrice: 20, availableQuantity: 10 },
    ]);
    console.log("equipment-service : catalogue de matériel initial créé.");
  }
}

export async function start() {
  const port = Number(process.env.PORT || 4002);
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_equipments");
  await seedInitialEquipment();
  return createApp().listen(port, () => console.log(`equipment-service sur le port ${port}`));
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Impossible de démarrer equipment-service:", error.message);
    process.exitCode = 1;
  });
}
