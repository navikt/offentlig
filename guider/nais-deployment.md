## Guide for deployment til NAIS via Circleci
Benytter Circleci, Dockerhub, deployment-cli, Naiserator og NAIS Deployment

1. [Legg til / follow](https://circleci.com/add-projects/gh/navikt) repoet ditt i Circleci
2. Opprett / kopier en Circleci pipeline (E.g [React pipelinen](https://github.com/navikt/personopplysninger/tree/master/.circleci) fra *Personopplysninger* eller [Spring pipelinen](https://github.com/navikt/personopplysninger-api/tree/master/.circleci) fra *Personopplysninger-API*. Disse benytter [deployment-cli](https://github.com/navikt/deployment-cli), er generiske og innhenter informasjonen de trenger, som reponavn, branch etc via env. variabler fra Circleci).
3. Legg til / kopier en naiserator config (E.g [nais.config.yaml](https://github.com/navikt/personopplysninger/blob/master/nais.config.yaml)). Variabler vil bli injecta av deployment-cli ved deploy.
4. Opprett et repository under Navikt på [Dockerhub](https://hub.docker.com/). Anbefaler å holde reponavnet identisk med Github for å kunne benytte Circleci env. variabler og dermed begrense manuell config.
5. Legg til "bots" med read/write tilganger under repoets permissions i dockerhub og legg til teamet ditt som admin. 
6. Legg til følgende environmental variabler i Circleci.
```
DOCKER_USER=naviktdocker
DOCKER_PASS=passord
```
7. Gi [team-personbruker](https://github.com/organizations/navikt/settings/apps/team-personbruker) / teamets Github App tilgang til å opprette deployment requests til repoet. Ligger under "Github App" -> "Install App" -> Tannhjulet -> "Only select repositories" -> Huk av Github repoet

*  For eksterne utenfor team-personbruker: En applikasjon må opprettes og installeres på Navikt organisasjonen dersom dere ikke har en eksisterende Github App. Obs: Da må du også endre appid i circleci pipelinen / config.yaml.

8. Benytt en eksisterende / opprett en ny "Private key" under Github App-en, "Base64" encode innholdet i fila og legg stringen / nøkkelen inn som GITHUB_DEPLOY_KEY under environmental variables i circleci. 
```
GITHUB_DEPLOY_KEY=base64(Private key)
```

*  Obs: Denne kan gjenbrukes, så anbefaler å lagre nøkkelen et trygt sted.

9. Gi NAIS deployment tilgang til å deployere applikasjonen via https://deployment.prod-sbs.nais.io/auth/login. 

* Obs: NAIS Deployment fortsetter at personbruker/teamet er lagt til under "teams" i Github repoet. I tillegg må den som registrerer tilgangen være maintainer i teamet.

## Forklaring av pipeline
Gjelder kun ved bruk av pipelinen til *Personopplysninger* eller *Personopplysninger-api*. </br>
Hvert team står fritt frem til å konfigurere sin egen pipeline.
* Samtlige commits vil bygges. 
* Push / merge til master trigger en automatisk deploy til dev-sbs, namespace default.
* Commits til branches kan manuelt deployeres til dev-sbs i Circleci.
* Deployering til produksjon kan godkjennes i Circleci når en commit er [tagget](https://help.github.com/en/articles/creating-releases) og pushes til master.
