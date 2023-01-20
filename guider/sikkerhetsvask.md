Sikkerhetsvask av Git-repositories ved open sourcing
====================================================

Før et repository flyttes fra BitBucket til Github, må det gjøres en
kvalitetssikring av det som legges ut. Dette skal sikre at ikke sensitiv
informasjon kommer på avveie.

Sensitiv informasjon inkluderer:

* Personopplysninger, herunder fødselsnumre, navn, adresser, og telefonnumre
* Interne ID-er, f.eks aktør-ID og veilederident
* Passord og andre tilgangsnøkler
* Nettverkstopologi

Eksempler på sårbarheter kan være:

* Avhengighet på programbiblioteker der det foreligger sikkerhetshull (se [sårbarhetsscan](sårbarhetsscan.md))
* API-endepunkter som ikke er tilstrekkelig sikret
* Tilbøyelighet for Denial of Service (DoS-angrep)


Fremgangsmåte
-------------

Start med å ferdigstille alle pull requests, og sørg for at ingen jobber på
koden samtidig som den skal saneres.

Gjør deretter et
[søk i Git-historikken](#søke-etter-sårbarheter)
etter sensitiv informasjon. Dersom slik informasjon foreligger, må
[Git-historikken skrives om](#skrive-om-git-historikk).
Det er ikke nok å slette informasjonen i en ny commit.

Gjør `git rebase` og skriv om commit-meldinger der det trengs. Se
[om å skrive gode commit-meldinger]([https://github.com/navikt/utvikling/blob/master/Commit-meldinger.MD](https://github.com/navikt/offentlig/blob/master/guider/commit-meldinger.md))
for tips og råd.

Dersom Git-historikken er omskrevet, må det gjøres en force push til upstream.
Alle utviklere må slette sin lokale kopi, og sjekke ut repoet på nytt.


Skrive om Git-historikk
-----------------------

Bruk [BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/) og følg
fremgangsmåten i dokumentasjonen.


Søke etter sensitiv informasjon
----------------------

Blant verktøy for å søke, finnes
[git-secrets](https://github.com/awslabs/git-secrets),
[Repo-supervisor](https://github.com/auth0/repo-supervisor) og
[Truffle Hog](https://github.com/dxa4481/truffleHog).
