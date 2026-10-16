import { lazy } from "react";
import { Route, Routes } from "react-router-dom";

const NotFoundPage = lazy(() => import("../pages/NotFoundPage"));
const HomePage = lazy(() => import("../pages/home/HomePage"));
const MoviesPage = lazy(() => import("../pages/movies/MoviesPage"));
const MovieDetailPage = lazy(() => import("../pages/movies/MovieDetailPage"));
const TrendingPage = lazy(() => import("../pages/trending/TrendingPage"));
const UpcomingPage = lazy(() => import("../pages/upcoming/UpcomingPage"));
const FavoritesPage = lazy(() => import("../pages/favorites/FavoritesPage"));
const WatchlistPage = lazy(() => import("../pages/watchlist/WatchlistPage"));
const LoginPage = lazy(() => import("../pages/auth/LoginPage"));
const SignupPage = lazy(() => import("../pages/auth/SignupPage"));
const ProfilePage = lazy(() => import("../pages/profile/ProfilePage"));

const BaseRoutes = ({ location }) => (
  <Routes location={location}>
    <Route path="/" element={<HomePage />} />
    <Route path="/movies" element={<MoviesPage />} />
    <Route path="/trending" element={<TrendingPage />} />
    <Route path="/upcoming" element={<UpcomingPage />} />
    <Route path="/favorites" element={<FavoritesPage />} />
    <Route path="/watchlist" element={<WatchlistPage />} />
    <Route path="/profile" element={<ProfilePage />} />
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/register" element={<SignupPage />} />
    <Route path="/movie/:id" element={<MovieDetailPage />} />
    <Route path="*" element={<NotFoundPage />} />
  </Routes>
);

const AuthModalRoutes = ({ location }) => (
  <Routes location={location}>
    <Route path="/login" element={<LoginPage />} />
    <Route path="/signup" element={<SignupPage />} />
    <Route path="/register" element={<SignupPage />} />
  </Routes>
);

export { AuthModalRoutes, BaseRoutes };
