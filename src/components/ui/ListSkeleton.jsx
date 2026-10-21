import { memo } from "react";

// ─── ListSkeleton: shimmering list rows ───────────────────────────────────────

const ListSkeleton = ({ count = 4, compact = false, className = "" }) => (
  <div aria-hidden="true" className={`space-y-2 ${className}`}>
    {Array.from({ length: count }, (_, index) => (
      <div
        key={index}
        className={`flex items-center gap-3 rounded-xl ${compact ? "p-2" : "p-4"}`}
      >
        <div
          className={`shrink-0 animate-pulse rounded-lg bg-white/10 ${
            compact ? "h-14 w-10" : "h-10 w-10"
          }`}
        />
        <div className="min-w-0 flex-1 space-y-2">
          <div className="h-3 w-2/3 animate-pulse rounded-full bg-white/10" />
          <div className="h-3 w-1/3 animate-pulse rounded-full bg-white/5" />
        </div>
      </div>
    ))}
  </div>
);

export default memo(ListSkeleton);
