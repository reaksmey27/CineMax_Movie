import { useEffect, useState } from "react";
import { ArrowUpIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "../../context/LanguageContext";

const SCROLL_THRESHOLD = 300;

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
      className={`fixed bottom-5 right-5 z-[120] flex h-12 w-12 items-center justify-center rounded-full border border-purple-300/70 bg-gradient-to-br from-purple-600 to-indigo-700 text-white shadow-[0_8px_28px_rgba(124,58,237,0.45)] ring-2 ring-purple-300/40 transition-all duration-300 hover:-translate-y-1 hover:from-purple-500 hover:to-indigo-600 hover:shadow-[0_10px_32px_rgba(124,58,237,0.6)] active:scale-95 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-purple-300 sm:bottom-6 sm:right-6 ${
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
