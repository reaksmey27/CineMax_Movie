export default function MovieDetailBackdrop({ movie }) {
  return (
    <div className="absolute inset-0 h-[50vh] sm:h-[70vh] w-full">
      <img
        src={movie.backdropImage || movie.image}
        alt=""
        className="h-full w-full object-cover"
        style={{ opacity: "var(--movie-backdrop-opacity)" }}
        decoding="async"
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--movie-hero-gradient-vertical)" }}
      />
      <div
        className="absolute inset-0"
        style={{ background: "var(--movie-hero-gradient-horizontal)" }}
      />
    </div>
  );
}
