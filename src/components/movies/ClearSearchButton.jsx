import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

export default function ClearSearchButton({ onClear, inputRef }) {
  const { t } = useLanguage();
  return (
    <button
      type="button"
      aria-label={t("Clear search")}
      onClick={() => {
        onClear();
        inputRef.current?.focus();
      }}
      className="absolute right-0 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-[var(--color-text-muted)] transition-colors hover:text-purple-400 focus-visible:outline-2 focus-visible:outline-purple-400"
    >
      <XMarkIcon aria-hidden="true" className="h-5 w-5" />
    </button>
  );
}
