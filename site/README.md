# Åpen kildekode i Nav — showcase-nettside

Prototype av én statisk side som viser frem Navs åpne kildekode:
et håndplukket utvalg prosjekter med håndskrevne norske beskrivelser,
levende nøkkeltall fra GitHub og npm, aktivitetskart, språkfordeling
og en kondensert versjon av [retningslinjene for åpen kildekode](https://github.com/navikt/offentlig).

Bakgrunn, innhold og bindende designspesifikasjon:
[PRD-open-source-showcase.md](../PRD-open-source-showcase.md).
Godkjent designskisse: [mockup/index.html](../mockup/index.html).

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

- **Astro** uten klient-JavaScript — eneste script på siden er tematoggelen.
  Aktivitetskartet genereres statisk fra ekte commit-data ved bygg.
- **Tall er aldri håndvedlikeholdt.** Feiler en delhenting i synken,
  beholdes forrige gode verdi og jobben feiler høylytt (PRD §5.7 og §7).
  Unntak: «~90 produktteam» og «2 400 deployer i uka» er Nav-interne
  cirkatall uten API-kilde (PRD §4.2).
- **Source Sans 3** (variabel, latin-subsett) er selv-hostet i `public/fonts/`.
- Lys og mørk modus med samme tokensett; `prefers-color-scheme` er
  standard, toggelen i headeren overstyrer.

## Deploy

Workflow-utkast ligger i [`.github-workflows-drafts/`](.github-workflows-drafts/)
(flyttes til `.github/workflows/` når siden får eget repo):

- `sync.yml` — nattlig cron: kjører synken og committer `generated.json`
- `deploy.yml` — bygger og deployer til GitHub Pages ved push

`SITE_URL` og `BASE_PATH` styrer om siden bygges for eget domene
(`kildekode.nav.no`) eller som prosjektside (`navikt.github.io/<repo>`),
se `astro.config.mjs`.

## Redaksjonelt vedlikehold

Utvalget endres i `src/data/projects.yaml` via pull request.
Beskrivelsene følger kortformelen i PRD §5.5: én setning på norsk,
stor forbokstav, punktum — aldri GitHub-beskrivelsen limt inn.
