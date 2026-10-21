import React, { memo } from "react";
import SkeletonCard from "../../../components/ui/SkeletonCard";

// ─── MovieDetailSkeleton: detail loading placeholder ──────────────────────────

const MovieDetailSkeleton = () => {
  return (
    <div
      className="min-h-screen overflow-x-hidden bg-slate-950"
      aria-busy="true"
    >
      <div className="absolute inset-0 h-[50vh] w-full sm:h-[70vh]">
        <div className="h-full w-full bg-slate-900 skeleton-shimmer opacity-40" />
        <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/80 to-transparent" />
        <div className="absolute inset-0 bg-linear-to-r from-slate-950 via-transparent to-transparent" />
      </div>

      <div className="relative z-10 px-4 pb-16 pt-24 sm:px-12 sm:pb-20 sm:pt-32 lg:px-24 xl:px-40">
        <span className="mb-6 block h-10 w-32 rounded-xl border border-white/5 bg-white/5 skeleton-shimmer sm:mb-8" />

        <div className="grid gap-8 lg:grid-cols-[minmax(0,20rem)_minmax(0,1fr)] lg:items-start xl:grid-cols-[minmax(0,22rem)_minmax(0,1fr)]">
          <div className="mx-auto w-full max-w-[22rem] lg:mx-0">
            <SkeletonCard />
          </div>

          <div className="space-y-6">
            <div className="space-y-3">
              <span className="block h-10 w-4/5 rounded-2xl bg-slate-200/10 skeleton-shimmer sm:h-14" />
              <span className="block h-6 w-2/3 rounded-2xl bg-slate-200/10 skeleton-shimmer sm:h-8" />
            </div>

            <div className="flex flex-wrap gap-3">
              <span className="h-7 w-24 rounded-xl bg-slate-200/10 skeleton-shimmer" />
              <span className="h-7 w-20 rounded-xl bg-slate-200/10 skeleton-shimmer" />
              <span className="h-7 w-28 rounded-xl bg-slate-200/10 skeleton-shimmer" />
            </div>

            <div className="space-y-3">
              <span className="block h-4 w-full rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
              <span className="block h-4 w-[94%] rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
              <span className="block h-4 w-[86%] rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
              <span className="block h-4 w-[68%] rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
            </div>

            <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
              <span className="block h-14 rounded-2xl bg-slate-200/10 skeleton-shimmer" />
              <span className="block h-14 rounded-2xl bg-slate-200/10 skeleton-shimmer" />
              <span className="block h-14 rounded-2xl bg-slate-200/10 skeleton-shimmer" />
              <span className="block h-14 rounded-2xl bg-slate-200/10 skeleton-shimmer" />
            </div>

            <div className="space-y-3 rounded-3xl border border-white/10 bg-white/3 p-5">
              <span className="block h-6 w-40 rounded-xl bg-slate-200/10 skeleton-shimmer" />
              <span className="block h-4 w-full rounded-full bg-slate-200/10 skeleton-shimmer" />
              <span className="block h-4 w-[90%] rounded-full bg-slate-200/10 skeleton-shimmer" />
              <span className="block h-4 w-[72%] rounded-full bg-slate-200/10 skeleton-shimmer" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default memo(MovieDetailSkeleton);
