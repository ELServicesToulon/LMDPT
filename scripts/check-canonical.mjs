#!/usr/bin/env node
/**
 * Garde-fou post-build : échoue si la canonique du dist n'est pas
 * https://lemediadupremiertour.fr (canonical, og:url, robots.txt, sitemap.xml).
 *
 * Usage : npm run check:canonical
 *         (branché aussi en postbuild, donc après `npm run build`)
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const EXPECTED_ORIGIN = 'https://lemediadupremiertour.fr';
const FORBIDDEN_HOST = 'lmdpt.iarbre.org';
const DIST = process.env.LMDPT_DIST_PATH?.trim() || join(process.cwd(), 'dist');

const errors = [];

function fail(msg) {
  errors.push(msg);
}

function readRequired(rel) {
  const file = join(DIST, rel);
  if (!existsSync(file)) {
    fail(`${rel} introuvable dans ${DIST}`);
    return null;
  }
  return readFileSync(file, 'utf8');
}

function assertOrigin(label, url) {
  if (!url) {
    fail(`${label} : valeur absente`);
    return;
  }
  if (url.includes(FORBIDDEN_HOST)) {
    fail(`${label} : hôte interdit ${FORBIDDEN_HOST} (${url})`);
    return;
  }
  if (!url.startsWith(`${EXPECTED_ORIGIN}/`) && url !== EXPECTED_ORIGIN) {
    fail(`${label} : attendu ${EXPECTED_ORIGIN} , obtenu ${url}`);
  }
}

function firstAttr(html, tagRe) {
  const m = html.match(tagRe);
  return m?.[1] ?? null;
}

const indexHtml = readRequired('index.html');
if (indexHtml) {
  const canonical =
    firstAttr(indexHtml, /rel=["']canonical["']\s+href=["']([^"']+)["']/i) ||
    firstAttr(indexHtml, /href=["']([^"']+)["']\s+rel=["']canonical["']/i);
  const ogUrl =
    firstAttr(indexHtml, /property=["']og:url["']\s+content=["']([^"']+)["']/i) ||
    firstAttr(indexHtml, /content=["']([^"']+)["']\s+property=["']og:url["']/i);
  assertOrigin('dist/index.html rel=canonical', canonical);
  assertOrigin('dist/index.html og:url', ogUrl);
  if (indexHtml.includes(FORBIDDEN_HOST)) {
    fail(`dist/index.html contient encore ${FORBIDDEN_HOST}`);
  }
}

const robots = readRequired('robots.txt');
if (robots) {
  const sitemaps = [...robots.matchAll(/^Sitemap:\s*(\S+)/gim)].map((m) => m[1]);
  if (sitemaps.length === 0) {
    fail('dist/robots.txt : aucune ligne Sitemap');
  }
  for (const url of sitemaps) {
    assertOrigin('dist/robots.txt Sitemap', url);
  }
}

const sitemap = readRequired('sitemap.xml');
if (sitemap) {
  const locs = [...sitemap.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/gi)].map((m) => m[1]);
  if (locs.length === 0) {
    fail('dist/sitemap.xml : aucune balise <loc>');
  }
  const bad = locs.filter(
    (url) => url.includes(FORBIDDEN_HOST) || (!url.startsWith(`${EXPECTED_ORIGIN}/`) && url !== EXPECTED_ORIGIN),
  );
  if (bad.length) {
    fail(
      `dist/sitemap.xml : ${bad.length}/${locs.length} <loc> hors ${EXPECTED_ORIGIN} (ex. ${bad[0]})`,
    );
  }
}

if (errors.length) {
  console.error(`check-canonical : ÉCHEC (${errors.length})`);
  for (const e of errors) console.error(`- ${e}`);
  process.exit(1);
}

console.log(`check-canonical : OK — canonique ${EXPECTED_ORIGIN} dans ${DIST}`);
