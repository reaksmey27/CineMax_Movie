import React, { startTransition, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import googleIcon from "../../assets/icons/google.svg";
import { getAuthRedirect } from "../../utils/authRedirect";
import { useAuth } from "../../context/AuthContext";

// ─── LoginButton: Google sign-in button ───────────────────────────────────────

const LoginButton = ({ className = "", label = "Continue with Google" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, loading, authenticating } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const isBusy = loading || authenticating || submitting;

  // ─── Handlers: sign in and redirect ───────────────────────────────────────────

  const handleClick = async () => {
    if (isBusy) {
      return;
    }

    setSubmitting(true);

    try {
      const nextUser = await signInWithGoogle();

      if (nextUser) {
        startTransition(() => {
          navigate(getAuthRedirect(location.state), { replace: true });
        });
      }
    } finally {
      setSubmitting(false);
    }
  };

  // ─── Render: button with busy state ───────────────────────────────────────────

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <img
        src={googleIcon}
        alt=""
        aria-hidden="true"
        className="h-5 w-5"
      />
      <span>{isBusy ? "Connecting..." : label}</span>
    </button>
  );
};

export default LoginButton;
