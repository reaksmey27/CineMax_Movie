import { Link } from "react-router-dom";
import { useLanguage } from "../../context/LanguageContext";

// ─── Data: terms of use sections ──────────────────────────────────────────────

const SECTIONS = [
  {
    id: "acceptance",
    title: "Acceptance of these terms",
    body: [
      "By using CineMax you agree to these Terms of Use. If you do not agree, please do not use the app.",
    ],
  },
  {
    id: "the-service",
    title: "The service",
    body: [
      "CineMax is a movie discovery app: it lets you browse catalogs and genres, search titles, read metadata and trailers, save favorites and a watchlist, and follow notifications about your collections.",
      "Movie metadata, posters and images are provided by TMDB. Playback is delivered through third-party embed players that CineMax does not host or operate.",
    ],
  },
  {
    id: "accounts",
    title: "Accounts and security",
    body: [
      "Accounts are created and managed through Firebase Authentication with Google sign-in. You are responsible for keeping access to your Google account secure.",
      "You are responsible for activity that happens while signed in. Tell us promptly if you suspect unauthorized use of your account.",
      "You must be old enough to consent to these terms in your country, or have permission from a parent or guardian.",
    ],
  },
  {
    id: "acceptable-use",
    title: "Acceptable use",
    body: [
      "You agree not to scrape the app at scale, overload its APIs, attempt to bypass access controls, probe for vulnerabilities, or interfere with other users' sessions.",
      "You will not use CineMax for unlawful purposes, to distribute malware, or to infringe the rights of others, including copyright holders.",
      "Reverse engineering the app, except where the law expressly allows it, is not permitted.",
    ],
  },
  {
    id: "third-party-content",
    title: "Third-party content and links",
    body: [
      "CineMax links to and embeds content from third parties such as TMDB and external video providers. We do not control that content, and your use of it is governed by the respective provider's terms and privacy policy.",
      "Any dispute about a movie, image, or player rests between you and the third party that supplies it.",
    ],
  },
  {
    id: "intellectual-property",
    title: "Intellectual property",
    body: [
      "The CineMax design, code, logos and original text belong to the project and its contributors. Movie titles, artwork and marks belong to their respective owners.",
      "TMDB marks and data are used under the TMDB terms; this product is not endorsed or certified by TMDB.",
    ],
  },
  {
    id: "accuracy-and-availability",
    title: "Accuracy and availability",
    body: [
      "We strive to keep metadata, ratings and release dates accurate, but catalogs change and errors happen. Content may be incomplete, outdated, or unavailable in your region.",
      "The app is provided on an as-available basis: we do not guarantee uninterrupted access, and maintenance may temporarily take features offline.",
    ],
  },
  {
    id: "disclaimer",
    title: "Disclaimer of warranties",
    body: [
      "To the maximum extent permitted by law, CineMax is provided without warranties of any kind, whether express or implied, including fitness for a particular purpose, accuracy, and non-infringement.",
    ],
  },
  {
    id: "liability",
    title: "Limitation of liability",
    body: [
      "To the maximum extent permitted by law, CineMax and its contributors are not liable for indirect, incidental, or consequential damages arising from your use of the app, including lost data, lost savings, or service interruptions.",
    ],
  },
  {
    id: "termination",
    title: "Suspension and termination",
    body: [
      "We may suspend or terminate access if these terms are violated or if required to protect the service or other users. You can stop using CineMax and delete your data at any time by requesting removal through the project's support channels.",
    ],
  },
  {
    id: "changes",
    title: "Changes to these terms",
    body: [
      "We may update these terms as the app evolves. The date at the top reflects the latest revision; continuing to use CineMax after a change means you accept the updated terms.",
    ],
  },
  {
    id: "contact",
    title: "Contact",
    body: [
      "Questions about these terms can be sent through the project's support channels, and we will respond as soon as we can.",
    ],
  },
];

// ─── TermsPage: rules for using CineMax ───────────────────────────────────────

export default function TermsPage() {
  const { t } = useLanguage();

  return (
    <section className="min-h-screen bg-[var(--color-bg)] px-6 pb-24 pt-32 sm:px-8 sm:pt-36 lg:px-24">
      <div className="mx-auto max-w-3xl">
        <p className="text-xs font-black uppercase tracking-[0.3em] text-purple-300">
          {t("Legal")}
        </p>
        <h1 className="page-heading page-heading--blue mt-4">
          {t("Terms of Use")}
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
            {t("Curious what we collect, and why?")}
          </p>
          <Link
            to="/privacy"
            className="shrink-0 rounded-xl bg-purple-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-purple-700"
          >
            {t("Read the Privacy Policy")}
          </Link>
        </div>
      </div>
    </section>
  );
}
