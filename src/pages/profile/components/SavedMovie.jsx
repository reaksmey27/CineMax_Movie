import { useRef, useState } from "react";
import { TrashIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";
import MovieCard from "../../../components/ui/MovieCard";

const SavedMovie = ({ movie, listName, onRemove, onRemoved }) => {
  const { t } = useLanguage();
  const [removing, setRemoving] = useState(false);
  const [error, setError] = useState(false);
  const busy = useRef(false);
  const remove = async () => {
    if (busy.current) return;
    busy.current = true;
    setRemoving(true);
    setError(false);
    try {
      const result = await onRemove(movie);
      if (result === false) setError(true);
      else onRemoved();
    } catch {
      setError(true);
    } finally {
      busy.current = false;
      setRemoving(false);
    }
  };
  return (
    <li className="min-w-0">
      <MovieCard
        movie={movie}
        headingLevel="h3"
        showActions={false}
        hideUnrated
      />
      <button
        type="button"
        disabled={removing}
        onClick={remove}
        aria-label={t("Remove {title} from {list}", {
          title: movie.title,
          list: t(listName),
        })}
        className="mt-3 inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl border border-[var(--color-border)] px-2 text-xs font-medium text-[var(--color-text-muted)] transition-colors hover:bg-red-500/10 hover:text-[var(--color-text)] focus-visible:outline-2 focus-visible:outline-purple-500 disabled:cursor-wait disabled:opacity-60 sm:text-sm"
      >
        <TrashIcon className="h-4 w-4" aria-hidden="true" />
        {removing ? t("Removing...") : t("Remove")}
      </button>
      {error && (
        <p role="alert" className="mt-2 text-xs text-[var(--color-text-muted)]">
          {t("Could not remove this movie. Please try again.")}
        </p>
      )}
    </li>
  );
};

export default SavedMovie;
