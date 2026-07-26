import mongoose from "mongoose";

export class AppError extends Error {
  constructor(status, message) {
    super(message);
    this.status = status;
  }
}

export const asyncRoute = (handler) => (req, res, next) =>
  Promise.resolve(handler(req, res, next)).catch(next);

export function errorHandler(error, req, res, next) {
  if (error instanceof mongoose.Error.CastError) return res.status(400).json({ message: "Identifiant invalide." });
  if (error?.code === 11000) return res.status(409).json({ message: "Ce courriel est déjà utilisé." });
  const status = error.status || 500;
  if (status === 500) console.error(error);
  return res.status(status).json({ message: status === 500 ? "Erreur interne du serveur." : error.message });
}
