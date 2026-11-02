import React, { memo } from "react";

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

      <div className="relative z-10 mx-auto max-w-[1600px] px-4 pb-16 pt-24 sm:px-12 sm:pb-20 sm:pt-32 lg:px-24 xl:px-40">
        <span className="mb-6 block h-8.5 w-32 rounded-xl border border-white/5 bg-white/5 skeleton-shimmer sm:mb-8 sm:h-9.5" />

        <div className="flex flex-col gap-8 sm:gap-12 lg:flex-row lg:gap-8 xl:gap-12">
          <div className="mx-auto w-full max-w-sm shrink-0 lg:mx-0 lg:w-72 lg:max-w-none xl:w-80">
            <div
              data-testid="detail-poster-skeleton"
              className="aspect-[2/3] w-full rounded-2xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] skeleton-shimmer sm:rounded-4xl"
            />
          </div>

          <div className="min-w-0 flex-1 space-y-6 sm:space-y-8">
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
