import { expect, test } from "@playwright/test";

test("site branding keeps the full logo visible on a dark navbar", async ({
  page,
}) => {
  await page.goto("/");

  const navbarLogo = page.locator("nav img[alt='CineMax Logo']");
  await expect(navbarLogo).toHaveAttribute("src", "/images/logo.svg");
  await expect(page.locator("footer img[alt='CineMax Logo']")).toHaveAttribute(
    "src",
    "/images/logo.svg",
  );

  await page.getByRole("button", { name: "Switch to light mode" }).click();
  await expect(navbarLogo).toHaveAttribute("src", "/images/logo.svg");
  await expect(page.locator(".site-navbar nav")).toHaveCSS(
    "background-color",
    "rgb(15, 23, 42)",
  );

  await expect(page.locator("link[rel='icon']")).toHaveAttribute(
    "href",
    "/images/logo-mark.svg",
  );
  await expect(page.locator("link[rel='apple-touch-icon']")).toHaveAttribute(
    "href",
    "/images/logo-mark.png",
  );
});
