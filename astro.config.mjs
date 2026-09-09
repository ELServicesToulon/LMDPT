// @ts-check
import { defineConfig } from 'astro/config';

// Retired analysis URLs (GSC 404s). No replacement slug on Main — send to the index.
// Trailing-slash variants are covered by directory output (`…/slug/index.html`) plus
// default `trailingSlash: 'ignore'`. Query strings (UTM) follow the path redirect.
const ANALYSIS_INDEX_REDIRECT = {
  status: 301,
  destination: '/analyses/',
};

// https://astro.build/config
// CI : ASTRO_SITE=https://lmdpt.iarbre.org — local : défauts sans sous-chemin
export default defineConfig({
  site: process.env.ASTRO_SITE,
  base: process.env.ASTRO_BASE ?? '/',
  redirects: {
    '/analyses/quatremer-marianne': ANALYSIS_INDEX_REDIRECT,
    '/analyses/livres-candidats': ANALYSIS_INDEX_REDIRECT,
  },
});
