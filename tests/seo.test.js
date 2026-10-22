import test from "node:test";
import assert from "node:assert/strict";
import {
  getPageMeta,
  getMovieMeta,
  SITE_URL,
} from "../src/config/routeMeta.js";
import { renderSeoHtml, sitemapXml, robotsTxt } from "../scripts/seo-build.js";

test("public and private routes have the intended indexing policy", () => {
  for (const path of ["/", "/movies", "/trending", "/upcoming", "/movie/42"])
    assert.equal(getPageMeta(path).noindex, false);
  for (const path of [
    "/profile",
    "/favorites",
    "/watchlist",
    "/history",
    "/notifications",
    "/login",
    "/signup",
    "/register",
    "/missing",
  ])
    assert.equal(getPageMeta(path).noindex, true);
  assert.equal(getPageMeta("/register").canonical, `${SITE_URL}/signup`);
});

test("canonical URLs preserve collections and pagination but exclude tracking", () => {
  const meta = getPageMeta(
    "/movies/",
    "?utm_source=test&page=2&collection=top-rated",
  );
  assert.equal(
    meta.canonical,
    `${SITE_URL}/movies?collection=top-rated&page=2`,
  );
  assert.match(meta.title, /Top Rated.*Page 2/);
  assert.equal(meta.noindex, false);
  assert.equal(
    getPageMeta("/movies", "?page=1").canonical,
    `${SITE_URL}/movies`,
  );
  assert.equal(getPageMeta("/movies", "?q=alien").noindex, true);
  assert.equal(getPageMeta("/movies", "?genre=28").noindex, true);
});

test("movie metadata uses real content without inventing ratings", () => {
  const meta = getMovieMeta({
    id: 42,
    title: "Example",
    release_date: "2025-01-02",
    overview: "A movie summary.",
    backdrop_path: "/backdrop.jpg",
    runtime: 99,
    genres: [{ name: "Drama" }],
  });
  assert.match(meta.title, /Example \(2025\)/);
  assert.equal(meta.canonical, `${SITE_URL}/movie/42`);
  assert.equal(meta.structuredData.duration, "PT99M");
  assert.deepEqual(meta.structuredData.genre, ["Drama"]);
  assert.equal(meta.structuredData.aggregateRating, undefined);
  assert.match(meta.image, /w780\/backdrop.jpg$/);
});

test("HTML generation escapes metadata and replaces old tags without duplicates", () => {
  const html =
    '<html><head><title>Old</title><meta name="description" content="Old"><link rel="canonical" href="https://old.example"></head><body><div id="root"></div></body></html>';
  const meta = getMovieMeta({
    id: 1,
    title: '<script>"Title"</script>',
    overview: "</script><script>alert(1)</script>",
  });
  const output = renderSeoHtml(renderSeoHtml(html, meta), meta);
  assert.equal((output.match(/rel="canonical"/g) || []).length, 1);
  assert.equal((output.match(/name="description"/g) || []).length, 1);
  assert.equal((output.match(/id="page-structured-data"/g) || []).length, 1);
  assert.match(output, /&lt;script&gt;/);
  assert.doesNotMatch(output, /<script>alert/);
  assert.match(renderSeoHtml(html, getPageMeta("/profile")), /noindex, follow/);
});

test("crawler files list public collections and allow noindex pages to be crawled", () => {
  assert.match(sitemapXml(), /collection=top-rated/);
  assert.doesNotMatch(
    sitemapXml(),
    /profile|favorites|watchlist|notifications|login/,
  );
  assert.match(robotsTxt(), /Allow: \//);
  assert.doesNotMatch(robotsTxt(), /Disallow:/);
});
