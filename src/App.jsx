import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

// Fixed imports: explicit .jsx extensions for shared core components
import ErrorBoundary from "./components/core/ErrorBoundary.jsx";
import RouteTitleManager from "./components/core/RouteTitleManager.jsx";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import BackToTopButton from "./components/ui/BackToTopButton";
import DonationButton from "./components/ui/DonationButton";
import PageSkeleton from "./components/ui/PageSkeleton";
import { AuthModalRoutes, BaseRoutes } from "./config/routes";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { LanguageProvider } from "./context/LanguageContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import { WatchHistoryProvider } from "./context/WatchHistoryContext";
import { RemovalUndoProvider } from "./context/RemovalUndoContext";
import useScrollToTop from "./hooks/useScrollToTop";
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  THEMES,
} from "./utils/theme";

// ─── Scroll Manager: reset scroll on route change ─────────────────────────────

const ScrollManager = ({ location }) => {
  useScrollToTop(location);
  return null;
};

// ─── App: layout shell & routed pages ─────────────────────────────────────────

const AppContent = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;
  const baseLocation = backgroundLocation || location;

  return (
    <>
      <ScrollManager location={baseLocation} />
      <RouteTitleManager />
      <div className="min-h-screen bg-(--color-bg) text-(--color-text)">
        <Navbar theme={theme} onToggleTheme={toggleTheme} />
        <main className="relative">
          <Suspense fallback={<PageSkeleton />}>
            <div key={baseLocation.pathname} className="animate-page-enter">
              <BaseRoutes location={baseLocation} />
            </div>
          </Suspense>
          {backgroundLocation && (
            <Suspense fallback={null}>
              <AuthModalRoutes location={location} />
            </Suspense>
          )}
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
              <RemovalUndoProvider>
                <WatchlistProvider>
                  <FavoritesProvider>
                    <WatchHistoryProvider>
                      <AppContent theme={theme} toggleTheme={toggleTheme} />
                    </WatchHistoryProvider>
                  </FavoritesProvider>
                </WatchlistProvider>
              </RemovalUndoProvider>
            </Router>
          </AuthProvider>
        </NotificationProvider>
      </LanguageProvider>
    </ErrorBoundary>
  );
};

export default App;
