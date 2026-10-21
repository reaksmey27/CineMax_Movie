/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { LANGUAGES, translate } from "../i18n/translations";

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
  const [language, setLanguage] = useState(getInitialLanguage);

  useEffect(() => {
    document.documentElement.lang = language;
    try {
      localStorage.setItem(STORAGE_KEY, language);
    } catch (error) {
      console.warn("[language] Could not save language preference", error);
    }
  }, [language]);

  const value = useMemo(
    () => ({
      language,
      setLanguage,
      languages: LANGUAGES,
      t: (key, values) => translate(language, key, values),
    }),
    [language],
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
