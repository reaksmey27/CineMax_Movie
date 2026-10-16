import { Suspense, useEffect, useState } from "react";
import { BrowserRouter as Router, useLocation } from "react-router-dom";

// Fixed imports: explicitly adding .jsx extensions for root-level components
import ErrorBoundary from "./components/ErrorBoundary.jsx";
import RouteTitleManager from "./components/RouteTitleManager.jsx";
import Footer from "./components/layout/Footer";
import Navbar from "./components/layout/Navbar";
import BackToTopButton from "./components/ui/BackToTopButton";
import PageLoader from "./components/ui/PageLoader";
import { AuthModalRoutes, BaseRoutes } from "./config/routes";
import { AuthProvider } from "./context/AuthContext";
import { FavoritesProvider } from "./context/FavoritesContext";
import { NotificationProvider } from "./context/NotificationContext";
import { WatchlistProvider } from "./context/WatchlistContext";
import useScrollToTop from "./hooks/useScrollToTop";
import {
  applyTheme,
  getStoredTheme,
  persistTheme,
  THEMES,
} from "./utils/theme";

// ─── Scroll Manager ───────────────────────────────────────────────────────────

const ScrollManager = () => {
  useScrollToTop();
  return null;
};

// ─── App ──────────────────────────────────────────────────────────────────────

const AppContent = ({ theme, toggleTheme }) => {
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

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
                label="Loading Experience..."
              />
            }
          >
            <BaseRoutes location={backgroundLocation || location} />
            {backgroundLocation && <AuthModalRoutes location={location} />}
          </Suspense>
        </main>
        <BackToTopButton />
        <Footer />
      </div>
    </>
  );
};

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
      <NotificationProvider>
        <AuthProvider>
          <WatchlistProvider>
            <FavoritesProvider>
              <Router>
                <AppContent theme={theme} toggleTheme={toggleTheme} />
              </Router>
            </FavoritesProvider>
          </WatchlistProvider>
        </AuthProvider>
      </NotificationProvider>
    </ErrorBoundary>
  );
};

export default App;
