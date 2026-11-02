import { doc, getDocFromServer, runTransaction } from "firebase/firestore";
import { db } from "./firestore";
import { createVisitLoader } from "../utils/sessionVisit";

const reference = doc(db, "siteStats", "visits");
const record = () =>
  runTransaction(db, async (transaction) => {
    const snapshot = await transaction.get(reference);
    const count = (snapshot.exists() ? snapshot.data().count : 0) + 1;
    transaction.set(reference, { count });
    return count;
  });
const read = async () => {
  const snapshot = await getDocFromServer(reference);
  return snapshot.exists() ? snapshot.data().count : 0;
};

export const loadSiteVisits = createVisitLoader({
  record,
  read,
  storage: {
    getItem: (key) => sessionStorage.getItem(key),
    setItem: (key, value) => sessionStorage.setItem(key, value),
  },
});
