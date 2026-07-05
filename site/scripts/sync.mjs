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
 * generated.json (aldri 0-ere på siden — jf. PRD §5.7 pkt. 6), og
 * jobben feiler høylytt (exit 1) — også ved delvise feil, f.eks. et
 * kuratert repo som mangler i svaret (PRD §7).
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
const FNR_PACKAGE = "@navikt/fnrvalidator";

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

/* Delvise feil (repo som mangler, statistikk som uteble): verdien brukes,
   men jobben skal likevel gå rød — aldri stille datasvinn. */
let partialFailures = 0;
function partialFail(msg) {
  partialFailures++;
  console.warn(`  DELVIS FEIL: ${msg}`);
}

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

/**
 * Search-API med sjekk av `incomplete_results`: tidsavbrutte søk gir for
 * lave tall. Vi prøver én gang til; er svaret fortsatt ufullstendig,
 * brukes verdien — men med høylytt advarsel i loggen.
 */
async function ghSearch(path) {
  let data = await ghRest(path);
  if (data.incomplete_results) {
    console.warn(`  incomplete_results på ${path} — prøver én gang til`);
    await sleep(3000);
    data = await ghRest(path);
    if (data.incomplete_results) {
      console.warn(
        `  ADVARSEL: søket er fortsatt ufullstendig (incomplete_results) — ` +
          `verdien fra ${path} kan være for lav`
      );
    }
  }
  return data;
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
    /* NOT_FOUND per alias (f.eks. ett flyttet repo) håndteres per repo av
       kalleren; alt annet (rate limit, auth, skjemafeil) er fatalt. */
    const fatal = body.errors.filter((e) => e.type !== "NOT_FOUND");
    if (fatal.length) {
      throw new Error(`GraphQL: ${fatal.map((e) => e.message).join("; ")}`);
    }
    for (const e of body.errors) console.warn(`  GraphQL NOT_FOUND: ${e.message}`);
  }
  if (!body.data) throw new Error("GraphQL: tomt svar");
  return body.data;
}

/**
 * Kuraterte repoer: stjerner, primærspråk, sist pushet, arkivstatus.
 * Mangler et repo i svaret, beholdes forrige verdi fra generated.json
 * og kjøringen markeres som delvis feilet — et repo forsvinner aldri
 * stille fra siden.
 */
async function fetchCuratedRepos(slugs, previousRepos = {}) {
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
      if (!r) return; // backfilles under
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
        console.warn(`  ${slug}: ${e.message}`); // backfilles under
      }
    }
  }
  for (const slug of slugs) {
    if (out[slug]) continue;
    const prev = previousRepos?.[slug];
    if (prev) {
      out[slug] = prev;
      partialFail(`${slug} mangler i svaret — beholder forrige verdi`);
    } else {
      partialFail(`${slug} mangler i svaret og har ingen tidligere verdi`);
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

/**
 * Nedre grense for søkevinduet: fullt ISO-8601-tidsstempel i UTC,
 * nøyaktig nå − N døgn. Brukes med `>=` — bare dato med `>` ville gitt
 * et vindu på ~6,1/29,1 døgn i stedet for 7/30.
 */
function sinceISO(days) {
  const d = new Date(Date.now() - days * 86400_000);
  return d.toISOString().slice(0, 19) + "+00:00";
}

/** Commits siste 7 dager (search API, total_count). */
async function fetchCommitsLast7Days() {
  const q = encodeURIComponent(`org:${ORG} is:public committer-date:>=${sinceISO(7)}`);
  const data = await ghSearch(`/search/commits?q=${q}&per_page=1`);
  return data.total_count;
}

/** Pull requests siste 30 dager (search API, total_count). */
async function fetchPrsLast30Days() {
  const q = encodeURIComponent(`org:${ORG} is:pr is:public created:>=${sinceISO(30)}`);
  const data = await ghSearch(`/search/issues?q=${q}&per_page=1&advanced_search=true`);
  return data.total_count;
}

/** npm-nedlastinger siste måned for en gitt pakke. */
async function fetchNpmDownloads(pkg) {
  const res = await fetch(
    `https://api.npmjs.org/downloads/point/last-month/${encodeURIComponent(pkg)}`
  );
  if (!res.ok) throw new Error(`npmjs ${pkg} → ${res.status}`);
  const data = await res.json();
  if (typeof data.downloads !== "number") throw new Error(`npmjs ${pkg} → uventet svar`);
  return data.downloads;
}

/**
 * «Nylig oppdatert» — de sist pushede repoene i org-en.
 * `sort=updated` sorterer på updated_at (som også bumpes av stjerner
 * og issues), så vi henter romslig og sorterer selv på pushed_at.
 */
async function fetchRecentlyUpdated() {
  const q = encodeURIComponent(`org:${ORG} is:public archived:false fork:false`);
  const data = await ghSearch(`/search/repositories?q=${q}&sort=updated&order=desc&per_page=30`);
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
 * 52 uker × 7 dager (søn–lør) per repo; vi summerer per uketimestamp
 * (normalisert til UTC-midnatt — enkelte repoer svarer med timeskjev
 * uke-start rundt sommertid).
 *
 * Repoer der statistikken ikke er klar (202) etter ett nytt forsøk,
 * utelates — kartet degraderer pent, men kjøringen markeres som delvis
 * feilet, og `includedRepos` viser dekningen. Gir ingen repoer data,
 * kastes det, slik at forrige kart beholdes.
 */
async function fetchHeatmap(slugs) {
  const byWeek = new Map(); // unix-uke (UTC-midnatt) → number[7]
  const includedRepos = [];
  for (const slug of slugs) {
    try {
      const weeks = await ghRest(`/repos/${slug}/stats/commit_activity`, { retry202: true });
      if (!Array.isArray(weeks)) {
        partialFail(`commit_activity ${slug}: uventet svar — utelatt fra kartet`);
        continue;
      }
      for (const w of weeks) {
        const week = Math.floor(w.week / 86400) * 86400; // normaliser til UTC-midnatt
        const acc = byWeek.get(week) ?? [0, 0, 0, 0, 0, 0, 0];
        w.days.forEach((n, i) => (acc[i] += n));
        byWeek.set(week, acc);
      }
      includedRepos.push(slug);
    } catch (e) {
      partialFail(`commit_activity ${slug}: ${e.message} — utelatt fra kartet`);
    }
  }
  if (includedRepos.length === 0) {
    throw new Error("ingen repoer ga commit_activity — beholder forrige kart");
  }
  const weeks = [...byWeek.entries()]
    .sort(([a], [b]) => a - b)
    .slice(-52)
    .map(([week, days]) => ({ week, days }));
  return { repoCount: includedRepos.length, includedRepos, weeks };
}

/**
 * Språkfordeling: antall repoer per primærspråk via search API
 * (aktive, ikke-forks). Approksimasjon — resten havner i «Annet».
 * Search har egen rate limit; vi tar en liten pause mellom kallene.
 */
async function fetchLanguages() {
  const base = `org:${ORG} is:public archived:false fork:false`;
  const total = (await ghSearch(`/search/repositories?q=${encodeURIComponent(base)}&per_page=1`))
    .total_count;
  const entries = [];
  for (const lang of CHART_LANGUAGES) {
    await sleep(2500);
    const q = encodeURIComponent(`${base} language:"${lang}"`);
    const data = await ghSearch(`/search/repositories?q=${q}&per_page=1`);
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
    fnrPackage: FNR_PACKAGE,
  };

  /* Hver delhenting feiler for seg; forrige gode verdi beholdes. */
  const steps = [
    ["repos", () => fetchCuratedRepos(slugs, previous.repos)],
    ["stats.publicRepos", fetchRepoCount],
    ["stats.commitsLast7Days", fetchCommitsLast7Days],
    ["stats.prsLast30Days", fetchPrsLast30Days],
    ["stats.npmDownloadsLastMonth", () => fetchNpmDownloads(NPM_PACKAGE)],
    ["stats.fnrDownloadsLastMonth", () => fetchNpmDownloads(FNR_PACKAGE)],
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
  if (failures > 0 || partialFailures > 0) {
    if (failures > 0) console.error(`${failures} delhenting(er) feilet.`);
    if (partialFailures > 0) console.error(`${partialFailures} delvis(e) feil (se DELVIS FEIL over).`);
    process.exitCode = 1; // nightly-jobben skal feile høylytt (PRD §7)
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
