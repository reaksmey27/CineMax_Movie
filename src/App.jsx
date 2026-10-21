import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

// Fixed imports: explicitly adding .jsx extensions for root-level components
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RouteTitleManager from "./components/RouteTitleManager.jsx";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import BackToTopButton from "./components/ui/BackToTopButton";
import DonationButton from "./components/ui/DonationButton";
import PageLoader from "./components/ui/PageLoader";
import { AuthModalRoutes, BaseRoutes } from "./config/routes";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { LanguageProvider, useLanguage } from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import useScrollToTop from "./hooks/useScrollToTop";
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  THEMES,
} from "./utils/theme";

// ─── Scroll Manager: reset scroll on route change ─────────────────────────────

const ScrollManager = () => {
  useScrollToTop();
  return null;
};

// ─── App: layout shell & routed pages ─────────────────────────────────────────

const AppContent = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const { t } = useLanguage();
  const backgroundLocation = location.state?.backgroundLocation;
  const baseLocation = backgroundLocation || location;

  return (
    <>
      <ScrollManager />
      <RouteTitleManager />
      <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="relative">
          <Suspense
            fallback={
              <PageLoader
                color="border-purple-500"
                label={t("Loading Experience...")}
              />
            }
          >
            <div
              key={baseLocation.pathname}
              className="animate-page-enter"
            >
              <BaseRoutes location={baseLocation} />
            </div>
            {backgroundLocation && <AuthModalRoutes location={location} />}
          </Suspense>
        </main>
        <DonationButton />
        <BackToTopButton />
        <Footer />
      </div>
    </>
  );
};

// ─── App Root: theme state & providers ────────────────────────────────────────

const App = () => {
  const [theme, setTheme] = useState(getStoredTheme);

  useEffect(() => {
    applyTheme(theme);
    persistTheme(theme);
  }, [theme]);

  const toggleTheme = () =>
    setTheme((current) =>
      current === THEMES.DARK ? THEMES.LIGHT : THEMES.DARK,
    );

  return (
    <ErrorBoundary>
      <LanguageProvider>
        <NotificationProvider>
          <AuthProvider>
            <Router>
              <WatchlistProvider>
                <FavoritesProvider>
                  <AppContent theme={theme} toggleTheme={toggleTheme} />
                </FavoritesProvider>
              </WatchlistProvider>
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
