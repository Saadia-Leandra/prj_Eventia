import { Router } from "express";
import { asyncRoute } from "./errors.js";

export default function createRoutes(service) {
  const router = Router();
  router.get("/", asyncRoute(async (req, res) => res.json(await service.list())));
  router.get("/:id", asyncRoute(async (req, res) => res.json(await service.get(req.params.id))));
  router.post("/", asyncRoute(async (req, res) => res.status(201).json(await service.create(req.body))));
  router.put("/:id", asyncRoute(async (req, res) => res.json(await service.update(req.params.id, req.body))));
  router.delete("/:id", asyncRoute(async (req, res) => {
    await service.delete(req.params.id);
    res.status(204).end();
  }));
  return router;
}
