import { Link } from "react-router-dom";
import {
  ArrowPathIcon,
  ExclamationTriangleIcon,
  MagnifyingGlassIcon,
} from "@heroicons/react/24/outline";
import MovieGridSkeleton from "../ui/MovieGridSkeleton";

export function CollectionLoading({ label, history = false }) {
  return (
    <div aria-busy="true" aria-label={label}>
      <p role="status" className="mb-5 text-sm text-[var(--color-text-muted)]">
        {label}
      </p>
      {history ? (
        <div
          aria-hidden="true"
          className="grid grid-cols-1 gap-3 min-[480px]:grid-cols-2 sm:gap-5 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6"
        >
          {Array.from({ length: 6 }, (_, index) => (
            <div
              key={index}
              className="grid grid-cols-[5.5rem_minmax(0,1fr)] overflow-hidden rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] motion-safe:animate-pulse min-[480px]:block"
            >
              <div className="aspect-[4/5] max-h-72 bg-[var(--color-surface-2)]" />
              <div className="space-y-3 p-3">
                <div className="h-5 w-4/5 rounded bg-[var(--color-surface-2)]" />
                <div className="h-4 w-3/5 rounded bg-[var(--color-surface-2)]" />
                <div className="h-11 rounded-lg bg-[var(--color-surface-2)]" />
                <div className="h-11 rounded-lg bg-[var(--color-surface-2)]" />
              </div>
            </div>
          ))}
        </div>
      ) : (
        <MovieGridSkeleton count={8} />
      )}
    </div>
  );
}

export default function CollectionState({
  title,
  message,
  error = false,
  onAction,
  actionTo,
  actionLabel,
}) {
  const Icon = error ? ExclamationTriangleIcon : MagnifyingGlassIcon;
  const actionClass =
    "inline-flex min-h-11 w-full items-center justify-center gap-2 rounded-xl bg-purple-600 px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 sm:w-auto";
  return (
    <div className="flex min-h-64 flex-col items-center justify-center rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] px-5 py-10 text-center sm:min-h-72">
      <span
        className={`mb-4 rounded-2xl p-4 ${error ? "bg-amber-500/10 text-amber-500" : "bg-purple-500/10 text-purple-400"}`}
      >
        <Icon aria-hidden="true" className="h-7 w-7" />
      </span>
      <h2 className="text-xl font-bold leading-relaxed text-[var(--color-text)]">
        {title}
      </h2>
      <p
        role={error ? "alert" : undefined}
        className="mt-2 max-w-md text-sm leading-relaxed text-[var(--color-text-muted)]"
      >
        {message}
      </p>
      {(onAction || actionTo) && (
        <div className="mt-6 w-full sm:w-auto">
          {actionTo ? (
            <Link to={actionTo} className={actionClass}>
              {actionLabel}
            </Link>
          ) : (
            <button type="button" onClick={onAction} className={actionClass}>
              {error && (
                <ArrowPathIcon aria-hidden="true" className="h-4 w-4" />
              )}
              {actionLabel}
            </button>
          )}
        </div>
      )}
    </div>
  );
}
