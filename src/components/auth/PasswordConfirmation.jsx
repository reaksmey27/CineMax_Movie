import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";
import { useLanguage } from "../../context/LanguageContext";

export default function PasswordConfirmation({ password, confirmation, id }) {
  const { t } = useLanguage();
  const matches = password === confirmation;
  const Icon = matches ? CheckIcon : XMarkIcon;
  return (
    <p id={id} role="status" aria-atomic="true" className={`text-[11px] leading-4 ${matches ? "text-green-500" : "text-red-400"}`}>
      {confirmation.length > 0 && (
        <span className="flex items-start gap-1">
          <Icon aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
          {matches ? t("Passwords match.") : t("Passwords do not match.")}
        </span>
      )}
    </p>
  );
}
