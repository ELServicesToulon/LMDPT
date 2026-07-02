#!/usr/bin/env tsx
/**
 * Orchestrateur sync pré-build : data.gouv + renifleur (+ brouillon X opt-in).
 *
 * Usage :
 *   npm run sync:all
 *   npm run sync:all:social
 *   LMDPT_SYNC_SOCIAL_DRAFT=1 npm run sync:all
 *
 * Le brouillon X n'est jamais généré lors d'un build standard (revue humaine).
 */
import { execFileSync } from 'node:child_process';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { shouldGenerateSocialDraft } from '../src/lib/sync-flags';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const TSX = join(ROOT, 'node_modules/.bin/tsx');

function runStep(label: string, script: string, extraArgs: string[] = []): void {
  console.log(`\n=== ${label} ===`);
  execFileSync(TSX, [join(ROOT, 'scripts', script), ...extraArgs], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });
}

function main(): void {
  const socialDraft = shouldGenerateSocialDraft();

  console.log('sync:all — data.gouv + renifleur + programme-veille' + (socialDraft ? ' + brouillon X' : ''));

  runStep('sync:data', 'sync-data.ts');
  runStep('renifleur', 'renifleur-run.ts');
  runStep('programme-veille', 'programme-veille-run.ts');

  if (socialDraft) {
    runStep('renifleur:draft', 'renifleur-social-draft.ts');
  } else {
    console.log('\n(brouillon X ignoré — activer : npm run sync:all:social)');
  }

  console.log('\nsync:all terminé.');
}

main();
