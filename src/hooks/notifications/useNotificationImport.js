import { useCallback, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";
import { writeStoredNotifications } from "../../context/notifications/notificationStorage";

export function useNotificationImport({
  userId,
  remoteHistory,
  localHistory,
  setLocalHistory,
}) {
  const { t } = useLanguage();
  const [importDismissedFor, setImportDismissedFor] = useState(null);
  const [isImportingHistory, setIsImportingHistory] = useState(false);
  const [importMessage, setImportMessage] = useState("");
  const [importError, setImportError] = useState("");

  const shouldOfferLocalImport = Boolean(
    userId &&
    remoteHistory.userId === userId &&
    localHistory.length > 0 &&
    importDismissedFor !== userId,
  );

  const importLocalHistory = useCallback(async () => {
    if (!userId || !shouldOfferLocalImport || isImportingHistory) return;

    setIsImportingHistory(true);
    setImportError("");
    setImportMessage("");

    try {
      const [{ db }, notificationsModule] = await Promise.all([
        import("../../firebase/firestore"),
        import("../../firebase/notifications"),
      ]);
      const result = await notificationsModule.importNotifications(
        db,
        userId,
        localHistory,
      );
      const consumedIds = new Set(result.consumedIds);

      setLocalHistory((previous) =>
        previous.filter((notification) => !consumedIds.has(notification.id)),
      );
      writeStoredNotifications(
        localHistory.filter(
          (notification) => !consumedIds.has(notification.id),
        ),
      );
      setImportDismissedFor(userId);
      setImportMessage(
        t(
          "Imported {count} notification(s). Your account keeps the 50 most recent.",
          {
            count: result.importedCount,
          },
        ),
      );
      if (result.skippedCount > 0) {
        setImportError(
          t("{count} invalid local notification(s) were left on this device.", {
            count: result.skippedCount,
          }),
        );
      }
    } catch (error) {
      console.error("[notifications] Failed to import local history", error);
      setImportError(
        t(
          "Local notification history could not be imported. It remains on this device; check your connection and retry.",
        ),
      );
    } finally {
      setIsImportingHistory(false);
    }
  }, [
    isImportingHistory,
    localHistory,
    setLocalHistory,
    shouldOfferLocalImport,
    t,
    userId,
  ]);

  const keepLocalHistory = useCallback(() => {
    setImportDismissedFor(userId);
    setImportError("");
    setImportMessage(t("Your older notifications will remain on this device."));
  }, [t, userId]);

  return {
    shouldOfferLocalImport,
    isImportingHistory,
    importMessage,
    importError,
    importLocalHistory,
    keepLocalHistory,
  };
}
