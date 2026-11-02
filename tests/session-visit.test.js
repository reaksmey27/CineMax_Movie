import test from "node:test";
import assert from "node:assert/strict";
import { createVisitLoader } from "../src/utils/sessionVisit.js";

test("counts once across concurrent mounts and reads on session reload", async () => {
  let count = 10;
  const values = new Map();
  const deps = {
    record: async () => ++count,
    read: async () => count,
    storage: {
      getItem: (key) => values.get(key),
      setItem: (key, value) => values.set(key, value),
    },
  };
  const load = createVisitLoader(deps);
  assert.deepEqual(await Promise.all([load(), load(), load()]), [11, 11, 11]);
  assert.equal(await createVisitLoader(deps)(), 11);
  values.clear();
  assert.equal(await createVisitLoader(deps)(), 12);
});

test("failed writes can retry and blocked storage counts once per page lifetime", async () => {
  let attempts = 0;
  const load = createVisitLoader({
    record: async () => {
      if (++attempts === 1) throw Error("offline");
      return 2;
    },
    read: async () => 2,
    storage: {
      getItem() {
        throw Error();
      },
      setItem() {
        throw Error();
      },
    },
  });
  await assert.rejects(load());
  assert.equal(await load(), 2);
  assert.equal(await load(), 2);
  assert.equal(attempts, 2);
});
