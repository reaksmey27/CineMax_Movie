/* eslint-disable react-refresh/only-export-components */
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import { LANGUAGES, loadLocale, translate } from "../i18n/translations";

// ─── Constants: storage key & default language ────────────────────────────────

const STORAGE_KEY = "cinemax_language";
const DEFAULT_LANGUAGE = "en";
const LanguageContext = createContext(null);

// ─── Helpers: resolve saved language safely ───────────────────────────────────

const getInitialLanguage = () => {
  try {
    const storedLanguage = localStorage.getItem(STORAGE_KEY);
    if (storedLanguage === "zh-CN") return "zh-TW";
    return LANGUAGES.some(({ code }) => code === storedLanguage)
      ? storedLanguage
      : DEFAULT_LANGUAGE;
  } catch {
    return DEFAULT_LANGUAGE;
  }
};

// ─── LanguageProvider: language state & translate ─────────────────────────────

export const LanguageProvider = ({ children }) => {
  const [request, setRequest] = useState(() => ({
    code: getInitialLanguage(),
  }));
  const [resolved, setResolved] = useState({
    language: DEFAULT_LANGUAGE,
    messages: {},
    request: null,
    error: false,
  });
  const { language, messages } = resolved;
  const languageLoading = resolved.request !== request;
  const languageError = !languageLoading && resolved.error;
  const setLanguage = useCallback((code) => {
    if (LANGUAGES.some((item) => item.code === code)) setRequest({ code });
  }, []);
  const retryLanguage = useCallback(
    () => setRequest((previous) => ({ code: previous.code })),
    [],
  );

  useEffect(() => {
    let ignore = false;
    loadLocale(request.code)
      .then((loadedMessages) => {
        if (ignore) return;
        setResolved({
          language: request.code,
          messages: loadedMessages,
          request,
          error: false,
        });
        try {
          localStorage.setItem(STORAGE_KEY, request.code);
        } catch (error) {
          console.warn("[language] Could not save language preference", error);
        }
      })
      .catch(() => {
        if (!ignore)
          setResolved((previous) => ({ ...previous, request, error: true }));
      });
    return () => {
      ignore = true;
    };
  }, [request]);

  useEffect(() => {
    document.documentElement.lang = language;
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languageLoading,
      languageError,
      retryLanguage,
      languages: LANGUAGES,
      t: (key, values) => translate(messages, key, values),
    }),
    [
      language,
      messages,
      setLanguage,
      languageLoading,
      languageError,
      retryLanguage,
    ],
  );

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};

// ─── useLanguage: read language context safely ────────────────────────────────

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};
