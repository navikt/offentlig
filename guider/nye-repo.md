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
Dette prosjektet er åpent for å akseptere funksjonsforespørsler og bidrag fra åpen kildekode-fellesskapet.
Vennligst fork repoen og start en ny branch å jobbe med.


## bygge lokalt
Dette prosjektet bruker [Gradle](https://gradle.org/) som byggeverktøy.
En Gradle Wrapper er inkludert i koden, så du trenger ikke å administrere din egen installasjon.
For å kjøre eit bygg, utfør følgende kommado:
./gradlew clean build

Dette vil kjøre alle trinnene som er definert i `build.gradle.kts` filen.


## Testing
Hvis du legger til en ny funksjon eller feilretting, sørg for at det er riktig testdekning.

## Pull Request Tilbakemelding 
Hvis du har en branch på forken din som er klar til å slås sammen, vennligst opprett en ny pull-request. Vedlikeholderne vil gå gjennom for å sikre at retningslinjene ovenfor er fulgt, og hvis endringene er nyttige for alle bibliotekbrukere, vil de bli slått sammen
```

## Sanering av gammel kode
Om det er flytting av eksisterende kode må både [kode og Git historikk vaskes](sikkerhetsvask.md)

## Scanning etter kjente sårbarheter i biblioteker
Programbiblioteker man er avhengig av må være uten kjente [sikkerhetshull](sårbarhetsscan.md)

## Commit-meldinger
Git historikken bør ha så mye verdi som mulig. Vi har derfor en [anbefaling til
gode commit meldinger](commit-meldinger.md)
