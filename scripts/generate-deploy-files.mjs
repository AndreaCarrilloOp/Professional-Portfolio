import { mkdir, writeFile } from "node:fs/promises";
import { resolve } from "node:path";

function normalizeSiteUrl(value) {
  return String(value || "http://localhost:4173").replace(/\/+$/, "");
}

const siteUrl = normalizeSiteUrl(
  process.env.VITE_SITE_URL || process.env.URL || "http://localhost:4173",
);
const outputDirectory = resolve("dist");

await mkdir(outputDirectory, { recursive: true });

const robots = `User-agent: *
Allow: /

Sitemap: ${siteUrl}/sitemap.xml
`;

const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${siteUrl}/</loc>
  </url>
</urlset>
`;

await Promise.all([
  writeFile(resolve(outputDirectory, "robots.txt"), robots, "utf8"),
  writeFile(resolve(outputDirectory, "sitemap.xml"), sitemap, "utf8"),
]);

console.log(`Generated Netlify SEO files for ${siteUrl}`);
