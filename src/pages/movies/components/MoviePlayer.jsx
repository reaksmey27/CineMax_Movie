import React from "react";

const resolveValue = (value, movie) => {
  if (typeof value === "function") {
    return value(movie);
  }

  return value || "";
};

const resolveTracks = (value, movie) => {
  const tracks = typeof value === "function" ? value(movie) : value;
  return Array.isArray(tracks) ? tracks : [];
};

const MoviePlayer = ({
  movie,
  SERVERS,
  activeServer,
  currentServer,
  currentServerUrl,
  iframeLoading,
  playerMessage,
  playerInstance,
  nextServerName,
  onServerChange,
  onIframeLoad,
  onIframeError,
  onNextServer,
  onReloadPlayer,
}) => {
  const movieVideoUrl = resolveValue(movie?.videoUrl, movie);
  const serverVideoUrl = resolveValue(currentServer?.videoUrl, movie);
  const activeVideoUrl = serverVideoUrl || movieVideoUrl;
  const subtitleTracks = [
    ...resolveTracks(movie?.subtitleTracks, movie),
    ...resolveTracks(currentServer?.subtitleTracks, movie),
  ];
  const hasDirectVideo = Boolean(activeVideoUrl);

  return (
    <div className="space-y-6">
      <div className="flex flex-nowrap sm:flex-wrap gap-3 overflow-x-auto pb-2 sm:pb-0 no-scrollbar">
        {SERVERS.map((server) => (
          <button
            key={server.name}
            onClick={() => onServerChange(server.name)}
            className={`shrink-0 px-6 py-2 rounded-full text-sm font-semibold  transition-all ${
              activeServer === server.name
                ? "bg-purple-600 text-white shadow-lg shadow-purple-600/40"
                : "bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white border border-white/5"
            }`}
          >
            {server.name}
          </button>
        ))}
      </div>

      <div className="mx-auto w-full max-w-5xl space-y-3">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 px-4 py-3">
          <div className="space-y-1">
            <p className="text-sm font-semibold text-white">
              Now playing on {activeServer}
            </p>
            <p className="text-sm font-bold text-gray-400">
              {currentServer.description}
            </p>
          </div>

          <div className="flex items-center gap-3">
            <span className="rounded-full border border-emerald-400/30 bg-emerald-400/10 px-3 py-1 text-sm font-semibold text-emerald-300">
              {currentServer.qualityLabel}
            </span>
            <button
              onClick={onReloadPlayer}
              className="rounded-full border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-white/10 active:scale-95"
            >
              Reload player
            </button>
          </div>
        </div>

        <div className="relative w-full overflow-hidden rounded-xl border border-white/10 bg-black shadow-2xl sm:rounded-3xl">
          <div className="aspect-video bg-black">
            {hasDirectVideo ? (
              <video
                key={`${activeVideoUrl}-${playerInstance}`}
                className="h-full w-full bg-black"
                controls
                autoPlay
                playsInline
                preload="metadata"
                onLoadedData={onIframeLoad}
                onError={onIframeError}
                poster={movie?.backdropImage || movie?.image || ""}
              >
                <source src={activeVideoUrl} />
                {subtitleTracks.map((track) => (
                  <track
                    key={`${track.src}-${track.lang || track.srclang || "subtitles"}`}
                    kind={track.kind || "subtitles"}
                    src={track.src}
                    srcLang={track.lang || track.srclang || "en"}
                    label={track.label || track.lang || "Subtitles"}
                    default={track.default}
                  />
                ))}
              </video>
            ) : (
              <iframe
                key={`${currentServerUrl}-${playerInstance}`}
                src={currentServerUrl}
                className="h-full w-full bg-black"
                frameBorder="0"
                scrolling="no"
                allow="autoplay; fullscreen; picture-in-picture; encrypted-media"
                allowFullScreen
                loading="eager"
                referrerPolicy="strict-origin-when-cross-origin"
                title="Cinema Player"
                onLoad={onIframeLoad}
                onError={onIframeError}
              />
            )}
          </div>
          {iframeLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/70 backdrop-blur-sm">
              <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-purple-500" />
            </div>
          )}
        </div>

        <p className="text-center text-sm font-bold text-[var(--color-text-muted)]">
          {hasDirectVideo
            ? "Use the caption button in the player controls if subtitle tracks are available."
            : "Softer streams usually look better at this size or in fullscreen than stretched edge to edge."}
        </p>

        {hasDirectVideo && subtitleTracks.length === 0 && (
          <p className="text-center text-sm font-bold text-amber-300">
            This video source does not include subtitle tracks yet.
          </p>
        )}
      </div>

      <div className="p-4 bg-purple-600/10 border border-purple-500/20 rounded-2xl flex items-center gap-3">
        <div className="h-2 w-2 bg-purple-500 rounded-full animate-pulse" />
        <p className="text-sm sm:text-sm text-purple-300 font-bold">
          Tip: Switch servers if the picture looks soft or the stream is slow.
        </p>
      </div>

      {playerMessage && (
        <div className="p-4 bg-red-500/10 border border-red-500/30 rounded-2xl flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
          <p className="text-sm text-red-300 font-bold">
            {playerMessage}
          </p>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={onReloadPlayer}
              className="px-4 py-2 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-white text-sm font-semibold active:scale-95"
            >
              Reload
            </button>
            <button
              onClick={onNextServer}
              className="px-4 py-2 rounded-lg bg-red-500 hover:bg-red-400 text-white text-sm font-semibold active:scale-95"
            >
              Try {nextServerName}
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default MoviePlayer;
