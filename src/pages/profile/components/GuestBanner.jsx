import { Link } from "react-router-dom";
import { PlayIcon, SparklesIcon } from "@heroicons/react/24/solid";
import LoginButton from "../../../components/auth/LoginButton";

// ─── Data: feature pills & cards (emptied) ────────────────────────────────────

const FEATURE_PILLS = [];

// Keep the sign-in info, but remove the large marketing text for logged-out state.
const FEATURE_CARDS = [];

// ─── GuestBanner: logged-out profile pitch ────────────────────────────────────

const GuestBanner = () => (
  <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-slate-950 px-4 pb-20 pt-28 sm:px-8 sm:pb-24 sm:pt-32">
    <div className="absolute -left-30 top-24 -z-10 h-105 w-105 rounded-full bg-purple-600/15 blur-[120px]" />
    <div className="absolute -bottom-30 -right-10 -z-10 h-105 w-105 rounded-full bg-blue-500/15 blur-[120px]" />

    <div className="w-full max-w-4xl overflow-hidden rounded-[2.5rem] border border-white/10 bg-white/5 shadow-2xl backdrop-blur-2xl">
      <div className="grid gap-0 lg:grid-cols-[1.1fr_0.9fr]">
        {/* ── Left: pitch ── */}
        <div className="border-b border-white/10 p-6 sm:p-8 lg:border-b-0 lg:border-r lg:p-10">
          <div className="inline-flex items-center gap-2 rounded-full border border-white/10 bg-white/5 px-4 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-purple-300">
            <SparklesIcon className="h-4 w-4" />
          </div>
          <h1 className="mt-6 text-4xl font-black uppercase tracking-tighter text-white sm:text-5xl">
            Build a profile that feels like your taste.
          </h1>
          <p className="mt-5 max-w-xl text-sm font-medium leading-7 text-gray-300">
            Create an account, sign in, or use Google to unlock your avatar,
            keep favorites close, and shape a movie identity that stays ready
            for every visit.
          </p>
          <div className="mt-8 flex flex-wrap gap-3" />
        </div>

        {/* ── Right: sign-in ── */}
        <div className="p-6 sm:p-8 lg:p-10">
          <h2 className="text-2xl font-black uppercase tracking-tighter text-white">
            Unlock your account
          </h2>
          <p className="mt-3 text-sm font-medium text-gray-400">
            One quick sign-in gives you access to synced identity, personalized
            details, and a smoother favorites experience.
          </p>
          <div className="mt-8 space-y-4">
            {FEATURE_CARDS.map(({ title, body }) => (
              <div
                key={title}
                className="rounded-[1.75rem] border border-white/10 bg-black/30 p-5"
              >
                <p className="text-sm font-bold text-white">{title}</p>
                <p className="mt-2 text-sm text-gray-400">{body}</p>
              </div>
            ))}
          </div>
          <div className="mt-8 space-y-4">
            <LoginButton />
            <Link
              to="/movies"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/10 bg-white/5 px-6 py-4 text-[10px] font-black uppercase tracking-[0.25em] text-white transition-all hover:bg-white/10"
            >
              <PlayIcon className="h-4 w-4" />
              Browse Movies First
            </Link>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export default GuestBanner;
