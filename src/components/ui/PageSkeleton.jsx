import { memo } from "react";
import SkeletonCard from "./SkeletonCard";

// ─── PageSkeleton: generic page loading placeholder ───────────────────────────

const PageSkeleton = () => (
  <div
    aria-hidden="true"
    className="mx-auto max-w-[1400px] px-4 pb-16 pt-28 sm:px-6 sm:pt-36 lg:px-24"
  >
    <div className="h-9 w-56 max-w-full animate-pulse rounded-full bg-white/10" />
    <div className="mt-4 h-4 w-80 max-w-full animate-pulse rounded-full bg-white/5" />
    <div className="mt-10 grid grid-cols-2 gap-x-3 gap-y-5 sm:grid-cols-3 lg:grid-cols-4">
      {Array.from({ length: 8 }, (_, index) => (
        <SkeletonCard key={index} />
      ))}
    </div>
  </div>
);

export default memo(PageSkeleton);
