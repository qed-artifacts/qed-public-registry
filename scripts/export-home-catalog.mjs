import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const outIndex = process.argv.indexOf("--out");
if (outIndex < 0 || !process.argv[outIndex + 1]) throw new Error("Usage: node scripts/export-home-catalog.mjs --out <domains.json>");
const sitemapIndex = process.argv.indexOf("--sitemap");
const registry = JSON.parse(await fs.readFile("registry.json", "utf8"));
const output = path.resolve(process.argv[outIndex + 1]);
const catalog = {
  schemaVersion: registry.schemaVersion,
  updated: registry.updated,
  taxonomy: registry.taxonomy,
  domains: registry.domains.map(({portalNumber, slug, name, summary, scopeStatus, stage, site, repository}) => ({portalNumber, slug, name, summary, scopeStatus, stage, site, repository}))
};
await fs.writeFile(output, `${JSON.stringify(catalog, null, 2)}\n`);
if (sitemapIndex >= 0 && process.argv[sitemapIndex + 1]) {
  const entries = [
    {url: "https://qedartifacts.org/", priority: "1.0"},
    {url: "https://qedartifacts.org/apps/", priority: "0.7"},
    ...catalog.domains.map((domain) => ({url: domain.site, priority: "0.8"}))
  ];
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${entries.map((entry) => `  <url><loc>${entry.url}</loc><lastmod>${catalog.updated}</lastmod><changefreq>monthly</changefreq><priority>${entry.priority}</priority></url>`).join("\n")}\n</urlset>\n`;
  await fs.writeFile(path.resolve(process.argv[sitemapIndex + 1]), xml);
}
console.log(`Wrote ${catalog.domains.length} domains to ${output}`);
