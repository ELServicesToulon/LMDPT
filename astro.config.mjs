// @ts-check
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

/** Les redirections statiques d’Astro n’ont pas de H1. On en ajoute un, le 301 reste. */
function redirectStubHeading() {
  const stubs = [
    'analyses/livres-candidats/index.html',
    'analyses/quatremer-marianne/index.html',
  ];
  return {
    name: 'lmdpt-redirect-stub-heading',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        for (const rel of stubs) {
          const file = join(root, rel);
          const html = readFileSync(file, 'utf8');
          if (/<h1\b/i.test(html)) continue;
          writeFileSync(file, html.replace('</body>', '<h1>Page retirée</h1></body>'));
        }
      },
    },
  };
}

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
  integrations: [redirectStubHeading()],
  redirects: {
    '/analyses/quatremer-marianne': ANALYSIS_INDEX_REDIRECT,
    '/analyses/livres-candidats': ANALYSIS_INDEX_REDIRECT,
    '/analyses/on-a-vole-la-revolution-puis-la-revolte': ANALYSIS_INDEX_REDIRECT,
  },
});
