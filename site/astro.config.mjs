// @ts-check
import { defineConfig } from "astro/config";

/*
 * SITE_URL og BASE_PATH settes av deploy-workflowen:
 *  - eget domene:   SITE_URL=https://kildekode.nav.no             (BASE_PATH utelates)
 *  - prosjektside:  SITE_URL=https://navikt.github.io BASE_PATH=/kildekode
 */
export default defineConfig({
  site: process.env.SITE_URL || "https://navikt.github.io",
  base: process.env.BASE_PATH || "/",
});
