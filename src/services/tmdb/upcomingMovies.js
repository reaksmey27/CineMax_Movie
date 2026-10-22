const calendarDate = (date) =>
  `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;

export function upcomingDateBoundary(now = new Date()) {
  const tomorrow = new Date(now);
  tomorrow.setDate(tomorrow.getDate() + 1);
  return { today: calendarDate(now), tomorrow: calendarDate(tomorrow) };
}

export function filterUpcomingMovies(movies, today) {
  return movies.filter((movie) => {
    const date = movie.release_date;
    if (
      typeof date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(date) ||
      date <= today
    )
      return false;
    const parsed = new Date(`${date}T00:00:00Z`);
    return (
      !Number.isNaN(parsed.getTime()) &&
      parsed.toISOString().slice(0, 10) === date
    );
  });
}
