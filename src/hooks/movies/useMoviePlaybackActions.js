import { useLocation, useNavigate } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import { useWatchHistory } from "../../context/WatchHistoryContext";
import { useLanguage } from "../../context/LanguageContext";
import { SERVERS } from "../../config/playerServers";

export default function useMoviePlaybackActions(
  id,
  { isPlaying, setIsPlaying, setActiveServer },
) {
  const navigate = useNavigate();
  const location = useLocation();
  const { t } = useLanguage();
  const { isAuthenticated, loading: authLoading } = useAuth();
  const {
    history,
    loading: historyLoading,
    error: historyError,
    retry,
  } = useWatchHistory();
  const saved = history.find(
    (item) => item.id === Number(id) && !item.completed,
  );

  const play = () => {
    if (authLoading || historyLoading || historyError) return;
    if (!isAuthenticated) {
      navigate("/login", {
        state: { backgroundLocation: location, returnTo: `/movie/${id}` },
      });
      return;
    }
    // Resume the movie's saved server without overwriting the user's preference.
    if (saved && SERVERS.some((server) => server.name === saved.server))
      setActiveServer(saved.server);
    setIsPlaying(true);
  };

  return {
    isAuthenticated,
    historyError,
    retryHistory: retry,
    goBack: () => (isPlaying ? setIsPlaying(false) : navigate(-1)),
    infoProps: {
      progress: saved,
      playLabel: authLoading
        ? t("Checking login...")
        : isAuthenticated
          ? saved
            ? t("Continue watching")
            : t("Play Movie")
          : t("Log in to Watch"),
      playDisabled:
        authLoading || (isAuthenticated && (historyLoading || historyError)),
      onPlay: play,
    },
  };
}
