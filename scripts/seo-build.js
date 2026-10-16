import { mkdir, readFile, writeFile } from "node:fs/promises";
import { resolve } from "node:path";
import {
  getPageMeta,
  getMetaTags,
  ROUTE_META,
  PUBLIC_ROUTES,
  SITE_URL,
} from "../src/config/routeMeta.js";

const escapeHtml = (value) =>
  String(value).replace(
    /[&<>"']/g,
    (char) =>
      ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[
        char
      ],
  );
export const renderSeoHtml = (html, meta) => {
  const cleaned = html
    .replace(/<title>[\s\S]*?<\/title>/gi, "")
    .replace(
      /<meta\s+[^>]*(?:name|property)=["'](?:description|robots|og:[^"']+|twitter:[^"']+)["'][^>]*>/gi,
      "",
    )
    .replace(/<link\s+[^>]*rel=["']canonical["'][^>]*>/gi, "")
    .replace(
      /<script[^>]*id=["']page-structured-data["'][^>]*>[\s\S]*?<\/script>/gi,
      "",
    );
  const tags = [
    `<title>${escapeHtml(meta.title)}</title>`,
    ...getMetaTags(meta).map(
      ([attribute, key, value]) =>
        `<meta ${attribute}="${key}" content="${escapeHtml(value)}" />`,
    ),
    ...(meta.canonical
      ? [`<link rel="canonical" href="${escapeHtml(meta.canonical)}" />`]
      : []),
    ...(meta.structuredData
      ? [
          `<script id="page-structured-data" type="application/ld+json">${JSON.stringify(meta.structuredData).replace(/</g, "\\u003c")}</script>`,
        ]
      : []),
  ];
  return cleaned.replace("</head>", `${tags.join("\n    ")}\n  </head>`);
};

export const sitemapXml = () => {
  const urls = [
    ...PUBLIC_ROUTES,
    "/movies?collection=top-rated",
    "/movies?collection=now-playing",
  ];
  return `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls.map((path) => `  <url><loc>${escapeHtml(`${SITE_URL}${path}`)}</loc></url>`).join("\n")}\n</urlset>\n`;
};
export const robotsTxt = () =>
  `User-agent: *\nAllow: /\n\nSitemap: ${SITE_URL}/sitemap.xml\n`;

export default function seoBuild() {
  let outDir;
  return {
    name: "cinemax-static-metadata",
    apply: "build",
    configResolved(config) {
      outDir = resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return renderSeoHtml(html, getPageMeta("/"));
    },
    async closeBundle() {
      const html = await readFile(resolve(outDir, "index.html"), "utf8");
      await mkdir(resolve(outDir, "seo"), { recursive: true });
      for (const path of Object.keys(ROUTE_META).filter(
        (path) => path !== "/",
      )) {
        await writeFile(
          resolve(outDir, `seo/${path.slice(1)}.html`),
          renderSeoHtml(html, getPageMeta(path)),
        );
      }
      const movieMeta = { ...getPageMeta("/movie/0"), canonical: null };
      await writeFile(
        resolve(outDir, "seo/movie.html"),
        renderSeoHtml(html, movieMeta),
      );
      await writeFile(
        resolve(outDir, "seo/not-found.html"),
        renderSeoHtml(html, getPageMeta("/404")),
      );
      await writeFile(resolve(outDir, "robots.txt"), robotsTxt());
      await writeFile(resolve(outDir, "sitemap.xml"), sitemapXml());
    },
  };
}
