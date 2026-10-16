import { Link } from "react-router-dom";
export default function NotFoundPage() {
  return (
    <section className="flex min-h-[75vh] flex-col items-center justify-center gap-5 px-6 pb-20 pt-36 text-center">
      <p className="text-sm font-semibold text-[var(--color-text-muted)]">
        404
      </p>
      <h1 className="text-3xl font-bold">Page not found</h1>
      <p className="text-[var(--color-text-muted)]">
        This page is unavailable. Find your next movie in the catalog.
      </p>
      <Link
        to="/movies"
        className="rounded-xl bg-purple-600 px-6 py-3 font-semibold text-white hover:bg-purple-500"
      >
        Explore Movies
      </Link>
    </section>
  );
}
