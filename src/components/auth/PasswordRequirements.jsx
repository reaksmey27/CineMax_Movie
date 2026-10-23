import { useLanguage } from "../../context/LanguageContext";
import { passwordRequirements } from "../../utils/passwordRequirements";

export default function PasswordRequirements({ password, id }) {
  const { t } = useLanguage();
  return (
    <div id={id} className="rounded-xl border border-purple-400/20 bg-purple-400/5 p-3 text-sm">
      <p className="mb-2 font-semibold text-purple-400">{t("Password requirements")}</p>
      <ul className="grid gap-1.5 sm:grid-cols-2">
        {passwordRequirements.map(({ label, test }) => (
          <li key={label}>
            <label className="flex items-start gap-2 text-[var(--color-text-muted)]">
              <input type="checkbox" checked={test(password)} disabled className="mt-1 shrink-0 accent-purple-500" />
              <span>{t(label)}</span>
            </label>
          </li>
        ))}
      </ul>
    </div>
  );
}
