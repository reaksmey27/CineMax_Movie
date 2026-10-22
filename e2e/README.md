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
| `helpers/` | Shared browser interaction helpers; no test cases |

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
absolute URLs. Some existing integration specs cover several related flows;
for example, `collections/watch-history.spec.js` also covers playback reports.

Playwright starts Vite using the test settings in `playwright.config.js`.
Firestore security rules and persistence are tested separately in `tests/`.
