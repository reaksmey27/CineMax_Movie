import React, { useEffect, useRef, useState } from "react";
import { XMarkIcon } from "@heroicons/react/24/outline";
import { useLanguage } from "../../context/LanguageContext";
import { tmdbService } from "../../services/tmdbService";

const posterCards = [
  {
    title: "SPECTRE",
    subtitle: "Spy thriller",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/b/b9/Spectre_2015_poster.jpg/250px-Spectre_2015_poster.jpg",
    tone: "from-amber-400 via-orange-500 to-red-600",
    rotation: "-rotate-12",
  },
  {
    title: "MATRIX",
    subtitle: "Action reboot",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/d/db/The_Matrix.png/250px-The_Matrix.png",
    tone: "from-emerald-400 via-teal-500 to-slate-900",
    rotation: "rotate-6",
  },
  {
    title: "MAD MAX",
    subtitle: "Road chaos",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/5/5a/MadMazAus.jpg/250px-MadMazAus.jpg",
    tone: "from-yellow-300 via-orange-500 to-rose-600",
    rotation: "-rotate-3",
  },
  {
    title: "SCARFACE",
    subtitle: "Crime classic",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/7/71/Scarface_-_1983_film.jpg/250px-Scarface_-_1983_film.jpg",
    tone: "from-stone-300 via-stone-500 to-zinc-900",
    rotation: "rotate-8",
  },
  {
    title: "NOIR",
    subtitle: "Midnight drama",
    image:
      "https://upload.wikimedia.org/wikipedia/en/thumb/9/9f/Blade_Runner_%281982_poster%29.png/250px-Blade_Runner_%281982_poster%29.png",
    tone: "from-fuchsia-500 via-slate-800 to-black",
    rotation: "-rotate-6",
  },
  {
    title: "THRONE",
    subtitle: "Epic saga",
    image:
      "https://upload.wikimedia.org/wikipedia/en/3/38/Chinatownposter1.jpg",
    tone: "from-sky-400 via-indigo-500 to-slate-950",
    rotation: "rotate-12",
  },
];

const AuthShell = ({ children, onClose }) => {
  const { t } = useLanguage();
  const [movieCards, setMovieCards] = useState(posterCards);
  const dialogRef = useRef(null);
  const onCloseRef = useRef(onClose);

  useEffect(() => {
    onCloseRef.current = onClose;
  }, [onClose]);

  useEffect(() => {
    const previousOverflow = document.body.style.overflow;
    const opener = document.activeElement;
    document.body.style.overflow = "hidden";

    const getFocusableElements = () =>
      dialogRef.current?.querySelectorAll(
        'a[href], button:not([disabled]), input:not([disabled]), select:not([disabled]), textarea:not([disabled]), [tabindex]:not([tabindex="-1"])',
      ) || [];

    const firstInput = dialogRef.current?.querySelector(
      "input:not([disabled])",
    );
    (firstInput || getFocusableElements()[0])?.focus();

    const handleDialogKeyDown = (event) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onCloseRef.current?.();
        return;
      }

      if (event.key !== "Tab") return;

      const focusable = getFocusableElements();
      if (focusable.length === 0) {
        event.preventDefault();
        return;
      }

      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };
    document.addEventListener("keydown", handleDialogKeyDown);

    return () => {
      document.removeEventListener("keydown", handleDialogKeyDown);
      document.body.style.overflow = previousOverflow;
      if (opener instanceof HTMLElement && opener.isConnected) opener.focus();
    };
  }, []);

  useEffect(() => {
    let cancelled = false;

    const loadNewReleasePosters = async () => {
      try {
        const [nowPlaying, trending, upcoming] = await Promise.allSettled([
          tmdbService.getNowPlayingMovies(),
          tmdbService.getTrendingMovies(),
          tmdbService.getUpcomingMovies(),
        ]);

        const nowPlayingResults =
          nowPlaying.status === "fulfilled" ? nowPlaying.value : [];
        const trendingResults =
          trending.status === "fulfilled" ? trending.value : [];
        const upcomingResults =
          upcoming.status === "fulfilled" ? upcoming.value : [];
        const mergedResults = [
          ...nowPlayingResults,
          ...trendingResults,
          ...upcomingResults,
        ];
        const uniqueMovies = mergedResults
          .filter((movie) => movie?.poster_path || movie?.backdrop_path)
          .filter(
            (movie, index, array) =>
              array.findIndex((item) => item.id === movie.id) === index,
          )
          .sort((left, right) => {
            const leftDate = new Date(
              left.release_date || left.first_air_date || 0,
            ).getTime();
            const rightDate = new Date(
              right.release_date || right.first_air_date || 0,
            ).getTime();
            const leftPopularity = left.popularity || 0;
            const rightPopularity = right.popularity || 0;

            return rightDate - leftDate || rightPopularity - leftPopularity;
          })
          .slice(0, 6)
          .map((movie, index) => {
            const formatted = tmdbService.formatMovieData(movie);

            return {
              title: formatted.title || "New Release",
              subtitle:
                formatted.subtitle ||
                (movie.release_date ? "New Release" : "Trending Now"),
              image: formatted.backdropImage || formatted.posterImage,
              imagePosition:
                movie.backdrop_path && index < 2
                  ? "center top"
                  : movie.poster_path
                    ? "center 15%"
                    : "center center",
              tone: "from-slate-900 to-slate-700",
              rotation: "rotate-0",
            };
          });

        if (!cancelled && uniqueMovies.length > 0) {
          setMovieCards(uniqueMovies);
        }
      } catch {
        if (!cancelled) {
          setMovieCards(posterCards);
        }
      }
    };

    loadNewReleasePosters();
    const refreshId = window.setInterval(loadNewReleasePosters, 10 * 60 * 1000);

    return () => {
      cancelled = true;
      window.clearInterval(refreshId);
    };
  }, []);

  return (
    <div
      className="animate-auth-backdrop fixed inset-0 z-[300] overflow-y-auto bg-transparent px-4 py-6 backdrop-blur-xl sm:px-6 sm:py-8"
      onClick={onClose}
      role="presentation"
    >
      <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top,rgba(168,85,247,0.05),transparent_40%)]" />
      <div className="mx-auto flex min-h-[calc(100svh-3rem)] w-full max-w-[840px] items-center">
        <div
          ref={dialogRef}
          className="animate-auth-modal relative grid w-full overflow-hidden rounded-[24px] border border-white/10 bg-[#2c2c2c] shadow-[0_18px_40px_rgba(0,0,0,0.35)] md:grid-cols-[1.08fr_0.92fr]"
          onClick={(event) => event.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-labelledby="auth-modal-title"
        >
          <button
            type="button"
            onClick={onClose}
            className="absolute right-4 top-4 z-10 grid h-10 w-10 place-items-center rounded-full border border-white/10 bg-black/35 text-white/80 backdrop-blur transition hover:border-purple-500/40 hover:bg-purple-500/20 hover:text-white"
            aria-label={t("Close auth popup")}
          >
            <XMarkIcon className="h-5 w-5" />
          </button>

          <section className="relative hidden overflow-hidden p-2 md:block md:min-h-[30rem]">
            <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(0,0,0,0.22))]" />
            <div className="grid h-full grid-cols-2 grid-rows-3 gap-2">
              {movieCards.map((poster, index) => (
                <article
                  key={poster.title}
                  className={`group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0f1014] ${poster.rotation} shadow-[0_16px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] ${
                    index === 0 ? "col-span-1 row-span-2" : ""
                  } ${index === 1 ? "mt-2" : ""} ${index === 2 ? "mt-8" : ""} ${
                    index === 3 ? "-mt-1" : ""
                  } ${index === 4 ? "col-span-1" : ""} ${index === 5 ? "col-span-2" : ""} ${
                    index === 0 ? "rounded-bl-[3.5rem]" : ""
                  } ${index === 5 ? "rounded-br-[3.5rem]" : ""}`}
                >
                  {poster.image ? (
                    <img
                      src={poster.image}
                      alt={poster.title}
                      className="absolute inset-0 h-full w-full object-cover scale-[1.12] transition duration-500 group-hover:scale-[1.18]"
                      loading={index === 0 ? "eager" : "lazy"}
                      decoding="async"
                      style={{
                        objectPosition: poster.imagePosition || "center center",
                      }}
                    />
                  ) : (
                    <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.3))]" />
                  )}
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.62))]" />
                  <div className="absolute inset-x-0 top-0 h-[4.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent)] opacity-75" />
                  <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.82))]" />
                  <div className="absolute bottom-0 left-0 right-0 p-3 text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)]">
                    <p className="text-[8px] font-black uppercase tracking-[0.26em] text-white/70">
                      {poster.subtitle}
                    </p>
                    <h2 className="mt-1.5 text-xl font-black uppercase tracking-[-0.05em] sm:text-2xl">
                      {poster.title}
                    </h2>
                  </div>
                </article>
              ))}
            </div>

            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(44,44,44,0.95))]" />
            <div className="absolute left-4 top-4 rounded-full border border-purple-500/30 bg-black/40 px-3 py-1.5 text-[10px] font-black uppercase tracking-[0.35em] text-purple-300 backdrop-blur">
              CineMax
            </div>
          </section>

          <section className="flex items-center bg-[#23212b] px-5 pb-7 pt-16 sm:px-8 sm:pb-8 sm:pt-16 lg:px-10 lg:py-10">
            <div className="w-full">
              <div id="auth-modal-title" className="w-full">
                {children}
              </div>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default AuthShell;
