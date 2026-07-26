/**
 * Assure l’accès aux données persistantes des clients.
 *
 * Cette classe reçoit le modèle Mongoose du client et centralise toutes les
 * opérations effectuées dans MongoDB. Elle doit permettre au reste du service
 * de consulter, ajouter, modifier et supprimer des clients sans manipuler
 * directement Mongoose.
 *
 * Travail demandé :
 * - conserver une référence vers le modèle Mongoose fourni;
 * - prévoir les opérations de persistance nécessaires aux contrats REST;
 * - retourner les résultats produits par Mongoose.
 *
 * Cette classe ne doit contenir ni validation métier ni traitement HTTP.
 */
export default class ClientRepository {
  constructor(model) { this.model = model; }
  findAll() { return this.model.find().sort({ name: 1 }).lean(); }
  findById(id) { return this.model.findById(id).lean(); }
  create(data) { return this.model.create(data); }
  update(id, data) {
    return this.model.findByIdAndUpdate(id, data, { new: true, runValidators: true }).lean();
  }
  delete(id) { return this.model.findByIdAndDelete(id).lean(); }
}
