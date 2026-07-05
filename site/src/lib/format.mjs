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

/** Relativ tid regnet fra synk-tidspunktet: «for 18 minutter siden». */
export function relativeTimeNo(iso, nowIso) {
  const diff = new Date(nowIso) - new Date(iso);
  const minutes = Math.floor(diff / 60_000);
  if (minutes < 1) return "for under ett minutt siden";
  if (minutes < 60) return `for ${minutes} ${minutes === 1 ? "minutt" : "minutter"} siden`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `for ${hours} ${hours === 1 ? "time" : "timer"} siden`;
  const days = Math.floor(hours / 24);
  if (days <= 30) return `for ${days} ${days === 1 ? "dag" : "dager"} siden`;
  return dateNo(iso);
}

/** «en lørdagskveld i juli» — regnes fra synk-tidspunktet. */
export function momentPhraseNo(iso) {
  const d = new Date(iso);
  const weekday = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, weekday: "long" }).format(d);
  const month = new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, month: "long" }).format(d);
  const hour = Number(
    new Intl.DateTimeFormat("nb-NO", { timeZone: TZ, hour: "numeric", hourCycle: "h23" }).format(d)
  );
  const tod =
    hour < 5 ? "natt" : hour < 10 ? "morgen" : hour < 12 ? "formiddag" : hour < 18 ? "ettermiddag" : "kveld";
  return `en ${weekday}s${tod} i ${month}`;
}
