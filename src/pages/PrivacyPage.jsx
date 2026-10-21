import { Link } from "react-router-dom";
import { useLanguage } from "../context/LanguageContext";

// ─── Data: privacy policy sections ────────────────────────────────────────────

const SECTIONS = [
  {
    id: "overview",
    title: "Overview",
    body: [
      "CineMax is a movie discovery app: browse the TMDB catalog, keep a personal favorites list and watchlist, follow trending and upcoming releases, and track your notifications. This policy explains what information we handle, why we handle it, and the choices you have.",
    ],
  },
  {
    id: "information-we-collect",
    title: "Information we collect",
    body: [
      "Account details: when you sign in with Google, Firebase Authentication provides your name, email address and profile image. Your Google password is never shared with us.",
      "Profile details: anything you choose to add on the Profile page, such as a display name, bio, location and favorite genre.",
      "Saved collections: the movies you add to your favorites and watchlist, stored in Cloud Firestore under your account so they sync across devices.",
      "Preferences: your theme and language choice, notification history, and recent searches, which are kept in your browser's local storage.",
      "Newsletter email: the address you enter in the footer sign-up form, used only to keep you on the list until you opt out.",
    ],
  },
  {
    id: "how-we-use-information",
    title: "How we use your information",
    body: [
      "We use your data to provide the service itself: syncing your saved movies, restoring your preferences, showing unread notifications, and personalizing headings and recommendations.",
      "We use aggregated, non-identifying signals (such as which filters or sections are used) to decide what to improve next.",
      "We do not sell your personal information, and we do not use it for advertising.",
    ],
  },
  {
    id: "authentication",
    title: "Authentication and accounts",
    body: [
      "Sign-in is handled by Firebase Authentication using Google OAuth. CineMax only receives the profile information Google returns after you approve the sign-in.",
      "You can sign out at any time from the Profile page or the navigation menu. Signing out ends the session on this device without deleting your saved collections.",
    ],
  },
  {
    id: "local-storage",
    title: "Local storage",
    body: [
      "We store a few values in your browser's local storage: your theme, your language, notification history for signed-out visitors, and your recent searches.",
      "These values stay on your device. You can clear them at any time through your browser's site data settings; the app will fall back to defaults.",
    ],
  },
  {
    id: "third-party-services",
    title: "Third-party services",
    body: [
      "Firebase (Google) hosts authentication, Firestore data and offline caching. See Google's privacy policy for how Firebase handles data.",
      "TMDB provides movie metadata and images. See the TMDB terms and privacy policy for details.",
      "Movie playback is delivered through third-party embed players. Those players are governed by their own providers' policies.",
      "External links (for example to TMDB or social networks) open third-party sites that we do not control.",
    ],
  },
  {
    id: "retention-and-deletion",
    title: "Data retention and deletion",
    body: [
      "Your account data is kept for as long as your account exists. Removing a movie from your favorites or watchlist deletes that entry immediately.",
      "Local storage values are removed when you clear your browser data for this site.",
      "If you want your account and saved collections removed, request it through the project's support channels and we will delete them.",
    ],
  },
  {
    id: "your-choices",
    title: "Your rights and choices",
    body: [
      "You can view and edit your profile details on the Profile page, remove individual movies from your collections, and switch language or theme at any time.",
      "You can opt out of the newsletter by using a different email or contacting us, and you can decline cookies and storage through your browser settings.",
      "Depending on where you live, you may have the right to access, correct, or delete the personal data we hold about you. Contact us to exercise those rights.",
    ],
  },
  {
    id: "children",
    title: "Children's privacy",
    body: [
      "CineMax is not directed at children under 13, and we do not knowingly collect their personal information. If you believe a child has provided data, contact us and we will remove it.",
    ],
  },
  {
    id: "changes",
    title: "Changes to this policy",
    body: [
      "We may update this policy as the app evolves. The date at the top of this page reflects the latest revision, and material changes will be highlighted in the app.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about this policy or your data can be sent through the project's support channels, and we will respond as soon as we can.",
    ],
  },
];

// ─── PrivacyPage: what we collect and why ─────────────────────────────────────

export default function PrivacyPage() {
  const { t } = useLanguage();

  return (
    <section className="min-h-screen bg-[var(--color-bg)] px-6 pb-24 pt-32 sm:px-8 sm:pt-36 lg:px-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
          {t("Legal")}
        </p>
        <h1 className="mt-4 text-3xl font-black tracking-tight text-white sm:text-5xl">
          {t("Privacy Policy")}
        </h1>
        <p className="mt-3 text-sm text-gray-500">
          {t("Last updated: October 21, 2026")}
        </p>

        <div className="mt-10 space-y-9">
          {SECTIONS.map(({ id, title, body }) => (
            <section key={id} id={id} className="scroll-mt-32">
              <h2 className="text-xl font-bold text-white">{t(title)}</h2>
              <div className="mt-3 space-y-3 text-sm leading-7 text-gray-400">
                {body.map((paragraph) => (
                  <p key={paragraph}>{t(paragraph)}</p>
                ))}
              </div>
            </section>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 sm:flex-row sm:items-center sm:justify-between">
          <p className="text-sm text-gray-400">
            {t("Want the shorter version? Your data stays yours.")}
          </p>
          <Link
            to="/terms"
            className="shrink-0 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            {t("Read the Terms of Use")}
          </Link>
        </div>
      </div>
    </section>
  );
}
