import { useState } from "react";
import { FilmIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

function PosterImage({ src, title, compact, className, imageClassName }) {
  const { t } = useLanguage();
  const [status, setStatus] = useState(src ? "loading" : "error");
  return (
    <div
      className={`relative overflow-hidden bg-[var(--color-bg-elevated)] ${className}`}
      data-poster-state={status}
    >
      {status === "loading" && (
        <div aria-hidden="true" className="skeleton-shimmer absolute inset-0" />
      )}
      {status === "error" ? (
        <div
          title={title || t("Poster unavailable")}
          className="absolute inset-0 flex flex-col items-center justify-center gap-2 bg-gradient-to-br from-purple-500/15 via-[var(--color-bg-elevated)] to-[var(--color-surface-2)] px-2 text-center text-[var(--color-text-muted)]"
        >
          <FilmIcon
            className={`${compact ? "h-5 w-5" : "h-8 w-8"} shrink-0 text-purple-400/80`}
            aria-hidden="true"
          />
          {!compact && title && (
            <span className="line-clamp-2 max-w-full break-words text-xs font-semibold leading-relaxed text-[var(--color-text)]">
              {title}
            </span>
          )}
          <span className={compact ? "sr-only" : "text-[10px] leading-relaxed"}>
            {t("Poster unavailable")}
          </span>
        </div>
      ) : (
        <img
          src={src}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setStatus("loaded")}
          onError={() => setStatus("error")}
          className={`absolute inset-0 h-full w-full object-cover motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:scale-[1.03] ${status === "loaded" ? "opacity-100" : "opacity-0"} ${imageClassName}`}
        />
      )}
    </div>
  );
}

export default function MoviePoster({
  src,
  title = "",
  compact = false,
  className = "h-full w-full",
  imageClassName = "",
}) {
  // A changed source starts a new loading cycle, including after an error.
  return (
    <PosterImage
      key={src || "missing"}
      src={src}
      title={title}
      compact={compact}
      className={className}
      imageClassName={imageClassName}
    />
  );
}
