export function movieYearOptions(
  selectedYear,
  currentYear = new Date().getFullYear(),
) {
  const years = Array.from({ length: currentYear + 5 - 1870 + 1 }, (_, index) =>
    String(currentYear + 5 - index),
  );
  // Keep older shared URLs representable even outside the default range.
  if (/^\d{4}$/.test(selectedYear) && !years.includes(selectedYear))
    years.push(selectedYear);
  return years
    .sort((a, b) => Number(b) - Number(a))
    .map((value) => ({ value, label: value }));
}
