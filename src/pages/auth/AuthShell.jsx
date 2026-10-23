import { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
import AuthPosterWall from "./AuthPosterWall";
import { CLOSE_ANIMATION_MS } from "./authPosterCards";
import { useReleasePosters } from "./hooks/useReleasePosters";

// ─── AuthShell: shared auth page layout ───────────────────────────────────────

const AuthShell = ({ children, onClose }) => {
  const { t } = useLanguage();
  const movieCards = useReleasePosters();
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);
  const [isClosing, setIsClosing] = useState(false);
  const closingRef = useRef(false);
  const closeTimerRef = useRef(null);
  const requestCloseRef = useRef(null);

  // ─── Handlers: animated close ────────────────────────────────────────────────

  const requestClose = () => {
    if (closingRef.current) return;

    const prefersReducedMotion =
      typeof window.matchMedia === "function" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      onCloseRef.current?.();
      return;
    }

    closingRef.current = true;
    setIsClosing(true);
    closeTimerRef.current = window.setTimeout(() => {
      onCloseRef.current?.();
    }, CLOSE_ANIMATION_MS);
  };

  // ─── Effects: focus trap & scroll lock ───────────────────────────────────────

  useEffect(() => {
    onCloseRef.current = onClose;
    requestCloseRef.current = requestClose;
  });

  useEffect(() => () => window.clearTimeout(closeTimerRef.current), []);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    document.body.style.overflow = "hidden";

    const getFocusableElements = () =>
      dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [];

    const firstInput = dialogRef.current?.querySelector(
      "input:not([disabled])",
    );
    (firstInput || getFocusableElements()[0])?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        requestCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeyDown);

    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  // ─── Render: split layout with close button ──────────────────────────────────

  return (
    <div
      className={`${isClosing ? "animate-auth-backdrop-out" : "animate-auth-backdrop"} fixed inset-0 z-[300] overflow-y-auto bg-transparent px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8`}
      onClick={requestClose}
      role="presentation"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.05),transparent_40%)]" />
      <div className="mx-auto flex min-h-[calc(100svh-4rem)] w-full max-w-[840px] items-center">
        <div
          ref={dialogRef}
          className={`${isClosing ? "animate-auth-modal-out" : "animate-auth-modal"} relative grid h-[min(46rem,calc(100svh_-_5rem))] w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#2c2c2c] shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:grid-cols-[1.08fr_0.92fr]`}
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <button
            type="button"
            onClick={requestClose}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/35 text-white/80 backdrop-blur transition hover:border-purple-500/40 hover:bg-purple-500/20 hover:text-white"
            aria-label={t("Close auth popup")}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <AuthPosterWall movieCards={movieCards} />

          <section className="flex min-h-0 items-center-safe overflow-y-auto bg-[#23212b] px-5 pb-7 pt-16 sm:px-8 sm:pb-8 sm:pt-16 lg:px-10 lg:py-10">
            <div className="w-full">
              <div id="auth-modal-title" className="w-full">
                {children}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
