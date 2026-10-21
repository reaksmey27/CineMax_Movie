import { ClipboardDocumentIcon, CheckIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

const PaymentRow = ({ label, value, copyText = value, copied, onCopy }) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-1.5 py-3">
      <dt className="text-xs font-medium text-[var(--color-text-muted)]">
        {label}
      </dt>
      <dd className="flex items-center justify-between gap-3">
        <span className="min-w-0 break-words text-sm font-semibold tracking-wide text-[var(--color-text)]">
          {value}
        </span>
        <button
          type="button"
          onClick={() => onCopy(copyText, label)}
          aria-label={t("Copy {label}", { label })}
          className="inline-flex min-h-11 shrink-0 items-center gap-1 rounded-xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-2 text-xs font-semibold text-[var(--color-text)] transition-colors hover:bg-[var(--color-surface-2)]"
        >
          {copied === label ? (
            <CheckIcon className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ClipboardDocumentIcon className="h-4 w-4" aria-hidden="true" />
          )}
          {copied === label ? t("Copied") : t("Copy")}
        </button>
      </dd>
    </div>
  );
};

export default PaymentRow;
