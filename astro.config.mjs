// @ts-check
import { defineConfig } from 'astro/config';

// https://astro.build/config
// CI GitHub Pages : ASTRO_SITE + ASTRO_BASE=/LMDPT/ — local : défauts sans sous-chemin
export default defineConfig({
  site: process.env.ASTRO_SITE,
  base: process.env.ASTRO_BASE ?? '/',
});
