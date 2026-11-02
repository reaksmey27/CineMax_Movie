import React from "react";

// ─── PageLoader: spinner with loading label ───────────────────────────────────

const PageLoader = ({
  color = "border-purple-600",
  label = "Loading...",
  glow = "",
}) => {
  return (
    <div className="flex min-h-[20rem] flex-col items-center justify-center gap-4 sm:min-h-[25rem]">
      <div
        className={`h-12 w-12 rounded-full border-4 ${color} border-t-transparent animate-spin ${glow}`}
      />
      <span className="px-4 text-center text-[10px] font-black uppercase tracking-widest text-gray-500">
        {label}
      </span>
    </div>
  );
};

export default PageLoader;
