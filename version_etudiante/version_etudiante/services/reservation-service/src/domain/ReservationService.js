import Reservation from "./Reservation.js";
import { AppError } from "../errors.js";

export default class ReservationService {
  constructor(repository, { clientsApi, equipmentApi, notificationsApi }) {
    this.repository = repository;
    this.clientsApi = clientsApi;
    this.equipmentApi = equipmentApi;
    this.notificationsApi = notificationsApi;
  }
  list() { return this.repository.findAll(); }
  async get(id) {
    const reservation = await this.repository.findById(id);
    if (!reservation) throw new AppError(404, "Réservation introuvable.");
    return reservation;
  }
  async create(input) {
    const reservation = new Reservation(input);
    const errors = reservation.validate();
    if (errors.length) throw new AppError(400, errors.join(" "));

    const [client, equipment] = await Promise.all([
      this.#request(() => this.clientsApi.get(`/${reservation.clientId}`), "Client introuvable."),
      this.#request(() => this.equipmentApi.get(`/${reservation.equipmentId}`), "Matériel introuvable."),
    ]);
    reservation.clientName = client.name;
    reservation.clientEmail = client.email;
    reservation.equipmentName = equipment.name;
    reservation.calculateTotal(equipment.dailyPrice);

    await this.#request(
      () => this.equipmentApi.put(`/${reservation.equipmentId}/reserve`, { quantity: reservation.quantity }),
      "Impossible de réserver le matériel.",
    );

    let saved;
    try {
      saved = await this.repository.create(reservation.toObject());
    } catch (error) {
      await this.equipmentApi.put(`/${reservation.equipmentId}/release`, { quantity: reservation.quantity }).catch(() => undefined);
      throw error;
    }

    try {
      await this.#notify(client.email, `Réservation confirmée pour ${reservation.equipmentName}.`, "RESERVATION_CONFIRMED");
    } catch (error) {
      console.error("Notification non livrée pour la réservation :", error.message || error);
    }

    return saved;
  }
  async cancel(id) {
    const current = await this.repository.findById(id);
    if (!current) throw new AppError(404, "Réservation introuvable.");
    if (current.status === "CANCELLED") throw new AppError(409, "La réservation est déjà annulée.");

    const cancelled = await this.repository.cancelConfirmed(id);
    if (!cancelled) throw new AppError(409, "La réservation ne peut pas être annulée.");
    try {
      await this.#request(
        () => this.equipmentApi.put(`/${cancelled.equipmentId}/release`, { quantity: cancelled.quantity }),
        "Impossible de remettre le matériel en stock.",
      );
    } catch (error) {
      await this.repository.restoreConfirmed(id);
      throw error;
    }
    try {
      await this.#notify(
        cancelled.clientEmail || cancelled.clientName,
        `Réservation annulée pour ${cancelled.equipmentName}.`,
        "RESERVATION_CANCELLED",
      );
    } catch (error) {
      console.error("Notification non livrée pour l'annulation :", error.message || error);
    }
    return cancelled;
  }
  async delete(id) {
    const reservation = await this.get(id);
    if (reservation.status === "CONFIRMED") {
      await this.cancel(id);
    }
    await this.repository.delete(id);
  }
  async #notify(recipient, message, type) {
    await this.#request(
      () => this.notificationsApi.post("/", { recipient, message, type }),
      "Impossible d'enregistrer la notification.",
    );
  }
  async #request(operation, fallbackMessage) {
    try {
      const response = await operation();
      return response.data;
    } catch (error) {
      if (error instanceof AppError) throw error;
      const status = error.response?.status;
      const message = error.response?.data?.message || fallbackMessage;
      throw new AppError(status && status < 500 ? status : 502, message);
    }
  }
}
