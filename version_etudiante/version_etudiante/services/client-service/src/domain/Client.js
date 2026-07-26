/**
 * Représente un client de l’entreprise Eventia Location.
 *
 * Cette classe doit regrouper les informations nécessaires pour identifier
 * et contacter un client. Elle doit aussi contenir les règles simples qui
 * permettent de vérifier qu’un client possède des données acceptables avant
 * son enregistrement.
 *
 * Travail demandé :
 * - déterminer les données qui décrivent un client à partir des besoins.
 * - initialiser correctement un nouvel objet client.
 * - prévoir une opération permettant de vérifier sa validité.
 *
 * Ne placez ici aucune logique liée à MongoDB ou aux requêtes HTTP.
 */
export default class Client {
  constructor({ name, email, phone } = {}) {
    this.name = typeof name === "string" ? name.trim() : "";
    this.email = typeof email === "string" ? email.trim().toLowerCase() : "";
    this.phone = typeof phone === "string" ? phone.trim() : "";
  }

  validate() {
    const errors = [];
    if (!this.name) errors.push("Le nom est obligatoire.");
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(this.email)) errors.push("Le courriel est invalide.");
    if (!this.phone) errors.push("Le téléphone est obligatoire.");
    return errors;
  }

  toObject() {
    return { name: this.name, email: this.email, phone: this.phone };
  }
}
