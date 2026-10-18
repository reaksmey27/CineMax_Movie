import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "../../context/LanguageContext";

const SCROLL_THRESHOLD = 500;

const BackToTopButton = () => {
  const { t } = useLanguage();
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const updateVisibility = () => {
      setIsVisible(window.scrollY > SCROLL_THRESHOLD);
    };

    updateVisibility();
    window.addEventListener("scroll", updateVisibility, { passive: true });

    return () => {
      window.removeEventListener("scroll", updateVisibility);
    };
  }, []);

  const handleClick = () => {
    const prefersReducedMotion =
      window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches ?? false;

    window.scrollTo({
      top: 0,
      behavior: prefersReducedMotion ? "auto" : "smooth",
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label={t("Back to top")}
      title={t("Back to top")}
      className={`fixed bottom-5 right-5 z-[120] flex h-12 w-12 items-center justify-center rounded-full border border-[var(--color-border)] bg-[var(--color-panel-bg)] text-[var(--color-text)] shadow-2xl backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-purple-500/50 hover:text-purple-300 hover:shadow-[0_0_24px_rgba(168,85,247,0.24)] active:scale-95 sm:bottom-6 sm:right-6 ${
        isVisible
          ? "pointer-events-auto translate-y-0 opacity-100"
          : "pointer-events-none translate-y-3 opacity-0"
      }`}
    >
      <ArrowUpIcon className="h-5 w-5" aria-hidden="true" />
    </button>
  );
};

export default BackToTopButton;
