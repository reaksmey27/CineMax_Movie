# CineMax

A responsive movie discovery app built with React, Vite, and TMDB. Browse collections, find a movie with live search, and keep favorites and a watchlist ready for your next movie night.

## Features

- **Movie discovery:** trending, upcoming, top-rated, now-playing, and genre collections, with links to browse full collections.
- **Independent homepage loading:** each row loads separately, with its own loading state and retry action. Additional genre rows expand on demand.
- **Live search:** search from the navigation or Movies page, preview matching titles, and navigate suggestions with the keyboard.
- **Filters and pagination:** browse by genre, release year, minimum rating, and sort order.
- **Movie details:** metadata, trailers, and a player with selectable sources and retry controls.
- **Saved movies:** Favorites and Watchlist tabs with counts, complete poster grids, removal controls, and friendly empty states.
- **Account profile:** profile photo, username, email, username editing, and logout. Supports email/password and Google sign-in.
- **Responsive interface:** light and dark themes, visible card titles and ratings, keyboard focus indicators, and reduced-motion support.
- **Donation card:** QR download and copyable payment details in a dialog that fits the viewport.

## Stack

| Area                  | Technology               |
| --------------------- | ------------------------ |
| UI                    | React 19, Tailwind CSS 4 |
| Routing               | React Router 7           |
| Build tooling         | Vite 7                   |
| Authentication        | Firebase Authentication  |
| Watchlist storage     | Cloud Firestore          |
| Movie data and images | TMDB                     |
| Icons                 | Heroicons, React Icons   |
| Code quality          | ESLint, Prettier         |

## Local setup

### 1. Install dependencies

Use **Node.js 22.12 or newer** and npm. The installed Vite version requires Node `^20.19.0 || >=22.12.0`; Node 16 is not supported.

```sh
git clone https://github.com/reaksmey27/Movie-Website.git
cd Movie-Website
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

| Variable                            | Required                   | Purpose                                                           |
| ----------------------------------- | -------------------------- | ----------------------------------------------------------------- |
| `VITE_TMDB_API_KEY`                 | One TMDB credential        | TMDB API key                                                      |
| `VITE_TMDB_READ_ACCESS_TOKEN`       | Alternative to the API key | TMDB read-access bearer token; takes precedence when both are set |
| `VITE_FIREBASE_API_KEY`             | Yes                        | Firebase web-app API key                                          |
| `VITE_FIREBASE_AUTH_DOMAIN`         | Yes                        | Firebase authentication domain                                    |
| `VITE_FIREBASE_PROJECT_ID`          | Yes                        | Firebase project ID                                               |
| `VITE_FIREBASE_STORAGE_BUCKET`      | Yes                        | Storage bucket from the web-app config                            |
| `VITE_FIREBASE_MESSAGING_SENDER_ID` | Yes                        | Messaging sender ID from the web-app config                       |
| `VITE_FIREBASE_APP_ID`              | Yes                        | Firebase web-app ID                                               |
| `VITE_FIREBASE_MEASUREMENT_ID`      | No                         | Optional measurement ID; this app does not initialize Analytics   |

TMDB credentials are available in your TMDB account API settings. Copy the Firebase values from your registered web app in Firebase Project Settings.

The app stops initialization if required Firebase values are missing. There is no fallback Firebase project. Restart Vite after changing `.env`.

`VITE_*` values are included in the browser build. Use only client configuration here, never a Firebase service-account key or other server secret. `.env` is excluded from Git.

### 3. Set up Firebase

In the Firebase project referenced by `.env`:

1. Enable **Email/Password** and **Google** in Authentication's sign-in providers.
2. Add `localhost` and your deployed hostnames to Authentication's authorized domains. Use hostnames without a protocol or path.
3. Create a **Cloud Firestore** database.
4. Configure Firestore rules so signed-in users can access only their own `watchlists/{userId}` document.

For a dedicated project, this minimal owner-only rule matches the app's watchlist storage path:

```text
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /watchlists/{userId} {
      allow read, write: if request.auth != null
                        && request.auth.uid == userId;
    }
  }
}
```

If you already have Firestore rules, integrate the watchlist rule without replacing rules for your other collections. The repository does not automatically deploy Firebase rules.

### 4. Start development

```sh
npm run dev
```

Open the local URL printed by Vite. Movie browsing needs TMDB access; sign-in and watchlist syncing also need Firebase access.

## Commands

| Command                | Description                            |
| ---------------------- | -------------------------------------- |
| `npm run dev`          | Start the development server           |
| `npm run build`        | Create the production build in `dist/` |
| `npm run preview`      | Serve the production build locally     |
| `npm run lint`         | Run ESLint                             |
| `npm run format:check` | Check formatting with Prettier         |
| `npm run format`       | Format project files with Prettier     |

There is currently no automated test script in `package.json`. Build and lint checks do not verify live sign-in, Firestore access, or playback.

## Saved data

| Data              | Storage                                          | Behavior                                                                                |
| ----------------- | ------------------------------------------------ | --------------------------------------------------------------------------------------- |
| Favorites         | Browser `localStorage`, `movie_favorites`        | Shared by users of the same browser origin; not account-scoped or synced across devices |
| Watchlist         | Firestore, `watchlists/{uid}`                    | Account-scoped, with real-time updates while signed in                                  |
| Profile overrides | Browser `localStorage`, `movie_user_profiles`    | Stored per user ID; username updates also attempt to update the Firebase display name   |
| Search history    | Browser `localStorage`, `cinemax-search-history` | Recent searches from the Movies page                                                    |

The profile photo comes from the signed-in account when available; otherwise the UI shows an initial. Email is read-only in the profile editor. Clearing browser storage removes local favorites, history, and profile overrides, but does not delete the Firestore watchlist.

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
| `/profile`                       | Profile and saved collections              |
| `/profile?tab=watchlist`         | Profile with the Watchlist tab selected    |
| `/login`, `/signup`, `/register` | Authentication; `/register` aliases signup |

The Movies page supports `q`, `genre`, `year`, `rating`, `sort`, and `page` query parameters. Selecting a discovery filter exits a named collection or active search.

## Project structure

```text
src/
  components/
    layout/       Navigation, global search, footer
    ui/           Shared movie cards, grids, loaders, donation dialog
  config/         Routes and page metadata
  context/        Authentication, favorites, watchlist, notifications
  firebase/       Firebase setup and watchlist persistence
  hooks/
    auth/         Authentication forms and profile editing
    movies/       Discovery, collections, details, player state
  pages/          Home, movies, profile, saved lists, authentication
  services/       TMDB requests, caching, data formatting
  utils/          Theme and authentication redirect helpers
  index.css       Shared styles and theme variables
public/           Static assets and crawler files
```

## Deployment

The repository includes [`vercel.json`](vercel.json) with an SPA rewrite to `index.html` and cache headers for static assets.

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
| Favorites differ between browsers         | Favorites are local to each browser origin                                                       |
| Refreshing a nested route returns 404     | Configure the host's SPA fallback to `index.html`                                                |
| Movie metadata loads but playback fails   | Player sources are separate from TMDB; try the existing reload or alternate-source controls      |

## Data and customization

Movie metadata and artwork are fetched through [`tmdbService.js`](src/services/tmdbService.js). Playback sources are configured separately in [`useMovieDetail.js`](src/hooks/movies/useMovieDetail.js); TMDB does not supply the embedded video streams.

Donation account details and the QR image are configured in [`DonationModal.jsx`](src/components/ui/DonationModal.jsx) and `src/assets/images/donation-qr.png`. Update both together when customizing the app. Review `public/robots.txt` and `public/sitemap.xml` for your deployment domain.
