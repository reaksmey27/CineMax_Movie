// Block bad popup/redirect ads from iframe
const BAD_URL_KEYWORDS = [
  "porn",
  "xxx",
  "adult",
  "sex",
  "nude",
  "naked",
  "onlyfans",
  "cam4",
  "chaturbate",
  "xvideos",
  "xhamster",
  "redtube",
  "brazzers",
  "escort",
  "dating18",
  "hookup",
  "nsfw",
  "casino",
  "poker",
  "betting",
  "slots",
  "gambling",
  "wager",
  "popads",
  "popcash",
  "trafficjunky",
  "exoclick",
  "juicyads",
  "adsterra",
  "hilltopads",
  "propellerads",
  "clickadu",
  "adcash",
  "proceedflow",
  "go.php",
  "click.php",
  "redirect.php",
  "track.php",
  "adf.ly",
  "shorte.st",
];

// ─── Guards: block ad popups & focus theft ────────────────────────────────────

const isBadUrl = (url) => {
  try {
    const lower = url.toLowerCase();
    return BAD_URL_KEYWORDS.some((kw) => lower.includes(kw));
  } catch {
    return false;
  }
};

export const patchWindowOpen = () => {
  if (window.__adBlockPatched) return;
  window.__adBlockPatched = true;
  const _open = window.open.bind(window);
  window.open = (url = "", ...args) => {
    if (!url || isBadUrl(String(url))) {
      console.warn("[AdBlock] Blocked popup:", url);
      return null;
    }
    return _open(url, ...args);
  };
};

export const blockFocusRedirect = () => {
  const handler = () => {
    setTimeout(() => {
      if (document.activeElement?.tagName === "IFRAME") return;
      window.focus();
    }, 50);
  };
  window.addEventListener("blur", handler);
  return () => window.removeEventListener("blur", handler);
};
