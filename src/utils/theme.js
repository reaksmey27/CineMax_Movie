// ─── Constants: theme keys & class names ──────────────────────────────────────

export const THEME_STORAGE_KEY = "cinemax-theme";
export const THEMES = {
  DARK: "dark",
  LIGHT: "light",
};

const ROOT_THEME_CLASSES = ["theme-dark", "theme-light"];

// ─── getStoredTheme: read theme from storage ──────────────────────────────────

export const getStoredTheme = () => {
  if (typeof window === "undefined") {
    return THEMES.DARK;
  }

  try {
    const storedTheme = window.localStorage.getItem(THEME_STORAGE_KEY);
    return storedTheme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  } catch {
    return THEMES.DARK;
  }
};

// ─── applyTheme: set theme class on root ──────────────────────────────────────

export const applyTheme = (theme) => {
  if (typeof document === "undefined") {
    return;
  }

  const nextTheme = theme === THEMES.LIGHT ? THEMES.LIGHT : THEMES.DARK;
  const rootElement = document.documentElement;

  rootElement.classList.remove(...ROOT_THEME_CLASSES);
  rootElement.classList.add(
    nextTheme === THEMES.LIGHT ? "theme-light" : "theme-dark",
  );
  rootElement.style.colorScheme = nextTheme;
};

// ─── persistTheme: save theme to storage ──────────────────────────────────────

export const persistTheme = (theme) => {
  if (typeof window === "undefined") {
    return;
  }

  try {
    window.localStorage.setItem(THEME_STORAGE_KEY, theme);
  } catch {
    // Ignore storage write failures and keep the in-memory theme active.
  }
};

// ─── initializeTheme: apply stored theme at boot ──────────────────────────────

export const initializeTheme = () => {
  const theme = getStoredTheme();

  applyTheme(theme);

  return theme;
};
