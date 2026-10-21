import { useEffect, useState } from "react";

const TrailerFrame = ({ src, title, className }) => {
  const [frameLoading, setFrameLoading] = useState(true);

  useEffect(() => {
    if (!frameLoading) return undefined;
    const timer = window.setTimeout(() => setFrameLoading(false), 4000);
    return () => window.clearTimeout(timer);
  }, [frameLoading]);

  return (
    <div className="relative">
      <iframe
        className={className}
        src={src}
        title={title}
        allow="autoplay; encrypted-media; gyroscope; picture-in-picture; web-share"
        allowFullScreen
        onLoad={() => setFrameLoading(false)}
      />
      {frameLoading && (
        <div
          aria-hidden="true"
          className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/85"
        >
          <div className="h-4 w-1/2 max-w-64 animate-pulse rounded-full bg-white/20" />
          <div className="h-3 w-1/3 max-w-40 animate-pulse rounded-full bg-white/10" />
        </div>
      )}
    </div>
  );
};

export default TrailerFrame;
