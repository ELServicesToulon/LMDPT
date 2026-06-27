// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// CI : ASTRO_SITE=https://lmdpt.iarbre.org — local : défauts sans sous-chemin
export default defineConfig({
  site: process.env.ASTRO_SITE,
  base: process.env.ASTRO_BASE ?? '/',
});
