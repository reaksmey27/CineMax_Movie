import flagUK from "../assets/flags/uk.png";
import flagKH from "../assets/flags/kh.png";
import flagCN from "../assets/flags/cn.png";
import flagES from "../assets/flags/es.png";
import flagFR from "../assets/flags/fr.png";
import flagJP from "../assets/flags/jp.png";
import flagKR from "../assets/flags/kr.png";
import flagVN from "../assets/flags/vn.png";
import flagID from "../assets/flags/id.png";
import flagDE from "../assets/flags/de.png";
import flagIT from "../assets/flags/it.png";
import flagBR from "../assets/flags/br.png";

// ─── LANGUAGES: language picker options ───────────────────────────────────────

export const LANGUAGES = [
  { code: "en", label: "English", flag: flagUK },
  { code: "km", label: "ខ្មែរ", flag: flagKH },
  { code: "zh-TW", label: "繁體中文", flag: flagCN },
  { code: "es", label: "Español", flag: flagES },
  { code: "fr", label: "Français", flag: flagFR },
  { code: "ja", label: "日本語", flag: flagJP },
  { code: "ko", label: "한국어", flag: flagKR },
  { code: "vi", label: "Tiếng Việt", flag: flagVN },
  { code: "id", label: "Bahasa Indonesia", flag: flagID },
  { code: "de", label: "Deutsch", flag: flagDE },
  { code: "it", label: "Italiano", flag: flagIT },
  { code: "pt-BR", label: "Português (BR)", flag: flagBR },
];

// ─── Translations: locale message maps ────────────────────────────────────────

export { loadLocale } from "./localeLoader";

// ─── translate: resolve key & fill placeholders ───────────────────────────────

export const translate = (messages, key, values = {}) => {
  const message = messages[key] || key;
  return message.replace(/\{(\w+)\}/g, (match, name) =>
    Object.hasOwn(values, name) ? String(values[name]) : match,
  );
};
