import { useEffect, useState } from "react";
import { useAuth } from "../../context/AuthContext";
import { SERVERS } from "../../config/playerServers";
import {
  patchWindowOpen,
  blockFocusRedirect,
} from "../../utils/player/adGuards";
import useMovieDetailsData from "./useMovieDetailsData";
import { readPreferredServer, savePreferredServer } from "../../utils/player/serverPreference";

const PLAYER_TIMEOUT_MS = 12000;

// Patch immediately on module load
patchWindowOpen();

// ─── useMovieDetail: movie data & player state ────────────────────────────────

const useMovieDetail = (id) => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const { movie, loading } = useMovieDetailsData(id);

  const [showTrailer, setShowTrailer] = useState(false);
  const [playRequested, setIsPlaying] = useState(false);
  const isPlaying = playRequested && isAuthenticated && !authLoading;
  const [activeServer, setActiveServer] = useState(readPreferredServer);
  const [iframeLoading, setIframeLoading] = useState(false);
  const [playerMessage, setPlayerMessage] = useState("");
  const [playerInstance, setPlayerInstance] = useState(0);

  // ─── Effects: fetch movie & drive player ──────────────────────────────────────

  // Preserve the existing player reset timing when auth, movie, or source changes.
  /* eslint-disable react-hooks/set-state-in-effect */
  useEffect(() => {
    if (!isAuthenticated) setIsPlaying(false);
  }, [isAuthenticated]);

  useEffect(() => {
    setIsPlaying(false);
    setShowTrailer(false);
    setActiveServer(readPreferredServer());
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
  /* eslint-enable react-hooks/set-state-in-effect */

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

  const selectServer = (name) => {
    if (!SERVERS.some((server) => server.name === name)) return;
    setActiveServer(name);
    savePreferredServer(name);
  };
  const goToNextServer = () => selectServer(nextServer.name);

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
    selectServer,
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
