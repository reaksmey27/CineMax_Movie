import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("visitor photo is opt-in and opting out removes the public avatar", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.route("**/src/firebase/publicVisitors.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    let enabled = false; const listeners = new Set();
    export const subscribeVisitors = (next) => { const emit = () => next(enabled ? [{id:'fan', photoURL:''}] : []); listeners.add(emit); emit(); return () => listeners.delete(emit); };
    export const subscribeVisitorPreference = (uid,next) => { const emit=()=>next(enabled); listeners.add(emit); emit(); return () => listeners.delete(emit); };
    export const setVisitorPreference = async (user,value) => { if (localStorage.getItem('fail-visitor')) throw Error('offline'); enabled=value; listeners.forEach(emit=>emit()); };
    export const touchPublicVisitor = async () => {};
  `,
    }),
  );
  await page.goto("/profile");
  const toggle = page.getByRole("checkbox", {
    name: "Show my photo in recent visitors",
  });
  const visitors = page.getByRole("list", { name: "Recent visitors" });
  await expect(toggle).toBeEnabled();
  await expect(toggle).not.toBeChecked();
  await expect(visitors).toHaveCount(0);
  await toggle.click();
  await expect(toggle).toBeChecked();
  await expect(visitors.locator("li")).toHaveCount(1);
  await page.evaluate(() => localStorage.setItem("fail-visitor", "1"));
  await toggle.click();
  await expect(
    page.getByText("Could not update visitor preference."),
  ).toBeVisible();
  await expect(toggle).toBeChecked();
  await expect(visitors.locator("li")).toHaveCount(1);
  await page.evaluate(() => localStorage.removeItem("fail-visitor"));
  await toggle.click();
  await expect(toggle).not.toBeChecked();
  await expect(visitors).toHaveCount(0);
});
