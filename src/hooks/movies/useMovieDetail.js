import { useEffect, useState } from "react";
import { tmdbService } from "../../services/tmdbService";
import { useAuth } from "../../context/AuthContext";

// ─── Helpers: build embed URLs with params ────────────────────────────────────

const buildUrl = (baseUrl, params = {}) => {
  const searchParams = new URLSearchParams(
    Object.entries(params).filter(
      ([, value]) => value !== undefined && value !== null,
    ),
  );

  return searchParams.size ? `${baseUrl}?${searchParams.toString()}` : baseUrl;
};

// ─── Constants: player servers, timeout & blocked ads ─────────────────────────

const SERVERS = [
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

const PLAYER_TIMEOUT_MS = 12000;

// Block bad popup/redirect ads from iframe
const BAD_URL_KEYWORDS = [
  "porn",
  "xxx",
  "adult",
  "sex",
  "nude",
  "naked",
  "onlyfans",
  "cam4",
  "chaturbate",
  "xvideos",
  "xhamster",
  "redtube",
  "brazzers",
  "escort",
  "dating18",
  "hookup",
  "nsfw",
  "casino",
  "poker",
  "betting",
  "slots",
  "gambling",
  "wager",
  "popads",
  "popcash",
  "trafficjunky",
  "exoclick",
  "juicyads",
  "adsterra",
  "hilltopads",
  "propellerads",
  "clickadu",
  "adcash",
  "proceedflow",
  "go.php",
  "click.php",
  "redirect.php",
  "track.php",
  "adf.ly",
  "shorte.st",
];

// ─── Guards: block ad popups & focus theft ────────────────────────────────────

const isBadUrl = (url) => {
  try {
    const lower = url.toLowerCase();
    return BAD_URL_KEYWORDS.some((kw) => lower.includes(kw));
  } catch {
    return false;
  }
};

const patchWindowOpen = () => {
  if (window.__adBlockPatched) return;
  window.__adBlockPatched = true;
  const _open = window.open.bind(window);
  window.open = (url = "", ...args) => {
    if (!url || isBadUrl(String(url))) {
      console.warn("[AdBlock] Blocked popup:", url);
      return null;
    }
    return _open(url, ...args);
  };
};

const blockFocusRedirect = () => {
  const handler = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName === "IFRAME") return;
      window.focus();
    }, 50);
  };
  window.addEventListener("blur", handler);
  return () => window.removeEventListener("blur", handler);
};

// Patch immediately on module load
patchWindowOpen();

// ─── useMovieDetail: movie data & player state ────────────────────────────────

const useMovieDetail = (id) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [movie, setMovie] = useState(null);
  const [loading, setLoading] = useState(true);

  const [showTrailer, setShowTrailer] = useState(false);
  const [playRequested, setIsPlaying] = useState(false);
  const isPlaying = playRequested && isAuthenticated && !authLoading;
  const [activeServer, setActiveServer] = useState(SERVERS[0].name);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [playerMessage, setPlayerMessage] = useState("");
  const [playerInstance, setPlayerInstance] = useState(0);

  // ─── Effects: fetch movie & drive player ──────────────────────────────────────

  useEffect(() => {
    if (!isAuthenticated) setIsPlaying(false);
  }, [isAuthenticated]);

  useEffect(() => {
    let ignore = false;

    const fetchDetails = async () => {
      setLoading(true);
      try {
        const data = await tmdbService.getMovieDetails(id);
        if (!ignore && data) {
          setMovie(tmdbService.formatMovieData(data));
        }
      } catch (error) {
        if (!ignore) {
          console.error("Error fetching movie details:", error);
        }
      } finally {
        if (!ignore) {
          setLoading(false);
        }
      }
    };

    fetchDetails();
    return () => {
      ignore = true;
    };
  }, [id]);

  useEffect(() => {
    setIsPlaying(false);
    setShowTrailer(false);
    setActiveServer(SERVERS[0].name);
    setIframeLoading(false);
    setPlayerMessage("");
    setPlayerInstance(0);
  }, [id]);

  useEffect(() => {
    if (!isPlaying) {
      setIframeLoading(false);
      return;
    }
    setIframeLoading(true);
    setPlayerMessage("");
  }, [isPlaying, activeServer, id, playerInstance]);

  useEffect(() => {
    if (!isPlaying || !iframeLoading) return;

    const timeoutId = setTimeout(() => {
      setIframeLoading(false);
      setPlayerMessage(
        "This source is taking too long to respond. Try reloading or switch servers.",
      );
    }, PLAYER_TIMEOUT_MS);

    return () => clearTimeout(timeoutId);
  }, [isPlaying, iframeLoading]);

  // Activate blur blocker only while player is open
  useEffect(() => {
    if (!isPlaying) return;
    const cleanup = blockFocusRedirect();
    return cleanup;
  }, [isPlaying]);

  // ─── Derived & Handlers: server & iframe control ──────────────────────────────

  const activeServerIndex = SERVERS.findIndex((s) => s.name === activeServer);
  const currentServer = SERVERS[activeServerIndex] || SERVERS[0];
  const currentServerUrl = movie ? currentServer.url(movie.id) : "";
  const nextServer = SERVERS[(activeServerIndex + 1) % SERVERS.length];

  const goToNextServer = () => setActiveServer(nextServer.name);

  const reloadPlayer = () => {
    setPlayerMessage("");
    setPlayerInstance((value) => value + 1);
  };

  const handleIframeLoad = () => setIframeLoading(false);

  const handleIframeError = () => {
    setIframeLoading(false);
    setPlayerMessage(
      "This source could not be loaded. Switch to another server.",
    );
  };

  // ─── Return: player API for the page ──────────────────────────────────────────

  return {
    movie,
    loading,
    SERVERS,
    showTrailer,
    setShowTrailer,
    isPlaying,
    setIsPlaying,
    activeServer,
    setActiveServer,
    currentServer,
    iframeLoading,
    playerMessage,
    currentServerUrl,
    playerInstance,
    nextServerName: nextServer.name,
    goToNextServer,
    reloadPlayer,
    handleIframeLoad,
    handleIframeError,
  };
};

export default useMovieDetail;
