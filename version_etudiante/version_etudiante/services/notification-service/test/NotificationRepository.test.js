import test from "node:test";
import assert from "node:assert/strict";
import NotificationRepository from "../src/domain/NotificationRepository.js";

test("NotificationRepository trie l'historique du plus récent au plus ancien", async () => {
  const calls = [];
  const expected = [{ _id: "notification-1" }];
  const model = {
    find() {
      calls.push("find");
      return {
        sort(criteria) {
          calls.push(["sort", criteria]);
          return {
            lean() {
              calls.push("lean");
              return Promise.resolve(expected);
            },
          };
        },
      };
    },
  };

  const result = await new NotificationRepository(model).findAll();

  assert.equal(result, expected);
  assert.deepEqual(calls, [
    "find",
    ["sort", { createdAt: -1 }],
    "lean",
  ]);
});

test("NotificationRepository délègue la création au modèle", async () => {
  const data = { recipient: "alice@example.com", message: "Confirmation" };
  const model = {
    create: async (received) => ({ _id: "notification-1", ...received }),
  };

  const result = await new NotificationRepository(model).create(data);

  assert.deepEqual(result, { _id: "notification-1", ...data });
});
