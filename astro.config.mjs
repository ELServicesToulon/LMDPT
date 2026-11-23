// @ts-check
import { readFileSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'astro/config';

const DEFAULT_ASTRO_SITE = 'https://lemediadupremiertour.fr';
const siteUrl = (process.env.ASTRO_SITE ?? DEFAULT_ASTRO_SITE).replace(/\/$/, '');
const ANALYSES_INDEX_CANONICAL = `${siteUrl}/analyses/`;

const REDIRECT_STUB_PATHS = [
  'analyses/livres-candidats/index.html',
  'analyses/quatremer-marianne/index.html',
  'analyses/on-a-vole-la-revolution-puis-la-revolte/index.html',
];

/** Pages renommées : canonique = nouvelle URL, pas de H1 « Page retirée ». */
const RENAMED_REDIRECT_STUBS = [
  {
    rel: 'analyses/voter-a-16-ans-l-urne-plutot-que-le-blocus/index.html',
    canonical: `${siteUrl}/analyses/voter-a-16-ans-une-loi-suffirait-elle/`,
    refresh: '/analyses/voter-a-16-ans-une-loi-suffirait-elle/',
  },
];

function patchRedirectStubHtml(html) {
  const canonicalTag = `<link rel="canonical" href="${ANALYSES_INDEX_CANONICAL}" />`;
  let out = html;
  if (/<link[^>]+rel=["']canonical["']/i.test(out)) {
    out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, canonicalTag);
  } else if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `  ${canonicalTag}\n</head>`);
  }
  if (!/<h1\b/i.test(out)) {
    out = out.replace('</body>', '<h1>Page retirée</h1></body>');
  }
  return out;
}

function patchRenamedRedirectStubHtml(html, canonical, refresh) {
  const canonicalTag = `<link rel="canonical" href="${canonical}" />`;
  let out = html;
  if (/<link[^>]+rel=["']canonical["']/i.test(out)) {
    out = out.replace(/<link[^>]+rel=["']canonical["'][^>]*>/i, canonicalTag);
  } else if (/<\/head>/i.test(out)) {
    out = out.replace(/<\/head>/i, `  ${canonicalTag}\n</head>`);
  } else if (/<meta[^>]+name=["']robots["'][^>]*>/i.test(out)) {
    out = out.replace(/<meta[^>]+name=["']robots["'][^>]*>/i, (m) => `${m}${canonicalTag}`);
  }
  if (/<meta[^>]+http-equiv=["']refresh["']/i.test(out)) {
    out = out.replace(
      /<meta[^>]+http-equiv=["']refresh["'][^>]*>/i,
      `<meta http-equiv="refresh" content="0;url=${refresh}">`,
    );
  }
  return out;
}

/** Redirections statiques Astro : H1 + canonique absolue vers /analyses/. */
function redirectStubHeading() {
  return {
    name: 'lmdpt-redirect-stub-heading',
    hooks: {
      'astro:build:done': ({ dir }) => {
        const root = fileURLToPath(dir);
        for (const rel of REDIRECT_STUB_PATHS) {
          const file = join(root, rel);
          let html;
          try {
            html = readFileSync(file, 'utf8');
          } catch {
            continue;
          }
          writeFileSync(file, patchRedirectStubHtml(html));
        }
        for (const stub of RENAMED_REDIRECT_STUBS) {
          const file = join(root, stub.rel);
          let html;
          try {
            html = readFileSync(file, 'utf8');
          } catch {
            continue;
          }
          writeFileSync(file, patchRenamedRedirectStubHtml(html, stub.canonical, stub.refresh));
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
export default defineConfig({
  site: siteUrl,
  base: process.env.ASTRO_BASE ?? '/',
  integrations: [redirectStubHeading()],
  redirects: {
    '/analyses/quatremer-marianne': ANALYSIS_INDEX_REDIRECT,
    '/analyses/livres-candidats': ANALYSIS_INDEX_REDIRECT,
    '/analyses/on-a-vole-la-revolution-puis-la-revolte': ANALYSIS_INDEX_REDIRECT,
    '/analyses/voter-a-16-ans-l-urne-plutot-que-le-blocus': {
      status: 301,
      destination: '/analyses/voter-a-16-ans-une-loi-suffirait-elle',
    },
  },
});
