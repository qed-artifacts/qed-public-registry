import fs from "node:fs/promises";

const registry = JSON.parse(await fs.readFile("registry.json", "utf8"));
const seeds = JSON.parse(await fs.readFile("domain-seeds.json", "utf8"));
const existing = new Map(registry.domains.map((domain) => [domain.slug, domain]));
const foundations = {
  "higher-education": {portalNumber: "01", summary: "Learning, institutions, systems, outcomes, and public value.", dimensions: ["Learning and formation", "Institutions and systems", "Outcomes and public value"], sourceSignals: ["Academic_Higher Education"]},
  "quality-of-life": {portalNumber: "02", summary: "Conditions, capabilities, lived experience, measures, and consequences.", dimensions: ["Lived experience", "Conditions and capabilities", "Measurement and consequences"], sourceSignals: ["Academic_Quality of Life"]},
  "healthcare": {portalNumber: "03", summary: "People, care, implementation, outcomes, systems, and stewardship.", dimensions: ["People and care", "Evidence and implementation", "Outcomes and stewardship"], sourceSignals: ["Academic_Healthcare"]}
};

for (const [slug, metadata] of Object.entries(foundations)) {
  existing.set(slug, {...existing.get(slug), ...metadata, stage: "foundation"});
}

const sourceSignalBySlug = {
  "aesthetics-and-fine-arts": "Academic_Aesthetics and the Fine Arts",
  "ai-and-machine-learning": "Academic_AI and Machine Learning",
  "axiology": "Academic_Axiology",
  "construction": "Academic_Construction",
  "data-and-information": "Academic_Data and Information",
  "economics": "Academic_Economics",
  "environment": "Academic_Environment",
  "evidence-and-research": "Academic_Evidence and Research",
  "food": "Academic_Food",
  "journalism-and-media": "Academic_Journalism and Media",
  "k12-education": "Academic_K-12 Education",
  "legal-and-jurisprudence": "Academic_Legal and Jurisprudence",
  "pharmaceuticals": "Academic_Pharmaceuticals",
  "psychometrics-and-metrology": "Academic_Psychometrics and Metrology",
  "public-administration-and-government": "Academic_Public Admin and Government",
  "quality-management": "Academic_Quality Management",
  "reliability-engineering": "Academic_Reliability Engineering",
  "rhetoric-and-communication": "Academic_Rhetoric and Communication",
  "sensory-science": "Academic_Sensory Science",
  "service-and-marketing": "Academic_Service and Marketing",
  "social-work-and-human-services": "Academic_Social Work and Human Services",
  "software": "Academic_Software",
  "federal-laws-and-regulations": "Professional_Federal Laws and Regulations",
  "standards-and-benchmarks": "Professional_Standardizers and Benchmarks"
};

for (const seed of seeds.domains) {
  existing.set(seed.slug, {
    id: `qed-domain-${seed.slug}`,
    slug: seed.slug,
    portalNumber: seed.portalNumber,
    name: seed.name,
    summary: seed.summary,
    dimensions: seed.dimensions,
    sourceSignals: seed.sourceSignals ?? [sourceSignalBySlug[seed.slug]],
    scopeStatus: "provisional",
    stage: "seed",
    site: `https://qedartifacts.org/${seed.slug}/`,
    repository: `https://github.com/qed-artifacts/${seed.slug}`,
    appCatalog: `https://qedartifacts.org/${seed.slug}/apps/catalog.json`
  });
}

registry.updated = "2026-08-26";
registry.taxonomy = seeds.taxonomy;
registry.domains = [...existing.values()].sort((a, b) => (a.portalNumber ?? "99").localeCompare(b.portalNumber ?? "99"));
await fs.writeFile("registry.json", `${JSON.stringify(registry, null, 2)}\n`);
const architecture = JSON.parse(await fs.readFile("architecture-state.json", "utf8"));
architecture.updated = registry.updated;
architecture.repositories = [
  ...architecture.repositories.filter((repository) => repository.role !== "domain-configuration"),
  ...registry.domains.map((domain) => ({name: domain.slug, role: "domain-configuration", visibility: "public"}))
];
await fs.writeFile("architecture-state.json", `${JSON.stringify(architecture, null, 2)}\n`);
console.log(`Registry now contains ${registry.domains.length} provisional domains`);
