import React, { startTransition, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getAuthRedirect } from "../../utils/authRedirect";
import { useAuth } from "../../context/AuthContext";

const GoogleIcon = () => (
  <svg aria-hidden="true" viewBox="0 0 24 24" className="h-5 w-5">
    <path
      fill="#EA4335"
      d="M12 10.2v3.9h5.4c-.2 1.2-.9 2.3-1.9 3l3.1 2.4c1.8-1.7 2.9-4.2 2.9-7.2 0-.7-.1-1.4-.2-2.1H12Z"
    />
    <path
      fill="#34A853"
      d="M12 21c2.6 0 4.8-.9 6.4-2.5l-3.1-2.4c-.9.6-2 .9-3.3.9-2.5 0-4.5-1.7-5.2-3.9l-3.2 2.5C5 18.8 8.2 21 12 21Z"
    />
    <path
      fill="#4A90E2"
      d="M6.8 13.1c-.2-.6-.3-1.2-.3-1.9s.1-1.3.3-1.9l-3.2-2.5C3 8.1 2.6 9.5 2.6 11.2s.4 3.1 1 4.4l3.2-2.5Z"
    />
    <path
      fill="#FBBC05"
      d="M12 5.4c1.4 0 2.7.5 3.7 1.4l2.8-2.8C16.8 2.4 14.6 1.5 12 1.5 8.2 1.5 5 3.7 3.6 6.8l3.2 2.5c.7-2.2 2.7-3.9 5.2-3.9Z"
    />
  </svg>
);

const LoginButton = ({ className = "", label = "Continue with Google" }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const { signInWithGoogle, loading, authenticating } = useAuth();
  const [submitting, setSubmitting] = useState(false);

  const isBusy = loading || authenticating || submitting;

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

  return (
    <button
      type="button"
      onClick={handleClick}
      disabled={isBusy}
      className={`inline-flex w-full items-center justify-center gap-3 rounded-xl border border-white/10 bg-white px-4 py-3 text-sm font-semibold text-slate-900 transition-all hover:-translate-y-0.5 hover:bg-slate-100 disabled:cursor-not-allowed disabled:opacity-60 ${className}`}
    >
      <GoogleIcon />
      <span>{isBusy ? "Connecting..." : label}</span>
    </button>
  );
};

export default LoginButton;
