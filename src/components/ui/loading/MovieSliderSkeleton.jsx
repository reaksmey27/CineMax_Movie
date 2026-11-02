import React, { memo } from "react";
import SkeletonCard from "./SkeletonCard";

// ─── MovieSliderSkeleton: loading slider placeholder ──────────────────────────

const MovieSliderSkeleton = ({ count = 6 }) => {
  return (
    <section
      aria-hidden="true"
      className="relative overflow-hidden bg-transparent py-4 sm:py-10"
    >
      <div className="mb-4 px-4 sm:mb-8 sm:px-6 lg:px-24">
        <div className="flex items-center gap-3">
          <span className="block h-7 w-40 rounded-full bg-slate-200/10 skeleton-shimmer sm:h-9 sm:w-56 md:h-11 md:w-72" />
          <span className="mt-2 hidden h-0.5 w-12 rounded-full bg-slate-200/10 md:block" />
        </div>
      </div>

      <div className="no-scrollbar flex gap-3 overflow-hidden px-4 pb-6 sm:gap-5 sm:px-6 sm:pb-12 lg:px-24">
        {Array.from({ length: count }, (_, index) => (
          <div
            key={index}
            className="w-[44vw] min-w-0 max-w-44 shrink-0 min-[380px]:w-40 min-[420px]:w-44 sm:w-56 sm:min-w-56 sm:max-w-60 lg:w-60 xl:w-64 xl:max-w-64"
          >
            <SkeletonCard />
          </div>
        ))}
      </div>
    </section>
  );
};

export default memo(MovieSliderSkeleton);
