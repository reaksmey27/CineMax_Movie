import { useState } from "react";
import { UserIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../../context/LanguageContext";

function CastPortrait({ person }) {
  const [failed, setFailed] = useState(false);
  return (
    <div className="aspect-[2/3] overflow-hidden rounded-xl bg-[var(--color-bg-elevated)]">
      {person.image && !failed ? (
        <img
          src={person.image}
          alt=""
          loading="lazy"
          decoding="async"
          onError={() => setFailed(true)}
          className="h-full w-full object-cover"
        />
      ) : (
        <div className="grid h-full place-items-center text-[var(--color-text-muted)]">
          <UserIcon className="h-12 w-12" aria-hidden="true" />
        </div>
      )}
    </div>
  );
}

export default function MovieCredits({ movie }) {
  const { t } = useLanguage();
  return (
    <section aria-labelledby="movie-credits-heading">
      <h2
        id="movie-credits-heading"
        className="text-2xl font-bold text-[var(--color-text)]"
      >
        {t("Cast & crew")}
      </h2>
      <dl className="mt-4 text-sm">
        <dt className="font-semibold text-[var(--color-text-muted)]">
          {t("Director")}
        </dt>
        <dd className="mt-1 text-[var(--color-text)]">
          {movie.directors?.join(", ") ||
            t("Director information unavailable.")}
        </dd>
      </dl>
      {movie.cast?.length ? (
        <ul className="mt-6 grid grid-cols-3 gap-x-3 gap-y-5 sm:gap-4 lg:grid-cols-6">
          {movie.cast.map((person) => (
            <li key={person.id} className="min-w-0">
              <CastPortrait person={person} />
              <p className="mt-2 text-xs font-semibold leading-relaxed text-[var(--color-text)] sm:text-sm">
                {person.name}
              </p>
              {person.character && (
                <p className="mt-1 text-xs text-[var(--color-text-muted)]">
                  {person.character}
                </p>
              )}
            </li>
          ))}
        </ul>
      ) : (
        <p className="mt-4 text-sm text-[var(--color-text-muted)]">
          {t("Cast information unavailable.")}
        </p>
      )}
    </section>
  );
}
