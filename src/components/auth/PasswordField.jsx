import { useId, useState } from "react";
import { EyeIcon, EyeSlashIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";

export default function PasswordField({ label, confirmation = false, ...inputProps }) {
  const { t } = useLanguage();
  const id = useId();
  const [visible, setVisible] = useState(false);
  const [capsLockOn, setCapsLockOn] = useState(false);
  const warningId = `${id}-caps-lock`;
  const updateCapsLock = (event) => {
    setCapsLockOn(event.getModifierState?.("CapsLock") === true);
  };
  const toggleLabel = confirmation
    ? visible ? t("Hide confirmation password") : t("Show confirmation password")
    : visible ? t("Hide password") : t("Show password");
  const Icon = visible ? EyeSlashIcon : EyeIcon;

  return (
    <div className="flex h-full min-w-0 flex-col">
      <label htmlFor={id} className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
        {label}
      </label>
      <div className="mt-auto">
        <div className="relative">
          <input
            {...inputProps}
            id={id}
            type={visible ? "text" : "password"}
            aria-describedby={[inputProps["aria-describedby"], capsLockOn && warningId].filter(Boolean).join(" ") || undefined}
            onKeyDown={(event) => {
              updateCapsLock(event);
              inputProps.onKeyDown?.(event);
            }}
            onKeyUp={(event) => {
              updateCapsLock(event);
              inputProps.onKeyUp?.(event);
            }}
            onBlur={(event) => {
              setCapsLockOn(false);
              inputProps.onBlur?.(event);
            }}
            className="min-h-11 w-full rounded-md border border-white/10 bg-white py-2 pl-3.5 pr-12 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 aria-invalid:border-red-400 aria-invalid:focus:ring-red-400/30"
          />
          <button
            type="button"
            aria-label={toggleLabel}
            aria-controls={id}
            disabled={inputProps.disabled}
            onClick={() => setVisible((current) => !current)}
            className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-md text-slate-500 transition hover:text-purple-600 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-500 disabled:opacity-50"
          >
            <Icon className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>
        <p id={warningId} role="status" className="text-xs text-amber-300">
          {capsLockOn && <span className="mt-2 block">{t("Caps Lock is on")}</span>}
        </p>
      </div>
    </div>
  );
}
