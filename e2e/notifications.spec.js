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

test("donation button floats above back-to-top on the right and opens its card", async ({
  page,
}) => {
  await page.goto("/notifications");

  const donationButton = page.getByRole("button", {
    name: "Buy me a coffee",
  });
  const backToTopButton = page.getByRole("button", { name: "Back to top" });

  await expect(donationButton).toHaveCSS("position", "fixed");
  const donationBounds = await donationButton.boundingBox();
  const backToTopBounds = await backToTopButton.boundingBox();
  expect(donationBounds).not.toBeNull();
  expect(backToTopBounds).not.toBeNull();
  expect(donationBounds.width).toBe(48);
  expect(donationBounds.height).toBe(48);
  expect(
    Math.abs(
      donationBounds.x +
        donationBounds.width -
        backToTopBounds.x -
        backToTopBounds.width,
    ),
  ).toBeLessThanOrEqual(1);
  expect(donationBounds.y + donationBounds.height).toBeLessThanOrEqual(
    backToTopBounds.y,
  );

  await page.setViewportSize({ width: 320, height: 720 });
  const mobileDonationBounds = await donationButton.boundingBox();
  expect(mobileDonationBounds).not.toBeNull();
  expect(mobileDonationBounds.x).toBeGreaterThanOrEqual(0);
  expect(
    mobileDonationBounds.x + mobileDonationBounds.width,
  ).toBeLessThanOrEqual(320);

  await donationButton.click();
  await expect(
    page.getByRole("dialog", { name: "Buy me a coffee" }),
  ).toBeVisible();
});

test("back-to-top becomes visible after scrolling and returns to the page top", async ({
  page,
}) => {
  await page.goto("/notifications");
  await page.evaluate(() => {
    document.body.style.minHeight = "200vh";
  });
  const backToTopButton = page.getByRole("button", { name: "Back to top" });

  await expect(backToTopButton).toHaveCSS("opacity", "0");
  await page.evaluate(() => window.scrollTo(0, 400));
  await expect(backToTopButton).toHaveCSS("opacity", "1");
  await expect(backToTopButton).toHaveCSS("background-image", /gradient/);

  await backToTopButton.click();
  await expect.poll(() => page.evaluate(() => window.scrollY)).toBe(0);
});

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

test("language selection translates navigation and persists across reloads", async ({
  page,
}) => {
  await page.goto("/notifications");
  const languageSelector = page.getByTestId("language-selector");
  const chooseLanguage = async (code, label, heading) => {
    await languageSelector.locator("summary").click();
    await languageSelector.getByRole("button", { name: label }).click();
    await expect(page.locator("html")).toHaveAttribute("lang", code);
    await expect(
      page.getByRole("heading", { name: heading, exact: true }),
    ).toBeVisible();
  };

  await chooseLanguage("km", "ខ្មែរ", "ការជូនដំណឹង");
  await chooseLanguage("zh-TW", "繁體中文", "通知");
  await chooseLanguage("es", "Español", "Notificaciones");
  await chooseLanguage("fr", "Français", "Notifications");
  await chooseLanguage("ja", "日本語", "通知");
  await chooseLanguage("ko", "한국어", "알림");
  await chooseLanguage("vi", "Tiếng Việt", "Thông báo");
  await chooseLanguage("id", "Bahasa Indonesia", "Notifikasi");

  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "id");
  await expect(
    page.getByRole("heading", { name: "Notifikasi", exact: true }),
  ).toBeVisible();

  await chooseLanguage("en", "English", "Notifications");
  await expect(
    languageSelector.getByTestId("selected-language-flag"),
  ).toHaveAttribute("src", /\.png(?:$|\?)/);
  await expect(
    languageSelector.getByTestId("selected-language-flag"),
  ).toHaveClass(/rounded-full/);
  await expect(
    languageSelector.getByTestId("selected-language-flag"),
  ).toHaveClass(/h-7 w-7/);
  const selectorBounds = await languageSelector
    .locator("summary")
    .boundingBox();
  expect(selectorBounds).not.toBeNull();
  expect(selectorBounds.width).toBe(selectorBounds.height);
  await expect(
    languageSelector.getByTestId("selected-language-flag"),
  ).toHaveCSS("object-fit", "cover");
  await expect(
    languageSelector
      .getByTestId("selected-language-flag")
      .evaluate((image) => image.decode()),
  ).resolves.toBeUndefined();
  await languageSelector.locator("summary").click();
  const languageFlags = languageSelector.locator("button img");
  await expect(languageFlags).toHaveCount(9);
  for (const flag of await languageFlags.all()) {
    await expect(flag).toHaveAttribute("src", /\.png(?:$|\?)/);
    await expect(flag).toHaveClass(/rounded-full/);
    await expect(flag).toHaveClass(/h-9 w-9/);
    await expect(flag).toHaveCSS("object-fit", "cover");
    await flag.evaluate((image) => image.decode());
  }
  await languageSelector.locator("summary").click();
  await expect(languageSelector.locator("button")).toHaveCount(9);
  await expect(languageSelector.locator('[aria-label="简体中文"]')).toHaveCount(
    0,
  );
  await expect(languageSelector.locator('[aria-label="ไทย"]')).toHaveCount(0);
  await expect(
    page.getByRole("heading", { name: "Notifications", exact: true }),
  ).toBeVisible();

  await page.evaluate(() => localStorage.setItem("cinemax_language", "zh-CN"));
  await page.reload();
  await expect(page.locator("html")).toHaveAttribute("lang", "zh-TW");
  await expect(
    languageSelector.getByTestId("selected-language-flag"),
  ).toHaveAttribute("src", /\.png(?:$|\?)/);
  await expect(
    languageSelector
      .getByTestId("selected-language-flag")
      .evaluate((image) => image.decode()),
  ).resolves.toBeUndefined();
  await expect(
    page.getByTestId("language-selector").locator("button"),
  ).toHaveCount(9);
});

test("language selector menu fits and scrolls on a narrow mobile screen", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/notifications");

  const languageSelector = page.getByTestId("language-selector");
  await expect(languageSelector).toBeVisible();
  await expect(page.getByRole("button", { name: "Open menu" })).toBeVisible();
  await expect(
    page.evaluate(() => document.documentElement.scrollWidth),
  ).resolves.toBeLessThanOrEqual(320);
  await languageSelector.locator("summary").click();

  const languageMenu = languageSelector.getByRole("group", {
    name: "Choose language",
  });
  await expect(languageMenu).toBeVisible();
  const menuBounds = await languageMenu.boundingBox();
  expect(menuBounds).not.toBeNull();
  expect(menuBounds.x).toBeGreaterThanOrEqual(0);
  expect(menuBounds.x + menuBounds.width).toBeLessThanOrEqual(320);
  expect(menuBounds.height).toBeLessThanOrEqual(24 * 16);
  await expect(languageMenu.locator("button")).toHaveCount(9);
});

test("mobile navigation drawer hides its scrollbar but remains scrollable", async ({
  page,
}) => {
  await page.setViewportSize({ width: 320, height: 568 });
  await page.goto("/notifications");
  await page.getByRole("button", { name: "Open menu" }).click();

  const drawer = page.getByRole("dialog", { name: "Main navigation" });
  await expect(drawer).toBeVisible();
  await expect
    .poll(() =>
      drawer.evaluate((element) => {
        const scrollbar = getComputedStyle(element, "::-webkit-scrollbar");
        return {
          overflowY: getComputedStyle(element).overflowY,
          scrollbarDisplay: scrollbar.display,
        };
      }),
    )
    .toEqual({
      overflowY: "auto",
      scrollbarDisplay: "none",
    });
});
