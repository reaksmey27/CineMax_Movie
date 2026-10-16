import React, { memo } from "react";
import HeroSkeleton from "./HeroSkeleton";
import MovieSliderSkeleton from "../../../components/ui/MovieSliderSkeleton";

const HomePageSkeleton = () => {
  return (
    <main id="home" className="min-h-screen bg-slate-950" aria-busy="true">
      <HeroSkeleton />

      <div className="relative z-30 mt-8 space-y-10 pb-14 sm:mt-16 sm:space-y-14 sm:pb-20">
        <MovieSliderSkeleton />
        <MovieSliderSkeleton />
        <MovieSliderSkeleton />
        <MovieSliderSkeleton />
      </div>

      <section className="border-t border-white/5 bg-slate-950 px-4 py-16 sm:px-6 sm:py-20 lg:px-24 xl:px-40">
        <div className="mx-auto max-w-7xl space-y-6">
          <span className="block h-4 w-52 rounded-full bg-slate-200/10 skeleton-shimmer" />
          <span className="block h-10 w-full max-w-3xl rounded-2xl bg-slate-200/10 skeleton-shimmer sm:h-14" />
          <span className="block h-4 w-full rounded-full bg-slate-200/10 skeleton-shimmer" />
          <span className="block h-4 w-[92%] rounded-full bg-slate-200/10 skeleton-shimmer" />
          <span className="block h-4 w-[78%] rounded-full bg-slate-200/10 skeleton-shimmer" />

          <div className="grid gap-4 lg:grid-cols-3">
            <span className="block min-h-52 rounded-3xl bg-slate-200/10 skeleton-shimmer" />
            <span className="block min-h-52 rounded-3xl bg-slate-200/10 skeleton-shimmer" />
            <span className="block min-h-52 rounded-3xl bg-slate-200/10 skeleton-shimmer" />
          </div>
        </div>
      </section>
    </main>
  );
};

export default memo(HomePageSkeleton);
