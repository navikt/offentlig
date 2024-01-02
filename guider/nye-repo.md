# Vil du ha repositories på GitHub?

Dette er en liten sjekkliste repositories må oppfylle for å være på GitHub.

## Lisens
NAV har valgt MIT som standard lisens. Alle repos [må ha en `LICENSE.md`](../LISENSIERING.md).

## Readme
Vi har en [standard README](../README.template.md) man kan ta utgangspunkt i.

I README må det også fremkomme et kontaktpunkt for koden/teamet. Dersom repoet er åpent *skal* det fremkomme en måte omverden kan ta kontakt på (epost, navn på person, osv). Som et tillegg kan man oppgi slack-kanal osv, men dette er selvfølgelig myntet på interne ansatte (som det står i readme-template).

## Codeowners
I CODEOWNERS-filen kan man oppføre Github-teamet som eiere av repoet. OBS: Det er ikke sikkert du ønsker å gjøre dette. Konsekvensen er at for hver pull-request som opprettes i repoet blir teamet assignet som code reviewer. Det fører til at det går epostnotifikasjoner til alle medlemmer i teamet for alle endringer på alle pull-requester.

Gjøres på formatet: `*  @navikt/navn-på-team`. Enkeltpersoner skal ikke stå som codeowners. Liste over tilgjengelige NAV-team på Github er her:https://github.com/orgs/navikt/teams Det maskinlesbare navnet på teamet er det man ser i URL-en når man går inn på teamet sin Github-side.

Eksempel `CODEOWNERS`-fil:

```
*  @navikt/navn-på-team
```


## Sanering av gammel kode
Om det er flytting av eksisterende kode må både [kode og Git historikk vaskes](sikkerhetsvask.md)

## Scanning etter kjente sårbarheter i biblioteker
Programbiblioteker man er avhengig av må være uten kjente [sikkerhetshull](sårbarhetsscan.md)

## Commit-meldinger
Git historikken bør ha så mye verdi som mulig. Vi har derfor en [anbefaling til
gode commit meldinger](commit-meldinger.md)
