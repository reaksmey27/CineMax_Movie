import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import { doc, getDoc, setDoc, deleteDoc } from "firebase/firestore";

test("public visits permit only reading and increments of one", async () => {
  const env = await initializeTestEnvironment({
    projectId: "demo-site-visits",
    firestore: { rules: await readFile("firestore.rules", "utf8") },
  });
  try {
    await env.clearFirestore();
    const db = env.unauthenticatedContext().firestore();
    const counter = doc(db, "siteStats", "visits");
    await assertSucceeds(getDoc(counter));
    await assertFails(setDoc(counter, { count: 100 }));
    await assertSucceeds(setDoc(counter, { count: 1 }));
    await assertSucceeds(setDoc(counter, { count: 2 }));
    await assertFails(setDoc(counter, { count: 1 }));
    await assertFails(setDoc(counter, { count: 10 }));
    await assertFails(setDoc(counter, { count: 3, extra: true }));
    await assertFails(deleteDoc(counter));
    await assertFails(setDoc(doc(db, "siteStats", "other"), { count: 1 }));
  } finally {
    await env.cleanup();
  }
});
