import test from "node:test";
import assert from "node:assert/strict";
import Reservation from "../src/domain/Reservation.js";

test("Reservation facture les deux dates inclusivement", () => {
  const reservation = new Reservation({
    clientId: "client", equipmentId: "equipment", quantity: "2",
    startDate: "2026-07-10", endDate: "2026-07-12",
  });
  assert.deepEqual(reservation.validate(), []);
  assert.equal(reservation.billableDays, 3);
  assert.equal(reservation.calculateTotal(25.5), 153);
  assert.equal(reservation.status, "CONFIRMED");
});

test("Reservation refuse une période inversée", () => {
  const reservation = new Reservation({
    clientId: "client", equipmentId: "equipment", quantity: 1,
    startDate: "2026-07-12", endDate: "2026-07-10",
  });
  assert.match(reservation.validate().join(" "), /date de fin/i);
});
