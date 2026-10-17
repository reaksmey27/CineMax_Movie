import process from "node:process";
import { defineConfig, devices } from "@playwright/test";

export default defineConfig({
  testDir: "./e2e",
  fullyParallel: true,
  reporter: "list",
  use: {
    baseURL: "http://127.0.0.1:4173",
    serviceWorkers: "block",
    trace: "retain-on-failure",
  },
  projects: [
    {
      name: "chromium",
      use: { ...devices["Desktop Chrome"] },
    },
  ],
  webServer: {
    command: "npm run dev -- --host 127.0.0.1 --port 4173",
    url: "http://127.0.0.1:4173",
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
    env: {
      VITE_TMDB_API_KEY: "playwright-test-key",
      VITE_FIREBASE_API_KEY: "playwright-test-key",
      VITE_FIREBASE_AUTH_DOMAIN: "playwright-test.firebaseapp.com",
      VITE_FIREBASE_PROJECT_ID: "playwright-test",
      VITE_FIREBASE_STORAGE_BUCKET: "playwright-test.appspot.com",
      VITE_FIREBASE_MESSAGING_SENDER_ID: "123456789",
      VITE_FIREBASE_APP_ID: "1:123456789:web:playwrighttest",
    },
  },
});
