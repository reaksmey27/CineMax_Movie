import React from "react";
import { ArrowRightIcon, LockClosedIcon } from "@heroicons/react/24/outline";
import { Link, Navigate, useLocation, useNavigate } from "react-router-dom";
import LoginButton from "../../components/auth/LoginButton";
import useAuthForm from "../../hooks/auth/useAuthForm";
import { useAuth } from "../../context/AuthContext";
import { useLanguage } from "../../context/LanguageContext";
import AuthShell from "./AuthShell";
import { getAuthRedirect } from "../../utils/authRedirect";

const LoginPage = () => {
  const { t } = useLanguage();
  const { user, loading } = useAuth();
  const { formData, error, isBusy, handleChange, handleSubmit } =
    useAuthForm("login");
  const navigate = useNavigate();
  const location = useLocation();
  const backgroundLocation = location.state?.backgroundLocation;

  const handleClose = () => {
    if (backgroundLocation) {
      const { pathname = "/", search = "", hash = "" } = backgroundLocation;
      navigate(`${pathname}${search}${hash}`, { replace: true });
      return;
    }

    navigate("/", { replace: true });
  };

  if (loading) return null;
  if (user) return <Navigate to={getAuthRedirect(location.state)} replace />;

  return (
    <AuthShell onClose={handleClose}>
      <div className="w-full">
        <div className="mb-7 flex items-center gap-3 text-purple-400">
          <LockClosedIcon className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">
            {t("Member Access")}
          </span>
        </div>

        <h1 className="text-3xl font-black tracking-[-0.05em] text-white sm:text-4xl">
          {t("Welcome Back")}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {location.state?.returnTo
            ? t("Log in to watch this movie.")
            : t("Enter your details.")}
        </p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
              {t("Enter Your Email")}
            </span>
            <input
              type="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              autoComplete="email"
              placeholder={t("Enter your Email")}
              className="w-full rounded-md border border-white/10 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
            />
          </label>

          <label className="block">
            <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
              {t("Password")}
            </span>
            <input
              type="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="current-password"
              placeholder={t("Enter your password")}
              className="w-full rounded-md border border-white/10 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
            />
          </label>

          {error && (
            <div className="rounded-xl border border-purple-500/20 bg-purple-500/10 px-4 py-3 text-sm text-purple-100">
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={isBusy}
            className="inline-flex w-full items-center justify-center gap-2 rounded-md bg-purple-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-purple-500 disabled:cursor-not-allowed disabled:opacity-60"
          >
            <span>{isBusy ? t("Signing In...") : t("Continue")}</span>
            <ArrowRightIcon className="h-4 w-4" />
          </button>
        </form>

        <div className="my-4 flex items-center gap-4">
          <div className="h-px flex-1 bg-white/10" />
          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-white/35">
            {t("Or")}
          </span>
          <div className="h-px flex-1 bg-white/10" />
        </div>

        <div className="space-y-2.5">
          <LoginButton label={t("Continue with Google")} />
        </div>

        <p className="mt-3 text-center text-[11px] text-white/40">
          {t("Secure sign-in powered by Firebase Authentication")}
        </p>

        <p className="mt-5 text-center text-sm text-white/50">
          {t("Don't have account?")}{" "}
          <Link
            to="/signup"
            state={location.state}
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            {t("Sign up")}
          </Link>
        </p>
      </div>
    </AuthShell>
  );
};

export default LoginPage;
