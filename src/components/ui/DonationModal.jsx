import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { XMarkIcon, ClipboardDocumentIcon, CheckIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { FaCoffee } from "react-icons/fa";
import donationQr from "../../assets/images/donation-qr.png";

const PAYMENT_INFO = {
  name: "SAN REAKSMEY",
  number: "006 419 870",
  numberRaw: "006419870",
  bank: "ABA Bank",
};

const PaymentRow = ({ label, value, copyText = value, copied, onCopy }) => (
  <div className="space-y-1.5 py-3">
    <dt className="text-xs font-medium text-[var(--color-text-muted)]">{label}</dt>
    <dd className="flex items-center justify-between gap-3">
      <span className="min-w-0 break-words text-sm font-semibold tracking-wide text-[var(--color-text)]">{value}</span>
      <button type="button" onClick={() => onCopy(copyText, label)} aria-label={`Copy ${label.toLowerCase()}`}
        className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-2 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)]">
        {copied === label ? <CheckIcon className="h-4 w-4" aria-hidden="true" /> : <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />}
        {copied === label ? "Copied" : "Copy"}
      </button>
    </dd>
  </div>
);

const DonationModal = ({ isOpen, onClose }) => {
  const dialogRef = useRef(null);
  const contentRef = useRef(null);
  const closeRef = useRef(null);
  const copyTimer = useRef(null);
  const copyVersion = useRef(0);
  const [copied, setCopied] = useState(null);
  const [message, setMessage] = useState("");

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
      const scale = Math.min(1, (availableWidth - 2) / width, (availableHeight - 2) / height);
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
    return () => {
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

  const handleCopy = async (text, label) => {
    const version = ++copyVersion.current;
    window.clearTimeout(copyTimer.current);
    setCopied(null);
    setMessage("");
    try {
      await navigator.clipboard.writeText(text);
      if (version !== copyVersion.current) return;
      setCopied(label);
      setMessage(`${label} copied.`);
      copyTimer.current = window.setTimeout(() => { setCopied(null); setMessage(""); }, 2500);
    } catch {
      if (version !== copyVersion.current) return;
      setMessage("Copy is unavailable. Please select and copy the account details manually.");
    }
  };

  const handleClose = () => {
    setCopied(null);
    setMessage("");
    onClose();
  };

  if (!isOpen) return null;

  return createPortal(
    <dialog ref={dialogRef} aria-labelledby="donation-title" aria-describedby="donation-description"
      onCancel={(event) => { event.preventDefault(); handleClose(); }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom) handleClose();
      }}
      className="donation-dialog fixed inset-0 m-auto max-h-none max-w-none overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0 text-[var(--color-text)] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm">
      <div ref={contentRef} className="w-[min(510px,calc(100vw-2rem-2px))] origin-top-left">
      <header className="relative border-b border-[var(--color-border)] bg-amber-500/5 px-5 pb-3 pt-4">
        <button ref={closeRef} type="button" onClick={handleClose} aria-label="Close donation card"
          className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]">
          <XMarkIcon className="h-5 w-5" />
        </button>
        <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10">
          <FaCoffee className="h-5 w-5" aria-hidden="true" />
        </div>
        <h2 id="donation-title" className="pr-8 text-xl font-bold tracking-tight sm:text-2xl">Buy me a coffee</h2>
        <p id="donation-description" className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--color-text-muted)]">
          Enjoying CineMax? Your support helps me keep building and improving it. Every coffee is appreciated.
        </p>
      </header>

      <div className="px-5 py-3">
        <div className="grid items-start gap-4 sm:grid-cols-[192px_minmax(0,1fr)]">
          <section aria-label="Scan to donate" className="text-center">
            <div className="mx-auto w-full max-w-[192px] overflow-hidden rounded-xl bg-white p-2 shadow-sm">
              <img src={donationQr} alt="Donation QR code for SAN REAKSMEY at ABA Bank" className="h-auto w-full" decoding="async" />
            </div>
            <p className="mt-2 text-sm font-semibold">Scan with your banking app</p>
            <p className="mt-1 text-xs text-[var(--color-text-muted)]">Or save the QR code to your phone</p>
          </section>

          <section aria-label="Bank transfer details" className="min-w-0">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-amber-400" aria-hidden="true" />
              <h3 className="text-sm font-semibold">{PAYMENT_INFO.bank}</h3>
              <span className="ml-auto rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">Bank transfer</span>
            </div>
            <dl className="mt-2 divide-y divide-[var(--color-border)]">
              <PaymentRow label="Account name" value={PAYMENT_INFO.name} copied={copied} onCopy={handleCopy} />
              <PaymentRow label="Account number" value={PAYMENT_INFO.number} copyText={PAYMENT_INFO.numberRaw} copied={copied} onCopy={handleCopy} />
            </dl>
            <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">Open your ABA app to scan the QR code or transfer using the account number above.</p>
            <p role="status" aria-live="polite" className="mt-2 min-h-5 text-xs text-[var(--color-text)]">{message}</p>
          </section>
        </div>

        <a href={donationQr} download="cinemax-donation-qr.png"
          className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300">
          <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" /> Save QR code
        </a>
        <button type="button" onClick={handleClose}
          className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)]">
          Maybe later
        </button>
        <p lang="km" className="mt-3 border-t border-[var(--color-border)] pt-3 text-center text-sm leading-relaxed text-[var(--color-text-muted)]">សូមអរគុណចំពោះការគាំទ្រ CineMax ❤️
              ទឹកចិត្តរបស់អ្នកមានន័យខ្លាំងណាស់។</p>
      </div>
      </div>
    </dialog>,
    document.body,
  );
};

export default DonationModal;
