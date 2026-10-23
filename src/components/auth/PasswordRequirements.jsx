import { useLanguage } from "../../context/LanguageContext";
import { passwordRequirements } from "../../utils/passwordRequirements";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function PasswordRequirements({ password, id }) {
  const { t } = useLanguage();
  return (
    <div id={id} className="text-xs leading-5">
      <ul aria-label={t("Password requirements")} className="space-y-0.5">
        {passwordRequirements.map(({ label, test }) => {
          const met = test(password);
          const Icon = met ? CheckIcon : XMarkIcon;
          return (
            <li key={label} data-met={met} className={`flex items-start gap-1.5 font-normal ${met ? "text-green-500" : "text-red-400"}`}>
              <Icon aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
              <span>
                <span className="sr-only">{met ? t("Met") : t("Not met")}: </span>
                {t(label)}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
