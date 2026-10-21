import { useEffect, useRef } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

// ─── LanguageSelector: language switch dropdown ───────────────────────────────

const LanguageSelector = ({ className = "" }) => {
  const { language, languages, setLanguage, t } = useLanguage();
  const detailsRef = useRef(null);
  const summaryRef = useRef(null);
  const currentLanguage = languages.find(({ code }) => code === language);

  // ─── Effects: close menu on outside click/Escape ──────────────────────────────

  useEffect(() => {
    const closeOnOutsideClick = (event) => {
      if (detailsRef.current && !detailsRef.current.contains(event.target)) {
        detailsRef.current.open = false;
      }
    };

    const closeOnEscape = (event) => {
      if (event.key !== "Escape" || !detailsRef.current?.open) return;
      detailsRef.current.open = false;
      summaryRef.current?.focus();
    };

    document.addEventListener("pointerdown", closeOnOutsideClick);
    document.addEventListener("keydown", closeOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeOnOutsideClick);
      document.removeEventListener("keydown", closeOnEscape);
    };
  }, []);

  return (
    <details
      ref={detailsRef}
      className={`relative ${className}`}
      data-testid="language-selector"
    >
      <summary
        ref={summaryRef}
        aria-label={`${t("Switch language")}: ${currentLanguage.label}`}
        title={currentLanguage.label}
        className="flex min-h-9 cursor-pointer list-none items-center justify-center gap-1 rounded-md px-1 text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500 sm:min-h-11 sm:gap-1.5 sm:px-2 [&::-webkit-details-marker]:hidden"
      >
        <img
          src={currentLanguage.flag}
          alt=""
          aria-hidden="true"
          data-testid="selected-language-flag"
          className="aspect-[3/2] w-7 shrink-0 rounded-sm object-contain object-center sm:w-8"
        />
        <ChevronDownIcon
          className="h-4 w-4 shrink-0 text-[var(--color-text-muted)]"
          aria-hidden="true"
        />
        <span className="sr-only">{currentLanguage.label}</span>
      </summary>
      <div
        role="group"
        aria-label={t("Choose language")}
        className="no-scrollbar absolute -right-10 z-50 mt-2 grid w-[min(18rem,calc(100vw-3rem))] max-h-[min(60dvh,24rem)] min-h-0 gap-1 overflow-y-auto overscroll-contain rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-2 shadow-xl sm:right-0"
      >
        {languages.map(({ code, label, flag }) => (
          <button
            key={code}
            type="button"
            aria-label={label}
            aria-pressed={code === language}
            onClick={() => {
              setLanguage(code);
              detailsRef.current.open = false;
            }}
            className="flex min-h-11 min-w-0 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            <img
              src={flag}
              alt=""
              aria-hidden="true"
              className="aspect-[3/2] w-8 shrink-0 rounded-sm object-contain object-center"
            />
            <span className="min-w-0 break-words">{label}</span>
          </button>
        ))}
      </div>
    </details>
  );
};

export default LanguageSelector;
