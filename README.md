# Movie Website

A React-based movie website powered by TMDB API.

## Setup

### Prerequisites

- Node.js (v16 or higher)
- npm or yarn

### Installation

1. Clone the repository
2. Install dependencies:

   ```bash
   npm install
   ```

3. **Configure environment variables:**

   Create a `.env` file from `.env.example` and fill in the values.

   Required values:
   - `VITE_TMDB_API_KEY` or `VITE_TMDB_READ_ACCESS_TOKEN`: get your TMDB credential from [TMDB](https://www.themoviedb.org/settings/api)
   - `VITE_FIREBASE_*`: create a Firebase web app and copy its client config from Project Settings

4. **Authorize your app domain in Firebase Authentication:**

   If Google sign-in shows `auth/unauthorized-domain`, add the exact host serving your app in:

   `Firebase Console -> Authentication -> Settings -> Authorized domains`

   Common examples:
   - `localhost`
   - your deployed domain, such as `movie-website.vercel.app`
   - your custom domain, such as `movies.example.com`

5. Start the development server:
   ```bash
   npm run dev
   ```

## Deploying To Vercel

This app is a Vite single-page app that uses `react-router-dom`, so Vercel needs a rewrite rule for client-side routes. This repo includes that rule in `vercel.json`.

Vercel also provides its CDN automatically for deployed projects and custom domains. This repo now adds explicit cache headers in `vercel.json` so the CDN can cache built assets more effectively:

- `/assets/*` is cached for 1 year with `immutable` because Vite fingerprints those files
- `/images/*` and `/favicon.ico` get shorter CDN caching to stay easy to refresh

Before you redeploy, make sure these settings are in place:

1.  In Vercel, open your project settings and add the same `VITE_*` variables from your local `.env`:

- `VITE_TMDB_API_KEY` or `VITE_TMDB_READ_ACCESS_TOKEN`
- `VITE_FIREBASE_API_KEY`
- `VITE_FIREBASE_AUTH_DOMAIN`
- `VITE_FIREBASE_PROJECT_ID`
- `VITE_FIREBASE_STORAGE_BUCKET`
- `VITE_FIREBASE_MESSAGING_SENDER_ID`
- `VITE_FIREBASE_APP_ID`
- `VITE_FIREBASE_MEASUREMENT_ID`

2. In Firebase Console, open the Firebase project used by those variables and add every deployed hostname in:

   `Authentication -> Settings -> Authorized domains`

   Common examples:
   - `your-project.vercel.app`
   - `www.smey-dev.site`
   - `smey-dev.site`

3. Redeploy the project on Vercel after saving the environment variables.

4. After deployment, verify the domain is actually pointing to Vercel. If a site audit still says there is no CDN, that usually means the production domain is not being served through the Vercel deployment yet.

## Troubleshooting

### "Failed to sync with cinematic database" Error

This error occurs when the TMDB API key is missing or invalid. To fix:

1. Verify your `.env` file contains a valid `VITE_TMDB_API_KEY` or `VITE_TMDB_READ_ACCESS_TOKEN`
2. Ensure the TMDB credential is correct and still active
3. Restart the development server after updating the `.env` file

### Network Errors

If you encounter network errors:

- Check your internet connection
- Try using a VPN if TMDB is blocked in your region
- Verify that `api.themoviedb.org` is accessible

### Firebase `auth/unauthorized-domain`

This happens when the current hostname is not listed in Firebase Authentication.

To fix:

1. Open Firebase Console
2. Go to `Authentication -> Settings -> Authorized domains`
3. Add the hostname shown in the app error message
4. Save and reload the app

If the project is using the fallback Firebase config instead of your own project, set the `VITE_FIREBASE_*` values in `.env` and restart Vite.

## Tech Stack

- React 18
- Vite
- TMDB API
- React Router
- Context API for state management
