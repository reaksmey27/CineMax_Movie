import { memo } from "react";

// ─── SkeletonCard: shimmering poster placeholder ──────────────────────────────

const SkeletonCard = ({ className = "" }) => (
  <div
    aria-hidden="true"
    className={`w-full shrink-0 rounded-2xl border border-[var(--color-border)] bg-[var(--color-surface-1)] ${className}`}
  >
    <div className="relative aspect-[2/3] overflow-hidden rounded-t-2xl bg-[var(--color-bg-elevated)]">
      <div className="absolute inset-0 skeleton-shimmer opacity-60" />
    </div>
    <div className="space-y-2 p-2.5 sm:p-3">
      <div className="min-h-10 space-y-2 sm:min-h-12">
        <div className="h-4 w-5/6 rounded bg-[var(--color-surface-3)] skeleton-shimmer" />
        <div className="h-4 w-3/5 rounded bg-[var(--color-surface-2)] skeleton-shimmer" />
      </div>
      <div className="flex items-center justify-between">
        <div className="h-4 w-10 rounded bg-[var(--color-surface-2)] skeleton-shimmer sm:h-5" />
        <div className="h-4 w-12 rounded bg-[var(--color-surface-2)] skeleton-shimmer sm:h-5" />
      </div>
    </div>
  </div>
);

export default memo(SkeletonCard);
