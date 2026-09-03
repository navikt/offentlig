# Åpen kildekode i Nav — showcase-nettside

Showcase-nettside av én statisk side som viser frem Navs åpne kildekode:
et håndplukket utvalg prosjekter med håndskrevne norske beskrivelser,
levende nøkkeltall fra GitHub og npm, aktivitetskart, språkfordeling
og en kondensert versjon av [retningslinjene for åpen kildekode](https://github.com/navikt/offentlig).

Bakgrunn, innhold og bindende designspesifikasjon: [PRD.md](PRD.md).

## Kom i gang

```bash
pnpm install
pnpm sync       # hent ferske tall (GITHUB_TOKEN anbefales, f.eks. GITHUB_TOKEN=$(gh auth token))
pnpm dev        # utviklingsserver på localhost:4321
pnpm build      # statisk bygg til dist/
```

`pnpm sync` er valgfritt lokalt — et øyeblikksbilde av
`src/data/generated.json` er sjekket inn, så siden bygger
deterministisk uten nett.

## Arkitektur

Mønster: **kuratert datafil + nattlig synk + statisk bygg** (PRD §6).

```
src/data/projects.yaml      redaksjonelt: repo, kategori, norsk beskrivelse, perle-flagg
                            (endres via pull request — aldri tall her)
scripts/sync.mjs            nattlig synk: stjerner, språk, sist aktiv, arkivstatus,
                            org-nøkkeltall, npm-nedlastinger, «nylig oppdatert»,
                            aktivitetskart og språkfordeling
                            → skriver src/data/generated.json
src/pages/index.astro       bygger hele siden fra de to datafilene
                            (bygget går aldri på nett)
```

- **Astro** med minimal klient-JavaScript: tematoggelen, pluss én progressiv
  forbedring — «Nylig oppdatert» friskes opp i nettleseren direkte fra GitHubs
  åpne REST-API (uautentisert, CORS `*`, 60 kall/time per besøkende IP).
  Siden er komplett uten JavaScript; feiler kallet, beholdes øyeblikksbildet
  fra nattlig synk i stillhet. NB: kallet går fra besøkendes nettleser til
  api.github.com — flagget for personvernvurdering før lansering.
  Aktivitetskartet genereres statisk fra ekte commit-data ved bygg.
- **Aktivitetskartet er org-vidt:** commits per dag i alle åpne navikt-repoer
  via commit-search (`total_count` per dato — kun standardgrenene indekseres).
  Rullerende vindu på de siste 364 hele UTC-døgnene t.o.m. i går, vedlikeholdt
  inkrementelt i `generated.json`: engangs backfill er ~364 datoer, kvotestyrt
  mot search-grensen på 30 kall/min (~20–25 min — retry ved
  `incomplete_results` dobler gjerne kallene), deretter henter natt-synken
  bare manglende datoer pluss de to siste på nytt (søkeindeksen henger
  etter) — ~3 kall per natt.
- **Tall er aldri håndvedlikeholdt.** Feiler en delhenting i synken,
  beholdes forrige gode verdi og jobben feiler høylytt (PRD §5.7 og §7).
  Unntak: «~90 produktteam» og «~2 400 deployer i uka» er Nav-interne
  cirkatall uten API-kilde (PRD §4.2).
- **Source Sans 3** (variabel, latin-subsett) er selv-hostet i `public/fonts/`.
- Lys og mørk modus med samme tokensett; `prefers-color-scheme` er
  standard, toggelen i headeren overstyrer.

## Deploy

**Forhåndsvisning (midlertidig):**
[`.github/workflows/showcase-preview.yml`](../.github/workflows/showcase-preview.yml)
holder `gh-pages` fersk fra `showcase`-grenen: én selvstendig jobb som
synker data, committer `generated.json` til `showcase`, bygger og
force-pusher `dist/` til `gh-pages` (`navikt.github.io/offentlig`).
Trigges av push til `showcase` og manuelt; cron-triggeren fyrer kun fra
standardgrenen, så en kopi av filen ligger på `main` for nattlig kjøring.
Feiler synken, deployes siste gode data — og kjøringen går rød (PRD §7).

**Permanent hjem:** workflow-utkast ligger i
[`.github-workflows-drafts/`](.github-workflows-drafts/)
(flyttes til `.github/workflows/` når siden får eget repo):

- `sync.yml` — nattlig cron: kjører synken og committer `generated.json`
- `deploy.yml` — bygger og deployer til GitHub Pages ved push til `main`
  og via `workflow_run` etter datasynken (synkens `GITHUB_TOKEN`-push
  trigger ikke push-hendelsen)

`SITE_URL` og `BASE_PATH` styrer om siden bygges for eget domene
(`kildekode.nav.no`) eller som prosjektside (`navikt.github.io/<repo>`),
se `astro.config.mjs`.

## Redaksjonelt vedlikehold

Utvalget endres i `src/data/projects.yaml` via pull request.
Beskrivelsene følger kortformelen i PRD §5.5: én setning på norsk,
stor forbokstav, punktum — aldri GitHub-beskrivelsen limt inn.
