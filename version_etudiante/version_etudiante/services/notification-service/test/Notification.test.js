import test from "node:test";
import assert from "node:assert/strict";
import Notification from "../src/domain/Notification.js";

test("Notification normalise ses données et fournit un type par défaut", () => {
  const notification = new Notification({
    recipient: "  alice@example.com ",
    message: " Réservation confirmée. ",
  });

  assert.deepEqual(notification.validate(), []);
  assert.equal(notification.recipient, "alice@example.com");
  assert.equal(notification.message, "Réservation confirmée.");
  assert.equal(notification.type, "GENERAL");
  assert.ok(notification.createdAt instanceof Date);
});

test("Notification refuse les données minimales manquantes", () => {
  const notification = new Notification({ recipient: " ", message: null });

  assert.deepEqual(notification.validate(), [
    "Le destinataire est obligatoire.",
    "Le message est obligatoire.",
  ]);
});

test("Notification normalise le type fourni", () => {
  const notification = new Notification({
    recipient: "alice@example.com",
    message: "Réservation annulée.",
    type: " reservation_cancelled ",
  });

  assert.equal(notification.type, "RESERVATION_CANCELLED");
});
