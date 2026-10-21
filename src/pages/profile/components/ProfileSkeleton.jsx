import { memo } from "react";
import MovieGridSkeleton from "../../../components/ui/MovieGridSkeleton";

// ─── ProfileSkeleton: profile page loading placeholder ────────────────────────

const ProfileSkeleton = () => (
  <div
    aria-hidden="true"
    className="min-h-screen bg-[var(--color-bg)] px-4 pb-20 pt-28 sm:px-8 sm:pt-40 lg:px-12"
  >
    <div className="mx-auto max-w-6xl space-y-8">
      <div className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] p-6 sm:p-8 lg:flex lg:items-center lg:justify-between lg:gap-5">
        <div className="flex items-center gap-4">
          <div className="h-16 w-16 shrink-0 animate-pulse rounded-full bg-white/10 sm:h-20 sm:w-20" />
          <div className="min-w-0 space-y-3">
            <div className="h-7 w-40 max-w-full animate-pulse rounded-full bg-white/10" />
            <div className="h-4 w-52 max-w-full animate-pulse rounded-full bg-white/5" />
          </div>
        </div>
        <div className="mt-5 flex gap-3 lg:mt-0">
          <div className="h-11 w-32 animate-pulse rounded-xl bg-white/10" />
          <div className="h-11 w-28 animate-pulse rounded-xl bg-white/5" />
        </div>
      </div>

      <MovieGridSkeleton count={8} />
    </div>
  </div>
);

export default memo(ProfileSkeleton);
