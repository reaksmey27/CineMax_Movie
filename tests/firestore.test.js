import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test, { after, before, beforeEach } from "node:test";
import {
  collection,
  doc,
  getDoc,
  getDocs,
  writeBatch,
} from "firebase/firestore";
import { initializeTestEnvironment } from "@firebase/rules-unit-testing";
import {
  addToFavorites,
  FAVORITES_COLLECTION,
  getFavoriteMovies,
} from "../src/firebase/favorites.js";
import {
  addToWatchlist,
  getWatchlistMovies,
  WATCHLISTS_COLLECTION,
  setWatchlistWatched,
  removeFromWatchlist,
} from "../src/firebase/watchlist.js";
import {
  clearNotifications,
  getNotifications,
  importNotifications,
  markAllNotificationsAsRead,
  markNotificationAsRead,
  NOTIFICATIONS_COLLECTION,
  removeNotification,
  saveNotification,
  subscribeToNotifications,
} from "../src/firebase/notifications.js";

const PROJECT_ID = "demo-movie-website";
const OWNER_UID = "movie-fan-1";
const OTHER_UID = "movie-fan-2";
const MOVIE = {
  id: 550,
  title: "Fight Club",
  subtitle: "1999",
  rating: "8.8",
  genres: ["Drama"],
  description: "A movie description.",
  image: "https://example.com/poster.jpg",
  posterImage: "https://example.com/poster.jpg",
  backdropImage: "https://example.com/backdrop.jpg",
  trailerKey: "trailer-key",
};
const SECOND_MOVIE = {
  ...MOVIE,
  id: 551,
  title: "The Big Lebowski",
};
const NOTIFICATION = {
  id: "notification-1",
  message: "Fight Club added to your favorites.",
  type: "success",
  timestamp: "2026-10-17T00:00:00.000Z",
  read: false,
  movie: {
    id: MOVIE.id,
    title: MOVIE.title,
    poster: MOVIE.posterImage,
  },
};

let environment;

test("watched status persists without changing saved metadata or other movies", async () => {
  const db = getAuthenticatedDatabase();
  await addToWatchlist(db, OWNER_UID, MOVIE);
  await addToWatchlist(db, OWNER_UID, SECOND_MOVIE);
  const ref = doc(db, WATCHLISTS_COLLECTION, OWNER_UID);
  const before = (await getDoc(ref)).data().movies;
  assert.equal(await setWatchlistWatched(db, OWNER_UID, MOVIE.id, true), true);
  const reloaded = (await getDoc(ref)).data().movies;
  assert.deepEqual(reloaded[MOVIE.id], { ...before[MOVIE.id], watched: true });
  assert.deepEqual(reloaded[SECOND_MOVIE.id], before[SECOND_MOVIE.id]);
  await setWatchlistWatched(db, OWNER_UID, MOVIE.id, false);
  assert.equal((await getDoc(ref)).data().movies[MOVIE.id].watched, false);
  await removeFromWatchlist(db, OWNER_UID, MOVIE.id);
  assert.equal(await setWatchlistWatched(db, OWNER_UID, MOVIE.id, true), false);
  assert.equal((await getDoc(ref)).data().movies[MOVIE.id], undefined);
});

test("watched status denies other accounts and signed-out users", async () => {
  await addToWatchlist(getAuthenticatedDatabase(), OWNER_UID, MOVIE);
  for (const db of [
    getAuthenticatedDatabase(OTHER_UID),
    environment.unauthenticatedContext().firestore(),
  ]) {
    await assert.rejects(
      setWatchlistWatched(db, OWNER_UID, MOVIE.id, true),
      /permission-denied/i,
    );
  }
});

const getAuthenticatedDatabase = (userId = OWNER_UID) =>
  environment.authenticatedContext(userId).firestore();

const getNotificationHistoryCollection = (database, userId = OWNER_UID) =>
  collection(database, NOTIFICATIONS_COLLECTION, userId, "history");

const readNotificationHistory = async (database, userId = OWNER_UID) =>
  getNotifications(
    await getDocs(getNotificationHistoryCollection(database, userId)),
  );

before(async () => {
  const rules = await readFile(new URL("../firestore.rules", import.meta.url), {
    encoding: "utf8",
  });

  environment = await initializeTestEnvironment({
    projectId: PROJECT_ID,
    firestore: { rules },
  });
});

beforeEach(async () => {
  await environment.clearFirestore();
});

after(async () => {
  await environment?.cleanup();
});

const testSavedCollection = ({ collection, addMovie, getMovies, name }) => {
  test(`${name} saves and reloads movies for the signed-in owner`, async () => {
    const database = environment.authenticatedContext(OWNER_UID).firestore();

    await addMovie(database, OWNER_UID, MOVIE);
    await addMovie(database, OWNER_UID, SECOND_MOVIE);

    const snapshot = await getDoc(doc(database, collection, OWNER_UID));
    const movies = getMovies(snapshot);

    assert.equal(snapshot.exists(), true);
    assert.equal(snapshot.data().userId, OWNER_UID);
    assert.equal(movies.length, 2);
    assert.deepEqual(
      movies.map(({ id }) => id).sort((first, second) => first - second),
      [MOVIE.id, SECOND_MOVIE.id],
    );
    assert.equal(movies.find(({ id }) => id === MOVIE.id).title, MOVIE.title);
    assert.equal(
      movies.find(({ id }) => id === MOVIE.id).posterImage,
      MOVIE.posterImage,
    );
    assert.ok(movies.every(({ savedAt }) => savedAt));
  });

  test(`${name} denies another user reads and writes`, async () => {
    const ownerDatabase = environment
      .authenticatedContext(OWNER_UID)
      .firestore();
    const otherDatabase = environment
      .authenticatedContext(OTHER_UID)
      .firestore();

    await addMovie(ownerDatabase, OWNER_UID, MOVIE);

    await assert.rejects(
      getDoc(doc(otherDatabase, collection, OWNER_UID)),
      /permission-denied/i,
    );
    await assert.rejects(
      addMovie(otherDatabase, OWNER_UID, {
        ...MOVIE,
        id: 999,
        title: "Unauthorized movie",
      }),
      /permission-denied/i,
    );
  });

  test(`${name} denies signed-out reads and writes`, async () => {
    const database = environment.unauthenticatedContext().firestore();

    await assert.rejects(
      getDoc(doc(database, collection, OWNER_UID)),
      /permission-denied/i,
    );
    await assert.rejects(
      addMovie(database, OWNER_UID, MOVIE),
      /permission-denied/i,
    );
  });
};

testSavedCollection({
  collection: FAVORITES_COLLECTION,
  addMovie: addToFavorites,
  getMovies: getFavoriteMovies,
  name: "Favorites",
});

testSavedCollection({
  collection: WATCHLISTS_COLLECTION,
  addMovie: addToWatchlist,
  getMovies: getWatchlistMovies,
  name: "Watchlist",
});

test("Notifications save and reload history for the signed-in owner", async () => {
  const database = getAuthenticatedDatabase();
  const secondNotification = {
    ...NOTIFICATION,
    id: "notification-2",
    timestamp: "2026-10-17T01:00:00.000Z",
    read: true,
  };

  await saveNotification(database, OWNER_UID, NOTIFICATION);
  await saveNotification(database, OWNER_UID, secondNotification);

  const notifications = await readNotificationHistory(database);
  assert.equal(notifications.length, 2);
  assert.deepEqual(notifications.map(({ id }) => id).sort(), [
    "notification-1",
    "notification-2",
  ]);
  assert.equal(
    notifications.find(({ id }) => id === NOTIFICATION.id).movie.poster,
    MOVIE.posterImage,
  );

  await markNotificationAsRead(database, OWNER_UID, NOTIFICATION.id);
  await markAllNotificationsAsRead(database, OWNER_UID, notifications);
  const updated = await readNotificationHistory(database);
  assert.ok(updated.every(({ read }) => read));

  await removeNotification(database, OWNER_UID, NOTIFICATION.id);
  await clearNotifications(database, OWNER_UID, updated);
  assert.deepEqual(await readNotificationHistory(database), []);
});

test("Notifications keep only the 50 most recent history entries", async () => {
  await environment.withSecurityRulesDisabled(async (context) => {
    const database = context.firestore();
    const batch = writeBatch(database);

    for (let index = 0; index < 50; index += 1) {
      const { id, ...data } = {
        ...NOTIFICATION,
        id: `notification-${String(index).padStart(2, "0")}`,
        timestamp: new Date(Date.UTC(2026, 0, 1, 0, index)).toISOString(),
      };
      batch.set(
        doc(database, NOTIFICATIONS_COLLECTION, OWNER_UID, "history", id),
        data,
      );
    }

    await batch.commit();
  });

  const database = getAuthenticatedDatabase();
  await saveNotification(database, OWNER_UID, {
    ...NOTIFICATION,
    id: "notification-50",
    timestamp: new Date(Date.UTC(2026, 0, 1, 0, 50)).toISOString(),
  });

  const notifications = await readNotificationHistory(database);
  assert.equal(notifications.length, 50);
  assert.equal(
    notifications.some(({ id }) => id === "notification-00"),
    false,
  );
  assert.equal(
    notifications.some(({ id }) => id === "notification-50"),
    true,
  );
});

test("Notifications import local history into the account without losing valid data", async () => {
  const database = getAuthenticatedDatabase();
  const localNotifications = [
    NOTIFICATION,
    {
      ...NOTIFICATION,
      id: "notification-local-2",
      message: "A second local notification.",
      timestamp: "2026-10-17T01:00:00.000Z",
      read: true,
    },
    { id: "invalid-local-notification", message: "Missing required fields." },
  ];

  await saveNotification(database, OWNER_UID, {
    ...NOTIFICATION,
    id: "notification-cloud",
    message: "An existing account notification.",
  });

  const result = await importNotifications(
    database,
    OWNER_UID,
    localNotifications,
  );
  const importedNotifications = await readNotificationHistory(database);

  assert.equal(result.importedCount, 2);
  assert.equal(result.skippedCount, 1);
  assert.deepEqual(
    result.consumedIds.sort(),
    [NOTIFICATION.id, "notification-local-2"].sort(),
  );
  assert.equal(importedNotifications.length, 3);
  assert.equal(
    importedNotifications.find(({ id }) => id === NOTIFICATION.id).movie.poster,
    MOVIE.posterImage,
  );
  assert.equal(
    importedNotifications.find(({ id }) => id === "notification-local-2").read,
    true,
  );

  await importNotifications(database, OWNER_UID, localNotifications);
  assert.equal((await readNotificationHistory(database)).length, 3);
});

test("Notifications stream new history to other signed-in sessions", async () => {
  const listenerDatabase = getAuthenticatedDatabase();
  const writerDatabase = getAuthenticatedDatabase();
  let resolveInitialSnapshot;
  let resolveNewNotification;
  let rejectListener;
  const initialSnapshot = new Promise((resolve) => {
    resolveInitialSnapshot = resolve;
  });
  const newNotificationSnapshot = new Promise((resolve, reject) => {
    resolveNewNotification = resolve;
    rejectListener = reject;
  });
  const timeout = setTimeout(
    () => rejectListener(new Error("Timed out waiting for notification sync.")),
    10000,
  );
  const unsubscribe = subscribeToNotifications(
    listenerDatabase,
    OWNER_UID,
    (notifications) => {
      resolveInitialSnapshot();
      if (notifications.some(({ id }) => id === NOTIFICATION.id)) {
        resolveNewNotification(notifications);
      }
    },
    rejectListener,
  );

  try {
    await initialSnapshot;
    await saveNotification(writerDatabase, OWNER_UID, NOTIFICATION);
    const notifications = await newNotificationSnapshot;
    assert.equal(notifications[0].id, NOTIFICATION.id);
  } finally {
    clearTimeout(timeout);
    unsubscribe();
  }
});

test("Notifications deny another user and signed-out reads and writes", async () => {
  const ownerDatabase = getAuthenticatedDatabase();
  const otherDatabase = getAuthenticatedDatabase(OTHER_UID);
  const signedOutDatabase = environment.unauthenticatedContext().firestore();
  const signedOutHistory = getNotificationHistoryCollection(signedOutDatabase);

  await saveNotification(ownerDatabase, OWNER_UID, NOTIFICATION);

  await assert.rejects(
    getDocs(getNotificationHistoryCollection(otherDatabase)),
    /permission-denied/i,
  );
  await assert.rejects(
    saveNotification(otherDatabase, OWNER_UID, {
      ...NOTIFICATION,
      id: "unauthorized",
    }),
    /permission-denied/i,
  );
  await assert.rejects(getDocs(signedOutHistory), /permission-denied/i);
  await assert.rejects(
    saveNotification(signedOutDatabase, OWNER_UID, NOTIFICATION),
    /permission-denied/i,
  );
});
