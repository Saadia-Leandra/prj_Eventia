export default class Reservation {
  constructor({
    clientId, equipmentId, clientName, clientEmail, equipmentName, quantity,
    startDate, endDate, totalPrice = 0, status = "CONFIRMED",
  } = {}) {
    this.clientId = clientId;
    this.equipmentId = equipmentId;
    this.clientName = typeof clientName === "string" ? clientName.trim() : "";
    this.clientEmail = typeof clientEmail === "string" ? clientEmail.trim().toLowerCase() : "";
    this.equipmentName = typeof equipmentName === "string" ? equipmentName.trim() : "";
    this.quantity = Number(quantity);
    this.startDate = this.#date(startDate);
    this.endDate = this.#date(endDate);
    this.totalPrice = Number(totalPrice);
    this.status = status || "CONFIRMED";
  }
  get billableDays() {
    if (!this.startDate || !this.endDate) return 0;
    return Math.floor((this.endDate - this.startDate) / 86400000) + 1;
  }
  calculateTotal(dailyPrice) {
    const price = Number(dailyPrice);
    this.totalPrice = Math.round(this.billableDays * this.quantity * price * 100) / 100;
    return this.totalPrice;
  }
  validate() {
    const errors = [];
    if (!this.clientId) errors.push("Le client est obligatoire.");
    if (!this.equipmentId) errors.push("Le matériel est obligatoire.");
    if (!Number.isInteger(this.quantity) || this.quantity < 1) errors.push("La quantité doit être un entier supérieur ou égal à 1.");
    if (!this.startDate || !this.endDate) errors.push("Les dates sont invalides.");
    else if (this.endDate < this.startDate) errors.push("La date de fin ne peut pas précéder la date de début.");
    return errors;
  }
  toObject() {
    return {
      clientId: this.clientId,
      equipmentId: this.equipmentId,
      clientName: this.clientName,
      clientEmail: this.clientEmail,
      equipmentName: this.equipmentName,
      quantity: this.quantity,
      startDate: this.startDate,
      endDate: this.endDate,
      totalPrice: this.totalPrice,
      status: this.status,
    };
  }
  #date(value) {
    if (!value) return null;
    const date = value instanceof Date ? new Date(value) : new Date(value);
    return Number.isNaN(date.getTime()) ? null : date;
  }
}
