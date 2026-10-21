import React from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

// ─── PageError: error panel with retry button ─────────────────────────────────

const PageError = ({
  message,
  buttonLabel = "Retry",
  onRetry,
  buttonColor = "bg-white hover:bg-red-500 hover:text-white",
  icon: Icon,
  iconColor = "text-red-500",
  borderColor = "border-red-500/10 bg-red-500/5",
}) => {
  const { t } = useLanguage();
  const handleClick = () => {
    if (onRetry) {
      onRetry();
    } else {
      window.location.reload();
    }
  };

  return (
    <div
      className={`flex min-h-[20rem] flex-col items-center justify-center rounded-3xl border-2 p-6 text-center sm:min-h-[25rem] sm:p-12 ${borderColor}`}
    >
      <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-full bg-white/10 sm:h-16 sm:w-16">
        {Icon ? (
          <Icon className={`h-8 w-8 ${iconColor}`} />
        ) : (
          <XMarkIcon className="h-8 w-8 text-red-500" />
        )}
      </div>
      <h3 className="text-2xl font-black text-white mb-2 uppercase italic tracking-tighter">
        {t("Error")}
      </h3>
      <p className="text-gray-500 font-medium max-w-sm">{message}</p>
      <button
        onClick={handleClick}
        className={`mt-8 w-full rounded-2xl px-6 py-4 text-xs font-black uppercase tracking-widest text-black transition-all shadow-xl active:scale-95 sm:w-auto sm:px-10 ${buttonColor}`}
      >
        {t(buttonLabel)}
      </button>
    </div>
  );
};

export default PageError;
