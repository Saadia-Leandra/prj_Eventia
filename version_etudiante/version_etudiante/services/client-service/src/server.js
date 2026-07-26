import "dotenv/config";
import express from "express";
import cors from "cors";
import mongoose from "mongoose";
import createRoutes from "./routes.js";
import ClientModel from "./models/ClientModel.js";
import ClientRepository from "./domain/ClientRepository.js";
import ClientService from "./domain/ClientService.js";
import { errorHandler } from "./errors.js";

export function createApp() {
  const app = express();
  const service = new ClientService(new ClientRepository(ClientModel));
  app.use(cors());
  app.use(express.json());
  app.get("/health", (req, res) => res.json({ service: "client-service", status: "UP" }));
  app.use("/api/clients", createRoutes(service));
  app.use(errorHandler);
  return app;
}

export async function start() {
  const port = Number(process.env.PORT || 4001);
  await mongoose.connect(process.env.MONGO_URI || "mongodb://127.0.0.1:27017/eventia_clients");
  return createApp().listen(port, () => console.log(`client-service sur le port ${port}`));
}

if (process.env.NODE_ENV !== "test") {
  start().catch((error) => {
    console.error("Impossible de démarrer client-service:", error.message);
    process.exitCode = 1;
  });
}
