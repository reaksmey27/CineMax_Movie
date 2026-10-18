import { useEffect, useRef } from "react";
import { useLanguage } from "../../context/LanguageContext";

const LanguageSelector = ({ className = "" }) => {
  const { language, languages, setLanguage, t } = useLanguage();
  const detailsRef = useRef(null);
  const summaryRef = useRef(null);
  const currentLanguage = languages.find(({ code }) => code === language);

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
        className="flex min-h-11 min-w-11 cursor-pointer list-none items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-surface-2)] px-3 text-xl focus-visible:outline-2 focus-visible:outline-purple-500 [&::-webkit-details-marker]:hidden"
      >
        <img
          src={currentLanguage.flag}
          alt=""
          aria-hidden="true"
          data-testid="selected-language-flag"
          className="h-5 w-7 rounded-sm object-contain shadow-sm"
        />
        <span className="sr-only">{currentLanguage.label}</span>
      </summary>
      <div
        role="group"
        aria-label={t("Choose language")}
        className="absolute right-0 z-50 mt-2 grid min-w-48 gap-1 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-2 shadow-xl"
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
            className="flex min-h-11 items-center gap-3 rounded-xl px-3 text-left text-sm font-medium text-[var(--color-text)] hover:bg-[var(--color-surface-2)] focus-visible:outline-2 focus-visible:outline-purple-500"
          >
            <img
              src={flag}
              alt=""
              aria-hidden="true"
              className="h-5 w-7 rounded-sm object-contain shadow-sm"
            />
            <span>{label}</span>
          </button>
        ))}
      </div>
    </details>
  );
};

export default LanguageSelector;
