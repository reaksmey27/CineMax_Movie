// Countries offered in the filter. Thailand is intentionally omitted from this
// menu; unfiltered movie listings and searches still include Thai movies.
export const MOVIE_COUNTRIES = [
  "KH",
  "KR",
  "JP",
  "CN",
  "HK",
  "TW",
  "VN",
  "LA",
  "ID",
  "MY",
  "SG",
  "PH",
  "IN",
  "US",
  "GB",
  "CA",
  "AU",
  "FR",
  "DE",
  "IT",
  "ES",
  "BR",
  "MX",
];

export function movieCountryName(country, language = "en") {
  try {
    return (
      new Intl.DisplayNames([language], { type: "region" }).of(country) ||
      country
    );
  } catch {
    return country;
  }
}
