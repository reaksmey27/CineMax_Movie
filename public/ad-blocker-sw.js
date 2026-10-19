// ============================================================
// CineMax Ad Blocker Service Worker
// Place this file in: public/ad-blocker-sw.js
// ============================================================

const BAD_DOMAINS = [
  // Known ad networks
  "popads.net",
  "popcash.net",
  "trafficjunky.com",
  "exoclick.com",
  "juicyads.com",
  "plugrush.com",
  "adsterra.com",
  "hilltopads.net",
  "propellerads.com",
  "clickadu.com",
  "adcash.com",
  "adskeeper.com",
  "adspyglass.com",
  "bidvertiser.com",
  "revcontent.com",
  "outbrain.com",
  "taboola.com",
  "mgid.com",
  "contentad.net",
  "adblade.com",

  // Confirmed vidsrc ad redirectors
  "proceedflow.com",
  "go2speed.org",
  "clicksfly.com",
  "safelink.now",
  "shorte.st",
  "adf.ly",
  "linkvertise.com",
  "direct-link.net",

  // 18+ ad networks
  "traffichaus.com",
  "ero-advertising.com",
  "plugrush.com",
  "juicyads.com",
  "adxpansion.com",
  "etargetnet.com",
  "AdultAdWorld.com",
  "adultforce.com",

  // Crypto/malware ad networks
  "coinzillatag.com",
  "coinhive.com",
  "cryptolinks.com",
  "miner.pr0gramm.com",
];

const BAD_URL_PATTERNS = [
  /\/click\?key=/i,
  /\/go\.php/i,
  /\/click\.php/i,
  /\/redirect\.php/i,
  /\/track\.php/i,
  /\/redir\./i,
  /zoneid=/i,
  /creative_id=/i,
  /fcost=/i,
  /\/popup\//i,
  /\/popunder\//i,
  /adserv/i,
  /\/serve\/ad/i,
  /\/banner\//i,
];

const isBadRequest = (url) => {
  try {
    const parsed = new URL(url);
    const hostname = parsed.hostname.toLowerCase();

    // Check bad domains
    if (BAD_DOMAINS.some((d) => hostname === d || hostname.endsWith("." + d))) {
      return true;
    }

    // Check bad URL patterns
    const full = url.toLowerCase();
    if (BAD_URL_PATTERNS.some((pattern) => pattern.test(full))) {
      return true;
    }

    return false;
  } catch {
    return false;
  }
};

self.addEventListener("install", (event) => {
  console.log("[AdBlocker SW] Installed");
  event.waitUntil(self.skipWaiting());
});

self.addEventListener("activate", (event) => {
  console.log("[AdBlocker SW] Activated");
  event.waitUntil(self.clients.claim());
});

self.addEventListener("fetch", (event) => {
  const url = event.request.url;

  if (isBadRequest(url)) {
    console.warn("[AdBlocker SW] Blocked:", url);
    // Return empty response instead of letting the request through
    event.respondWith(
      new Response("", {
        status: 200,
        statusText: "Blocked by CineMax AdBlocker",
      }),
    );
    return;
  }

  // All other requests pass through normally
  event.respondWith(fetch(event.request));
});
