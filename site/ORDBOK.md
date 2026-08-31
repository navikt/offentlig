# ORDBOK — terminologi for showcase-siten

Terminologisk referanse for den norske teksten i `site/`. Filen er den ordboka
`forfatter`-agenten skal følge (jf. agentens ORDBOK.md-protokoll i delegeringa fra
`@nav-pilot`). Der et ord ikke står her, gjelder den generelle lista i
`forfatter`-regelboka (`~/.copilot/agents/forfatter.agent.md`, seksjonen «Fagtermer»).

**Generelt prinsipp:** Engelske Kubernetes- og programvaretermer beholdes med
mindre det finnes en bredt etablert norsk oversettelse (etablert i norsk fagspråk,
f.eks. hos Digdir/Språkrådet eller i vanlig bransjebruk). Er du i tvil, behold
engelsk. En løsere norsk parafrase i forklarende prosa er greit, men selve termen
oversettes ikke på egen hånd.

Ordboka dekker to retninger:

- **Behold engelsk** — etablerte tekniske termer som *ikke* skal oversettes.
- **Bruk norsk** — steder der vi bevisst har valgt et norsk ord, fordi den norske
  oversettelsen er bredt etablert.

## Bøyning av engelske lånord

Engelske termer bøyes som norske ord: bøyningsendelsen settes **rett på**, uten
apostrof.

- bestemt form: «sidecaren», «tokenet», «secreten», «podden»
- flertall: «podene», «tokenene», «clustre», «containere»

**Bindestrek kun i sammensetninger**, ikke i bøyning:

- ✅ «sidecar-oppsett», «Kubernetes-sidecar», «OpenID Connect-sidecar», «secret-lager»
- ✅ «sidecaren», «podene» (bøyning — ingen bindestrek)
- ❌ «sidecar'en», «pod'ene» (ingen apostrof)
- ❌ «Kubernetes sidecar», «secret lager» (særskriving)

## Behold engelsk — aldri oversett

| Term | Aldri | Merknad |
|------|-------|---------|
| sidecar | «sidevogn» | Kjernebeslutning. Bøyes «sidecaren». «sidevogn» er feil. |
| secret | «hemmelighet» | Kubernetes-term. «secret-lager», ikke «hemmelighets-lager». |
| cluster | «klynge» | Bøyes «clusteret», flertall «clustre». Vær konsekvent — ikke «Kafka-klynge». |
| namespace | «navnerom» | Kubernetes-term. |
| pod | — | Bøyes «podden», «podene». |
| CRD | — | Custom Resource Definition. Også ressurstype/ressurs i prosa er OK. |
| container | «beholder» | Bøyes «containeren». |
| image | «avbilde», «bilde» | «container image». |
| deployment / deploy | «utrulling» | Substantivet «deployment» beholdes. «deploy» og «rulle ut» som verb er OK. |
| reverse proxy | «omvendt proxy» | |
| token | — | Bøyes «tokenet», «tokenene». «access-token», «API-token». |
| client secret | «klienthemmelighet» | OAuth-term. |
| endpoint | «endepunkt» | Merk: siten bruker «endepunkt» i én overskrift — ok som løsere prosa, men foretrekk «endpoint» i teknisk kontekst. |
| callback | «tilbakekall» | OAuth-flyt. Bøyes «callbacket». «tilbakekall» betyr revocation. |
| pull request | — | Ikke «forespørsel om fletting». |
| issue | «sak» | I GitHub/open source-kontekst. |
| operator | «operatør» | Kubernetes operator. Aldri «operatør» i denne betydningen. Bøyes «operatoren», flertall «operatorer». Sammensetninger: «Kubernetes-operator», «operator-oppsett», «operator-image». |
| controller | «kontroller» | Kubernetes-controller og MVC-controller. Bøyes «controlleren». |
| feature toggles / feature flags | «funksjonsbrytere» | Unleash-kontekst. «funksjonsbrytere» er ikke en bredt etablert oversettelse. Entall «feature toggle». Unntak: «bryter»/«brytertavle» beholdes som *visuell metafor* for de fysiske bryterne i unleasherator-heltebildet (se «Bruk norsk»). |
| reconcile / reconcile-løkke | — | Operator-terminologi. |
| ACL | «tilgangsliste» | Selve forkortelsen ACL beholdes; «tilgangsliste» kan brukes forklarende i prosa. |
| Unleash, Kubernetes, Kafka, BigQuery, Aiven, Helm | — | Produkt- og egennavn beholdes uendret. |

For alt annet: se «Alltid engelsk»-lista i `forfatter`-regelboka (image, node, release,
backup, failover, rollback, pipeline, workflow, runtime, framework, middleware, commit,
merge, branch, rebase, scope, payload, PVC, PDB m.fl.).

## Bruk norsk — bevisste valg

Radene under er beholdt fordi den norske oversettelsen er bredt etablert (Digdir,
Språkrådet eller vanlig bransjebruk), eller fordi ordet er allmennorsk.

| Norsk term | For | Merknad |
|------------|-----|---------|
| brytertavle / bryter | de fysiske bryterne i heltebildet | **Kun** som visuell metafor for bryterpanelet på unleasherator-siden (aria-label, board-note, animasjonskommentar). Selve produktbegrepet er «feature toggles» (se «Behold engelsk») — ikke bruk «bryter» om feature toggles i brødteksten. |
| identitetsleverandør | identity provider | Digdir-etablert norsk fagterm. |
| innlogging / pålogging | login / authentication | Etablert norsk i UI-tekst. |
| sesjon | session | Etablert norsk lånord. |
| tilganger | access / ACL-rettigheter i prosa | Allmennorsk. «setter opp tilgangene», «holder tilgangene i tråd». Selve ACL-forkortelsen beholdes engelsk. |
| legitimasjon | credentials | «legitimasjonen i en secret». Ikke «legitimasjonen» om selve secret-objektet — det er en «secret». |

## Konsistensmerknad

Siten bruker `cluster`/`clusteret`/`clustre` gjennomgående — hold deg til det, ikke
«klynge». Tilsvarende: `secret` (ikke «hemmelighet») og `sidecar` (ikke «sidevogn»)
overalt.
