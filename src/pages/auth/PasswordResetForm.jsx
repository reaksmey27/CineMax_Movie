import { useEffect, useRef, useState } from "react";
import { sendPasswordResetEmail } from "firebase/auth";
import { auth } from "../../firebase/config";
import { useLanguage } from "../../context/LanguageContext";

export default function PasswordResetForm({ initialEmail = "", onBack }) {
  const { t, language } = useLanguage();
  const [email, setEmail] = useState(initialEmail);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const pending = useRef(false);
  const emailRef = useRef(null);
  const mounted = useRef(false);
  useEffect(() => {
    mounted.current = true;
    emailRef.current?.focus();
    return () => {
      mounted.current = false;
    };
  }, []);

  const submit = async (event) => {
    event.preventDefault();
    if (pending.current || status === "sent") return;
    pending.current = true;
    setStatus("sending");
    setError("");
    try {
      auth.languageCode = language;
      await sendPasswordResetEmail(auth, email.trim());
      if (mounted.current) setStatus("sent");
    } catch (failure) {
      if (!mounted.current) return;
      // Use the same confirmation when enumeration protection is disabled.
      if (failure.code === "auth/user-not-found") {
        setStatus("sent");
      } else {
        setStatus("idle");
        setError(
          failure.code === "auth/too-many-requests"
            ? "Too many reset attempts. Please wait and try again."
            : "Could not send the reset link. Please try again.",
        );
      }
    } finally {
      pending.current = false;
    }
  };

  return (
    <div className="w-full">
      <h1 className="page-heading page-heading--violet">{t("Reset password")}</h1>
      <p className="mt-3 text-sm text-white/70">
        {t("Enter your email to receive a password reset link.")}
      </p>
      {status === "sent" ? (
        <p
          role="status"
          className="mt-6 rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-4 text-sm text-emerald-100"
        >
          {t(
            "If an account exists for this email, a reset link will arrive shortly. Check your inbox and spam folder.",
          )}
        </p>
      ) : (
        <form
          onSubmit={submit}
          className="mt-6 space-y-4"
          aria-busy={status === "sending"}
        >
          <label className="block text-sm font-semibold text-white">
            {t("Email address")}
            <input
              ref={emailRef}
              type="email"
              required
              autoComplete="email"
              value={email}
              disabled={status === "sending"}
              onChange={(event) => {
                setEmail(event.target.value);
                setError("");
              }}
              className="mt-2 min-h-11 w-full rounded-lg bg-white px-3 text-slate-900 outline-none focus:ring-2 focus:ring-purple-500 disabled:opacity-60"
            />
          </label>
          {error && (
            <p role="alert" className="text-sm text-red-200">
              {t(error)}
            </p>
          )}
          <button
            type="submit"
            disabled={status === "sending"}
            className="min-h-11 w-full rounded-lg bg-purple-600 px-4 font-semibold text-white hover:bg-purple-500 disabled:cursor-wait disabled:opacity-60"
          >
            {status === "sending"
              ? t("Sending reset link...")
              : t("Send reset link")}
          </button>
        </form>
      )}
      <p className="mt-5 text-sm text-white/60">
        {t("If you use Google, continue with Google on the sign-in screen.")}
      </p>
      <button
        type="button"
        onClick={onBack}
        className="mt-4 min-h-11 text-sm font-semibold text-purple-300 hover:text-purple-200"
      >
        {t("Back to sign in")}
      </button>
    </div>
  );
}
