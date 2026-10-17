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

const getHistoryCollection = (database, userId) => {
  if (!userId) {
    throw new Error("A signed-in user is required to sync notifications.");
  }

  return collection(database, NOTIFICATIONS_COLLECTION, userId, "history");
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
