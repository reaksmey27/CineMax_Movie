import { SparklesIcon } from "@heroicons/react/24/solid";

// ─── ProBanner: signed-in profile banner ──────────────────────────────────────

const ProBanner = ({ user }) => {
  return (
    <section className="rounded-[2rem] border border-white/10 bg-white/5 px-5 py-6 shadow-lg backdrop-blur-sm sm:px-8 sm:py-8">
      <div className="max-w-3xl space-y-4">
        <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/10 px-4 py-2 text-[10px] font-semibold uppercase tracking-[0.28em] text-slate-200">
          <SparklesIcon className="h-4 w-4" />
          Profile
        </div>
        <div>
          <h1 className="text-3xl font-semibold tracking-tight text-white sm:text-4xl">
            {user?.name}
          </h1>
          <p className="mt-2 text-sm leading-6 text-gray-400">
            Keep your account details, saved favorites, and viewing identity in
            one calm place.
          </p>
        </div>
      </div>
    </section>
  );
};

export default ProBanner;
