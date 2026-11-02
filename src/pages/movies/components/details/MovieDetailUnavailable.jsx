import { XMarkIcon } from "@heroicons/react/24/outline";
import PageError from "../../../../components/ui/feedback/PageError";
import { useLanguage } from "../../../../context/LanguageContext";
import { useNavigate } from "react-router-dom";

export default function MovieDetailUnavailable({ error, onRetry }) {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const retryable = error === "unavailable";
  return (
    <div className="pt-32 pb-20 px-6 sm:px-12 lg:px-24 xl:px-40 min-h-screen bg-[var(--color-bg)] flex flex-col items-center justify-center">
      <PageError
        message={
          retryable ? t("Could not load movie details.") : t("Movie not found")
        }
        buttonLabel={retryable ? t("Try again") : t("Browse Movies")}
        onRetry={retryable ? onRetry : () => navigate("/movies")}
        icon={XMarkIcon}
      />
    </div>
  );
}
