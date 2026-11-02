import test from "node:test";
import { readFile } from "node:fs/promises";
import {
  initializeTestEnvironment,
  assertSucceeds,
  assertFails,
} from "@firebase/rules-unit-testing";
import {
  doc,
  getDoc,
  setDoc,
  deleteDoc,
  collection,
  query,
  limit,
  getDocs,
  serverTimestamp,
} from "firebase/firestore";

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

test("public visitor photos restrict writes to owners and reject private fields", async () => {
  const env = await initializeTestEnvironment({
    projectId: "demo-public-visitors",
    firestore: { rules: await readFile("firestore.rules", "utf8") },
  });
  try {
    await env.clearFirestore();
    const owner = env.authenticatedContext("fan").firestore();
    const guest = env.unauthenticatedContext().firestore();
    const other = env.authenticatedContext("other").firestore();
    const data = () => ({
      photoURL: "https://example.com/avatar.png",
      lastVisitedAt: serverTimestamp(),
    });
    await assertFails(setDoc(doc(guest, "publicVisitors", "fan"), data()));
    await assertFails(setDoc(doc(other, "publicVisitors", "fan"), data()));
    await assertSucceeds(setDoc(doc(owner, "publicVisitors", "fan"), data()));
    await assertSucceeds(
      getDocs(query(collection(guest, "publicVisitors"), limit(6))),
    );
    await assertFails(getDocs(collection(guest, "publicVisitors")));
    await assertFails(
      setDoc(doc(owner, "publicVisitors", "fan"), {
        ...data(),
        email: "private@example.com",
      }),
    );
    await assertFails(
      setDoc(doc(owner, "publicVisitors", "fan"), {
        ...data(),
        photoURL: "javascript:alert(1)",
      }),
    );
    await assertFails(deleteDoc(doc(other, "publicVisitors", "fan")));
    await assertSucceeds(deleteDoc(doc(owner, "publicVisitors", "fan")));
  } finally {
    await env.cleanup();
  }
});
