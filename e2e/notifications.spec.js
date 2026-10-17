import { expect, test } from "@playwright/test";

const seedNotifications = async (page, notifications) => {
  await page.addInitScript((items) => {
    if (sessionStorage.getItem("notification-history-seeded")) return;
    localStorage.setItem("cinema_notifications", JSON.stringify(items));
    sessionStorage.setItem("notification-history-seeded", "true");
  }, notifications);
};

const notifications = [
  {
    id: "movie-unread",
    message: "Example Film is now available.",
    type: "success",
    timestamp: "2026-04-01T12:00:00.000Z",
    read: false,
    movie: {
      id: 42,
      title: "Example Film",
      poster: "/poster.jpg",
    },
  },
  {
    id: "account-unread",
    message: "Your account settings were updated.",
    type: "info",
    timestamp: "2026-04-01T11:00:00.000Z",
    read: false,
  },
  {
    id: "account-read",
    message: "Welcome to CineMax.",
    type: "success",
    timestamp: "2026-04-01T10:00:00.000Z",
    read: true,
  },
];

test("notification history filters and supports read, remove, and clear actions", async ({
  page,
}) => {
  await seedNotifications(page, notifications);
  await page.goto("/notifications");

  await expect(
    page.getByRole("heading", { name: "Notifications", exact: true }),
  ).toBeVisible();
  await expect(
    page.locator('div[aria-label="2 unread notifications"]'),
  ).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(3);

  await page.getByRole("button", { name: "Unread (2)" }).click();
  await expect(page.getByRole("listitem")).toHaveCount(2);

  const movieNotification = page
    .getByRole("listitem")
    .filter({ hasText: "Example Film is now available." });
  await movieNotification
    .getByRole("button", { name: "Mark notification as read" })
    .click();
  await expect(page.getByRole("listitem")).toHaveCount(1);
  await expect(
    page.locator('div[aria-label="1 unread notifications"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: "All", exact: true }).click();
  await expect(page.getByRole("listitem")).toHaveCount(3);
  await page.getByRole("button", { name: "Mark all read" }).click();
  await expect(
    page.locator('div[aria-label="0 unread notifications"]'),
  ).toBeVisible();

  await page
    .getByRole("listitem")
    .filter({ hasText: "Your account settings were updated." })
    .getByRole("button", { name: "Remove notification" })
    .click();
  await expect(page.getByRole("listitem")).toHaveCount(2);

  await page.reload();
  await expect(page.getByRole("listitem")).toHaveCount(2);
  await expect(
    page.locator('div[aria-label="0 unread notifications"]'),
  ).toBeVisible();

  await page.getByRole("button", { name: "Clear history" }).click();
  await page.getByRole("button", { name: "Confirm" }).click();
  await expect(page.getByText("No notifications yet")).toBeVisible();
  await expect(page.getByRole("listitem")).toHaveCount(0);
});

test("movie notification poster opens the linked movie on a narrow viewport", async ({
  page,
}) => {
  await seedNotifications(page, [notifications[0]]);
  await page.setViewportSize({ width: 320, height: 740 });
  await page.route("**/*", async (route) => {
    const requestUrl = new URL(route.request().url());
    if (
      requestUrl.hostname !== "api.themoviedb.org" ||
      !requestUrl.pathname.endsWith("/movie/42")
    ) {
      await route.continue();
      return;
    }

    await route.fulfill({
      headers: { "access-control-allow-origin": "*" },
      json: {
        id: 42,
        title: "Example Film",
        release_date: "2024-01-01",
        overview: "A test movie.",
        poster_path: "/poster.jpg",
        backdrop_path: "/backdrop.jpg",
        vote_average: 7.5,
        runtime: 100,
        genres: [{ name: "Drama" }],
        videos: { results: [] },
      },
    });
  });
  await page.goto("/notifications");

  await page.getByRole("link", { name: "View Example Film" }).click();

  await expect(page).toHaveURL(/\/movie\/42$/);
  await expect(
    page.getByRole("heading", { name: "Example Film" }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= window.innerWidth,
    ),
  ).toBe(true);
});
