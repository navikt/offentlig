/**
 * Norsk formatering — brukes kun på byggetidspunktet.
 * Alle klokkeslett og datoer regnes i norsk tid (Europe/Oslo).
 */

const THIN = " "; // tynt, hardt mellomrom som tusenskille (3 102)
const TZ = "Europe/Oslo";

/** 3102 → «3 102» (tynt mellomrom, jf. PRD §5.4). */
export function formatNumber(n) {
  if (n == null) return "–";
  return String(n).replace(/\B(?=(\d{3})+(?!\d))/g, THIN);
}

/** ISO-dato → «5. juli 2026». */
export function dateNo(iso) {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: TZ,
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** ISO-dato → «5. juli 2026 kl. 21.28» (norsk punktum i klokkeslett). */
export function dateTimeNo(iso) {
  const time = new Intl.DateTimeFormat("nb-NO", {
    timeZone: TZ,
    hour: "2-digit",
    minute: "2-digit",
  })
    .format(new Date(iso))
    .replace(":", ".");
  return `${dateNo(iso)} kl. ${time}`;
}

/** ISO-dato → «juni 2026» (til «Sist aktiv i …» på kortene). */
export function monthYearNo(iso) {
  return new Intl.DateTimeFormat("nb-NO", {
    timeZone: TZ,
    month: "long",
    year: "numeric",
  }).format(new Date(iso));
}

/** Relativ tid regnet fra synk-tidspunktet: «for 18 minutter siden».
 *  Entall skrives ut: «for ett minutt siden», «for én time siden»,
 *  «for én dag siden» — aldri «for 1 minutter siden»-varianter. */
export function relativeTimeNo(iso, nowIso) {
  const diff = new Date(nowIso) - new Date(iso);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "for under ett minutt siden";
  if (minutes === 1) return "for ett minutt siden";
  if (minutes < 60) return `for ${minutes} minutter siden`;
  const hours = Math.floor(minutes / 60);
  if (hours === 1) return "for én time siden";
  if (hours < 24) return `for ${hours} timer siden`;
  const days = Math.floor(hours / 24);
  if (days === 1) return "for én dag siden";
  if (days <= 30) return `for ${days} dager siden`;
  return dateNo(iso);
}
