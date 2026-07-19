#!/usr/bin/env tsx
/**
 * Génère un brouillon X depuis le renifleur presse (revue humaine obligatoire).
 * Inclut gate qualité rédaction (mots accolés / typos) via qualite-redaction.
 *
 * Usage :
 *   npm run renifleur:draft
 *   npm run renifleur:draft -- --stdout
 *
 * ENV :
 *   LMDPT_SOCIAL_DRAFTS_DIR — dossier sortie (défaut : second-brain Manusk)
 */
import { existsSync, mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildRenifleurSocialDraft } from '../src/lib/renifleur-social';
import type { RenifleurSnapshot } from '../src/lib/renifleur';
import { fetchRenifleurSnapshot } from '../src/lib/renifleur';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const LATEST = join(ROOT, 'src/data/renifleur/latest.json');

const DEFAULT_DRAFTS_DIR = resolve(
  ROOT,
  '../../Mediconvoi/second-brain/projects/lmdpt/social-drafts/auto',
);

function resolveDraftsDir(): string {
  const override = process.env.LMDPT_SOCIAL_DRAFTS_DIR?.trim();
  if (override) return resolve(override);
  if (existsSync(DEFAULT_DRAFTS_DIR)) return DEFAULT_DRAFTS_DIR;
  return join(ROOT, 'data/social-drafts/auto');
}

async function loadSnapshot(refresh: boolean): Promise<RenifleurSnapshot> {
  if (refresh || !existsSync(LATEST)) {
    console.log('Renifleur — fetch RSS…');
    const snapshot = await fetchRenifleurSnapshot();
    writeFileSync(LATEST, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
    return snapshot;
  }
  return JSON.parse(readFileSync(LATEST, 'utf8')) as RenifleurSnapshot;
}

async function main() {
  const stdout = process.argv.includes('--stdout');
  const refresh = process.argv.includes('--refresh') || !existsSync(LATEST);

  const snapshot = await loadSnapshot(refresh);
  const markdown = buildRenifleurSocialDraft(snapshot);
  const date = snapshot.fetched_at.slice(0, 10);
  const outDir = resolveDraftsDir();
  const outFile = join(outDir, `${date}-renifleur-draft.md`);

  if (stdout) {
    process.stdout.write(markdown);
    return;
  }

  mkdirSync(outDir, { recursive: true });
  writeFileSync(outFile, markdown, 'utf8');
  console.log(`OK → ${outFile}`);
  console.log(`Articles : ${snapshot.items.length} · gate qualité rédaction + revue humaine avant publish`);
  if (markdown.includes('DecisionTag')) {
    const m = markdown.match(/\*\*DecisionTag\*\* : (SHIP|FIX-FIRST)/);
    if (m) console.log(`Qualité rédaction : ${m[1]}`);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
