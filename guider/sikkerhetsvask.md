Sikkerhetsvask av Git-repositories ved open sourcing
====================================================

Før et repository åpnes, må det gjøres en
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
[om å skrive gode commit-meldinger](https://github.com/navikt/offentlig/blob/master/guider/commit-meldinger.md)
for tips og råd.

Dersom Git-historikken er omskrevet, må det gjøres en force push til upstream.
Alle utviklere må slette sin lokale kopi, og sjekke ut repoet på nytt. Har
repoet ligget på GitHub, må du også
[be GitHub Support om å fjerne restene](#fjerne-dataene-fra-github).


Skrive om Git-historikk
-----------------------

Har det lekket en secret (passord, token, API-nøkkel, sertifikat), må du
rotere eller tilbakekalle den først. Det er den eneste måten å stoppe misbruk på.
Å fjerne den fra historikken kommer i tillegg, ikke i stedet.

Har det lekket personopplysninger, er det et avvik. Meld det etter Navs
rutiner for avvikshåndtering.

En force push med omskrevet historikk er ikke nok. Dataene kan fortsatt ligge
på GitHub:

* i pull requests: GitHub lar deg ikke overskrive `refs/pull/*`, så gamle
  commits kan fortsatt nås via PR-er
* i bufrede visninger (cached views): commits kan åpnes direkte med SHA
* i forks og i lokale kloner hos andre

Bare GitHub Support kan fjerne de to første. Forks og kloner må eierne rydde
selv. Kloner hos andre utenfor organisasjonen er utenfor Navs kontroll.

### Rydde lokalt med git-filter-repo

> [!WARNING]
> Stegene under skriver om historikken og sletter data for godt. Commit-hasher
> endres, diffen i gamle pull requests forsvinner, og arbeid som ikke er pushet
> kan gå tapt. Er du usikker, spør i
> #github-support på Slack
> før du begynner.

GitHub anbefaler [git-filter-repo](https://github.com/newren/git-filter-repo)
med flagget `--sensitive-data-removal`. Vi anbefalte tidligere
[BFG Repo Cleaner](https://rtyley.github.io/bfg-repo-cleaner/), men BFG gir
ikke informasjonen GitHub Support ber om.

1. Merge eller lukk alle åpne pull requests, og si fra til alle som jobber i
   repoet at de må stoppe til du er ferdig.
2. Installer git-filter-repo, versjon 2.47 eller nyere:

   ```shell
   brew install git-filter-repo
   ```

3. Klon repoet på nytt, slik at du jobber i en fersk kopi:

   ```shell
   git clone https://github.com/navikt/REPO
   cd REPO
   ```

4. Fjern dataene. For å slette en fil fra hele historikken, oppgi full sti
   i repoet, ikke bare filnavnet. Har fila hatt andre stier (flyttet eller
   gitt nytt navn), legger du til én `--path` per sti:

   ```shell
   git-filter-repo --sensitive-data-removal --invert-paths --path sti/til/fil.txt
   ```

   For å erstatte bestemte verdier i alle tekstfiler, lag en fil utenfor repoet
   med én verdi per linje, og kjør:

   ```shell
   git-filter-repo --sensitive-data-removal --replace-text ../hemmeligheter.txt
   ```

   Ta vare på output fra kommandoen. Du trenger linja
   `NOTE: First Changed Commit(s)` når du kontakter GitHub Support.

5. Sjekk at dataene er borte fra alle branches og tags:

   ```shell
   git log --all -p -S 'verdien-som-lekket'
   ```

6. Tell hvor mange pull requests omskrivingen påvirker:

   ```shell
   grep -c '^refs/pull/.*/head$' .git/filter-repo/changed-refs
   ```

   Er tallet høyere enn ventet, kan du slette klonen og starte på nytt. Etter
   neste steg kan du ikke angre.

7. Slå midlertidig av branch protection som hindrer force push, og push:

   ```shell
   git push --force --mirror origin
   ```

   Push av `refs/pull/*` vil feile. Det er forventet. Feiler andre refs, er de
   trolig beskyttet. Slå av beskyttelsen og push på nytt til bare
   `refs/pull/*` feiler. Slå deretter på branch protection igjen.

### Fjerne dataene fra GitHub

Opprett en sak hos [GitHub Support](https://support.github.com) med:

* organisasjon og repo, for eksempel `navikt/REPO`
* antall pull requests som er påvirket (fra steg 6)
* commit-ene fra `NOTE: First Changed Commit(s)` i output fra git-filter-repo
* fila som er nevnt hvis output inneholder
  `NOTE: There were LFS Objects Orphaned by this rewrite`

GitHub Support fjerner referansene fra de berørte pull requestene, eller sletter
dem helt. De kjører også garbage collection på serveren og fjerner bufrede
visninger. Hvis bare referansene fjernes, blir PR-beskrivelse og kommentarer
liggende. Sjekk om noen har sitert de sensitive dataene der, og rediger eller
slett i så fall kommentarene.

GitHub Support hjelper bare når risikoen ikke kan fjernes ved å rotere en
secret. Forklar derfor i saken hvorfor rotering ikke er nok, for eksempel at det
gjelder personopplysninger.

### Etter oppryddingen

* Alle som har en klone, må slette den og klone på nytt. Én `git pull`
  etterfulgt av `git push` fra en gammel klone legger dataene tilbake.
  Branches fra gammel historikk må rebases, ikke merges.
* Finnes det forks, må du be eierne slette dem eller rydde selv. GitHub
  oppgir ikke kontaktinformasjon til eierne.
* Commit-signaturer forsvinner fra omskrevne commits, og diffen i gamle pull
  requests blir borte.
* Slå på [push protection](https://docs.github.com/en/code-security/concepts/secret-security/push-protection)
  for å stoppe nye secrets før de havner i repoet.

Se GitHubs egen guide,
[Removing sensitive data from a repository](https://docs.github.com/en/authentication/keeping-your-account-and-data-secure/removing-sensitive-data-from-a-repository),
for flere detaljer.


Søke etter sensitiv informasjon
----------------------

Blant verktøy for å søke, finnes
[git-secrets](https://github.com/awslabs/git-secrets),
[Repo-supervisor](https://github.com/auth0/repo-supervisor) og
[Truffle Hog](https://github.com/dxa4481/truffleHog).
