# CineMax

A responsive movie discovery app built with React, Vite, and TMDB. Browse collections, find a movie with live search, and keep favorites and a watchlist ready for your next movie night.

## Features

- **Movie discovery:** trending, upcoming, top-rated, now-playing, and genre collections, with links to browse full collections.
- **Upcoming dates:** the Upcoming page and homepage row include only movies whose TMDB primary release date is after the viewer's current local date. Today's releases and missing or invalid dates are excluded. The Upcoming page shows full localized release dates; dates reflect TMDB metadata rather than availability in a specific country.
- **Independent homepage loading:** each row loads separately, with its own loading state and retry action. Additional genre rows expand on demand.
- **Live search:** search from the navigation or Movies page, preview matching titles, and navigate suggestions with the keyboard.
- **Filters and pagination:** browse by genre, release year, minimum rating, and sort order. Search stays active when filters change; filtered searches combine up to 2,000 results before sorting and pagination. Resetting filters preserves the search query.
- **Movie details:** metadata, directors, cast with character names, related movies, trailers, and a player with selectable sources and retry controls. Related movies load independently with retry and empty states.
- **Saved movies:** Favorites and Watchlist tabs with counts, complete poster grids, removal controls, and friendly empty states.
- **Watchlist organization:** search saved titles, sort by saved date/title/rating, and filter by watched status. Mark movies watched or unwatched without removing them. Status syncs to your account; changing it requires a connection. Existing entries start as unwatched.
- **Account profile:** profile photo, username, email, username editing, and logout. Supports email/password and Google sign-in.
- **Password recovery:** the sign-in dialog offers a translated “Forgot password?” flow using Firebase reset emails and its hosted reset page. It preserves the login email, prevents duplicate submissions, and handles request failures. Email delivery uses your Firebase Authentication email template; browser tests intercept requests and send no real emails.
- **Responsive interface:** light and dark themes, visible card titles and ratings, keyboard focus indicators, and reduced-motion support.
- **12 languages:** a navbar language selector with persistent choice; Khmer text renders in the Kantumruy Pro font. Watchlist controls, cast and related-movie sections, profile collection states, and movie save-button accessibility labels use the selected language. Original movie titles and person names are preserved.
- **On-demand translations:** English needs no translation download. Other languages load when selected and are reused during the session. The current language stays visible during loading; failed downloads preserve the saved preference and offer retry.
- **Donation card:** QR download and copyable payment details in a dialog that fits the viewport.
- **Detailed footer:** explore links, genre shortcuts, TMDB attribution and social buttons. Newsletter signup is unavailable until a subscription service is connected.
- **Legal pages:** privacy policy and terms of use, linked from the footer and included in the sitemap.

## Stack

| Area                  | Technology               |
| --------------------- | ------------------------ |
| UI                    | React 19, Tailwind CSS 4 |
| Routing               | React Router 7           |
| Build tooling         | Vite 7                   |
| Authentication        | Firebase Authentication  |
| Saved movie storage   | Cloud Firestore          |
| Movie data and images | TMDB                     |
| Internationalization  | Custom i18n, 12 locales  |
| Icons                 | Heroicons, React Icons   |
| Code quality          | ESLint, Prettier         |

## Local setup

### 1. Install dependencies

Use **Node.js 22.12 or newer** and npm. The installed Vite version requires Node `^20.19.0 || >=22.12.0`; Node 16 is not supported.

```sh
git clone https://github.com/reaksmey27/CineMax_Movie.git
cd CineMax_Movie
npm ci
```

### 2. Configure the environment

Copy [`.env.example`](.env.example) to `.env`:

```powershell
# PowerShell
Copy-Item .env.example .env
```

```sh
# macOS / Linux
cp .env.example .env
```

Replace the placeholders with your own TMDB and Firebase web-app configuration.

| Variable                            | Required                        | Purpose                                                           |
| ----------------------------------- | ------------------------------- | ----------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`                 | One of the two TMDB credentials | TMDB API key                                                      |
| `VITE_TMDB_READ_ACCESS_TOKEN`       | Alternative to the API key      | TMDB read-access bearer token; takes precedence when both are set |
| `VITE_FIREBASE_API_KEY`             | Yes                             | Firebase web-app API key                                          |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Yes                             | Firebase authentication domain                                    |
| `VITE_FIREBASE_PROJECT_ID`          | Yes                             | Firebase project ID                                               |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Yes                             | Storage bucket from the web-app config                            |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes                             | Messaging sender ID from the web-app config                       |
| `VITE_FIREBASE_APP_ID`              | Yes                             | Firebase web-app ID                                               |
| `VITE_FIREBASE_MEASUREMENT_ID`      | No                              | Optional measurement ID; this app does not initialize Analytics   |
| `VITE_FIREBASE_APP_CHECK_SITE_KEY`  | No                              | reCAPTCHA v3 site key; enables Firebase App Check in the web app  |

Set either `VITE_TMDB_API_KEY` or `VITE_TMDB_READ_ACCESS_TOKEN`; you do not need both. TMDB credentials are available in your TMDB account API settings. Copy the Firebase values from your registered web app in Firebase Project Settings.

The app stops initialization if required Firebase values are missing. There is no fallback Firebase project. Restart Vite after changing `.env`.

`VITE_*` values are included in the browser build. Use only client configuration here, never a Firebase service-account key or other server secret. `.env` is excluded from Git.

### 3. Set up Firebase

In the Firebase project referenced by `.env`:

1. Enable **Email/Password** and **Google** in Authentication's sign-in providers.
2. Add `localhost` and your deployed hostnames to Authentication's authorized domains. Use hostnames without a protocol or path.
3. Create a **Cloud Firestore** database.
4. Configure Firestore rules so signed-in users can access only their own `favorites/{userId}` and `watchlists/{userId}` documents.

For a dedicated project, these minimal owner-only rules match the app's saved movie storage paths:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /watchlists/{userId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == userId;
    }
    match /favorites/{userId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == userId;
    }
    match /notifications/{userId}/history/{notificationId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == userId;
    }
  }
}
```

The owner-only collection rules are also in [`firestore.rules`](firestore.rules), which the local Firestore Emulator uses for tests. If you already have Firestore rules, integrate all three collection rules without replacing rules for your other collections. The repository does not automatically deploy Firebase rules.

#### Protect and monitor the Firebase project

Keep the owner-only Firestore rules above deployed in the Firebase Console. The app does not deploy rules automatically; emulator tests verify that Favorites, Watchlist, and notification history deny access to other users and signed-out clients.

To add App Check for the web app:

1. In Firebase Console, open **App Check**, register the web app with **reCAPTCHA v3**, and add `localhost` and your deployed hostnames to the reCAPTCHA allowed domains.
2. Copy the reCAPTCHA **site key** (not its secret key) into `.env` as `VITE_FIREBASE_APP_CHECK_SITE_KEY`. This is a public browser key; never put the reCAPTCHA secret key in a `VITE_*` variable.
3. Restart the app and check App Check request metrics in Firebase Console. This project initializes the reCAPTCHA provider and refreshes App Check tokens automatically when the site key is configured.
4. Start by monitoring requests in App Check without enforcement. Once legitimate production traffic is consistently verified, enable enforcement for Cloud Firestore in App Check. Test the deployed site after enforcement; invalid or missing App Check tokens will then be rejected. Leave enforcement off until the production key and domains are configured.

For ongoing monitoring, review **Firestore > Usage** for reads, writes, deletes, and storage; **App Check** metrics for valid, invalid, and unverified requests; and **Authentication > Usage** for sign-in activity. Configure Google Cloud budget alerts for cost awareness (budgets notify but do not cap usage), and inspect Firebase/Google Cloud error metrics and application logs when failures occur.

### 4. Start development

```sh
npm run dev
```

Open the local URL printed by Vite. Movie browsing needs TMDB access; sign-in and watchlist syncing also need Firebase access.

## Commands

| Command                | Description                                    |
| ---------------------- | ---------------------------------------------- |
| `npm run dev`          | Start the development server                   |
| `npm run build`        | Create the production build in `dist/`         |
| `npm run preview`      | Serve the production build locally             |
| `npm run lint`         | Run ESLint                                     |
| `npm run format:check` | Check formatting with Prettier                 |
| `npm run format`       | Format project files with Prettier             |
| `npm test`             | Run tests against the local Firestore Emulator |
| `npm run test:ui`      | Run browser-based UI regression tests          |

`npm test` runs the SEO regression tests and Firestore Emulator integration tests for saving/reloading Favorites, Watchlist, and notification history and denying access from another user. It requires Java to run the emulator. The tests use a demo project and do not connect to your live Firebase project. You can run only the SEO tests with `node --test tests/seo.test.js`.

`npm run test:ui` runs the Chromium browser suite: navbar branding and theme, home discovery and genre retry, keyboard movie filters, notification history, the trailer player, and footer links to the legal pages. Install the browser once with `npx playwright install chromium`. The tests start a local Vite server and use mocked movie data and test-only Firebase configuration.

Firestore uses a persistent browser cache when the browser supports it, so signed-in notification changes can queue offline and sync after reconnecting. If persistent browser storage is unavailable, the app falls back to memory cache. Sign out on shared devices because Firestore's local cache is not encrypted.

## Saved data

| Data              | Storage                                          | Behavior                                                                                          |
| ----------------- | ------------------------------------------------ | ------------------------------------------------------------------------------------------------- |
| Favorites         | Firestore, `favorites/{uid}`                     | Account-scoped, with real-time updates while signed in                                            |
| Watchlist         | Firestore, `watchlists/{uid}`                    | Account-scoped, with real-time updates while signed in                                            |
| Notifications     | Firestore, `notifications/{uid}/history/{id}`    | Account-scoped, real-time history while signed in; local history while signed out; latest 50 kept |
| Profile overrides | Browser `localStorage`, `movie_user_profiles`    | Stored per user ID; username updates also attempt to update the Firebase display name             |
| Search history    | Browser `localStorage`, `cinemax-search-history` | Recent searches from the Movies page                                                              |

The profile photo comes from the signed-in account when available; otherwise the UI shows an initial. Email is read-only in the profile editor. Notification history created while signed in syncs between devices; signed-out history stays in this browser and is kept separate from account history. When signed in, the Notifications page offers an optional import of local history; you can also choose to keep it on this device. Only the latest 50 notifications are retained per account. Clearing browser storage removes local notification history, search history, and profile overrides, but does not delete Favorites, Watchlist, or signed-in notification history stored in Firestore.

Favorites saved in browser storage before Firestore syncing was added are not imported automatically. Add them again while signed in if you want them in your account collection.

## Routes

| Route                            | Page                                       |
| -------------------------------- | ------------------------------------------ |
| `/`                              | Homepage                                   |
| `/movies`                        | Search and filtered discovery              |
| `/movies?collection=top-rated`   | Top-rated movies                           |
| `/movies?collection=now-playing` | Now-playing movies                         |
| `/trending`                      | Trending movies                            |
| `/upcoming`                      | Upcoming movies                            |
| `/movie/:id`                     | Movie details and playback                 |
| `/favorites`                     | Saved favorites                            |
| `/watchlist`                     | Account watchlist                          |
| `/notifications`                 | Notification history                       |
| `/profile`                       | Profile and saved collections              |
| `/profile?tab=watchlist`         | Profile with the Watchlist tab selected    |
| `/login`, `/signup`, `/register` | Authentication; `/register` aliases signup |
| `/privacy`                       | Privacy policy                             |
| `/terms`                         | Terms of use                               |

The Movies page supports `q`, `genre`, `year`, `rating`, `sort`, and `page` query parameters. Selecting a discovery filter exits a named collection or active search.

## Internationalization

The UI ships in 12 languages: English, Khmer, Traditional Chinese, Spanish, French, Japanese, Korean, Vietnamese, Indonesian, German, Italian, and Brazilian Portuguese. The language selector is in the navbar; the choice persists in `localStorage` (`cinemax_language`) and sets `document.documentElement.lang`.

English is the source language: translation keys are the English strings themselves, so `src/i18n/locales/en.js` is intentionally empty and any untranslated key falls back to English. Every other locale in [`src/i18n/locales/`](src/i18n/locales) maps those English strings to translations. All locales are registered in [`src/i18n/translations.js`](src/i18n/translations.js).

UI text renders in Plus Jakarta Sans; when the language is Khmer, the page switches to Kantumruy Pro via the `[lang="km"]` rule in `src/index.css`. Both fonts load from Google Fonts in `index.html`.

To add a language:

1. Create `src/i18n/locales/<code>.js` by copying the key set from an existing locale (for example `de.js`) and translating the values, keeping `{placeholders}` intact.
2. Add a flag image under `src/assets/flags/`.
3. Register it in `src/i18n/translations.js`: import the locale and flag, add a `LANGUAGES` entry (code, label, flag), and add the locale to the `translations` map.

## Project structure

```text
src/
  assets/        Flag, icon, and image assets
  components/
    core/         Error boundary and route title/SEO manager
    layout/       Navigation, global search, footer
    ui/           Shared movie cards, grids, loaders, donation dialog
    auth/         Google sign-in button
  config/         Routes, page metadata, and movie filter options
  context/        Authentication, favorites, watchlist, notifications
  firebase/       Firebase setup and watchlist persistence
  hooks/
    auth/         Authentication forms and profile editing
    movies/       Discovery, collections, details, player state
  i18n/           Language registry and per-language locale files
  pages/          Route pages: home, movies, profile, saved lists, notifications, auth, legal, 404
  services/       TMDB requests, caching, data formatting
  utils/          Theme and authentication redirect helpers
  index.css       Shared styles, theme variables, and animations
public/           Static assets and crawler files
```

## Deployment

The repository includes [`vercel.json`](vercel.json) with route-specific HTML rewrites and cache headers for static assets. The Vite build generates these HTML files in `dist/seo/`.

For Vercel, configure:

- **Framework:** Vite
- **Build command:** `npm run build`
- **Output directory:** `dist`
- **Environment variables:** the same configured `VITE_*` values used locally

Add the deployed hostname to Firebase Authentication's authorized domains. Rebuild after changing environment variables because Vite embeds them at build time. For another static host, serve `dist/` and configure unknown application routes to fall back to `index.html`.

After deployment, verify direct navigation to `/movie/:id` and `/profile`, both sign-in methods, profile editing, watchlist persistence, and mobile layouts.

## Troubleshooting

| Problem                                   | Check                                                                                            |
| ----------------------------------------- | ------------------------------------------------------------------------------------------------ |
| Vite reports an unsupported Node version  | Use a Node version matching the requirement above, then run `npm ci`                             |
| App reports missing Firebase variables    | Fill all six required Firebase values and restart or rebuild                                     |
| Movie rows fail to load                   | Verify the TMDB credential and network access; retry the affected row                            |
| `auth/unauthorized-domain`                | Add the exact hostname to Firebase Authentication's authorized domains                           |
| Google or password sign-in is unavailable | Enable the corresponding provider in the configured Firebase project                             |
| Watchlist cannot sync or save             | Confirm sign-in, project configuration, Firestore database creation, and owner-only access rules |
| Favorites or watchlist won't sync         | Sign in and confirm the Firestore owner-only rules are configured for both saved collections     |
| Refreshing a nested route returns 404     | Configure the host's SPA fallback to `index.html`                                                |
| Movie metadata loads but playback fails   | Player sources are separate from TMDB; try the existing reload or alternate-source controls      |

## Data and customization

### Password reset on the website

Deploy the `/reset-password` route before changing Firebase email settings. The page verifies the email action code with Firebase, confirms the new password, and handles expired links without storing passwords or codes in browser storage. Firebase still controls code expiry and password policy.

In **Firebase Console → Authentication → Templates → Password reset → Customize action URL**, set `https://smey-dev.site/reset-password` and save. Ensure `smey-dev.site` is listed under Authentication's authorized domains. Keep the template's generated link placeholder so Firebase supplies `mode` and `oobCode`. Request a fresh reset email after saving; existing emails retain their original links. A continue URL alone does not replace Firebase's reset form.

The Vercel configuration serves the route directly with no-store and no-referrer headers. No Firestore rules or collections change. Other supported email action modes offer a link to the configured Firebase project's built-in handler.

Reference: https://firebase.google.com/docs/auth/custom-email-handler

### Watch history and continue watching

Signed-in users automatically save a movie when opening its player. Home shows unfinished movies, and `/history` shows the latest 50 entries with completion and removal controls. Open a saved movie and choose **Continue watching** to restore its last server. Server 4 supports timestamp resume using the provider's documented `PLAYER_EVENT` messages and `startAt` parameter; other servers save the title for reopening. Native video sources also save their playback position. Progress saves at most every 15 seconds during playback and immediately on pause, seek, completion, and page visibility changes. Abrupt browser shutdown can lose the last unsaved seconds. Actual resume depends on the external player delivering its documented events.

Data is stored at `watchHistory/{uid}/movies/{movieId}`. **Deploy the updated `firestore.rules` to the intended Firebase project before deploying this website update** (`firebase deploy --only firestore:rules --project YOUR_PROJECT_ID`). Redeploy the Vercel website as well. No new environment variables are needed. Rules restrict history reads and writes to the account owner. The latest 50 entries are displayed; older entries are not automatically deleted.

Provider reference: [VidSrc player documentation](https://vidsrc.sh/vidsrc/docs/). Browser tests use simulated player events and storage; Firestore emulator tests separately verify persistence and account access rules.

Movie metadata and artwork are fetched through [`tmdbService.js`](src/services/tmdbService.js). Playback sources are configured separately in [`useMovieDetail.js`](src/hooks/movies/useMovieDetail.js); TMDB does not supply the embedded video streams.

Donation account details and the QR image are configured in [`DonationModal.jsx`](src/components/ui/DonationModal.jsx) and `src/assets/images/donation-qr.png`. Update both together when customizing the app. Review `public/robots.txt` and `public/sitemap.xml` for your deployment domain.

## SEO

- Canonical URLs, Open Graph tags, Twitter cards, and page-specific descriptions are managed in `src/config/routeMeta.js`.
- `SITE_URL` is the canonical production origin. Change it when moving domains; rebuild to regenerate crawler files and metadata.
- The Vite SEO plugin in `scripts/seo-build.js` generates static metadata for known routes, plus `robots.txt` and `sitemap.xml`. Vercel rewrites serve those HTML files.
- Public collections and the privacy and terms pages are indexable. Account pages, saved lists, search/filter variants, and unknown routes receive `noindex`. They remain crawlable so crawlers can read that directive.
- Movie pages receive titles, descriptions, artwork, and Movie JSON-LD from TMDB after JavaScript loads. The homepage includes WebSite JSON-LD. Pagination uses ordinary links.
- This remains a client-rendered app: static metadata generation is not full prerendering. Movie-specific social previews require a crawler that executes JavaScript; server rendering would be needed for reliable movie previews in other crawlers. Unknown routes display a not-found page with `noindex`, but the static-host fallback does not guarantee an HTTP 404 response.

Run the metadata regression checks with `node --test tests/seo.test.js`. After deployment, inspect the rendered URLs in Search Console and submit `/sitemap.xml`; local checks cannot guarantee indexing or rankings.
