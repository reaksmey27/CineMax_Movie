import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
  setDoc,
  updateDoc,
  writeBatch,
} from "firebase/firestore";

export const NOTIFICATIONS_COLLECTION = "notifications";
export const NOTIFICATION_HISTORY_LIMIT = 50;

const NOTIFICATION_ID_PATTERN = /^[A-Za-z0-9_-]+$/;

const getHistoryCollection = (database, userId) => {
  if (!userId) {
    throw new Error("A signed-in user is required to sync notifications.");
  }

  return collection(database, NOTIFICATIONS_COLLECTION, userId, "history");
};

const normalizeLocalNotification = (notification) => {
  const isValid =
    typeof notification?.id === "string" &&
    NOTIFICATION_ID_PATTERN.test(notification.id) &&
    typeof notification.message === "string" &&
    typeof notification.type === "string" &&
    typeof notification.timestamp === "string" &&
    Number.isFinite(Date.parse(notification.timestamp)) &&
    typeof notification.read === "boolean";

  if (!isValid) return null;

  const normalized = {
    message: notification.message,
    type: notification.type,
    timestamp: new Date(notification.timestamp).toISOString(),
    read: notification.read,
  };
  if (notification.movie && typeof notification.movie === "object") {
    const { id, title, poster } = notification.movie;
    normalized.movie = {
      ...(typeof id === "string" ||
      (typeof id === "number" && Number.isFinite(id))
        ? { id }
        : {}),
      ...(typeof title === "string" ? { title } : {}),
      ...(typeof poster === "string" ? { poster } : {}),
    };
  }

  return normalized;
};

export const getNotifications = (snapshot) =>
  snapshot.docs.map((notification) => ({
    ...notification.data(),
    id: notification.id,
  }));

export const subscribeToNotifications = (
  database,
  userId,
  onNotifications,
  onError,
) => {
  const historyCollection = getHistoryCollection(database, userId);
  const historyQuery = query(
    historyCollection,
    orderBy("timestamp", "desc"),
    limit(NOTIFICATION_HISTORY_LIMIT),
  );

  return onSnapshot(
    historyQuery,
    { includeMetadataChanges: true },
    (snapshot) => onNotifications(getNotifications(snapshot)),
    onError,
  );
};

export const saveNotification = async (database, userId, notification) => {
  if (!notification?.id) {
    throw new Error("A valid notification is required to save history.");
  }

  const historyCollection = getHistoryCollection(database, userId);
  const { id, ...notificationData } = notification;
  await setDoc(doc(historyCollection, id), notificationData);

  const historyQuery = query(
    historyCollection,
    orderBy("timestamp", "desc"),
    limit(NOTIFICATION_HISTORY_LIMIT + 1),
  );
  const existingNotifications = await getDocs(historyQuery);
  const expiredNotifications = existingNotifications.docs.slice(
    NOTIFICATION_HISTORY_LIMIT,
  );
  if (expiredNotifications.length === 0) return;

  const batch = writeBatch(database);
  expiredNotifications.forEach((expiredNotification) =>
    batch.delete(expiredNotification.ref),
  );
  await batch.commit();
};

export const importNotifications = async (
  database,
  userId,
  localNotifications,
) => {
  const historyCollection = getHistoryCollection(database, userId);
  const importedById = new Map();
  let skippedCount = 0;

  for (const notification of localNotifications) {
    const normalized = normalizeLocalNotification(notification);
    if (!normalized) {
      skippedCount += 1;
      continue;
    }
    importedById.set(notification.id, normalized);
  }

  const existingSnapshot = await getDocs(
    query(
      historyCollection,
      orderBy("timestamp", "desc"),
      limit(NOTIFICATION_HISTORY_LIMIT),
    ),
  );
  const existingById = new Map(
    existingSnapshot.docs.map((snapshot) => [snapshot.id, snapshot.data()]),
  );
  const mergedNotifications = new Map(existingById);
  importedById.forEach((notification, id) => {
    mergedNotifications.set(id, notification);
  });

  const retainedNotifications = [...mergedNotifications.entries()]
    .sort(
      ([, first], [, second]) =>
        Date.parse(second.timestamp) - Date.parse(first.timestamp),
    )
    .slice(0, NOTIFICATION_HISTORY_LIMIT);
  const retainedIds = new Set(retainedNotifications.map(([id]) => id));
  const retainedImportedIds = [...importedById.keys()].filter((id) =>
    retainedIds.has(id),
  );
  const batch = writeBatch(database);

  retainedNotifications.forEach(([id, notification]) => {
    if (importedById.has(id)) {
      batch.set(doc(historyCollection, id), notification);
    }
  });
  existingSnapshot.docs.forEach((snapshot) => {
    if (!retainedIds.has(snapshot.id)) batch.delete(snapshot.ref);
  });

  if (retainedNotifications.length > 0 || existingSnapshot.size > 0) {
    await batch.commit();
  }

  return {
    consumedIds: [...importedById.keys()],
    importedCount: retainedImportedIds.length,
    skippedCount,
  };
};

export const markNotificationAsRead = (database, userId, notificationId) =>
  updateDoc(
    doc(database, NOTIFICATIONS_COLLECTION, userId, "history", notificationId),
    { read: true },
  );

export const markAllNotificationsAsRead = async (
  database,
  userId,
  notifications,
) => {
  const unreadNotifications = notifications.filter(
    (notification) => !notification.read,
  );
  if (unreadNotifications.length === 0) return;

  const batch = writeBatch(database);
  unreadNotifications.forEach(({ id }) => {
    batch.update(
      doc(database, NOTIFICATIONS_COLLECTION, userId, "history", id),
      { read: true },
    );
  });
  await batch.commit();
};

export const removeNotification = (database, userId, notificationId) =>
  deleteDoc(
    doc(database, NOTIFICATIONS_COLLECTION, userId, "history", notificationId),
  );

export const clearNotifications = async (database, userId, notifications) => {
  if (notifications.length === 0) return;

  const batch = writeBatch(database);
  notifications.forEach(({ id }) =>
    batch.delete(
      doc(database, NOTIFICATIONS_COLLECTION, userId, "history", id),
    ),
  );
  await batch.commit();
};
