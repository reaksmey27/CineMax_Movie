import { useEffect, useState } from "react";
import { useLanguage } from "../../context/LanguageContext";

export default function ConnectionBanner() {
  const { t } = useLanguage();
  const [status, setStatus] = useState(() =>
    navigator.onLine ? "online" : "offline",
  );
  useEffect(() => {
    const offline = () => setStatus("offline");
    const online = () =>
      setStatus((current) => (current === "offline" ? "restored" : current));
    window.addEventListener("offline", offline);
    window.addEventListener("online", online);
    return () => {
      window.removeEventListener("offline", offline);
      window.removeEventListener("online", online);
    };
  }, []);

  if (status === "online") return null;
  return (
    <aside
      aria-label={t("Connection status")}
      className="fixed bottom-20 left-4 right-4 z-[120] mx-auto flex max-w-lg items-center justify-between gap-3 rounded-2xl border border-(--color-border) bg-(--color-surface-1) px-4 py-3 text-sm text-(--color-text) shadow-xl sm:bottom-6"
    >
      <p role="status">
        {status === "offline"
          ? t("You're offline. Some features are unavailable.")
          : t("Connection restored. Retry any failed requests.")}
      </p>
      {status === "restored" && (
        <button
          type="button"
          onClick={() => setStatus("online")}
          className="min-h-11 shrink-0 rounded-xl px-3 text-purple-500 hover:bg-purple-500/10"
        >
          {t("Dismiss")}
        </button>
      )}
    </aside>
  );
}
