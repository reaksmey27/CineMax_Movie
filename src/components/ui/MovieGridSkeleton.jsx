import React, { memo } from "react";
import SkeletonCard from "./SkeletonCard";

const MovieGridSkeleton = ({ count = 12 }) => {
  return (
    <div
      aria-hidden="true"
      className="grid grid-cols-2 gap-x-3 gap-y-5 sm:gap-x-5 sm:gap-y-8 sm:grid-cols-3 lg:grid-cols-4 2xl:grid-cols-5 lg:gap-x-6 lg:gap-y-10"
    >
      {Array.from({ length: count }, (_, index) => (
        <div
          key={index}
          className="min-w-0 animate-in fade-in slide-in-from-bottom-4 duration-500"
          style={{ animationDelay: `${index * 40}ms` }}
        >
          <SkeletonCard />
        </div>
      ))}
    </div>
  );
};

export default memo(MovieGridSkeleton);
