import { useEffect, useState } from "react";
import { ClockIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";
import {
  getRemainingSeconds,
  formatRemainingDuration,
} from "../../../utils/player/finishTime";

export default function MovieFinishTime({ runtimeMinutes, progress }) {
  const { t, language } = useLanguage();
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const refresh = () => setNow(Date.now());
    const timer = window.setInterval(refresh, 30000);
    document.addEventListener("visibilitychange", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
    };
  }, []);
  const remaining = getRemainingSeconds(runtimeMinutes, progress);
  if (remaining === null || remaining <= 0) return null;
  const finish = new Date(now + remaining * 1000);
  const anotherDay = finish.toDateString() !== new Date(now).toDateString();
  const time = new Intl.DateTimeFormat(language, {
    timeStyle: "short",
    ...(anotherDay ? { dateStyle: "short" } : {}),
  }).format(finish);
  const duration = formatRemainingDuration(remaining, language);
  return (
    <p
      className="flex flex-wrap items-center gap-x-2 gap-y-1 text-sm leading-relaxed text-[var(--color-text-muted)]"
      data-testid="movie-finish-time"
    >
      <ClockIcon aria-hidden="true" className="h-4 w-4 shrink-0" />
      <span>
        {progress && !progress.completed && progress.positionSeconds > 0
          ? t("{duration} remaining", { duration })
          : duration}
      </span>
      <span aria-hidden="true">·</span>
      <span>{t("Estimated finish: {time}", { time })}</span>
    </p>
  );
}
