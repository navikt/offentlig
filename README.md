Retningslinjer for åpen kildekode i Nav
====================

## Introduksjon
Det er avgjørende viktig for Navs samfunnsoppdrag at det eksisterer et tillitsforhold mellom Nav og Navs brukere. Et viktig element for å skape tillit er åpenhet og gjennomsiktighet i det Nav gjør. Derfør bør mest mulig av koden og dokumentasjonen vi skriver være åpent tilgjengelig, på lik linje med lovene som vi implementerer. Offentlig finansierte løsninger bør være offentlig tilgjengelig. Motivasjonen er da ikke hovedsakelig gjenbruk, selv om det selvsagt er en heldig bieffekt. Motivasjonen er først og fremst åpenhet og gjennomsiktighet i de digitale løsningene.  Disse retningslinjene legger seg tett opptil retningslinjene fra tilsvarende retningslinjer fra gov.uk.

### Hvordan åpen kildekode skiller seg fra åpne standarder
Åpen kildekode er en måte å utvikle og distribuere programvare på. Koden skrives ofte i samarbeid, og den kan lastes ned, brukes og endres av hvem som helst. Se her for detaljer for MIT-lisensen som Nav bruker https://tldrlegal.com/license/mit-license og https://en.wikipedia.org/wiki/MIT_License.
Åpne standarder er felles regler som lar enhver bruker lage kompatible og konsistente produkter, prosesser og tjenester. De er designet i samarbeid, er offentlig tilgjengelige og gratis eller til lave kostnader. Vær oppmerksom på at det likevel kan påløpe kostnader ved åpen kildekode. Migreringskostnader (til og fra) bør tas med i vurderingen.

### Hvordan åpne kildekode.
Kildekoden legges på https://github.com/navikt

## Åpen kildekode 

### Ved å bruke åpen kildekode kan du:
* Nyttiggjøre deg allerede løste problemer med allmenn tilgjengelig teknologi
* Sparer tid og ressurser på tilpassede løsninger for å løse sjeldne eller unike problemer
* Oppnå lavere implementerings- og driftskostnader

 
### Hvordan din kode kan bli bedre om den er åpen:
Å publisere koden og dataene dine fra begynnelsen av kodebasens levetid eller programmet ditt vil oppmuntre til:
* renere og godt strukturert kode som er enklere å vedlikeholde
* klarhet rundt data som må forbli beskyttet og hvordan det oppnås
* forslag til hvordan koden kan forbedres eller hvor sikkerheten kan forbedres

### Sikkerhet: 
Åpen kildekode gir både muligheter og utfordringer for sikkerheten. Når vi åpner opp for innsyn kan eksterne melde fra om sikkerhetshull i koden vår, slik at vi ender opp med sikrere systemer. Samtidig må vi sørge for at sensitiv informasjon, slik som personopplysninger og tilgangsnøkler, ikke kommer i hendene til aktører med ondsinnede hensikter. En rekke verktøy er tilgjengelige for å sikre nødvendig sikkerhet ved å kode åpent, disse verktøyene gjør ting som skanning etter 3-parts biblioteker med kjente sårbarheter, finner feil/bugs i koden, automatisk penetrasjonstesting etc. Når man oppdager sårbarheter må man raskt kunne deploye ny kode, som lukker denne sårbarheten

### Ansvar: 
Teamet som eier koden har ansvaret for vurdere om koden er trygg å distribuere som åpen kildekode. Dersom koden overføres til et nytt team, må dette teamet gjøre en ny vurdering. Dette ansvaret gjelder i kodens levetid. 

## Kvalitet og relevans: 
All kode i Nav skal holde høy kvalitet, uavhengig om den er åpen eller lukket. At en kodebase har lav kodekvalitet er ikke i seg selv et argument for å la være å åpne den for innsyn, men et argument for å arbeide med å forbedre kodekvaliteten. 

## Krav til åpne repo under github.com/navikt
Alle repositories på Github under Nav IKT skal uavhengig av synlighet, oppfylle følgende krav. Dersom repositoryet ditt oppfyller disse kravene, så er det opp til teamet selv om de ønsker å ha koden åpent eller lukket.

### Lisens: 
Alle repoer må ha MIT-lisensen i en egen LICENSE-fil (plain text) eller en LICENSE.md-fil (markdown). Se [lisensiering.md](LISENSIERING.md)

### README.md: 
Alle repoer må ha en forklarende Read Me, enten som plaintext (README) eller som markdown (README.md). Vi oppfordrer teams til å beskrive hensikten med repoet, hvordan man bygger/tester koden samt hvordan man kan komme i kontakt med teamet på (både som intern og ekstern bruker). Bruk [denne templaten](README.template.md).

### Eierskap: 
GitHub har støtte for en spesiell fil som heter CODEOWNERS som angir hvilke team som eier koden, eller deler av den. Formatet i filen ligner mye på .gitignore, men følgende eksempel er et greit utgangspunkt for de fleste:
```
* @navikt/navn-på-team
```
Dette betyr at teamet navn-på-team eier hele kodebasen (* er wildcard). Vi ønsker ikke at enkeltpersoner skal stå oppført her.

#### Sanering av gammel kode: 
Både git-historikk og kode må vaskes for eventuelle hemmeligheter og personsensitive opplysninger. Her finnes det mange ulike verktøy man kan benytte seg av, og det finnes en liten guide på GitHub om dette.

#### Migrering av gammel kode: 
Ved migrering av gammel kode bør man kjøre en risikovurdering. Team Tryggnok har lagd et verktøy for å gjennomføre en slik ROS-analyse. Ta kontakt med teamet på Slack i kanalen #tryggnok
 
## Kode som ikke kan åpnes
Vi må holde noe data og kode lukket:
* nøkler og legitimasjon
* algoritmer som brukes til å oppdage svindel
* kode som implementerer lovendringer og forskrifter som ikke er ferdig behandlet.

> **Note**
> Kodebaser som vurderes til å ikke kunne være åpne skal ha et avsnitt i README hvor beslutningen begrunnes så konkret som mulig.
> Eks på begrunnelser om hvorfor kodebasen er lukket: [aad-iac](https://github.com/navikt/aad-iac) og [loginservice](https://github.com/navikt/loginservice)

### Nøkler og legitimasjon
Du må holde hemmelige data som nøkler eller legitimasjon lukket, fordi denne informasjonen kan tillate noen å få tilgang til systemet ditt. Du må videre holde kode som bruker hemmeligheter borte fra hemmelighetene i seg selv. Dette inkluderer lagring av hemmelige nøkler og legitimasjon. Du kan deretter åpne koden mens du holder hemmelighetene lukket og sikker. Du skal bruke et separat system for å lagre og sikre hemmelighetene dine, men la applikasjoner bruke dem der det er nødvendig. Et slikt system sørger for at bare autoriserte ansatte får tilgang til nøklene. Systemet gjør det også lettere å tilby forskjellige nøkler for forskjellige miljøer og rotere nøkler om nødvendig.
Følg veiledningen for å håndtere sikkerhetsproblemer hvis du ved et uhell eksponerer en hemmelighet. (TODO)

### Algoritmer for å avdekke svindel
Du bør lukke alle algoritmer du bruker for å oppdage svindel. Du bør også skille kode som bruker disse algoritmene fra algoritmene selv. Separasjonen vil gjøre det lettere for deg å oppdatere algoritmene når du lærer mer om svindelforsøkene.
 
### Lovendringer og forskrifter som ikke er iverksatt.
Hvis koden implementerer en lovendring eller forskrift som ennå ikke er kunngjort, kan denne koden ikke være åpen. Du bør imidlertid utvikle koden som om den allerede er åpen og fortsette å følge god utvikling og sikkerhetspraksis. Teamet bør vurdere å åpne koden så snart som mulig etter at lovendringen eller forskiften er kunngjort.


## Er du klar?
Sjekk ut guiden om [nye repo](guider/nye-repo.md). Husk at det er teamet selv som tar det ansvarlige valget om koden kan open sources eller ikke.

## Eller er du på vei bort? :(
Da burde du sjekke ut [praktiske ting rundt det å slutte hos oss](guider/slutte-i-nav.md)!