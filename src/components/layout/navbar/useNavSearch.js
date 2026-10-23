import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { tmdbService } from "../../../services/tmdbService";

export default function useNavSearch() {
  const navigate = useNavigate();
  const rootRef = useRef(null);
  const inputRef = useRef(null);
  const toggleRef = useRef(null);
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [response, setResponse] = useState({
    query: "",
    results: [],
    error: false,
  });
  const [activeIndex, setActiveIndex] = useState(-1);
  const [attempt, setAttempt] = useState(0);
  const trimmed = query.trim();
  const loading = response.query !== trimmed;
  const results = loading ? [] : response.results;
  const showResults = open && trimmed.length >= 2;

  // ─── Effects: debounced TMDB search & dismiss ─────────────────────────────────

  useEffect(() => {
    if (!open || trimmed.length < 2) return;
    let cancelled = false;
    const timer = window.setTimeout(async () => {
      try {
        const data = await tmdbService.searchMovies(trimmed, 1);
        if (!cancelled)
          setResponse({
            query: trimmed,
            results: (data?.results || []).slice(0, 6),
            error: false,
          });
      } catch {
        if (!cancelled)
          setResponse({ query: trimmed, results: [], error: true });
      }
    }, 300);

    return () => {
      cancelled = true;
      window.clearTimeout(timer);
    };
  }, [open, trimmed, attempt]);

  useEffect(() => {
    if (!open) return;
    const dismiss = (event) => {
      if (!rootRef.current?.contains(event.target)) setOpen(false);
    };
    document.addEventListener("pointerdown", dismiss);
    return () => document.removeEventListener("pointerdown", dismiss);
  }, [open]);

  // ─── Helpers: jump to selected movie ──────────────────────────────────────────

  const selectMovie = (movie) => {
    setOpen(false);
    setActiveIndex(-1);
    inputRef.current?.blur();
    navigate(`/movie/${movie.id}`);
  };

  const retry = () => {
    setResponse({ query: "", results: [], error: false });
    setActiveIndex(-1);
    setAttempt((value) => value + 1);
    inputRef.current?.focus();
  };

  // ─── Render: search input & results dropdown ──────────────────────────────────

  return {
    rootRef,
    inputRef,
    toggleRef,
    open,
    setOpen,
    query,
    setQuery,
    response,
    activeIndex,
    setActiveIndex,
    trimmed,
    loading,
    results,
    showResults,
    selectMovie,
    retry,
    navigate,
  };
}
