import { expect, test } from "@playwright/test";
import { setupPlaybackHistory } from "../helpers/playbackHistory.js";

test("playback report includes the movie and server, handles failure, and confirms submission", async ({
  page,
}) => {
  await setupPlaybackHistory(page);
  await page.goto("/movie/42");
  await page.getByRole("button", { name: "Play Movie", exact: true }).click();
  await page.getByRole("button", { name: "Server 2", exact: true }).click();
  await page
    .getByRole("button", { name: "Report playback problem", exact: true })
    .click();
  const form = page.getByRole("form", { name: "Report playback problem" });
  await expect(form).toContainText("Example Film");
  await expect(form).toContainText("Server 2");
  await form.getByRole("radio", { name: "No sound", exact: true }).check();
  await form
    .getByLabel("Details (optional)")
    .fill("Sound stops after 10 minutes.");
  await expect(form.getByLabel("Details (optional)")).toHaveAttribute(
    "maxlength",
    "1000",
  );
  await page.evaluate(() => localStorage.setItem("fail-report", "1"));
  await form
    .getByRole("button", { name: "Submit report", exact: true })
    .click();
  await expect(
    form.getByRole("button", { name: "Submitting...", exact: true }),
  ).toBeDisabled();
  await expect(form.getByRole("alert")).toContainText(
    "Could not submit the report",
  );
  await page.evaluate(() => localStorage.removeItem("fail-report"));
  await form.getByRole("button", { name: "Try again", exact: true }).click();
  await expect(form.getByRole("status")).toHaveText(
    "Report submitted. Thank you.",
  );
  expect(
    await page.evaluate(() =>
      JSON.parse(localStorage.getItem("submitted-report")),
    ),
  ).toEqual({
    uid: "fan",
    movieId: 42,
    server: "Server 2",
    issue: "no-sound",
    details: "Sound stops after 10 minutes.",
  });
  await expect(
    form.getByRole("button", { name: "Submit report", exact: true }),
  ).toHaveCount(0);
});
