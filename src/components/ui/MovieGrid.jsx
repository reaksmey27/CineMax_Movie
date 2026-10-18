import React, { memo } from "react";
import { useLanguage } from "../../context/LanguageContext";
import MovieCard from "./MovieCard";

const MovieGrid = ({
  movies,
  onReset,
  resetLabel = "Reset Results",
  emptyTitle = "No Movies Found",
  emptyMessage = "Try adjusting your search or filters to explore more titles.",
}) => {
  const { t } = useLanguage();
  if (movies.length === 0) {
    return (
      <div className="flex min-h-[18rem] flex-col items-center justify-center px-4 text-center sm:min-h-[25rem]">
        <h3 className="mb-2 text-2xl font-black uppercase italic tracking-tighter text-white">
          {t(emptyTitle)}
        </h3>
        <p className="max-w-sm text-gray-500 font-medium">{t(emptyMessage)}</p>
        {onReset && (
          <button
            onClick={onReset}
            className="mt-6 w-full rounded-xl bg-purple-600 px-6 py-3 font-bold text-white shadow-xl shadow-purple-600/20 transition-all hover:bg-purple-500 sm:w-auto sm:px-8"
          >
            {t(resetLabel)}
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 lg:gap-x-6 lg:gap-y-10">
      {movies.map((movie, index) => (
        <div
          key={movie.id}
          className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 50}ms` }}
        >
          <MovieCard movie={movie} />
        </div>
      ))}
    </div>
  );
};

export default memo(MovieGrid);
