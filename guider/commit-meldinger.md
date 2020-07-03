# Om å skrive gode commit-meldinger

Commit-meldinger skal dokumentere endringer som er gjort i koden, slik at det er
enkelt å lese loggen i ettertid (`git blame`) for å forstå hvorfor en endringer gjort.

En commit-melding skal være så utfyllende at det er unødvendig å forklare endringen
i en pull-request eller JIRA-sak.

## Standardformat på en commit-melding:

> ```
> Kort (helst 50 tegn eller mindre) oppsummering
>
> Beskrivelse av hvorfor denne endringen er gjort.
> (Hva var problemet eller saken som skulle løses?)
> Vi commiter ikke kode inn i repoet helt uten grunn,
> det pleier å være en årsak til de endringene vi gjør.
>
> Alt ettersom hvilken endring det er snakk om,
> kan de lønne seg å ha kort eller lang tekst her.
>
> - Punktliste er også ok.
> - Bruk bindestrek for å lage punktliste.
> ```

## Ikke forklar *hva* som er gjort

Man kan lese ut av commit-diff-en hvilke
endringer som er gjort.

#### Dårlig commit-melding:

```
Skrev om kode i MinKlasse.java

Refaktorerte metoden "hallo" på linje 21
i MinKlasse.java, og lagde en ny hjelpefunksjon
som heter "oisann". Bruker BigInteger
i stedet for Integer.
```

## Forklar *hvorfor* noe er gjort, og *hvordan* det funker

Det er ikke alltid opplagt hvorfor noen
byttet fra Integer til BigInteger i koden.
En hjelpsom commit-melding forklarer altså
ikke hva som er gjort, men hvorfor endringen
er gjort.

#### God commit-melding:

```
Feilfiks: bruk BigInteger i pensjonsberegningen

Det viste seg at noen beregninger feilet på grunn
av for store tall, noe Integer ikke kunne håndtere.
Derfor brukes BigInteger nå i stedet.
```

## Ikke bruk JIRA-saksnummer eller issue-id

Eksterne brukere har ikke tilgang til JIRA, og har
derfor ikke forutsetninger for å forstå en endring.

#### Dårlig commit-melding:

```
JIRA-123 fiks
```

(med lang beskrivelse i støttesystem; JIRA-saken eller pull-requesten.)

Velg heller å ha en lang beskrivelse i commit-meldingen, og
referer til commit-historikken i støttesystemene.

## Ikke bruk one-linere som ikke forklarer noe som helst

#### Dårlig commit-melding:

```
wip
```

Hvis en commit er en del av en større sak, skriv heller
det i beskrivelsen.

#### Dårlig commit-melding (på master-branchen):

```
Prøver for n-te gang å fikse Jenkins-bygg
```

Gjør heller slike commits på en branch, og squash dem
før de merges til master-branchen. Det er lov å skrive om
git-historie på brancher.

## Pass på språkbruk

#### Dårlig commit-melding:

```
Prøver å fikse den jævla drittfeilen!!!

Helvete. Jeg hater java. NullPointerException kan ta seg en bolle.
```

Husk at alle kan lese meldingene, de kan være offentlige. Slike
meldinger stiller både NAV og deg personlig i et dårlig lys.

## Litt litteratur på engelsk om teamet:

- https://github.com/erlang/otp/wiki/writing-good-commit-messages
- https://gist.github.com/robertpainsi/b632364184e70900af4ab688decf6f53
- [How to Write a Git Commit Message](https://chris.beams.io/posts/git-commit/)

