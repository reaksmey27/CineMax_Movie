const loaders = {
  en: () => Promise.resolve({ default: {} }),
  km: () => import("./locales/km.js"),
  "zh-TW": () => import("./locales/zh-TW.js"),
  es: () => import("./locales/es.js"),
  fr: () => import("./locales/fr.js"),
  ja: () => import("./locales/ja.js"),
  ko: () => import("./locales/ko.js"),
  vi: () => import("./locales/vi.js"),
  id: () => import("./locales/id.js"),
  de: () => import("./locales/de.js"),
  it: () => import("./locales/it.js"),
  "pt-BR": () => import("./locales/pt-BR.js"),
};
const pending = new Map();

export function loadLocale(language) {
  if (!Object.hasOwn(loaders, language))
    return Promise.reject(new Error("Unsupported language"));
  if (!pending.has(language)) {
    pending.set(
      language,
      loaders[language]()
        .then((module) => module.default)
        .catch((error) => {
          pending.delete(language);
          throw error;
        }),
    );
  }
  return pending.get(language);
}
