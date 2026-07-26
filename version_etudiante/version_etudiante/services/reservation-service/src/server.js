import "dotenv/config";
import axios from "axios";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import createRoutes from "./routes.js";
import ReservationModel from "./models/ReservationModel.js";
import ReservationRepository from "./domain/ReservationRepository.js";
import ReservationService from "./domain/ReservationService.js";
import { errorHandler } from "./errors.js";

export function createApp() {
  const app = express();
  const service = new ReservationService(new ReservationRepository(ReservationModel), {
    clientsApi: axios.create({ baseURL: process.env.CLIENT_SERVICE_URL || "http://localhost:4001/api/clients", timeout: 5000 }),
    equipmentApi: axios.create({ baseURL: process.env.EQUIPMENT_SERVICE_URL || "http://localhost:4002/api/equipments", timeout: 5000 }),
    notificationsApi: axios.create({ baseURL: process.env.NOTIFICATION_SERVICE_URL || "http://localhost:4004/api/notifications", timeout: 5000 }),
  });
  app.use(cors());
  app.use(express.json());
  app.get("/health", (req, res) => res.json({ service: "reservation-service", status: "UP" }));
  app.use("/api/reservations", createRoutes(service));
  app.use(errorHandler);
  return app;
}

export async function start() {
  const port = Number(process.env.PORT || 4003);
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_reservations");
  return createApp().listen(port, () => console.log(`reservation-service sur le port ${port}`));
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Impossible de démarrer reservation-service:", error.message);
    process.exitCode = 1;
  });
}
