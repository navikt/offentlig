#!/usr/bin/env node
/**
 * sync.mjs — nattlig datasynk for «Åpen kildekode i Nav»
 *
 * Henter tall fra GitHub og npm og skriver src/data/generated.json.
 * Bygget leser kun denne filen — selve bygget går aldri på nett.
 *
 * Kjøres med GITHUB_TOKEN satt (GraphQL + romsligere rate limits);
 * uten token faller skriptet tilbake til REST der det går.
 *
 *   GITHUB_TOKEN=$(gh auth token) npm run sync
 *
 * Feiler en delhenting, beholdes den forrige verdien fra eksisterende
 * generated.json (aldri 0-ere på siden — jf. PRD §5.7 pkt. 6).
 */

import { readFileSync, writeFileSync, existsSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";
import { parse as parseYaml } from "yaml";

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = join(__dirname, "..", "src", "data");
const OUT_FILE = join(DATA_DIR, "generated.json");

const GITHUB_API = "https://api.github.com";
const TOKEN = process.env.GITHUB_TOKEN || "";
const ORG = "navikt";
const NPM_PACKAGE = "@navikt/aksel-icons";

/* GitHubs offisielle språkfarger (entitetsfarger — unntatt fra token-regelen,
   som i mockupen). Fallback for språk GraphQL ikke gir oss farge på. */
const LANGUAGE_COLORS = {
  Kotlin: "#a97bff",
  TypeScript: "#3178c6",
  Java: "#b07219",
  JavaScript: "#f1e05a",
  Python: "#3572a5",
  Shell: "#89e051",
  Go: "#00add8",
  Rust: "#dea584",
  Ruby: "#701516",
  HTML: "#e34c26",
  CSS: "#663399",
  "PL/I": "#6d3b9f",
  Dockerfile: "#384d54",
  Vue: "#41b883",
  "C#": "#178600",
  Scala: "#c22d40",
  Svelte: "#ff3e00",
  HCL: "#844fba",
};

/* Språkene i fordelingsstolpen; resten samles i «Annet». */
const CHART_LANGUAGES = ["Kotlin", "TypeScript", "Java", "JavaScript", "Python", "Shell", "Go"];

const sleep = (ms) => new Promise((r) => setTimeout(r, ms));

function ghHeaders(extra = {}) {
  const h = {
    Accept: "application/vnd.github+json",
    "X-GitHub-Api-Version": "2022-11-28",
    "User-Agent": "navikt-kildekode-sync",
    ...extra,
  };
  if (TOKEN) h.Authorization = `Bearer ${TOKEN}`;
  return h;
}

async function ghRest(path, { retry202 = false } = {}) {
  const url = `${GITHUB_API}${path}`;
  for (let attempt = 0; attempt < 2; attempt++) {
    const res = await fetch(url, { headers: ghHeaders() });
    if (res.status === 202 && retry202) {
      // GitHub regner ut statistikk i bakgrunnen — vent og prøv én gang til
      await sleep(6000);
      continue;
    }
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    if (res.status === 202) throw new Error(`GET ${path} → 202 (statistikk ikke klar)`);
    return res.json();
  }
  throw new Error(`GET ${path} → 202 etter retry`);
}

async function ghGraphql(query) {
  const res = await fetch(`${GITHUB_API}/graphql`, {
    method: "POST",
    headers: ghHeaders({ "Content-Type": "application/json" }),
    body: JSON.stringify({ query }),
  });
  if (!res.ok) throw new Error(`GraphQL → ${res.status}`);
  const body = await res.json();
  if (body.errors?.length) {
    // Delvise svar er ok (f.eks. ett repo som ikke finnes) — logg og fortsett
    for (const e of body.errors) console.warn(`  GraphQL-advarsel: ${e.message}`);
  }
  if (!body.data) throw new Error("GraphQL: tomt svar");
  return body.data;
}

/** Kuraterte repoer: stjerner, primærspråk, sist pushet, arkivstatus. */
async function fetchCuratedRepos(slugs) {
  const out = {};
  if (TOKEN) {
    const fields = slugs
      .map((slug, i) => {
        const [owner, name] = slug.split("/");
        return `r${i}: repository(owner: "${owner}", name: "${name}") {
          nameWithOwner stargazerCount pushedAt isArchived
          primaryLanguage { name color }
        }`;
      })
      .join("\n");
    const data = await ghGraphql(`query {\n${fields}\n}`);
    slugs.forEach((slug, i) => {
      const r = data[`r${i}`];
      if (!r) {
        console.warn(`  Fant ikke ${slug} — hopper over`);
        return;
      }
      out[slug] = {
        stars: r.stargazerCount,
        language: r.primaryLanguage?.name ?? null,
        languageColor: r.primaryLanguage?.color ?? LANGUAGE_COLORS[r.primaryLanguage?.name] ?? null,
        pushedAt: r.pushedAt,
        isArchived: r.isArchived,
      };
    });
  } else {
    for (const slug of slugs) {
      try {
        const r = await ghRest(`/repos/${slug}`);
        out[slug] = {
          stars: r.stargazers_count,
          language: r.language ?? null,
          languageColor: LANGUAGE_COLORS[r.language] ?? null,
          pushedAt: r.pushed_at,
          isArchived: r.archived,
        };
      } catch (e) {
        console.warn(`  ${slug}: ${e.message} — hopper over`);
      }
    }
  }
  return out;
}

/** Antall offentlige repoer i org-en. */
async function fetchRepoCount() {
  if (TOKEN) {
    const data = await ghGraphql(
      `query { organization(login: "${ORG}") { repositories(privacy: PUBLIC) { totalCount } } }`
    );
    return data.organization.repositories.totalCount;
  }
  const org = await ghRest(`/orgs/${ORG}`);
  return org.public_repos;
}

function daysAgoISO(days) {
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString().slice(0, 10);
}

/** Commits siste 7 dager (search API, total_count). */
async function fetchCommitsLast7Days() {
  const q = encodeURIComponent(`org:${ORG} is:public committer-date:>${daysAgoISO(7)}`);
  const data = await ghRest(`/search/commits?q=${q}&per_page=1`);
  return data.total_count;
}

/** Pull requests siste 30 dager (search API, total_count). */
async function fetchPrsLast30Days() {
  const q = encodeURIComponent(`org:${ORG} is:pr is:public created:>${daysAgoISO(30)}`);
  const data = await ghRest(`/search/issues?q=${q}&per_page=1&advanced_search=true`);
  return data.total_count;
}

/** npm-nedlastinger siste måned for Aksel-ikonene. */
async function fetchNpmDownloads() {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(NPM_PACKAGE)}`
  );
  if (!res.ok) throw new Error(`npmjs → ${res.status}`);
  const data = await res.json();
  return data.downloads;
}

/** «Nylig oppdatert» — de sist pushede repoene i org-en. */
async function fetchRecentlyUpdated() {
  const q = encodeURIComponent(`org:${ORG} is:public archived:false fork:false`);
  const data = await ghRest(`/search/repositories?q=${q}&sort=updated&order=desc&per_page=10`);
  return data.items
    .map((r) => ({
      name: r.name,
      url: r.html_url,
      pushedAt: r.pushed_at,
      language: r.language ?? null,
      languageColor: LANGUAGE_COLORS[r.language] ?? null,
    }))
    .sort((a, b) => new Date(b.pushedAt) - new Date(a.pushedAt))
    .slice(0, 6);
}

/**
 * Aktivitetskart: commits per dag siste 52 uker, aggregert over de
 * kuraterte repoene (ikke alle tusen). /stats/commit_activity gir
 * 52 uker × 7 dager (søn–lør) per repo; vi summerer per uketimestamp.
 * Repoer der statistikken ikke er klar (202) etter ett nytt forsøk,
 * utelates — kartet degraderer pent.
 */
async function fetchHeatmap(slugs) {
  const byWeek = new Map(); // unix-uke → number[7]
  let included = 0;
  for (const slug of slugs) {
    try {
      const weeks = await ghRest(`/repos/${slug}/stats/commit_activity`, { retry202: true });
      if (!Array.isArray(weeks)) continue;
      for (const w of weeks) {
        const acc = byWeek.get(w.week) ?? [0, 0, 0, 0, 0, 0, 0];
        w.days.forEach((n, i) => (acc[i] += n));
        byWeek.set(w.week, acc);
      }
      included++;
    } catch (e) {
      console.warn(`  commit_activity ${slug}: ${e.message} — utelatt fra kartet`);
    }
  }
  if (included === 0) return null;
  const weeks = [...byWeek.entries()]
    .sort(([a], [b]) => a - b)
    .slice(-52)
    .map(([week, days]) => ({ week, days }));
  return { repoCount: included, weeks };
}

/**
 * Språkfordeling: antall repoer per primærspråk via search API
 * (aktive, ikke-forks). Approksimasjon — resten havner i «Annet».
 * Search har egen rate limit; vi tar en liten pause mellom kallene.
 */
async function fetchLanguages() {
  const base = `org:${ORG} is:public archived:false fork:false`;
  const total = (await ghRest(`/search/repositories?q=${encodeURIComponent(base)}&per_page=1`))
    .total_count;
  const entries = [];
  for (const lang of CHART_LANGUAGES) {
    await sleep(2500);
    const q = encodeURIComponent(`${base} language:"${lang}"`);
    const data = await ghRest(`/search/repositories?q=${q}&per_page=1`);
    entries.push({ name: lang, count: data.total_count, color: LANGUAGE_COLORS[lang] ?? null });
  }
  entries.sort((a, b) => b.count - a.count);
  const known = entries.reduce((s, e) => s + e.count, 0);
  entries.push({ name: "Annet", count: Math.max(total - known, 0), color: null });
  return { totalRepos: total, entries };
}

async function main() {
  const projectsFile = readFileSync(join(DATA_DIR, "projects.yaml"), "utf8");
  const curated = parseYaml(projectsFile);
  const slugs = curated.projects.map((p) => p.repo);

  const previous = existsSync(OUT_FILE) ? JSON.parse(readFileSync(OUT_FILE, "utf8")) : {};

  const result = {
    syncedAt: new Date().toISOString(),
    org: ORG,
    npmPackage: NPM_PACKAGE,
  };

  /* Hver delhenting feiler for seg; forrige gode verdi beholdes. */
  const steps = [
    ["repos", () => fetchCuratedRepos(slugs)],
    ["stats.publicRepos", fetchRepoCount],
    ["stats.commitsLast7Days", fetchCommitsLast7Days],
    ["stats.prsLast30Days", fetchPrsLast30Days],
    ["stats.npmDownloadsLastMonth", fetchNpmDownloads],
    ["recentlyUpdated", fetchRecentlyUpdated],
    ["languages", fetchLanguages],
    ["heatmap", () => fetchHeatmap(slugs)],
  ];

  let failures = 0;
  for (const [key, fn] of steps) {
    process.stdout.write(`Henter ${key} … `);
    try {
      const value = await fn();
      setPath(result, key, value);
      console.log("ok");
    } catch (e) {
      failures++;
      const prev = getPath(previous, key);
      setPath(result, key, prev ?? null);
      console.log(`FEILET (${e.message})${prev != null ? " — beholder forrige verdi" : ""}`);
    }
    await sleep(1000);
  }

  writeFileSync(OUT_FILE, JSON.stringify(result, null, 2) + "\n");
  console.log(`\nSkrev ${OUT_FILE}`);
  if (failures > 0) {
    console.error(`${failures} delhenting(er) feilet.`);
    process.exitCode = 1; // nightly-jobben skal feile høylytt
  }
}

function setPath(obj, path, value) {
  const parts = path.split(".");
  let o = obj;
  for (const p of parts.slice(0, -1)) o = o[p] ?? (o[p] = {});
  o[parts.at(-1)] = value;
}
function getPath(obj, path) {
  return path.split(".").reduce((o, p) => o?.[p], obj);
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
});
