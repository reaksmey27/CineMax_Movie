import { useLanguage } from "../../../context/LanguageContext";

// ─── NotificationStatusNotices: offline, import & sync banners ────────────────

const NotificationStatusNotices = ({
  isOnline,
  isAuthenticated,
  shouldOfferLocalImport,
  localHistoryCount,
  isImportingHistory,
  importMessage,
  importError,
  syncError,
  onImportLocalHistory,
  onKeepLocalHistory,
  onRetrySync,
}) => {
  const { t } = useLanguage();

  return (
    <>
      {isAuthenticated && !isOnline && (
        <div
          role="status"
          className="mb-5 rounded-2xl border border-amber-400/30 bg-amber-500/10 p-4 text-sm text-amber-100"
        >
          {t(
            "You’re offline. Firestore will queue notification changes and sync them when you reconnect.",
          )}
        </div>
      )}

      {shouldOfferLocalImport && (
        <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-purple-400/30 bg-purple-500/10 p-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h2 className="font-bold text-purple-100">
              {t("Import browser notification history?")}
            </h2>
            <p className="mt-1 text-sm text-purple-100/75">
              {t(
                "{count} notification(s) are stored on this device. Import them into your account? Only the 50 newest will be kept.",
                { count: localHistoryCount },
              )}
            </p>
          </div>
          <div className="flex shrink-0 flex-wrap gap-2">
            <button
              type="button"
              onClick={onImportLocalHistory}
              disabled={!isOnline || isImportingHistory}
              className="min-h-10 rounded-xl bg-purple-600 px-4 text-sm font-bold text-white transition-colors hover:bg-purple-500 disabled:cursor-wait disabled:opacity-60"
            >
              {isImportingHistory ? t("Importing...") : t("Import history")}
            </button>
            <button
              type="button"
              onClick={onKeepLocalHistory}
              disabled={isImportingHistory}
              className="min-h-10 rounded-xl border border-purple-200/20 px-4 text-sm font-bold text-purple-100 transition-colors hover:bg-purple-200/10 disabled:opacity-60"
            >
              {t("Keep on this device")}
            </button>
          </div>
        </div>
      )}

      {importMessage && (
        <p
          role="status"
          className="mb-3 rounded-xl border border-emerald-400/20 bg-emerald-500/10 p-3 text-sm text-emerald-100"
        >
          {importMessage}
        </p>
      )}

      {importError && (
        <p
          role="alert"
          className="mb-5 rounded-xl border border-red-400/20 bg-red-500/10 p-3 text-sm text-red-100"
        >
          {importError}
        </p>
      )}

      {syncError && (
        <div
          role="alert"
          className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-400/30 bg-red-500/10 p-4 text-sm text-red-200 sm:flex-row sm:items-center sm:justify-between"
        >
          <p>{t(syncError)}</p>
          <button
            type="button"
            onClick={onRetrySync}
            className="min-h-10 shrink-0 rounded-xl bg-red-500/15 px-4 font-bold text-red-100 transition-colors hover:bg-red-500/25"
          >
            {t("Retry sync")}
          </button>
        </div>
      )}
    </>
  );
};

export default NotificationStatusNotices;
