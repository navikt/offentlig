# Vil du ha repositories på GitHub?

Dette er en liten sjekkliste repositories må oppfylle for å være på GitHub.

## Lisens
NAV har valgt MIT som standard lisens. Alle repos [må ha en `LICENSE.md`](../LISENSIERING.md).

## Readme
Vi har en [standard README](../README.template.md) man kan ta utgangspunkt i.

I README må det også fremkomme et kontaktpunkt for koden/teamet. Dersom repoet er åpent *skal* det fremkomme en måte omverden kan ta kontakt på (epost, navn på person, osv). Som et tillegg kan man oppgi slack-kanal osv, men dette er selvfølgelig myntet på interne ansatte (som det står i readme-template).

## Codeowners
Her må teamet stå som eiere, på formatet: `*  @navikt/navn-på-team`. Eget team opprettes da på GitHub via navikt-organisasjonen. Enkeltpersoner skal ikke stå som codeowners.

Liste over tilgjengelige NAV-team på Github er her:
https://github.com/orgs/navikt/teams

Det maskinlesbare navnet på teamet er det man ser i URL-en når man går inn på teamet sin Github-side.

Eksempel `CODEOWNERS`-fil:

```
*  @navikt/navn-på-team
```

# Contributing
Her kan vi oppgi hvordan andre både eksterne og evt interne kan bidra på kodebasen:

Eksempel `CONTRIBUTING`-fil:
```
This project is open to accept feature requests and contributions from the open source community.
Please fork the repo and start a new branch to work on.


## Building locally
This project is using [Gradle](https://gradle.org/) for its build tool.
A Gradle Wrapper is included in the code though, so you do not have to manage your own installation.

To run a build simply exucute the following:

``` bash
./gradlew clean build
```

This will run all the steps defined in the `build.gradle.kts` file.


## Testing
If you are adding a new feature or bug fix please ensure there is proper test coverage.

## Pull Request Review
If you have a branch on your fork that is ready to be merged, please create a new pull request. The maintainers will review to make sure the above guidelines have been followed and if the changes are helpful to all library users, they will be merged.
```

## Sanering av gammel kode
Om det er flytting av eksisterende kode må både [kode og Git historikk vaskes](sikkerhetsvask.md)

## Scanning etter kjente sårbarheter i biblioteker
Programbiblioteker man er avhengig av må være uten kjente [sikkerhetshull](sårbarhetsscan.md)

## Commit-meldinger
Git historikken bør ha så mye verdi som mulig. Vi har derfor en [anbefaling til
gode commit meldinger](commit-meldinger.md)
