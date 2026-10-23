import { useLanguage } from "../../context/LanguageContext";
import { passwordRequirements } from "../../utils/passwordRequirements";
import { CheckIcon, XMarkIcon } from "@heroicons/react/24/solid";

export default function PasswordRequirements({ password, id, visible = true }) {
  const { t } = useLanguage();
  return (
    <div id={id} hidden={!visible} className="text-[11px] leading-4">
      <ul aria-label={t("Password requirements")} className="space-y-0">
        {passwordRequirements.map(({ label, test }) => {
          const met = test(password);
          const Icon = met ? CheckIcon : XMarkIcon;
          return (
            <li key={label} data-met={met} className={`flex items-start gap-1 font-normal ${met ? "text-green-500" : "text-red-400"}`}>
              <Icon aria-hidden="true" className="mt-0.5 h-3 w-3 shrink-0" />
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
