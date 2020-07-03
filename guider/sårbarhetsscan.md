# Sårbarheter i avhengigheter

Det oppdages jevnlig sikkerhetshull i tredjeparts rammeverk og biblioteker. 
For å minske sannsynligheten for at vår kode også blir sårbar som følge av dette har NAV kjøpt tilgang til to ulike tjenster 
som kan scanne våre repo etter kjente sårbarheter. Disse er [Snyk](https://snyk.io/) og [Dependabot](https://dependabot.com/).
Alle våre repo skal ta i bruk en (eller begge) av disse, og det er teamets ansvar å kontinuerlig følge opp varsler fra disse tjenestene.

## Sette opp scanning med Snyk

Følg anvisningene [her](https://support.snyk.io/hc/en-us/categories/360000449098-Getting-started)

## Sette opp scanning med Dependabot

Under `Settings` -> `Security & Analysis` for GitHub-repoet, velg `Enable` på `Dependabot alerts`

Vurder også å bruke f.eks
[Nessus](https://www.tenable.com/products/nessus/nessus-pro) til å scanne etter andre kjente sårbarheter.


