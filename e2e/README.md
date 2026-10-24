# End-to-end tests

Playwright discovers all `*.spec.js` files in these folders automatically.

| Folder | Coverage |
| --- | --- |
| `auth/` | Password reset requests and reset links |
| `collections/` | Favorites, Watchlist, History, saved filters, and removal undo |
| `home/` | Homepage discovery sections and themes |
| `layout/` | Navigation, accessibility, branding, footer, responsive layouts, and scroll restoration |
| `localization/` | Translations and language loading |
| `movies/` | Search, filters, details, posters, trailers, sharing, finish times, and upcoming releases |
| `notifications/` | Notifications and associated account/navigation flows |
| `helpers/` | Shared browser interactions and mocked network setup; no test cases |

Run commands from the repository root:

```sh
# All browser tests
npm run test:ui

# One feature group
npm run test:ui -- e2e/collections

# One spec
npm run test:ui -- e2e/movies/runtime-filters.spec.js

# Show all discovered tests without launching a browser
npm run test:ui -- --list
```

Keep new specs in the closest feature folder and import shared helpers with
`../helpers/...`. Browser-served fixture imports such as `/src/...` remain
absolute URLs.

Playback and history coverage is organized by feature:

- `collections/watch-history.spec.js`: history loading, filters, clearing, and watched status.
- `movies/playback-history.spec.js`: saving playback progress, resuming, and write recovery.
- `movies/playback-report.spec.js`: submitting playback reports and retrying failures.
- `movies/server-preference.spec.js`: server preferences, fallback, and blocked storage.
- `layout/account-responsive.spec.js`: account layouts and English/Khmer history layouts.

These specs share `helpers/playbackHistory.js`, which mocks authentication and
network storage while exercising the real history provider and player components.

Playwright starts Vite using the test settings in `playwright.config.js`.
Firestore security rules and persistence are tested separately in `tests/`.
