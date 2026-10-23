import PasswordRequirements from "../../components/auth/PasswordRequirements";
import PasswordConfirmation from "../../components/auth/PasswordConfirmation";
import React, { useState } from "react";
import { ArrowRightIcon, UserPlusIcon, CheckIcon, ExclamationCircleIcon } from "@heroicons/react/24/outline";
import { Link, useLocation } from "react-router-dom";
import PasswordField from "../../components/auth/PasswordField";
import LoginButton from "../../components/auth/LoginButton";
import useAuthForm from "../../hooks/auth/useAuthForm";
import { useLanguage } from "../../context/LanguageContext";

// ─── SignupPage: create-account form ──────────────────────────────────────────

const SignupPage = () => {
  const { t } = useLanguage();
  const { formData, fieldErrors, touched, isBusy, handleChange, handleBlur, handleSubmit } =
    useAuthForm("register");
  const location = useLocation();
  const [passwordFocused, setPasswordFocused] = useState(false);

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

        <form
          className="mt-6 space-y-3"
          onSubmit={handleSubmit}
          noValidate
          onFocusCapture={(event) => setPasswordFocused(["password", "confirmPassword"].includes(event.target.name))}
          onBlurCapture={(event) => {
            if (!event.currentTarget.contains(event.relatedTarget)) setPasswordFocused(false);
          }}
        >
          <div className="grid min-w-0 grid-cols-1 items-start gap-3 min-[480px]:grid-cols-2">
            {[
              { name: "name", label: "Full Name", placeholder: "Movie lover name", type: "text", autoComplete: "name" },
              { name: "email", label: "Enter Your Email", placeholder: "Enter your Email", type: "email", autoComplete: "email" },
            ].map(({ name, label, placeholder, ...attributes }) => (
              <div key={name} className="min-w-0">
                <label htmlFor={`signup-${name}`} className="mb-2 block text-[10px] font-black uppercase tracking-[0.25em] text-white/45">{t(label)}</label>
                <div className="relative">
                  <input
                    {...attributes}
                    id={`signup-${name}`}
                    name={name}
                    autoFocus={name === "name"}
                    value={formData[name]}
                    onChange={handleChange}
                    onBlur={handleBlur}
                    placeholder={t(placeholder)}
                    aria-invalid={Boolean(fieldErrors[name])}
                    aria-describedby={fieldErrors[name] ? `signup-${name}-error` : undefined}
                    className="min-h-11 w-full rounded-md border border-white/10 bg-white py-2 pl-3.5 pr-10 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-purple-500/60 focus:ring-2 focus:ring-purple-500/20 aria-invalid:border-red-400 aria-invalid:focus:ring-red-400/30"
                  />
                  {touched[name] && (fieldErrors[name]
                    ? <ExclamationCircleIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-red-500" />
                    : <CheckIcon aria-hidden="true" className="pointer-events-none absolute right-3 top-3 h-5 w-5 text-green-600" />)}
                </div>
                <p id={`signup-${name}-error`} aria-live="polite" className="mt-1 min-h-8 text-[11px] leading-4 text-red-400">{fieldErrors[name] && t(fieldErrors[name])}</p>
              </div>
            ))}
          </div>
          <div className="grid min-w-0 grid-cols-1 items-start gap-3 min-[480px]:grid-cols-2">
            <div className="min-w-0">
              <PasswordField
                label={t("Password")}
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                placeholder={t("At least 8 characters")}
                aria-invalid={Boolean(fieldErrors.password)}
                aria-describedby="signup-password-error signup-password-requirements"
              />
              <p id="signup-password-error" aria-live="polite" className="mt-1 min-h-8 text-[11px] leading-4 text-red-400">{fieldErrors.password && t(fieldErrors.password)}</p>
            </div>
            <div className="min-w-0">
              <PasswordField
                label={t("Confirm Password")}
                confirmation
                name="confirmPassword"
                aria-describedby="signup-confirmPassword-error signup-password-confirmation"
                aria-invalid={Boolean(fieldErrors.confirmPassword) || (formData.confirmPassword.length > 0 && formData.password !== formData.confirmPassword)}
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                autoComplete="new-password"
                placeholder={t("Repeat your password")}
              />
              <div className="mt-1 min-h-8">
                <p id="signup-confirmPassword-error" aria-live="polite" className="text-[11px] leading-4 text-red-400">{!formData.confirmPassword && fieldErrors.confirmPassword && t(fieldErrors.confirmPassword)}</p>
                <PasswordConfirmation id="signup-password-confirmation" password={formData.password} confirmation={formData.confirmPassword} />
              </div>
            </div>
          </div>
          <PasswordRequirements id="signup-password-requirements" password={formData.password} visible={passwordFocused} />

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
