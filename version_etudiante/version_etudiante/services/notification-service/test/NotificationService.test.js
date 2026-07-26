import test from "node:test";
import assert from "node:assert/strict";
import NotificationService from "../src/domain/NotificationService.js";

test("NotificationService retourne l'historique du dépôt", async () => {
  const history = [{ _id: "notification-1" }];
  const service = new NotificationService({
    findAll: async () => history,
  });

  assert.equal(await service.list(), history);
});

test("NotificationService valide puis persiste une notification", async () => {
  let persisted;
  const service = new NotificationService({
    create: async (data) => {
      persisted = data;
      return { _id: "notification-1", ...data };
    },
  });

  const result = await service.create({
    recipient: " alice@example.com ",
    message: " Réservation confirmée. ",
    type: "reservation_confirmed",
  });

  assert.equal(result._id, "notification-1");
  assert.equal(persisted.recipient, "alice@example.com");
  assert.equal(persisted.message, "Réservation confirmée.");
  assert.equal(persisted.type, "RESERVATION_CONFIRMED");
  assert.ok(persisted.createdAt instanceof Date);
});

test("NotificationService refuse une notification invalide sans la persister", () => {
  let createCalled = false;
  const service = new NotificationService({
    create: async () => {
      createCalled = true;
    },
  });

  assert.throws(
    () => service.create({ recipient: "", message: "" }),
    (error) => error.status === 400
      && /destinataire/i.test(error.message)
      && /message/i.test(error.message),
  );
  assert.equal(createCalled, false);
});
