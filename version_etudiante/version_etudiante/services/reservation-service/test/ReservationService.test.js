import test from "node:test";
import assert from "node:assert/strict";
import ReservationService from "../src/domain/ReservationService.js";

function api(data, calls, method = "get") {
  return { [method]: async (url, body) => { calls.push({ method, url, body }); return { data }; } };
}

test("ReservationService orchestre une création complète", async () => {
  const calls = [];
  const repository = {
    create: async (data) => ({ _id: "reservation", ...data }),
    delete: async () => undefined,
  };
  const service = new ReservationService(repository, {
    clientsApi: api({ name: "Alice", email: "alice@example.com" }, calls),
    equipmentApi: {
      get: async (url) => { calls.push({ method: "get", url }); return { data: { name: "Projecteur", dailyPrice: 20 } }; },
      put: async (url, body) => { calls.push({ method: "put", url, body }); return { data: {} }; },
    },
    notificationsApi: api({}, calls, "post"),
  });

  const result = await service.create({
    clientId: "client", equipmentId: "equipment", quantity: 2,
    startDate: "2026-07-10", endDate: "2026-07-11",
  });

  assert.equal(result.totalPrice, 80);
  assert.equal(result.clientName, "Alice");
  assert.ok(calls.some((call) => call.url === "/equipment/reserve"));
  assert.ok(calls.some((call) => call.method === "post" && call.body.recipient === "alice@example.com"));
});

test("ReservationService restitue le stock si la persistance échoue", async () => {
  const equipmentCalls = [];
  const service = new ReservationService(
    { create: async () => { throw new Error("MongoDB indisponible"); } },
    {
      clientsApi: api({ name: "Alice", email: "alice@example.com" }, []),
      equipmentApi: {
        get: async () => ({ data: { name: "Projecteur", dailyPrice: 20 } }),
        put: async (url, body) => { equipmentCalls.push({ url, body }); return { data: {} }; },
      },
      notificationsApi: api({}, [], "post"),
    },
  );

  await assert.rejects(() => service.create({
    clientId: "client", equipmentId: "equipment", quantity: 1,
    startDate: "2026-07-10", endDate: "2026-07-10",
  }), /MongoDB indisponible/);
  assert.deepEqual(equipmentCalls.map((call) => call.url), ["/equipment/reserve", "/equipment/release"]);
});

test("ReservationService conserve la réservation même si le service de notification échoue", async () => {
  const equipmentCalls = [];
  const repository = {
    create: async (data) => ({ _id: "reservation", ...data }),
  };
  const service = new ReservationService(repository, {
    clientsApi: api({ name: "Alice", email: "alice@example.com" }, []),
    equipmentApi: {
      get: async () => ({ data: { name: "Projecteur", dailyPrice: 20 } }),
      put: async (url, body) => { equipmentCalls.push({ url, body }); return { data: {} }; },
    },
    notificationsApi: {
      post: async () => {
        const error = new Error("Notification indisponible");
        error.response = { status: 502, data: { message: "Impossible d'enregistrer la notification." } };
        throw error;
      },
    },
  });

  const result = await service.create({
    clientId: "client", equipmentId: "equipment", quantity: 2,
    startDate: "2026-07-10", endDate: "2026-07-11",
  });

  assert.equal(result.totalPrice, 80);
  assert.deepEqual(equipmentCalls.map((call) => call.url), ["/equipment/reserve"]);
});

test("ReservationService annule même si le service de notification échoue", async () => {
  const service = new ReservationService(
    {
      findById: async () => ({
        _id: "reservation",
        equipmentId: "equipment",
        quantity: 1,
        equipmentName: "Projecteur",
        clientEmail: "alice@example.com",
        clientName: "Alice",
        status: "CONFIRMED",
      }),
      cancelConfirmed: async () => ({
        _id: "reservation",
        equipmentId: "equipment",
        quantity: 1,
        equipmentName: "Projecteur",
        clientEmail: "alice@example.com",
        clientName: "Alice",
        status: "CANCELLED",
      }),
      restoreConfirmed: async () => ({ status: "CONFIRMED" }),
      delete: async () => undefined,
    },
    {
      clientsApi: api({}, []),
      equipmentApi: {
        put: async () => ({ data: {} }),
      },
      notificationsApi: {
        post: async () => { throw new Error("Notification indisponible"); },
      },
    },
  );

  const result = await service.cancel("reservation");
  assert.equal(result.status, "CANCELLED");
});
