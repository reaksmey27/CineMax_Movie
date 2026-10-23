import PasswordRequirements from "../../components/auth/PasswordRequirements";
import PasswordConfirmation from "../../components/auth/PasswordConfirmation";
import { meetsPasswordRequirements } from "../../utils/passwordRequirements";
import { useEffect, useRef, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { confirmPasswordReset, verifyPasswordResetCode } from "firebase/auth";
import { LockClosedIcon } from "@heroicons/react/24/outline";
import { auth } from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";

const INVALID = "This reset link is invalid or expired. Request a new one.";
const FAILED = "Could not reset your password. Please try again.";
const invalidCode = (error) =>
  [
    "auth/expired-action-code",
    "auth/invalid-action-code",
    "auth/user-disabled",
    "auth/user-not-found",
  ].includes(error.code);
const INPUT =
  "mt-2 min-h-12 w-full rounded-xl border border-[var(--color-border)] bg-[var(--color-bg-elevated)] px-3 text-[var(--color-text)] focus:outline-2 focus:outline-purple-400 disabled:opacity-60";

function ResetForm({ search }) {
  const { t } = useLanguage();
  const params = new URLSearchParams(search);
  const code = params.get("oobCode");
  const mode = params.get("mode");
  const [status, setStatus] = useState("checking");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [passwordStarted, setPasswordStarted] = useState(false);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const pending = useRef(false);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);
  useEffect(() => {
    let active = true;
    if (!code || mode !== "resetPassword") return;
    verifyPasswordResetCode(auth, code)
      .then((address) => {
        if (active) {
          setEmail(address);
          setStatus("ready");
        }
      })
      .catch((failure) => {
        if (active)
          setStatus(invalidCode(failure) ? "invalid" : "verify-error");
      });
    return () => {
      active = false;
    };
  }, [code, mode, attempt]);

  const submit = async (event) => {
    event.preventDefault();
    if (pending.current || status !== "ready") return;
    if (!meetsPasswordRequirements(password)) {
      setError("Meet all password requirements before continuing.");
      return;
    }
    if (password !== confirm) {
      setError("Passwords do not match.");
      return;
    }
    pending.current = true;
    setStatus("saving");
    setError("");
    try {
      await confirmPasswordReset(auth, code, password);
      if (mounted.current) {
        setPassword("");
        setConfirm("");
        setStatus("done");
      }
    } catch (failure) {
      if (!mounted.current) return;
      if (invalidCode(failure)) setStatus("invalid");
      else {
        setStatus("ready");
        setError(
          [
            "auth/weak-password",
            "auth/password-does-not-meet-requirements",
          ].includes(failure.code)
            ? "Use a stronger password that meets your account requirements."
            : FAILED,
        );
      }
    } finally {
      pending.current = false;
    }
  };
  const invalid = !code || mode !== "resetPassword" || status === "invalid";
  // Other email actions can share this URL; retain Firebase's trusted handler.
  const otherAction =
    code &&
    ["verifyEmail", "recoverEmail", "verifyAndChangeEmail"].includes(mode);
  const fallback = otherAction
    ? new URL(`https://${auth.app.options.authDomain}/__/auth/action`)
    : null;
  if (fallback) {
    fallback.searchParams.set("mode", mode);
    fallback.searchParams.set("oobCode", code);
    fallback.searchParams.set("apiKey", auth.app.options.apiKey);
  }
  return (
    <div className="mx-auto min-h-screen max-w-xl px-4 pb-16 pt-28 sm:pt-40">
      <section
        aria-labelledby="reset-password-title"
        className="rounded-3xl border border-[var(--color-border)] bg-[var(--color-surface-1)] p-6 shadow-xl sm:p-8"
      >
        <LockClosedIcon
          aria-hidden="true"
          className="mb-4 h-10 w-10 text-purple-400"
        />
        <h1
          id="reset-password-title"
          className="page-heading page-heading--violet"
        >
          {t("Reset password")}
        </h1>
        {fallback ? (
          <a
            href={fallback.href}
            rel="noreferrer"
            className="mt-6 inline-flex min-h-12 items-center rounded-xl bg-purple-600 px-6 font-semibold text-white"
          >
            {t("Continue")}
          </a>
        ) : invalid ? (
          <p role="alert" className="mt-4 leading-relaxed">
            {t(INVALID)}
          </p>
        ) : status === "checking" ? (
          <p role="status" className="mt-4">
            {t("Checking reset link...")}
          </p>
        ) : status === "verify-error" ? (
          <div className="mt-4">
            <p role="alert">{t(FAILED)}</p>
            <button
              className="mt-3 min-h-11 text-purple-400 underline"
              onClick={() => {
                setStatus("checking");
                setAttempt((value) => value + 1);
              }}
            >
              {t("Try again")}
            </button>
          </div>
        ) : status === "done" ? (
          <p
            role="status"
            className="mt-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4"
          >
            {t("Password reset. You can now sign in.")}
          </p>
        ) : (
          <form
            onSubmit={submit}
            onFocusCapture={(event) => {
            if (["password", "confirmPassword"].includes(event.target.name)) setPasswordStarted(true);
          }}
            aria-busy={status === "saving"}
            className="mt-5 space-y-4"
          >
            <p className="text-sm text-[var(--color-text-muted)]">
              {t("Choose a new password.")}
              <span className="mt-1 block break-all font-medium">{email}</span>
            </p>
            <label className="block text-sm font-semibold">
              {t("Password")}
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                aria-describedby="reset-password-requirements"
                value={password}
                name="password"
                disabled={status === "saving"}
                onChange={(event) => {
                  setPassword(event.target.value);
                  setError("");
                }}
                placeholder={t("Enter your password")}
                className={INPUT}
              />
            </label>
            <label className="block text-sm font-semibold">
              {t("Confirm password")}
              <input
                type="password"
                autoComplete="new-password"
                required
                minLength={8}
                value={confirm}
                name="confirmPassword"
                aria-describedby="reset-password-confirmation"
                aria-invalid={confirm.length > 0 && password !== confirm}
                disabled={status === "saving"}
                onChange={(event) => {
                  setConfirm(event.target.value);
                  setError("");
                }}
                placeholder={t("Repeat your password")}
                className={INPUT}
              />
            </label>
            <PasswordConfirmation id="reset-password-confirmation" password={password} confirmation={confirm} />
            <PasswordRequirements id="reset-password-requirements" password={password} visible={passwordStarted} />
            {error && (
              <p role="alert" className="text-sm text-[var(--color-text)]">
                {t(error)}
              </p>
            )}
            <button
              disabled={status === "saving"}
              className="min-h-12 w-full rounded-xl bg-purple-600 px-4 font-semibold text-white hover:bg-purple-500 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-purple-400 disabled:opacity-60"
            >
              {status === "saving" ? t("Saving...") : t("Reset password")}
            </button>
          </form>
        )}
        <Link
          to="/login"
          className="mt-6 inline-flex min-h-11 items-center font-semibold text-purple-400 underline"
        >
          {t("Back to sign in")}
        </Link>
      </section>
    </div>
  );
}

export default function ResetPasswordPage() {
  const { search } = useLocation();
  return <ResetForm key={search} search={search} />;
}
