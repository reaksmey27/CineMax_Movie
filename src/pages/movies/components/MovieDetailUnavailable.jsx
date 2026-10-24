import { XMarkIcon } from "@heroicons/react/24/outline";
import PageError from "../../../components/ui/PageError";
import { useLanguage } from "../../../context/LanguageContext";

export default function MovieDetailUnavailable() {
  const { t } = useLanguage();
  return (
    <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24 xl:px-40 min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center">
      <PageError
        message={t("Movie not found")}
        buttonLabel={t("Go Back")}
        icon={XMarkIcon}
      />
    </div>
  );
}
