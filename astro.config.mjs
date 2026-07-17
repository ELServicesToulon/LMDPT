// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// Canonique prod : https://lmdpt.iarbre.org (surcharge ASTRO_SITE si besoin)
export default defineConfig({
  site: process.env.ASTRO_SITE || 'https://lmdpt.iarbre.org',
  base: process.env.ASTRO_BASE ?? '/',
  trailingSlash: 'always',
});
