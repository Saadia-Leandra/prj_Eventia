/**
 * Contient la logique applicative du service des notifications.
 *
 * Cette classe est utilisée par les routes REST pour consulter l’historique ou
 * créer une notification. Elle doit construire une entité Notification,
 * vérifier sa validité, puis demander au dépôt de l’enregistrer.
 *
 * Travail demandé :
 * - recevoir le dépôt de notifications;
 * - fournir les opérations attendues par les routes;
 * - valider une notification avant sa persistance;
 * - signaler une notification incomplète ou invalide.
 *
 * Cette classe ne doit pas manipuler directement Express ou Mongoose.
 */
import Notification from "./Notification.js";
import { AppError } from "../errors.js";

export default class NotificationService {
  constructor(repository) {
    this.repository = repository;
  }

  list() {
    return this.repository.findAll();
  }

  get(id) {
    return this.repository.findById(id);
  }

  create(input) {
    const notification = new Notification(input);
    const errors = notification.validate();
    if (errors.length) throw new AppError(400, errors.join(" "));
    return this.repository.create(notification.toObject());
  }
}
