import fs from "node:fs/promises";

const architecture = JSON.parse(await fs.readFile("architecture-state.json", "utf8"));
const registry = JSON.parse(await fs.readFile("registry.json", "utf8"));
const classes = JSON.parse(await fs.readFile("information-classes.json", "utf8"));

if (architecture.schemaVersion !== 1 || registry.schemaVersion !== 1 || classes.schemaVersion !== 1) throw new Error("Unsupported schema version");
const slugs = new Set();
for (const domain of registry.domains) {
  if (slugs.has(domain.slug)) throw new Error(`Duplicate domain slug: ${domain.slug}`);
  slugs.add(domain.slug);
  if (!domain.site.startsWith("https://qedartifacts.org/")) throw new Error(`Invalid site URL: ${domain.site}`);
  if (!domain.repository.startsWith("https://github.com/qed-artifacts/")) throw new Error(`Invalid repository URL: ${domain.repository}`);
}
const ids = classes.classes.map((item) => item.id);
if (new Set(ids).size !== ids.length) throw new Error("Duplicate information class");
if (!ids.includes("secret") || !ids.includes("public")) throw new Error("Required information classes missing");
console.log(`Registry valid: ${registry.domains.length} domains, ${ids.length} information classes`);
