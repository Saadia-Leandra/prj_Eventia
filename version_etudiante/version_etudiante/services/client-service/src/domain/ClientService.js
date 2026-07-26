/**
 * Contient la logique applicative du service des clients.
 *
 * Cette classe constitue l’intermédiaire entre les routes REST, l’entité
 * Client et le dépôt de clients. Elle doit appliquer les règles métier avant
 * de demander au dépôt de lire ou de modifier les données.
 *
 * Travail demandé :
 * - recevoir le dépôt nécessaire à son fonctionnement;
 * - offrir les opérations correspondant aux cas d’utilisation du service;
 * - créer et valider l’entité appropriée avant un enregistrement;
 * - déléguer la persistance au dépôt;
 * - signaler clairement les données invalides.
 *
 * Cette classe ne doit pas utiliser directement Express ni Mongoose.
 */
import Client from "./Client.js";
import { AppError } from "../errors.js";

export default class ClientService {
  constructor(repository) { this.repository = repository; }
  list() { return this.repository.findAll(); }
  async get(id) {
    const client = await this.repository.findById(id);
    if (!client) throw new AppError(404, "Client introuvable.");
    return client;
  }
  async create(input) { return this.repository.create(this.#validate(input).toObject()); }
  async update(id, input) {
    const updated = await this.repository.update(id, this.#validate(input).toObject());
    if (!updated) throw new AppError(404, "Client introuvable.");
    return updated;
  }
  async delete(id) {
    if (!await this.repository.delete(id)) throw new AppError(404, "Client introuvable.");
  }
  #validate(input) {
    const client = new Client(input);
    const errors = client.validate();
    if (errors.length) throw new AppError(400, errors.join(" "));
    return client;
  }
}
