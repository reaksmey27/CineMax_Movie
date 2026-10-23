import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

// ─── Lazy Routes: code-split page imports ─────────────────────────────────────

const NotFoundPage = lazy(() => import("../pages/not-found/NotFoundPage"));
const HomePage = lazy(() => import("../pages/home/HomePage"));
const MoviesPage = lazy(() => import("../pages/movies/MoviesPage"));
const MovieDetailPage = lazy(() => import("../pages/movies/MovieDetailPage"));
const TrendingPage = lazy(() => import("../pages/trending/TrendingPage"));
const UpcomingPage = lazy(() => import("../pages/upcoming/UpcomingPage"));
const FavoritesPage = lazy(() => import("../pages/favorites/FavoritesPage"));
const WatchlistPage = lazy(() => import("../pages/watchlist/WatchlistPage"));
const HistoryPage = lazy(() => import("../pages/history/HistoryPage"));
const NotificationsPage = lazy(
  () => import("../pages/notifications/NotificationsPage"),
);
const AuthLayout = lazy(() => import("../pages/auth/AuthLayout"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const ResetPasswordPage = lazy(() => import("../pages/auth/ResetPasswordPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));
const PrivacyPage = lazy(() => import("../pages/privacy/PrivacyPage"));
const TermsPage = lazy(() => import("../pages/terms/TermsPage"));

// ─── Base Routes: main app page routes ────────────────────────────────────────

const BaseRoutes = ({ location }) => (
  <Routes location={location}>
    <Route path="/" element={<HomePage />} />
    <Route path="/movies" element={<MoviesPage />} />
    <Route path="/trending" element={<TrendingPage />} />
    <Route path="/upcoming" element={<UpcomingPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/watchlist" element={<WatchlistPage />} />
    <Route path="/history" element={<HistoryPage />} />
    <Route path="/notifications" element={<NotificationsPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/reset-password" element={<ResetPasswordPage />} />
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<SignupPage />} />
    </Route>
    <Route path="/movie/:id" element={<MovieDetailPage />} />
    <Route path="/privacy" element={<PrivacyPage />} />
    <Route path="/terms" element={<TermsPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

// ─── Auth Modal Routes: login/signup overlays ─────────────────────────────────

const AuthModalRoutes = ({ location }) => (
  <Routes location={location}>
    <Route element={<AuthLayout />}>
      <Route path="/login" element={<LoginPage />} />
      <Route path="/signup" element={<SignupPage />} />
      <Route path="/register" element={<SignupPage />} />
    </Route>
  </Routes>
);

export { AuthModalRoutes, BaseRoutes };
