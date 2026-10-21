const buildUrl = (baseUrl, params = {}) => {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

  return searchParams.size ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
};

// ─── Constants: player servers, timeout & blocked ads ─────────────────────────

export const SERVERS = [
  {
    name: "Server 1",
    qualityLabel: "Primary",
    description: "Fastest default source",
    url: (id) =>
      buildUrl(`https://vidsrc.pm/embed/movie/${id}`, {
        autoplay: "1",
      }),
  },
  {
    name: "Server 2",
    qualityLabel: "Fallback",
    description: "Try this if playback is slow",
    url: (id) =>
      buildUrl(`https://vidsrc.xyz/embed/movie/${id}`, {
        autoplay: "1",
      }),
  },
  {
    name: "Server 3",
    qualityLabel: "Fallback",
    description: "Useful when other servers fail",
    url: (id) =>
      buildUrl(`https://vidsrc-embed.ru/embed/movie/${id}`, {
        autoplay: "1",
      }),
  },
  {
    name: "Server 4",
    qualityLabel: "Legacy",
    description: "Older source with broad compatibility",
    url: (id) =>
      buildUrl("https://vidsrc.me/embed/movie", {
        tmdb: id,
        autoplay: "1",
      }),
  },
];
