import {
  collection,
  deleteDoc,
  doc,
  getDocs,
  limit,
  onSnapshot,
  orderBy,
  query,
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
    (snapshot) => onNotifications(getNotifications(snapshot)),
    onError,
  );
};

export const saveNotification = async (database, userId, notification) => {
  if (!notification?.id) {
    throw new Error("A valid notification is required to save history.");
  }

  const historyCollection = getHistoryCollection(database, userId);
  const historyQuery = query(
    historyCollection,
    orderBy("timestamp", "desc"),
    limit(NOTIFICATION_HISTORY_LIMIT),
  );
  const existingNotifications = await getDocs(historyQuery);
  const batch = writeBatch(database);
  const { id, ...notificationData } = notification;

  batch.set(doc(historyCollection, id), notificationData);
  if (existingNotifications.size >= NOTIFICATION_HISTORY_LIMIT) {
    batch.delete(
      existingNotifications.docs[existingNotifications.docs.length - 1].ref,
    );
  }

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

export const clearNotifications = async (database, userId) => {
  const historyCollection = getHistoryCollection(database, userId);
  const snapshot = await getDocs(historyCollection);
  if (snapshot.empty) return;

  const batch = writeBatch(database);
  snapshot.docs.forEach((notification) => batch.delete(notification.ref));
  await batch.commit();
};
