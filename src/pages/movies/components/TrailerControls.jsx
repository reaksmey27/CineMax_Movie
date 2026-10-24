import {
  ArrowsPointingOutIcon,
  MinusIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

export default function TrailerControls({
  isMinimized,
  minimizeRef,
  expandRef,
  onMinimize,
  onExpand,
  onStop,
}) {
  const { t } = useLanguage();
  return (
    <div className="flex shrink-0 items-center gap-1">
      <button
        ref={isMinimized ? expandRef : minimizeRef}
        type="button"
        aria-label={
          isMinimized
            ? t("Expand trailer player")
            : t("Minimize trailer and keep watching")
        }
        title={
          isMinimized ? t("Expand player") : t("Minimize and keep watching")
        }
        onClick={isMinimized ? onExpand : onMinimize}
        className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-white/20 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400"
      >
        {isMinimized ? (
          <ArrowsPointingOutIcon className="h-5 w-5" aria-hidden="true" />
        ) : (
          <MinusIcon className="h-5 w-5" aria-hidden="true" />
        )}
      </button>
      <button
        type="button"
        aria-label={t("Stop trailer")}
        title={t("Stop trailer")}
        onClick={onStop}
        className="flex min-h-10 min-w-10 items-center justify-center rounded-full bg-white/10 transition-colors hover:bg-red-500/80 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-red-400"
      >
        <XMarkIcon className="h-5 w-5" aria-hidden="true" />
      </button>
    </div>
  );
}
