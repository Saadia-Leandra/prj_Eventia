import { Router } from "express";
import { asyncRoute } from "./errors.js";

export default function createRoutes(service) {
  const router = Router();
  router.get("/", asyncRoute(async (req, res) => res.json(await service.list())));
  router.get("/:id", asyncRoute(async (req, res) => {
    const notification = await service.get(req.params.id);
    if (!notification) return res.status(404).json({ message: "Notification introuvable." });
    res.json(notification);
  }));
  router.post("/", asyncRoute(async (req, res) =>
    res.status(201).json(await service.create(req.body))));
  return router;
}
