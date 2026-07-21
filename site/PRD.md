# PRD: Åpen kildekode i Nav — showcase-nettside

**Status:** Draft v1 · 2026-07-05
**Eier:** @navikt/offentlig (foreslått)
**Arbeidstittel:** *Åpen kildekode i Nav* (foreslått domene: `kildekode.nav.no`, fallback `navikt.github.io/kildekode`)

---

## 1. Bakgrunn og problem

Nav er sannsynligvis Norges største bidragsyter til åpen kildekode i offentlig sektor: **3 100+ offentlige repoer** på [github.com/navikt](https://github.com/navikt), **215** på [github.com/nais](https://github.com/nais), et designsystem ([Aksel](https://aksel.nav.no)) med ~400 000 npm-nedlastinger/måned for ikonpakken, en applikasjonsplattform ([Nais](https://nais.io)) som Statistisk sentralbyrå har adoptert i sin helhet, og saksbehandlingskode som ligger åpent («law as code», f.eks. [helse-spleis](https://github.com/navikt/helse-spleis)).

Men i dag er **GitHub selv den eneste utstillingen** — og 3 100 usorterte repoer er et oppdagbarhetsproblem, ikke en fortelling:

- Retningslinjene i `navikt/offentlig` forklarer *hvorfor og hvordan* vi åpner kode, men viser ikke frem *hva* vi har åpnet.
- Perlene drukner: `fnrvalidator` har ~53 000 npm-nedlastinger/måned men 20 stjerner; `digdirator` kunne vært gjenbrukt av enhver norsk etat, men er nesten usynlig.
- Et tidligere forsøk på en portal ([nav-aapen-kildekode](https://github.com/navikt/nav-aapen-kildekode)) ble arkivert i 2020. `data.nav.no` er borte. Historien viser at en showcase uten automatikk og eierskap dør.

## 2. Mål

Én enkel, statisk nettside som:

1. **Forteller hvorfor**: «Offentlig finansierte løsninger bør være offentlig tilgjengelig» — transparens som hovedmotivasjon, gjenbruk som gevinst (i tråd med retningslinjene i dette repoet).
2. **Viser frem det beste**: 15–30 kuraterte flaggskip og skjulte perler, med håndskrevne norske én-linjere og automatisk oppdaterte tall.
3. **Peker videre**: til GitHub-organisasjonene, retningslinjene, Aksel, Nais og fellesskapet (Offentlig PaaS).

### Suksesskriterier

| Kriterium | Mål |
|---|---|
| Siden holder seg fersk uten manuelt arbeid | Metadata maks 24 t gammel; synlig «Sist oppdatert»-stempel |
| Kurert innhold vedlikeholdes | Minst 1 redaksjonell endring per kvartal; eierteam i CODEOWNERS |
| Brukes i rekruttering og kommunikasjon | Lenkes fra detsombetyrnoe.no og presse-/foredragsmateriell |
| Gjenbruk i offentlig sektor | Henvendelser/issues fra andre etater; trafikk fra .no-offentlige domener |
| Tilgjengelighet | WCAG 2.1 AA, publisert tilgjengelighetserklæring |

### Ikke-mål

- **Ikke** en uttømmende katalog over alle 3 100 repoer (det er GitHub sin jobb; code.gov døde av uttømmende compliance uten kuratering).
- **Ikke** en blogg eller nyhetsside (Aksels produktblogg og detsombetyrnoe.no finnes).
- **Ikke** en erstatning for aksel.nav.no, nais.io eller ki-utvikling.nav.no — siden lenker dit.
- **Ikke** en supportkanal; Nav gir ingen supportgaranti til eksterne brukere, og siden skal si det ærlig.
- Ingen backend, database eller innlogging.

## 3. Målgrupper og brukerhistorier

Prioritert rekkefølge:

1. **Utviklere (rekruttering)** — «Som utvikler som vurderer Nav vil jeg se hva slags teknologi og kvalitet Nav faktisk leverer, så jeg kan avgjøre om dette er et sted jeg vil jobbe.» Vil ha: språk/teknologi-fasetter, levende tall, ekte kode, dark mode.
2. **Andre offentlige virksomheter** — «Som arkitekt i en etat/kommune vil jeg finne løsninger Nav har bygget som vi kan gjenbruke, så vi slipper å bygge selv.» Vil ha: problemområde-kategorier («hva løser dette?»), produksjonsstatus, lisens, kontaktpunkt. (Jf. developers.italia.it: etater navigerer etter domene, ikke programmeringsspråk.)
3. **Allmennheten og presse** — «Som journalist/innbygger vil jeg forstå at Nav bygger i det åpne for skattepengene, og se konkrete eksempler.» Vil ha: klarspråk-fortelling, tallene, DSF-historien (folketrygdsystemet 1967–2018 som museumsgjenstand), «loven som kode».

## 4. Innhold og informasjonsarkitektur

Én side (one-pager) i MVP, med ankernavigasjon. Norsk (bokmål), klarspråk.

### 4.1 Hero — «Vi bygger i det åpne»
Kort manifest (2–3 setninger): offentlig finansiert → offentlig tilgjengelig; kode åpen «på linje med lovene vi forvalter». Nav-logo (rød #C30000 — eneste bruk av rødt). Primær-CTA: «Utforsk prosjektene» + «Se alt på GitHub».

### 4.2 Tallene og pulsen
Narrative nøkkeltall (ikke live-tellere som kan vise 0), alle hentet av nightly-jobben og presentert med «Sist oppdatert»-stempel:

- **Statisk verifiserbare (GitHub/npm-API):** åpne repoer (3 102), commits siste 7 dager (8 127), pull requests siste 30 dager (21 667), npm-nedlastinger siste måned (399 223 for Aksel-ikonene). Verifisert mot API-ene 2026-07-05 — alle er én spørring hver.
- **Nav-interne (krever manuell/annen kilde):** ~90 produktteam og ~2 400 deployer/uka (fra detsombetyrnoe.no; bør få en avtalt kilde eller merkes «cirka»).
- **Pulsen (aktivitetslag):** GitHub-style aktivitetskart over commits per dag siste 52 uker (sekvensiell accent-blå), og en «Nylig oppdatert»-liste med de sist pushede repoene (GitHub search API, `sort=updated`). Poenget er bevis på liv: feeden viser gjerne pushes fra samme time.
- **Ærlighetsregel:** botter (Dependabot m.fl.) er med i commit/PR-tallene — siden sier det eksplisitt i stempelet i stedet for å filtrere og forklare.

### 4.3 Utvalgte prosjekter (kuratert, 15–30 stk.)
Kort-grid gruppert i kategorier som treffer begge fasetter (domene for etater, teknologi synlig på kortet for utviklere). Gridet og «Bygd for gjenbruk» (§4.4) er **disjunkte**: hvert prosjekt vises på nøyaktig ett sted — ett prosjekt, én plass — og gjenbruk vinner. Et gjenbruksprosjekt (alt med `gjenbruk:`-felt i `projects.yaml`) dukker derfor aldri opp i gridet. Gridet er prosjekter uten `gjenbruk:`-felt, gruppert slik (eksemplene under er dagens grid):

- **Plattform** — naiserator, texas, naisdevice
- **Designsystem** — Aksel (komponenter, tokens, over 900 ikoner)
- **Biblioteker og verktøy** — rapids-and-rivers, nav-faker
- **Åpenhet i forvaltningen** — helse-spleis («en liten kalkulator for sykepenger»), spraksjekk
- **Data og KI** — copilot

**Kortformel** (Spotify-mønsteret): navn · håndskrevet norsk én-linjer (ikke GitHub-beskrivelsen) · primærspråk · ⭐ stjerner · sist aktiv · vedlikeholdt-av «Team X i Nav» · ev. status-badge (`aktiv`/`arkivert`) · lenke til GitHub. Tall auto-synkes; tekst er redaksjonell.

### 4.4 Bygd for gjenbruk
Egen seksjon rett etter prosjektgridet, som svarer direkte på persona 2 (arkitekter i andre etater) og suksessmålet «Gjenbruk i offentlig sektor»: en samlet, kompakt liste over prosjekter som er laget for at også andre virksomheter skal kunne ta dem i bruk — MIT-lisensiert og klare i dag. Kom fra tilbakemelding fra en kollega på prototypen: *«Skulle vi fått inn en liste over repoer/prosjekter som er bygd med tanke på at andre også kan bruke de? Ghep vet jeg er tatt i bruk av Miljødirektoratet også.»*

**Disjunkt fra gridet (§4.3)** — et prosjekt vises på nøyaktig ett sted: ett prosjekt, én plass, og gjenbruk vinner. Alt med `gjenbruk:`-felt bor kun her og filtreres bevisst ut av «Utvalgte prosjekter», så seksjonene aldri overlapper. Denne seksjonen viser fulle rader (ikke duplikat av gridkortene).

**Datamodell** (redaksjonell, aldri synket) — nytt valgfritt felt `gjenbruk:` per prosjekt i `projects.yaml`. Selv et tomt objekt (`{}`) løfter prosjektet inn i seksjonen. Valgfrie underfelt:
- `bruktAv:` — liste med navngitte virksomheter utenfor Nav. Rendres som «Brukt av X (og Y)».
- `merknad:` — fritekst når vi ikke kan navngi noen konkret adopter (f.eks. «Brukt langt utenfor Nav»); vises kun når `bruktAv` mangler.

**Ærlighetsregel** (jf. §7): aldri gjett en adopter. `bruktAv` skal kun inneholde håndverifiserte påstander og endres via pull request. Etter offentlig kildegransking (juli 2026) har `ghep` (Miljødirektoratet), `digdirator` (Kartverket), `fnrvalidator` (Norges domstoler, DNB m.fl.) og `mock-oauth2-server` (Elasticsearch, Apache Kafka m.fl.) navngitte brukere med offentlig etterprøvbare kilder, dokumentert som kommentarer i `projects.yaml`. `bruktAv` kan navngi virksomheter eller kjente åpne prosjekter. Kompakt liste (ikke fulle kort — unngår duplikat av prosjektgridet): navn, håndskrevet én-linjer, primærspråk (synket), og ev. «✓»-linje.

**Landingssider** — hvert gjenbruksprosjekt får en egen landingsside, med mindre det allerede har en utenfor repoet (`ghep` → navikt.github.io/ghep, `cplt` → ki-utvikling.nav.no/cplt). Sidene ligger under `/prosjekt/<navn>/` og pekes ut med `side:`-feltet i `projects.yaml`; gjenbrukslisten lenker dit i stedet for til GitHub. Sidene er **bespoke, aldri generert fra en mal**: felles er kun tokens, topplinje (`ProsjektHeader`) og bunnlinje (`ProsjektFooter`) — heltemotivet skal komme fra prosjektets egen verden (digdirator: manifestet + reconcile-loggen; fnrvalidator: en levende validator; osv.). Alle påstander på sidene følger samme ærlighetsregel, og tall hentes fra `generated.json`.

### 4.5 Skjulte perler
Liten seksjon for prosjekter vi er stolte av uten at de er noe å gjenbruke — ren historiefortelling: *DSF* (IT-dinosauren som gikk av med pensjon etter 51 år). Gjenbruksprosjekter dupliseres bevisst ikke hit (fnrvalidator og digdirator lå her opprinnelig, men bor nå i gjenbruksseksjonen med hver sin landingsside). Seksjonen tåler én enkelt perle (gridet auto-tilpasser) og er fortsatt det som gjør siden *autentisk* snarere enn korporativ.

### 4.6 Slik jobber vi åpent
Kondensert versjon av retningslinjene med lenke til `navikt/offentlig`: motivasjon (transparens først), prosessen (risikovurdering → sikkerhetsvask → krav → publiser), MIT-lisens, og de tre ærlige unntakene (hemmeligheter, svindelalgoritmer, ikke-vedtatte lovendringer). Å publisere policyen er i seg selv showcase-innhold (jf. GOV.UK «Coding in the Open», Microsofts program-side).

### 4.7 Fellesskapet
Offentlig PaaS (grunnlagt 2017 av Nav og Skatteetaten, 2 000+ medlemmer fra 80+ virksomheter), SSBs adopsjon av Nais, samarbeid på tvers av etater. + «Vil du bruke noe av dette?» med forventningsavklaring (ingen support-SLA, men issues er velkomne).

### 4.8 Footer
Lenker: github.com/navikt · github.com/nais · aksel.nav.no · nais.io · ki-utvikling.nav.no · detsombetyrnoe.no · retningslinjene · tilgjengelighetserklæring · «Sist oppdatert {dato} — siden bygges automatisk, kildekoden er selvsagt åpen».

## 5. Design

Prinsipp: **nav.no-slektskap, nais.io-holdning.** Umiskjennelig Nav for alle som kjenner merkevaren, men med den avslappede, likemannsaktige tonen Nav allerede bruker mot utviklere (nais.io, Aksel «Darkside»).

Poleringsfilosofi: en side ser billig ut når den er *nesten* konsistent. Derfor er reglene under prescriptive — hver verdi kommer fra Aksel-tokens, og prototypen skal ikke inneholde én eneste hardkodet farge-, avstands- eller skriftverdi utenom disse.

### 5.1 Grunnvalg

- **Tokens:** Aksel Darkside (`--ax-*`), både lys og mørk modus (dark mode er et sterkt utviklersignal Nav selv bruker på aksel.nav.no). Prototypen bruker `@navikt/ds-tokens` (CSS-variabler) direkte; `@navikt/ds-react`-komponenter der de finnes (LinkCard, Tag, Button, Link, HGrid, Box).
- **Typografi:** Source Sans 3 (variabel font, self-hostet — CSP/personvern), 18 px grunnstørrelse, vekt 400/600 — Navs mest gjenkjennelige trekk.
- **Ingen dekoratør:** Siden er utviklerrettet, ikke innbyggerrettet — samme valg som aksel.nav.no og nais.io.
- **Tone:** Klarspråk. «Du/vi», aktiv setningsbygging, ingen superlativer. Tørr humor er innenfor (presedens: «Darkside», «pensjonert IT-dinosaur»).

### 5.2 Layout og rytme

Det som oftest avslører en uferdig side er ujevn vertikal rytme og tilfeldige bredder. Derfor:

- **Innholdsbredde:** maks **1152 px** for grid-seksjoner; **prosa maks 576 px** (~65 tegn ved 18 px — Aksels 50–75-tegnsregel). Løpende tekst skal aldri strekkes over full sidebredde.
- **Sideluft:** 16 px (mobil) / 32 px (≥768 px) / 48 px (≥1024 px) horisontal margin.
- **Vertikal rytme:** seksjoner skilles med **96 px** (mobil: 64 px). Innenfor en seksjon: overskrift → ingress 16 px, ingress → innhold 40 px. Én skala, ingen unntak.
- **Grid:** kort i 3 kolonner ≥1024 px, 2 ≥640 px, 1 under; **24 px gutter** begge veier. Alle kort i samme rad har lik høyde (grid, ikke flexbasert masonry).
- **Seksjonsbakgrunner:** hvit grunnflate; annenhver innholdsseksjon kan ligge på en myk tint (se 5.3) i **full sidebredde** med innholdet sentrert i maksbredden. Aldri tint bak bare halve seksjoner eller kort-i-kort.

### 5.3 Fargeoppskrift

- **Rødt (#C30000) kun i logo/ordmerke.** Aldri som UI-farge — rødt betyr feil i Navs semantikk.
- **Grunnflate:** `--ax-bg-default` (hvit) med tekst `--ax-text-neutral` (neutral-1000). Dempet metatekst: `--ax-text-neutral-subtle` — aldri egen grå.
- **Identitetstinter:** seksjonsbakgrunner veksler mellom `brand-beige` soft (hero, «tallene») og `brand-blue`/`info` soft («fellesskapet»). Kun 100–200-steg som flater; 700+-steg kun som tekst/dekor på tint.
- **Interaksjon:** all lenke/CTA-farge er accent-blå (`--ax-text-accent` / `--ax-bg-accent-strong`, ≈ #0063C1). Én interaksjonsfarge på hele siden.
- **Kategorifarger:** kun som Tag/badge på kort — Plattform: info, Designsystem: brand-magenta, Biblioteker: accent, Åpenhet: brand-beige, Data/KI: meta-purple. Alltid soft-variant (tint-bakgrunn + mørk tekst i samme familie). Maks én kategorifarge synlig per kort; ellers blir gridet en regnbue.
- **Mørk modus:** samme tokens (de flipper selv). Krav: begge tema testes ved hver endring; tema-toggle i header; `prefers-color-scheme` som default.

### 5.4 Typografisk hierarki

| Element | Stil | Størrelse/linje | Vekt |
|---|---|---|---|
| Hero-tittel | Heading XL | 40/52 (mobil 32/40) | 600 |
| Seksjonstittel | Heading L | 32/40 | 600 |
| Ingress | BodyLong L | 20/28 | 400 |
| Korttittel | Heading XS | 20/28 | 600 |
| Brødtekst/kortbeskrivelse | BodyLong M | 18/28 | 400 |
| Metadata (stjerner, språk, team) | Detail | 14/20 | 400 |

Regler: aldri mer enn to vekter (400/600); aldri sentrert brødtekst (kun hero-tittel + ingress kan sentreres); `text-wrap: balance` på overskrifter; norske anførselstegn «»; tall i metadatarader med `font-variant-numeric: tabular-nums` (ellers «hopper» stjernetallene); tusenskille med tynt mellomrom (3 102, ikke 3102 eller 3,102).

### 5.5 Kort-anatomi (prosjektkortet er sidens viktigste komponent)

```
┌──────────────────────────────────────┐
│ [Tag: Biblioteker]        [arkivert?]│  Detail, soft-tint tag
│ mock-oauth2-server                   │  Heading XS, lenkefarge
│ Mock av OAuth2/OIDC for testing —    │  BodyLong M, neutral, håndskrevet,
│ brukt langt utenfor Nav.             │  maks 2 linjer (line-clamp)
│                                      │
│ Kotlin · ⭐ 394 · aktiv i juni 2026  │  Detail, subtle, tabular-nums
│ Vedlikeholdes av Team Auth i Nav     │  Detail, subtle
└──────────────────────────────────────┘
```

- Ramme `1px solid --ax-border-neutral-subtle`, radius **12 px**, padding **24 px**, ingen skygge (Darkside bruker rammer, ikke skygger).
- Hele kortet er klikkbart (LinkCard); hover: ramme → accent + bakgrunn `--ax-bg-accent-soft`, transition 150 ms på farger — **ingen** scale/translate-effekter.
- Språkprikk i språkets GitHub-farge er lov; ellers ingen dekor. Ikke repo-avatarer/emojier — de gjør gridet rotete.
- Alle beskrivelser skal ha samme form: én setning, stor forbokstav, punktum, uten «Dette repoet inneholder …».

### 5.6 Hero og grafisk motiv

- Komposisjon: venstrestilt/sentrert tekstblokk på brand-beige-soft flate; Nav-logo (rød) oppe til venstre; tittel + 2 setninger manifest + to CTA-er (primær Button + sekundær Link). Ingen illustrasjonsjakt i MVP — **whitespace og typografi er heroen**.
- Tillatt motiv hvis ønsket: et diskret «kode-vitne» — f.eks. et ekte utdrag fra `projects.yaml` eller MIT-lisensen satt i monospace på tintflaten, maks 40 % bredde, aldri stock-foto, aldri generiske «kode-regn»-illustrasjoner.
- Monospace ved kodeutdrag: systemets mono-stack; kun som sitat/vitne, aldri i UI-tekst.
- **Data som ornament:** sidens grafiske lag er dataene selv — aktivitetskart, språkprikker, levende «nylig oppdatert»-liste — pluss strekikoner fra `@navikt/aksel-icons` (24 px, 1,5–2 px strek) på nøkkeltall og seksjoner. Illustrasjoner er fase 2 og krever designer; generiske «tech-illustrasjoner» er ikke et alternativ.

### 5.7 Mikrodetaljer som avgjør poleringen

1. **Fokus:** Aksel-fokusring (`--ax-focus`-tokens, 3 px blå ytre ring) på alt interaktivt — aldri `outline: none`.
2. **Overganger:** 150 ms `ease` på farger, ingenting annet animeres. `prefers-reduced-motion` respekteres (skru av alt).
3. **Ikoner:** kun `@navikt/aksel-icons` (stroke-stil), 20/24 px, aldri emoji som ikonerstatning i UI (emoji er ok i redaksjonell tekst, sparsomt).
4. **Eksterne lenker:** ExternalLink-ikon fra Aksel; alle GitHub-lenker åpner i samme fane (ingen `target="_blank"`-refleks).
5. **«Sist oppdatert»-stempelet:** Detail-stil i footer + øverst i prosjektseksjonen; dato på norsk («5. juli 2026»).
6. **Tomme tilstander:** hvis nightly-synk feiler, vises siste gode data med stempel — aldri 0-ere eller spinnere (openCoDE-fellen).
7. **Skeleton/lasting finnes ikke:** alt er statisk bygget; siden skal være komplett i første byte. Ett dokumentert unntak: «Nylig oppdatert» friskes opp i nettleseren fra GitHubs åpne REST-API som progressiv forbedring — øyeblikksbildet fra synken står seg uten JavaScript og beholdes i stillhet hvis kallet feiler (kvote/nettverk). Kallet går fra besøkendes nettleser til api.github.com og skal personvernvurderes før lansering.
8. **Favicon/og-bilde:** Nav-logo på hvit; og:image med tittel satt i Source Sans 3 på brand-beige — samme regler som resten.

### 5.8 Anti-mønstre (avvis i review)

- Hardkodede hex/px-verdier utenfor token-settet; «nesten-Aksel»-farger.
- Drop-shadows, gradienter, glassmorphism, hover-scale — alt dette bryter Darksides rolige uttrykk.
- GitHub-beskrivelser limt rett inn på kort (engelsk + ujevn form = uferdig-signal nr. 1).
- Mer enn én interaksjonsfarge, mer enn to skriftvekter, mer enn tre skriftstørrelser per seksjon.
- Kort med ulik høyde i samme rad; tekst som klippes uten line-clamp.
- Live-tellere, karuseller, autoplay, parallax.
- Blanding av norsk og engelsk i UI-tekst (engelske faguttrykk i beskrivelser er greit; UI-etiketter er norske).

### 5.9 Kvalitetsporter for prototypen

Før prototypen vises frem skal den:

1. **Side-om-side-testen:** skjermbilde ved siden av aksel.nav.no og nais.io — den skal se ut som en søsken, ikke en kopi eller en fremmed.
2. **Beggetema-testen:** hver seksjon screenshotes i lys og mørk modus; ingen «glemte» hvite flater i mørk modus.
3. **Lighthouse ≥ 95** på Performance/A11y/Best Practices/SEO; axe-core uten feil; full tastaturnavigasjon med synlig fokus hele veien.
4. **Bruddpunkt-testen:** 360, 768, 1024, 1440 px — ingen horisontal scroll, prosa aldri over 75 tegn.
5. **Zoom-testen:** 200 % zoom og 400 % (WCAG 1.4.10 reflow) uten tap av innhold.
6. **Innholds-testen:** alle kortbeskrivelser lest høyt i én økt — lik form, lik lengde, klarspråk.

### 5.10 Tilgjengelighet

WCAG 2.1 AA (lovkrav, uutilsynet): 4.5:1 kontrast, synlig fokus, semantisk HTML (én `<h1>`, seksjoner med `<h2>`, landemerker), tilgjengelighetserklæring. Aksel-tokens/-komponenter gir det meste gratis; kvalitetsportene i 5.9 verifiserer resten.

## 6. Teknisk løsning

**Mønster: kuratert datafil + nattlig GitHub-API-synk + statisk bygg** (Spotify-mønsteret — beste forhold mellom innsats og troverdighet).

- **Generator:** Astro (anbefalt: null JS som default, kan bruke `@navikt/ds-react`-komponenter som øyer ved behov, ellers rene tokens/CSS). Alternativ: Eleventy.
- **Hosting:** GitHub Pages fra eget offentlig repo `navikt/kildekode` (arbeidstittel), deploy via GitHub Actions. Egendefinert domene `kildekode.nav.no` hvis DNS lar seg avklare; ellers `navikt.github.io/<repo>`.
- **Data:**
  - `projects.yaml` — den kuraterte listen: repo-slug, kategori, håndskrevet beskrivelse, team, ev. «perle»-flagg. Endres via PR (redaksjonell terskel = kodegjennomgang).
  - Nattlig Action (cron) henter stjerner, språk, siste aktivitet, arkivstatus m.m. fra GitHub GraphQL API → committer `projects.generated.json` → Pages rebygger. Aldri et håndvedlikeholdt tall.
  - Org-nøkkeltall og puls hentes i samme jobb (alle verifisert 2026-07-05):
    - repo-antall: GraphQL `organization.repositories(privacy: PUBLIC).totalCount`
    - commit-tempo: `GET /search/commits?q=org:navikt+committer-date:>{7d}` → `total_count`
    - PR-tempo: `GET /search/issues?q=org:navikt+is:pr+created:>{30d}` → `total_count`
    - npm-nedlastinger: `api.npmjs.org/downloads/point/last-month/@navikt/aksel-icons`
    - «Nylig oppdatert»: `GET /search/repositories?q=org:navikt+archived:false+fork:false&sort=updated`
    - aktivitetskart: org-vide commits per dag via `GET /search/commits?q=org:navikt+committer-date:{dato}` → `total_count` (commit-search indekserer kun standardgrenene — teksten på siden sier det). Rullerende vindu på de siste 364 hele UTC-døgnene t.o.m. i går, vedlikeholdt inkrementelt i generated.json: engangs backfill er ~364 datoer, kvotestyrt mot search-grensen på 30 kall/min (~20–25 min — retry ved incomplete_results dobler gjerne kallene), deretter henter natt-synken bare manglende datoer pluss de to siste på nytt (søkeindeksen henger etter) — ~3 kall per natt
- **Repoet er selv et forbilde:** MIT-lisens, README etter malen i dette repoet, CODEOWNERS (team, ikke enkeltpersoner), CONTRIBUTING, SECURITY, dokumentert datapipeline. Siden demonstrerer policyen den omtaler.

## 7. Motvirke forfall (lærdom fra code.gov, Netflix OSS og nav-aapen-kildekode)

Dette er den viktigste ikke-funksjonelle egenskapen:

1. All metadata automatiseres; redaksjonelt innhold er begrenset til ~30 korte tekster.
2. Synlig «Sist oppdatert»-tidsstempel (tillitssignal + intern alarmklokke).
3. Arkiverte prosjekter merkes ærlig automatisk (arkivstatus kommer fra API-et).
4. Navngitt eierteam i CODEOWNERS med avtalt kvartalsvis redaksjonssjekk (15 min: stemmer utvalget fortsatt?).
5. Nightly-jobben feiler høylytt (Slack-varsel) hvis API-synk stopper.

## 8. Faser

**MVP (fase 1):** One-pager med seksjonene over, ~20 kuraterte prosjekter, nattlig synk, lys + mørk modus, WCAG AA, tilgjengelighetserklæring.

**Fase 2 (etter behov):** Engelsk språkversjon · «Utforsk alle»-side med søk/filter over hele org-en · publiccode.yml-metadata per repo (åpner for høsting av developers.italia.it-type portaler og en ev. norsk nasjonal katalog) · maintainer-portretter/intervjuer (BlueHats-inspirert) · årlig «Nav open source i tall»-oppsummering (Meta-mønsteret).

**Bevisst utelatt:** blogg, kommentarer, analytics utover enkel personvernvennlig telling.

## 9. Åpne spørsmål

1. **Domene:** Kan `kildekode.nav.no` (el.l.) delegeres til GitHub Pages, eller starter vi på navikt.github.io? Hvem eier avklaringen mot domeneforvaltning?
2. **Eierskap:** Er @navikt/offentlig riktig eierteam, eller bør det ligge hos Nav Tech-kommunikasjon (detsombetyrnoe.no-miljøet)?
3. **Navn:** «Åpen kildekode i Nav» er beskrivende; finnes det appetitt for noe med mer personlighet (jf. «Darkside»)?
4. **Kuratert utvalg v1:** Forslaget i 4.3–4.5 er research-basert — trenger en runde med teamene som eier prosjektene (og deres OK til å stå som kontaktpunkt).
5. **pdfgen → pdfgenrs:** pdfgen er merket deprecated til fordel for arvtakeren `pdfgenrs` (Rust, Typst-maler; opprettet mars 2026). Kuratert utvalg og landingsside beholder pdfgen så lenge produksjonshistorien er argumentet, med tydelig skilt om arvtakeren begge steder — byttes ut når pdfgenrs har egen produksjonshistorie å vise til.
6. **Nais-org-en:** Skal nais-repoer kurateres inn på lik linje (anbefalt: ja, med tydelig org-merking), eller kun lenkes via nais.io?

---

## Vedlegg A — Research-grunnlag (verifisert 2026-07-05)

- **navikt:** 3 102 offentlige repoer (1 810 aktive / 1 292 arkiverte); Kotlin ~39 %, deretter TypeScript, Java, JS, Python. Toppstjerner: mock-oauth2-server (394★), aksel (184★), cplt (98★), DSF (55★), copilot (52★), offentlig (50★).
- **nais:** 215 repoer; SSB adopterte Nais-plattformen (des. 2024).
- **Ekstern bruk:** @navikt/aksel-icons ~399k npm-nedl./mnd; fnrvalidator ~53k/mnd; mock-oauth2-server ~5,4M Docker-pulls.
- **Eksisterende kanaler:** detsombetyrnoe.no (rekruttering, nøkkeltall), aksel.nav.no, nais.io, ki-utvikling.nav.no. Ingen levende showcase-side; nav-aapen-kildekode arkivert 2020; data.nav.no nede.
- **Designfakta:** Nav-rød #C30000 (kun logo/identitet); Aksel Darkside-tokens (`--ax-*`, OKLCH, lys+mørk); Source Sans 3, 18 px base; WCAG 2.1 AA lovpålagt siden 2023.
- **Mønsterreferanser:** spotify.github.io (kuratert YAML + nattlig GraphQL-synk — anbefalt arkitektur), opensource.fb.com («by the numbers»-rapport), opensource.microsoft.com (bidragstrakt), developers.italia.it (domene-navigasjon for etater), code.gouv.fr (BlueHats-fellesskap), code.gov/netflix.github.io (forfallsvarsler).
