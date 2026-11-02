import { expect, test } from "@playwright/test";

for (const path of ["/login", "/signup"]) {
  test(`${path} submits once while pending and permits retry`, async ({
    page,
  }) => {
    await page.route("https://api.themoviedb.org/**", (route) =>
      route.fulfill({ json: { results: [] } }),
    );
    await page.route("**/src/context/AuthContext.js", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
   export const AuthProvider=({children})=>children;
   async function submit(){window.submitCount=(window.submitCount||0)+1; await new Promise(resolve=>{window.releaseSubmit=resolve;}); return null;}
   export const useAuth=()=>({user:null,isAuthenticated:false,loading:false,authenticating:false,login:submit,register:submit});
  `,
      }),
    );
    await page.goto(path);
    if (path === "/signup")
      await page.locator('input[name="name"]').fill("Movie Fan");
    await page.locator('input[name="email"]').fill("fan@example.com");
    await page.locator('input[name="password"]').fill("Example123");
    if (path === "/signup")
      await page.locator('input[name="confirmPassword"]').fill("Example123");
    const form = page.getByRole("dialog").locator("form");
    await form.evaluate((el) => {
      el.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
      el.dispatchEvent(
        new Event("submit", { bubbles: true, cancelable: true }),
      );
    });
    await expect.poll(() => page.evaluate(() => window.submitCount)).toBe(1);
    await expect(form.locator('button[type="submit"]')).toBeDisabled();
    await page.evaluate(() => window.releaseSubmit());
    await expect(form.locator('button[type="submit"]')).toBeEnabled();
    await form.locator('button[type="submit"]').click();
    await expect.poll(() => page.evaluate(() => window.submitCount)).toBe(2);
    await page.evaluate(() => window.releaseSubmit());
    await expect(form.locator('button[type="submit"]')).toBeEnabled();
  });
}
