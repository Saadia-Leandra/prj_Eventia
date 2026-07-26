/**
 * Contient la logique applicative du service du matériel.
 *
 * Cette classe orchestre l’entité Equipment et son dépôt. Elle doit gérer le
 * catalogue, valider les nouveaux articles et appliquer les règles de stock
 * lors d’une réservation ou d’une remise en disponibilité.
 *
 * Travail demandé :
 * - recevoir le dépôt de matériel;
 * - exposer les opérations requises par les contrats REST;
 * - valider les données avant la création;
 * - empêcher une réservation lorsque le matériel est absent ou insuffisant;
 * - diminuer ou augmenter la quantité disponible de façon cohérente;
 * - produire des erreurs compréhensibles lorsque l’opération est impossible.
 *
 * Cette classe ne doit pas traiter directement les objets req et res.
 */
import Equipment from "./Equipment.js";
import { AppError } from "../errors.js";

export default class EquipmentService {
  constructor(repository) { this.repository = repository; }
  list() { return this.repository.findAll(); }
  async get(id) {
    const item = await this.repository.findById(id);
    if (!item) throw new AppError(404, "Matériel introuvable.");
    return item;
  }
  create(input) { return this.repository.create(this.#validate(input).toObject()); }
  async update(id, input) {
    const updated = await this.repository.update(id, this.#validate(input).toObject());
    if (!updated) throw new AppError(404, "Matériel introuvable.");
    return updated;
  }
  async delete(id) {
    if (!await this.repository.delete(id)) throw new AppError(404, "Matériel introuvable.");
  }
  async reserve(id, rawQuantity) {
    const quantity = this.#quantity(rawQuantity);
    const updated = await this.repository.reserve(id, quantity);
    if (updated) return updated;
    if (!await this.repository.findById(id)) throw new AppError(404, "Matériel introuvable.");
    throw new AppError(409, "Quantité disponible insuffisante.");
  }
  async release(id, rawQuantity) {
    const quantity = this.#quantity(rawQuantity);
    const updated = await this.repository.release(id, quantity);
    if (!updated) throw new AppError(404, "Matériel introuvable.");
    return updated;
  }
  #validate(input) {
    const item = new Equipment(input);
    const errors = item.validate();
    if (errors.length) throw new AppError(400, errors.join(" "));
    return item;
  }
  #quantity(value) {
    const quantity = Number(value);
    if (!Number.isInteger(quantity) || quantity < 1) throw new AppError(400, "La quantité doit être un entier supérieur ou égal à 1.");
    return quantity;
  }
}
