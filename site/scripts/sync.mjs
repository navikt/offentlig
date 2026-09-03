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

/* ---- Aktivitetskart, org-vidt ------------------------------------------- */

const DAY_MS = 86_400_000;
const HEATMAP_SOURCE = "search-org-daily";
const HEATMAP_WINDOW_DAYS = 364; // 52 hele uker
const SEARCH_PACE_MS = 1000; // høflig minsteavstand mellom search-kall
const MAX_DAY_FETCHES = 400; // tak (datoer) per kjøring — full backfill er ~364

const isoDay = (epochDay) => new Date(epochDay * DAY_MS).toISOString().slice(0, 10);

/**
 * Ett search-kall med kvotestyrt pacing. Search-limiten (30 kall/min) er
 * delt for hele search-API-et, og incomplete_results-retry kan i praksis
 * doble antall kall — derfor styres tempoet av kvote-headerne: nærmer
 * kvoten seg tom, soves det til X-RateLimit-Reset FØR neste kall i stedet
 * for å kjøre inn i 403-er. På 403/429 respekteres Retry-After der den
 * finnes.
 */
async function ghSearchThrottled(path) {
  for (let attempt = 0; ; attempt++) {
    const res = await fetch(`${GITHUB_API}${path}`, { headers: ghHeaders() });
    const remaining = Number(res.headers.get("x-ratelimit-remaining"));
    const reset = Number(res.headers.get("x-ratelimit-reset"));
    const retryAfter = Number(res.headers.get("retry-after"));
    if ((res.status === 403 || res.status === 429) && attempt < 4) {
      const waitMs = retryAfter
        ? retryAfter * 1000 + 500
        : Math.max((reset || 0) * 1000 - Date.now(), 5_000) + 1_500;
      console.warn(`  search rate limit (${res.status}) — venter ${Math.ceil(waitMs / 1000)} s`);
      await sleep(waitMs);
      continue;
    }
    if (!res.ok) throw new Error(`GET ${path} → ${res.status}`);
    const data = await res.json();
    if (remaining <= 1) {
      const waitMs = Math.max((reset || 0) * 1000 - Date.now(), 1_000) + 1_500;
      console.log(`  search-kvoten nesten tom — venter ${Math.ceil(waitMs / 1000)} s til reset`);
      await sleep(waitMs);
    }
    return data;
  }
}

/** Org-vidt antall commits på én UTC-dato. Commit-search indekserer kun
 *  standardgrenene — teksten på siden sier det ærlig. Retry ved
 *  incomplete_results; er svaret fortsatt ufullstendig, brukes verdien
 *  med høylytt advarsel. */
async function searchCommitCountForDay(date) {
  const q = encodeURIComponent(`org:${ORG} is:public committer-date:${date}`);
  const path = `/search/commits?q=${q}&per_page=1`;
  let data = await ghSearchThrottled(path);
  if (data.incomplete_results) {
    await sleep(SEARCH_PACE_MS);
    data = await ghSearchThrottled(path);
    if (data.incomplete_results) {
      console.warn(`  ADVARSEL: incomplete_results for ${date} — tallet kan være for lavt`);
    }
  }
  if (typeof data.total_count !== "number") throw new Error(`uventet svar for ${date}`);
  return data.total_count;
}

/**
 * Aktivitetskart: commits per dag i ALLE åpne navikt-repoer, via
 * commit-search (total_count per dato).
 *
 * Rullerende vindu på nøyaktig de siste 364 HELE UTC-døgnene, t.o.m.
 * i går — aldri i dag: et påbegynt døgn ville låst inn for lave tall.
 *
 * Inkrementelt: dager fra forrige generated.json gjenbrukes; kun datoer
 * som mangler i vinduet hentes, pluss alltid de to siste dagene på nytt
 * (søkeindeksen henger etter). Engangs backfill er ~364 datoer
 * (kvotebundet: ~20–25 min når incomplete_results-retry dobler kallene);
 * nattlig vedlikehold er ~3 kall. Det gamle commit_activity-formatet i
 * generated.json behandles som tomt (full backfill) — aldri krasj på
 * gammel form.
 *
 * Feiler én dato, mangler den dagen i utdata og kjøringen markeres som
 * delvis feilet (exit 1); kunne ingen datoer hentes når henting trengtes,
 * kastes det, slik at forrige kart beholdes på steg-nivå.
 */
/* Sjekkpunkt under backfill: en avbrutt kjøring (kill, nettbrudd) skal
   ikke kaste bort hundrevis av kvotebundne kall. Filen er utrackert
   (.gitignore); i CI gjenopptas det fra committet generated.json. */
const HEATMAP_CHECKPOINT = join(DATA_DIR, ".heatmap-checkpoint.json");

function daysFromMap(known) {
  return [...known.entries()]
    .sort(([a], [b]) => a - b)
    .map(([day, count]) => ({ date: isoDay(day), count }));
}

function mergeHeatmapDays(source, firstDay, lastDay, known) {
  if (source?.source !== HEATMAP_SOURCE || !Array.isArray(source.days)) return 0;
  let used = 0;
  for (const d of source.days) {
    const day = Math.floor(Date.parse(d.date) / DAY_MS);
    if (day >= firstDay && day <= lastDay && typeof d.count === "number" && !known.has(day)) {
      known.set(day, d.count);
      used++;
    }
  }
  return used;
}

async function fetchOrgHeatmap(previousHeatmap) {
  const lastDay = Math.floor(Date.now() / DAY_MS) - 1; // i går (UTC)
  const firstDay = lastDay - (HEATMAP_WINDOW_DAYS - 1);

  const known = new Map(); // epoch-dag → count
  mergeHeatmapDays(previousHeatmap, firstDay, lastDay, known);
  if (existsSync(HEATMAP_CHECKPOINT)) {
    try {
      const cp = JSON.parse(readFileSync(HEATMAP_CHECKPOINT, "utf8"));
      const used = mergeHeatmapDays(cp, firstDay, lastDay, known);
      if (used) console.log(`\n  aktivitetskart: gjenopptar ${used} dag(er) fra sjekkpunkt`);
    } catch {
      /* korrupt sjekkpunkt ignoreres */
    }
  }

  const toFetch = [];
  for (let day = firstDay; day <= lastDay; day++) {
    if (!known.has(day) || day >= lastDay - 1) toFetch.push(day);
  }
  const capped = toFetch.slice(0, MAX_DAY_FETCHES);
  if (capped.length < toFetch.length) {
    partialFail(
      `aktivitetskart: ${toFetch.length - capped.length} datoer utsatt til neste kjøring ` +
        `(tak på ${MAX_DAY_FETCHES} kall)`
    );
  }

  console.log(`\n  aktivitetskart: henter ${capped.length} dato(er), gjenbruker ${known.size}`);
  let fetched = 0;
  for (const day of capped) {
    const date = isoDay(day);
    try {
      known.set(day, await searchCommitCountForDay(date));
      fetched++;
      if (fetched % 25 === 0) {
        writeFileSync(
          HEATMAP_CHECKPOINT,
          JSON.stringify({ source: HEATMAP_SOURCE, days: daysFromMap(known) }) + "\n"
        );
      }
      if (fetched % 50 === 0) console.log(`  … ${fetched}/${capped.length}`);
    } catch (e) {
      partialFail(`aktivitetskart ${date}: ${e.message}`);
    }
    await sleep(SEARCH_PACE_MS);
  }
  if (capped.length > 0 && fetched === 0) {
    throw new Error("ingen dagstall kunne hentes — beholder forrige kart");
  }

  return { source: HEATMAP_SOURCE, days: daysFromMap(known) };
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
    ["heatmap", () => fetchOrgHeatmap(previous.heatmap)],
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
