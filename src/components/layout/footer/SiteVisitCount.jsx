import { useEffect, useState } from "react";
import { EyeIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

export default function SiteVisitCount() {
  const { t, language } = useLanguage();
  const [count, setCount] = useState(null);
  useEffect(() => {
    let active = true;
    import("../../../firebase/siteVisits")
      .then(({ loadSiteVisits }) => loadSiteVisits())
      .then((value) => {
        if (active && Number.isSafeInteger(value) && value >= 0)
          setCount(value);
      })
      .catch(() => {
        /* Keep the footer usable if the counter is unavailable. */
      });
    return () => {
      active = false;
    };
  }, []);
  return (
    <p className="flex items-center justify-center gap-2 text-sm text-gray-400 md:justify-start">
      <EyeIcon
        className="h-4 w-4 shrink-0 text-purple-400"
        aria-hidden="true"
      />
      <span>
        {t("Website visits")}:{" "}
        <span className="font-semibold tabular-nums text-[var(--color-text)]">
          {count === null ? "—" : new Intl.NumberFormat(language).format(count)}
        </span>
      </span>
    </p>
  );
}
