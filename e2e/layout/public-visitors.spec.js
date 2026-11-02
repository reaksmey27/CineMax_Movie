import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

for (const signedIn of [true, false]) {
  test(`${signedIn ? "signed-in visitors appear automatically" : "guests do not publish a profile"}`, async ({
    page,
  }) => {
    await setupPlaybackHistory(page);
    if (!signedIn)
      await page.route("**/src/context/AuthContext.js", (route) =>
        route.fulfill({
          contentType: "application/javascript",
          body: "export const AuthProvider=({children})=>children; export const useAuth=()=>({user:null,isAuthenticated:false,loading:false});",
        }),
      );
    await page.route("**/src/firebase/publicVisitors.js", (route) =>
      route.fulfill({
        contentType: "application/javascript",
        body: `
      let visitors=[]; const listeners=new Set();
      export const subscribeVisitors=next=>{listeners.add(next);next(visitors);return ()=>listeners.delete(next);};
      export const publishPublicVisitor=async user=>{localStorage.setItem('published-visitor',user.uid);visitors=[{id:user.uid,photoURL:''}];listeners.forEach(next=>next(visitors));};
    `,
      }),
    );
    await page.goto(signedIn ? "/profile" : "/privacy");
    const visitors = page.getByRole("list", { name: "Recent visitors" });
    if (signedIn) {
      await expect(visitors.locator("li")).toHaveCount(1);
      await expect(
        page.getByRole("checkbox", {
          name: "Show my photo in recent visitors",
        }),
      ).toHaveCount(0);
      expect(
        await page.evaluate(() => localStorage.getItem("published-visitor")),
      ).toBe("fan");
    } else {
      await expect(page.getByRole("contentinfo")).toBeVisible();
      await expect(visitors).toHaveCount(0);
      expect(
        await page.evaluate(() => localStorage.getItem("published-visitor")),
      ).toBeNull();
    }
  });
}
