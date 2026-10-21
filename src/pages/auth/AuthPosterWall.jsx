import { useLanguage } from "../../context/LanguageContext";

// ─── AuthPosterWall: decorative poster grid beside the auth form ──────────────

const AuthPosterWall = ({ movieCards }) => {
  const { t } = useLanguage();

  return (
    <section className="relative hidden overflow-hidden p-2 md:block">
      <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.04),rgba(0,0,0,0.22))]" />
      <div className="grid h-full grid-cols-2 grid-rows-3 gap-2">
        {movieCards.map((poster, index) => (
          <article
            key={poster.title}
            className={`group relative overflow-hidden rounded-[1.35rem] border border-white/10 bg-[#0f1014] ${poster.rotation} shadow-[0_16px_30px_rgba(0,0,0,0.35)] transition duration-300 hover:-translate-y-1 hover:scale-[1.02] ${
              index === 0 ? "col-span-1 row-span-2" : ""
            } ${index === 1 ? "mt-2" : ""} ${index === 2 ? "mt-8" : ""} ${
              index === 3 ? "-mt-1" : ""
            } ${index === 4 ? "col-span-1" : ""} ${
              index === 5 ? "col-span-2" : ""
            } ${index === 0 ? "rounded-bl-[3.5rem]" : ""} ${
              index === 5 ? "rounded-br-[3.5rem]" : ""
            }`}
          >
            {poster.image ? (
              <img
                src={poster.image}
                alt={poster.title}
                className="absolute inset-0 h-full w-full object-cover scale-[1.12] transition duration-500 group-hover:scale-[1.18]"
                loading={index === 0 ? "eager" : "lazy"}
                decoding="async"
                style={{
                  objectPosition: poster.imagePosition || "center center",
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-[linear-gradient(135deg,rgba(255,255,255,0.08),rgba(0,0,0,0.3))]" />
            )}
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.12),transparent_35%),linear-gradient(180deg,rgba(255,255,255,0.02),rgba(0,0,0,0.62))]" />
            <div className="absolute inset-x-0 top-0 h-[4.5rem] bg-[linear-gradient(180deg,rgba(255,255,255,0.2),transparent)] opacity-75" />
            <div className="absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(0,0,0,0.82))]" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white drop-shadow-[0_3px_12px_rgba(0,0,0,0.6)]">
              <p className="text-[8px] font-black uppercase tracking-[0.26em] text-white/70">
                {poster.subtitle}
              </p>
              <h2 className="mt-1.5 text-xl font-black uppercase tracking-[-0.05em] sm:text-2xl">
                {poster.title}
              </h2>
            </div>
          </article>
        ))}
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-28 bg-[linear-gradient(180deg,transparent,rgba(44,44,44,0.95))]" />
      <div className="absolute left-4 top-4 rounded-full border border-purple-500/30 bg-black/40 p-1.5 backdrop-blur sm:p-2">
        <img
          src="/images/logo.svg"
          alt={t("CineMax Logo")}
          className="h-6 w-auto sm:h-7"
          decoding="async"
        />
      </div>
    </section>
  );
};

export default AuthPosterWall;
