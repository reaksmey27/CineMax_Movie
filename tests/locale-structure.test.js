import assert from "node:assert/strict";
import { readFile, readdir } from "node:fs/promises";
import test from "node:test";

const features = [
  "authentication",
  "collections",
  "common",
  "movies",
  "navigation",
  "notifications",
  "profile",
];
const root = new URL("../src/i18n/locales/", import.meta.url);
const fallbacks = JSON.parse(
  await readFile(
    new URL("./fixtures/locale-fallbacks.json", import.meta.url),
    "utf8",
  ),
);
const locales = (await readdir(root))
  .filter((file) => file.endsWith(".js") && file !== "en.js")
  .map((file) => file.slice(0, -3));
const catalogs = Object.fromEntries(
  await Promise.all(
    locales.map(async (locale) => [
      locale,
      (await import(`../src/i18n/locales/${locale}.js`)).default,
    ]),
  ),
);
const allKeys = new Set(
  Object.values(catalogs).flatMap((messages) => Object.keys(messages)),
);
const featureByKey = new Map();

for (const locale of locales) {
  test(`${locale} has complete feature modules without duplicate or misplaced keys`, async () => {
    const files = await readdir(new URL(`${locale}/`, root));
    assert.deepEqual(
      files.sort(),
      features.map((feature) => `${feature}.js`),
    );
    const merged = {};
    for (const feature of features) {
      const messages = (
        await import(`../src/i18n/locales/${locale}/${feature}.js`)
      ).default;
      for (const [key, value] of Object.entries(messages)) {
        assert.ok(
          !Object.hasOwn(merged, key),
          `Duplicate ${locale} key: ${key}`,
        );
        assert.equal(typeof value, "string");
        assert.ok(value.trim(), `Empty ${locale} translation: ${key}`);
        assert.deepEqual(
          [...new Set(value.match(/\{\w+\}/g) || [])].sort(),
          [...new Set(key.match(/\{\w+\}/g) || [])].sort(),
          `Placeholder mismatch: ${locale}/${key}`,
        );
        if (featureByKey.has(key))
          assert.equal(
            featureByKey.get(key),
            feature,
            `Inconsistent feature for ${key}`,
          );
        featureByKey.set(key, feature);
        merged[key] = value;
      }
    }
    assert.deepEqual(merged, catalogs[locale]);
    // Only pre-existing gaps may use English fallback. New keys must be translated.
    for (const key of allKeys) {
      assert.ok(
        Object.hasOwn(merged, key) || fallbacks[locale]?.includes(key),
        `Missing ${locale} translation: ${key}`,
      );
    }
  });
}
