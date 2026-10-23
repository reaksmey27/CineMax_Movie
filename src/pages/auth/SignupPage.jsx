import PasswordRequirements from "../../components/auth/PasswordRequirements";
import React from "react";
import { ArrowRightIcon, UserPlusIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import PasswordField from "../../components/auth/PasswordField";
import LoginButton from "../../components/auth/LoginButton";
import useAuthForm from "../../hooks/auth/useAuthForm";
import { useLanguage } from "../../context/LanguageContext";

// ─── SignupPage: create-account form ──────────────────────────────────────────

const SignupPage = () => {
  const { t } = useLanguage();
  const { formData, error, isBusy, handleChange, handleSubmit } =
    useAuthForm("register");
  const location = useLocation();

  return (
    <>
      <div className="w-full">
        <div className="mb-7 flex items-center gap-3 text-purple-400">
          <UserPlusIcon className="h-5 w-5" />
          <span className="text-[10px] font-black uppercase tracking-[0.4em] text-purple-400">
            {t("Create Account")}
          </span>
        </div>

        <h1 className="page-heading page-heading--violet">
          {t("Join CineMax")}
        </h1>
        <p className="mt-2 text-sm text-white/55">
          {t("Fill in your details to get started.")}
        </p>

        <form className="mt-6 space-y-3" onSubmit={handleSubmit}>
          <div className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            <label className="flex h-full min-w-0 flex-col">
              <span className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-white/45">
                {t("Full Name")}
              </span>
              <input
                autoFocus
                type="text"
                name="name"
                value={formData.name}
                onChange={handleChange}
                autoComplete="name"
                placeholder={t("Movie lover name")}
                className="mt-auto w-full rounded-md border border-white/10 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
              />
            </label>

            <label className="flex h-full min-w-0 flex-col">
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
                className="mt-auto w-full rounded-md border border-white/10 bg-white px-3.5 py-2 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20"
              />
            </label>
          </div>

          <div className="grid min-w-0 grid-cols-1 gap-3 min-[480px]:grid-cols-2">
            <PasswordField
              label={t("Password")}
              name="password"
              value={formData.password}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder={t("At least 8 characters")}
              aria-describedby="signup-password-requirements"
            />

            <PasswordField
              label={t("Confirm Password")}
              confirmation
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              autoComplete="new-password"
              placeholder={t("Repeat your password")}
            />
          </div>

          <PasswordRequirements id="signup-password-requirements" password={formData.password} />

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
            <span>
              {isBusy ? t("Creating Account...") : t("Create Account")}
            </span>
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
          {t("Secure sign-up powered by Firebase Authentication")}
        </p>

        <p className="mt-5 text-center text-sm text-white/50">
          {t("Already have an account?")}{" "}
          <Link
            to="/login"
            state={location.state}
            className="font-semibold text-purple-400 hover:text-purple-300"
          >
            {t("Sign in")}
          </Link>
        </p>
      </div>
    </>
  );
};

export default SignupPage;
