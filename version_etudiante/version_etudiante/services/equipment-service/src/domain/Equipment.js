/**
 * Représente un matériel disponible à la location.
 *
 * Cette classe doit regrouper les informations commerciales et de stock d’un
 * article loué par Eventia Location. Elle porte aussi les règles permettant
 * de vérifier la cohérence d’un matériel et de déterminer si une quantité
 * demandée peut être réservée.
 *
 * Travail demandé :
 * - déduire les données nécessaires à partir du dialogue et des contrats REST;
 * - convertir les valeurs numériques lorsque cela est nécessaire;
 * - vérifier la validité générale d’un matériel;
 * - vérifier si le stock permet une réservation donnée.
 *
 * Ne placez ici aucune logique MongoDB, Express ou Axios.
 */
export default class Equipment {
  constructor({ name, category, dailyPrice, availableQuantity } = {}) {
    this.name = typeof name === "string" ? name.trim() : "";
    this.category = typeof category === "string" ? category.trim() : "";
    this.dailyPrice = Number(dailyPrice);
    this.availableQuantity = Number(availableQuantity);
  }
  validate() {
    const errors = [];
    if (!this.name) errors.push("Le nom est obligatoire.");
    if (!this.category) errors.push("La catégorie est obligatoire.");
    if (!Number.isFinite(this.dailyPrice) || this.dailyPrice < 0) errors.push("Le prix quotidien doit être positif ou nul.");
    if (!Number.isInteger(this.availableQuantity) || this.availableQuantity < 0) errors.push("La quantité disponible doit être un entier positif ou nul.");
    return errors;
  }
  canReserve(quantity) {
    const requested = Number(quantity);
    return Number.isInteger(requested) && requested >= 1 && requested <= this.availableQuantity;
  }
  toObject() {
    return {
      name: this.name,
      category: this.category,
      dailyPrice: this.dailyPrice,
      availableQuantity: this.availableQuantity,
    };
  }
}
