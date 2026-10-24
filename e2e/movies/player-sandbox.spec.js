import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("all movie servers block popup and top-page navigation attempts", async ({
  page,
  context,
}) => {
  await setupPlaybackHistory(page);
  await page.route(/https:\/\/vidsrc[^/]*\/embed\/.*/, (route) =>
    route.fulfill({
      contentType: "text/html",
      body: `<html><body>
      <button id="popup">Open popup</button>
      <button id="redirect">Redirect page</button>
      <p id="result"></p>
      <script>
        document.getElementById('popup').onclick = () => {
          const popup = window.open('https://example.com/ad', '_blank');
          document.getElementById('result').textContent = popup === null ? 'Popup blocked' : 'Popup opened';
        };
        document.getElementById('redirect').onclick = () => {
          try { window.top.location.href = 'https://example.com/ad'; }
          catch (error) { document.getElementById('result').textContent = error.name; }
        };
      </script>
    </body></html>`,
    }),
  );
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  for (const server of ["Server 1", "Server 2", "Server 3", "Server 4"]) {
    await page.getByRole("button", { name: server, exact: true }).click();
    const player = page.getByTitle("Cinema Player");
    await expect(player).toHaveAttribute(
      "sandbox",
      "allow-scripts allow-same-origin allow-presentation",
    );
    const frame = player.contentFrame();
    await frame.getByRole("button", { name: "Open popup" }).click();
    await expect(frame.locator("#result")).toHaveText("Popup blocked");
    await frame.getByRole("button", { name: "Redirect page" }).click();
    await expect(frame.locator("#result")).toHaveText("SecurityError");
    await expect(page).toHaveURL(/\/movie\/42$/);
    expect(context.pages()).toHaveLength(1);
  }
});
