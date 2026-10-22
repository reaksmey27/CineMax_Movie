import { useLayoutEffect, useRef, useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";

export default function useDonationDialog(isOpen, onClose) {
  const { t } = useLanguage();
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  const closeRef = useRef(null);
  const copyTimer = useRef(null);
  const copyVersion = useRef(0);
  const [copied, setCopied] = useState(null);
  const [message, setMessage] = useState("");

  // ─── Effects: focus, viewport fit & cleanup ───────────────────────────────────

  useLayoutEffect(() => {
    if (!isOpen) return;
    const dialog = dialogRef.current;
    const opener = document.activeElement;
    const previousOverflow = document.body.style.overflow;
    dialog.showModal();
    const content = contentRef.current;
    // Measure the natural card, then fit it within the visible viewport.
    // The content has its own width so scaling cannot create a resize loop.
    const fitCard = () => {
      const viewport = window.visualViewport;
      const availableWidth = (viewport?.width || window.innerWidth) - 32;
      const availableHeight = (viewport?.height || window.innerHeight) - 32;
      const width = content.offsetWidth;
      const height = content.offsetHeight;
      if (!width || !height) return;
      const scale = Math.min(
        1,
        (availableWidth - 2) / width,
        (availableHeight - 2) / height,
      );
      content.style.transform = `scale(${Math.max(0.1, scale)})`;
      dialog.style.width = `${width * scale + 2}px`;
      dialog.style.height = `${height * scale + 2}px`;
    };
    fitCard();
    const observer = new ResizeObserver(fitCard);
    observer.observe(content);
    window.addEventListener("resize", fitCard);
    window.visualViewport?.addEventListener("resize", fitCard);
    document.body.style.overflow = "hidden";
    closeRef.current?.focus();
    const wrapFocus = (event) => {
      if (event.key !== "Tab") return;
      const controls = [
        ...dialog.querySelectorAll(
          'button:not([disabled]), a[href], input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
        ),
      ].filter(
        (element) => element.getClientRects().length && element.tabIndex >= 0,
      );
      const first = controls[0];
      const last = controls.at(-1);
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last?.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first?.focus();
      }
    };
    dialog.addEventListener("keydown", wrapFocus);
    return () => {
      dialog.removeEventListener("keydown", wrapFocus);
      observer.disconnect();
      window.removeEventListener("resize", fitCard);
      window.visualViewport?.removeEventListener("resize", fitCard);
      copyVersion.current += 1;
      window.clearTimeout(copyTimer.current);
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, [isOpen]);

  // ─── Handlers: copy details & close dialog ────────────────────────────────────

  const handleCopy = async (text, label) => {
    const version = ++copyVersion.current;
    window.clearTimeout(copyTimer.current);
    setCopied(null);
    setMessage("");
    try {
      await navigator.clipboard.writeText(text);
      if (version !== copyVersion.current) return;
      setCopied(label);
      setMessage(t("{label} copied.", { label: t(label) }));
      copyTimer.current = window.setTimeout(() => {
        setCopied(null);
        setMessage("");
      }, 2500);
    } catch {
      if (version !== copyVersion.current) return;
      setMessage(
        t(
          "Copy is unavailable. Please select and copy the account details manually.",
        ),
      );
    }
  };

  const handleClose = () => {
    setCopied(null);
    setMessage("");
    onClose();
  };

  return {
    dialogRef,
    contentRef,
    closeRef,
    copied,
    message,
    handleCopy,
    handleClose,
  };
}
