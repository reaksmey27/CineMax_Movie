import PaymentRow from "./donation/PaymentRow";
import useDonationDialog from "./donation/useDonationDialog";
import { createPortal } from "react-dom";
import { XMarkIcon, ArrowDownTrayIcon } from "@heroicons/react/24/outline";
import { FaCoffee } from "react-icons/fa";
import donationQr from "../../assets/images/donation-qr.png";
import { useLanguage } from "../../context/LanguageContext";

// ─── Constants: bank account details ──────────────────────────────────────────

const PAYMENT_INFO = {
  name: "SAN REAKSMEY",
  number: "006 419 870",
  numberRaw: "006419870",
  bank: "ABA Bank",
};

// ─── DonationModal: QR & bank transfer dialog ─────────────────────────────────

const DonationModal = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const {
    dialogRef,
    contentRef,
    closeRef,
    copied,
    message,
    handleCopy,
    handleClose,
  } = useDonationDialog(isOpen, onClose);

  // ─── Render: donation dialog markup ───────────────────────────────────────────

  if (!isOpen) return null;

  return createPortal(
    <dialog
      ref={dialogRef}
      aria-labelledby="donation-title"
      aria-describedby="donation-description"
      onCancel={(event) => {
        event.preventDefault();
        handleClose();
      }}
      onClick={(event) => {
        if (event.target !== event.currentTarget) return;
        const bounds = event.currentTarget.getBoundingClientRect();
        if (
          event.clientX < bounds.left ||
          event.clientX > bounds.right ||
          event.clientY < bounds.top ||
          event.clientY > bounds.bottom
        )
          handleClose();
      }}
      className="donation-dialog fixed inset-0 m-auto max-h-none max-w-none overflow-hidden rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-0 text-[var(--color-text)] shadow-2xl backdrop:bg-black/75 backdrop:backdrop-blur-sm"
    >
      <div
        ref={contentRef}
        className="w-[min(510px,calc(100vw-2rem-2px))] origin-top-left"
      >
        <header className="relative border-b border-[var(--color-border)] bg-amber-500/5 px-5 pb-3 pt-4">
          <button
            ref={closeRef}
            type="button"
            onClick={handleClose}
            aria-label={t("Close donation card")}
            className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full text-[var(--color-text-muted)] transition-colors hover:bg-[var(--color-surface-2)] hover:text-[var(--color-text)]"
          >
            <XMarkIcon className="h-5 w-5" />
          </button>
          <div className="mb-2 flex h-9 w-9 items-center justify-center rounded-2xl bg-amber-400 text-slate-950 shadow-lg shadow-amber-500/10">
            <FaCoffee className="h-5 w-5" aria-hidden="true" />
          </div>
          <h2
            id="donation-title"
            className="pr-8 text-xl font-bold tracking-tight sm:text-2xl"
          >
            {t("Buy me a coffee")}
          </h2>
          <p
            id="donation-description"
            className="mt-2 max-w-lg text-sm leading-relaxed text-[var(--color-text-muted)]"
          >
            {t(
              "Enjoying CineMax? Your support helps me keep building and improving it. Every coffee is appreciated.",
            )}
          </p>
        </header>

        <div className="px-5 py-3">
          <div className="grid items-start gap-4 sm:grid-cols-[192px_minmax(0,1fr)]">
            <section aria-label={t("Scan to donate")} className="text-center">
              <div className="mx-auto w-full max-w-[192px] overflow-hidden rounded-xl bg-white p-2 shadow-sm">
                <img
                  src={donationQr}
                  alt={t("Donation QR code for {name} at {bank}", {
                    name: PAYMENT_INFO.name,
                    bank: PAYMENT_INFO.bank,
                  })}
                  className="h-auto w-full"
                  decoding="async"
                />
              </div>
              <p className="mt-2 text-sm font-semibold">
                {t("Scan with your banking app")}
              </p>
              <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                {t("Or save the QR code to your phone")}
              </p>
            </section>

            <section
              aria-label={t("Bank transfer details")}
              className="min-w-0"
            >
              <div className="flex items-center gap-2">
                <span
                  className="h-2 w-2 rounded-full bg-amber-400"
                  aria-hidden="true"
                />
                <h3 className="text-sm font-semibold">{PAYMENT_INFO.bank}</h3>
                <span className="ml-auto rounded-full bg-[var(--color-surface-2)] px-2.5 py-1 text-xs text-[var(--color-text-muted)]">
                  {t("Bank transfer")}
                </span>
              </div>
              <dl className="mt-2 divide-y divide-[var(--color-border)]">
                <PaymentRow
                  label={t("Account name")}
                  value={PAYMENT_INFO.name}
                  copied={copied}
                  onCopy={handleCopy}
                />
                <PaymentRow
                  label={t("Account number")}
                  value={PAYMENT_INFO.number}
                  copyText={PAYMENT_INFO.numberRaw}
                  copied={copied}
                  onCopy={handleCopy}
                />
              </dl>
              <p className="text-xs leading-relaxed text-[var(--color-text-muted)]">
                {t(
                  "Open your ABA app to scan the QR code or transfer using the account number above.",
                )}
              </p>
              <p
                role="status"
                aria-live="polite"
                className="mt-2 min-h-5 text-xs text-[var(--color-text)]"
              >
                {message}
              </p>
            </section>
          </div>

          <a
            href={donationQr}
            download="cinemax-donation-qr.png"
            className="mt-4 flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-amber-400 px-5 py-3 text-sm font-bold text-slate-950 transition-colors hover:bg-amber-300"
          >
            <ArrowDownTrayIcon className="h-5 w-5" aria-hidden="true" />{" "}
            {t("Save QR code")}
          </a>
          <button
            type="button"
            onClick={handleClose}
            className="mt-2 flex min-h-11 w-full items-center justify-center rounded-xl text-sm font-medium text-[var(--color-text-muted)] hover:bg-[var(--color-surface-1)] hover:text-[var(--color-text)]"
          >
            {t("Maybe later")}
          </button>
          <p
            lang="km"
            className="mt-3 border-t border-[var(--color-border)] pt-3 text-center text-sm leading-relaxed text-[var(--color-text-muted)]"
          >
            សូមអរគុណចំពោះការគាំទ្រ CineMax ❤️ ទឹកចិត្តរបស់អ្នកមានន័យខ្លាំងណាស់។
          </p>
        </div>
      </div>
    </dialog>,
    document.body,
  );
};

export default DonationModal;
