export default function HeroSkeleton() {
  return (
    <section className="relative flex min-h-svh w-full items-end overflow-hidden bg-black pb-24 pt-28 sm:items-center sm:pb-28 sm:pt-36">
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(168,85,247,0.2),transparent_30%),radial-gradient(circle_at_bottom_left,rgba(59,130,246,0.18),transparent_28%)]" />
      <div className="absolute inset-0 bg-linear-to-t from-slate-950 via-slate-950/40 to-transparent" />

      <div className="relative z-10 mx-auto w-full max-w-[1600px] px-4 pb-10 sm:px-6 sm:pb-0 lg:px-24 xl:px-40">
        <div className="space-y-4 sm:space-y-6">
          <div className="space-y-3">
            <span className="block h-11 w-3/4 max-w-3xl rounded-2xl bg-slate-200/10 skeleton-shimmer sm:h-16 lg:h-20" />
            <span className="block h-6 w-2/3 max-w-2xl rounded-2xl bg-slate-200/10 skeleton-shimmer sm:h-10 lg:h-12" />
          </div>

          <div className="flex flex-wrap items-center gap-2.5 sm:gap-4">
            <span className="h-6 w-22 rounded-lg bg-slate-200/10 skeleton-shimmer" />
            <span className="h-6 w-18 rounded-lg bg-slate-200/10 skeleton-shimmer" />
            <span className="h-6 w-20 rounded-lg bg-slate-200/10 skeleton-shimmer" />
          </div>

          <div className="max-w-2xl space-y-3">
            <span className="block h-4 w-full rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
            <span className="block h-4 w-[92%] rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
            <span className="block h-4 w-[78%] rounded-full bg-slate-200/10 skeleton-shimmer sm:h-5" />
          </div>

          <div className="flex flex-col items-stretch gap-4 sm:flex-row sm:flex-wrap sm:items-center sm:gap-4">
            <span className="block min-h-14 w-full rounded-2xl bg-slate-200/10 skeleton-shimmer sm:w-56" />
            <div className="flex w-full flex-wrap gap-3 sm:w-auto sm:flex-nowrap sm:gap-4">
              <span className="block min-h-14 flex-1 rounded-2xl bg-slate-200/10 skeleton-shimmer sm:w-44 sm:flex-none" />
              <span className="block min-h-14 flex-1 rounded-2xl bg-slate-200/10 skeleton-shimmer sm:w-44 sm:flex-none" />
            </div>
          </div>
        </div>
      </div>

      <div className="absolute bottom-5 left-1/2 flex -translate-x-1/2 items-center gap-3 sm:bottom-12 sm:gap-4">
        <span className="h-2 w-10 rounded-full bg-slate-200/10 skeleton-shimmer sm:w-14" />
        <span className="h-2 w-3 rounded-full bg-slate-200/10 skeleton-shimmer" />
        <span className="h-2 w-3 rounded-full bg-slate-200/10 skeleton-shimmer" />
        <span className="h-2 w-3 rounded-full bg-slate-200/10 skeleton-shimmer" />
      </div>
    </section>
  );
}
