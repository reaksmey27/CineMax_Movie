import React, { useEffect, useRef, useState } from "react";
import {
  XMarkIcon,
  ClipboardDocumentIcon,
  CheckIcon,
  ArrowDownTrayIcon,
} from "@heroicons/react/24/solid";
import { FaCoffee } from "react-icons/fa";
import donationQr from "../../assets/images/donation-qr.png";

// ─── Constants ───────────────────────────────────────────────────────────────

const PAYMENT_INFO = {
  name: "SAN REAKSMEY",
  number: "006 419 870",
  numberRaw: "006419870",
  bank: "ABA Bank",
};

// ─── Sub-components ──────────────────────────────────────────────────────────

const CopyButton = ({ text, field, copied, onCopy }) => (
  <button
    type="button"
    onClick={() => onCopy(text, field)}
    aria-label={`Copy ${field}`}
    className="flex min-h-11 shrink-0 items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-2 py-1 text-[10px] font-bold text-gray-400 transition-all active:scale-95 hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-400"
  >
    {copied === field ? (
      <>
        <CheckIcon className="h-3 w-3 text-green-400" />
        <span className="text-green-400">Done</span>
      </>
    ) : (
      <>
        <ClipboardDocumentIcon className="h-3 w-3" />
        <span>Copy</span>
      </>
    )}
  </button>
);

const PaymentRow = ({
  label,
  value,
  field,
  copied,
  onCopy,
  copyText,
  hasBorder,
}) => (
  <div className={`px-3 py-2.5 ${hasBorder ? "border-b border-white/5" : ""}`}>
    <p className="mb-1 text-[10px] font-bold uppercase tracking-widest text-white/55">
      {label}
    </p>
    <div className="flex items-center justify-between gap-2">
      <p className="truncate text-sm font-bold text-white font-mono tracking-wider">
        {value}
      </p>
      <CopyButton
        text={copyText ?? value}
        field={field}
        copied={copied}
        onCopy={onCopy}
      />
    </div>
  </div>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const DonationModal = ({ isOpen, onClose }) => {
  const panelRef = useRef(null);
  const [copied, setCopied] = useState(null);

  // Keyboard + scroll lock
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    const prevOverflow = document.body.style.overflow;

    document.addEventListener("keydown", handleKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", handleKeyDown);
      document.body.style.overflow = prevOverflow;
    };
  }, [isOpen, onClose]);

  const handleBackdropMouseDown = (e) => {
    if (!panelRef.current?.contains(e.target)) onClose?.();
  };

  const handleCopy = (text, field) => {
    navigator.clipboard.writeText(text).then(() => {
      setCopied(field);
      setTimeout(() => setCopied(null), 2000);
    });
  };

  const handleDownload = () => {
    const link = document.createElement("a");
    link.href = donationQr;
    link.download = "cinemax-donation-qr.png";
    link.click();
  };

  if (!isOpen) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-label="Buy Me a Coffee"
      onMouseDown={handleBackdropMouseDown}
    >
      {/* Backdrop */}
      <div className="absolute inset-0 bg-[var(--color-overlay)] backdrop-blur-md" />

      {/* Panel */}
      <div
        ref={panelRef}
        className="relative max-h-[calc(100dvh-3rem)] w-full max-w-lg overflow-y-auto overscroll-contain rounded-3xl border border-[var(--color-border)] bg-[var(--color-panel-bg)] shadow-2xl"
        style={{
          boxShadow:
            "0 0 60px rgba(251,191,36,0.1), 0 25px 50px rgba(0,0,0,0.25)",
        }}
      >
        {/* Top glow */}
        <div className="absolute left-1/2 top-0 h-px w-64 -translate-x-1/2 bg-gradient-to-r from-transparent via-yellow-400 to-transparent" />
        <div className="absolute left-1/2 top-0 h-8 w-40 -translate-x-1/2 rounded-full bg-yellow-400/10 blur-xl" />

        {/* Header */}
        <div className="flex items-center justify-between px-6 pb-4 pt-6">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-yellow-400/20 bg-yellow-400/15">
              <FaCoffee
                className="h-5 w-5 text-yellow-300"
                aria-hidden="true"
              />
            </div>
            <div>
              <h2 className="text-base font-black tracking-tight text-white">
                Buy Me a Coffee
              </h2>
              <p className="text-xs font-medium text-white/60">
                Support CineMax with a coffee
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl border border-white/10 bg-white/5 text-gray-400 transition-all active:scale-95 hover:border-white/20 hover:bg-white/10 hover:text-white"
          >
            <XMarkIcon className="h-4 w-4" />
          </button>
        </div>

        <div className="h-px bg-white/5 mx-6" />

        {/* Body */}
        <div className="space-y-4 px-6 py-5">
          {/* Message */}
          <div className="rounded-2xl border border-yellow-400/15 bg-gradient-to-br from-yellow-400/10 to-yellow-900/10 px-4 py-3.5">
            <p className="text-sm font-medium leading-relaxed text-white/80">
              <span className="font-bold text-yellow-300">Hey!</span> If you
              enjoy using CineMax, consider buying me a coffee. It keeps me
              motivated to build more!
            </p>
            <p className="mt-2 text-xs font-medium leading-relaxed text-yellow-200/70">
              សូមអរគុណចំពោះការគាំទ្រ CineMax ❤️
              ទឹកចិត្តរបស់អ្នកមានន័យខ្លាំងណាស់។
            </p>
          </div>

          {/* QR + Payment */}
          <div className="flex flex-col items-stretch gap-4 sm:flex-row">
            {/* QR Code */}
            <div className="flex shrink-0 flex-col items-center">
              <div className="w-48 overflow-hidden rounded-2xl bg-white p-2">
                <img
                  src={donationQr}
                  alt="Donation QR Code"
                  className="h-auto w-full"
                  decoding="async"
                />
              </div>
              <p className="mt-2 text-[10px] font-bold uppercase tracking-widest text-white/55">
                Scan to donate
              </p>
              <button
                type="button"
                onClick={handleDownload}
                className="mt-2 flex items-center gap-1.5 rounded-lg border border-white/10 bg-white/5 px-3 py-1.5 text-[10px] font-bold text-gray-400 transition-all active:scale-95 hover:border-yellow-400/40 hover:bg-yellow-400/10 hover:text-yellow-400"
              >
                <ArrowDownTrayIcon className="h-3 w-3" />
                Download QR
              </button>
            </div>

            {/* Payment Info */}
            <div className="min-w-0 flex-1 overflow-hidden rounded-2xl border border-white/8 bg-white/4">
              <div className="flex items-center justify-between border-b border-white/5 px-3 py-2.5">
                <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/55">
                  Payment Info
                </span>
                <span className="text-[10px] font-bold uppercase tracking-wide text-yellow-400">
                  {PAYMENT_INFO.bank}
                </span>
              </div>

              <PaymentRow
                label="Account Name"
                value={PAYMENT_INFO.name}
                field="name"
                copied={copied}
                onCopy={handleCopy}
                hasBorder
              />

              <PaymentRow
                label="Account Number"
                value={PAYMENT_INFO.number}
                copyText={PAYMENT_INFO.numberRaw}
                field="number"
                copied={copied}
                onCopy={handleCopy}
                hasBorder
              />

              <div className="px-3 py-2.5">
                <p className="text-[10px] leading-relaxed text-white/60">
                  Open your ABA app, scan the QR or enter the account number
                  above. Every coffee counts!
                </p>
              </div>
            </div>
          </div>

          {/* Close */}
          <button
            type="button"
            onClick={onClose}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 px-4 py-3 text-sm font-bold text-gray-900 transition-all active:scale-[0.98] hover:bg-yellow-300"
            style={{ boxShadow: "0 4px 20px rgba(251,191,36,0.3)" }}
          >
            <FaCoffee className="h-4 w-4" aria-hidden="true" />
            Maybe Next Time!
          </button>
        </div>
      </div>
    </div>
  );
};

export default DonationModal;
