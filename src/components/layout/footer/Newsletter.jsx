import { useState } from "react";
import { useLanguage } from "../../../context/LanguageContext";

const Newsletter = () => {
  const { t } = useLanguage();
  const [email, setEmail] = useState("");
  const [subscribed, setSubscribed] = useState(false);

  const handleSubmit = (event) => {
    event.preventDefault();
    if (!email.trim()) return;

    setSubscribed(true);
    setEmail("");
  };

  return (
    <section
      aria-labelledby="footer-newsletter-heading"
      className="mb-10 rounded-3xl border border-white/10 bg-white/5 p-6 sm:p-8"
    >
      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
        <div className="text-center lg:text-left">
          <h2
            id="footer-newsletter-heading"
            className="text-lg font-semibold text-white"
          >
            {t("Stay Updated")}
          </h2>
          <p className="mt-1 text-sm text-gray-400">
            {t(
              "New trailers, trending picks and release alerts — no spam, unsubscribe anytime.",
            )}
          </p>
        </div>

        {subscribed ? (
          <div
            role="status"
            className="flex flex-col items-center gap-3 text-center sm:flex-row lg:justify-end"
          >
            <p className="text-sm font-medium text-emerald-400">
              {t("You're on the list — we'll keep you posted.")}
            </p>
            <button
              type="button"
              onClick={() => setSubscribed(false)}
              className="text-sm font-semibold text-purple-400 underline underline-offset-4 hover:text-purple-300"
            >
              {t("Use a different email")}
            </button>
          </div>
        ) : (
          <form
            onSubmit={handleSubmit}
            className="flex flex-col gap-2 min-[420px]:flex-row"
          >
            <label htmlFor="footer-newsletter-email" className="sr-only">
              {t("Email address")}
            </label>
            <input
              id="footer-newsletter-email"
              type="email"
              required
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              placeholder={t("Email address")}
              className="min-h-11 w-full min-w-0 rounded-xl border border-white/10 bg-white/5 px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 focus:ring-purple-500"
            />
            <button
              type="submit"
              className="min-h-11 shrink-0 rounded-xl bg-purple-600 px-6 text-sm font-semibold text-white transition hover:bg-purple-700"
            >
              {t("Join")}
            </button>
          </form>
        )}
      </div>
    </section>
  );
};

export default Newsletter;
