import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("own profile photo stays visible when public visitor storage is unavailable", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.route("**/src/context/AuthContext.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    const user={uid:'fan',name:'Fan',avatar:'/images/logo.png'};
    export const AuthProvider=({children})=>children;
    export const useAuth=()=>({user,isAuthenticated:true,loading:false});
  `,
    }),
  );
  await page.route("**/src/firebase/publicVisitors.js", (route) =>
    route.fulfill({
      contentType: "application/javascript",
      body: `
    export const subscribeVisitors=(next,error)=>{error(Error('permission-denied'));return ()=>{};};
    export const publishPublicVisitor=async()=>{throw Error('permission-denied');};
  `,
    }),
  );
  await page.goto("/privacy");
  const list = page.getByRole("list", { name: "Recent visitors" });
  await expect(list.locator("li")).toHaveCount(1);
  await expect(
    list.getByRole("img", { name: "Visitor", exact: true }),
  ).toHaveAttribute("src", "/images/logo.png");
  await expect(
    list.getByRole("img", { name: "Visitor", exact: true }),
  ).toBeVisible();
});

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
      await expect(visitors.locator("li")).toHaveCount(1);
      await expect(
        visitors.getByRole("img", { name: "Guest visitor" }),
      ).toBeVisible();
      expect(
        await page.evaluate(() => localStorage.getItem("published-visitor")),
      ).toBeNull();
    }
  });
}
