/**
 * Veille publication programmes 2027 — flags + signaux presse (pas d'import auto).
 * Usage: npm run programme-veille
 */
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import type { RenifleurSnapshot } from '../src/lib/renifleur';
import {
  filterProgramNewsItems,
  findPressSignalsForCandidates,
} from '../src/lib/programme-veille';
import type { ProgramVeilleIndex } from '../src/lib/program-types';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.join(__dirname, '..');
const INDEX_PATH = path.join(ROOT, 'src/data/programmes/presidentielle-2027/_index.json');
const RENIFLEUR_PATH = path.join(ROOT, 'src/data/renifleur/latest.json');

function main(): void {
  const index = JSON.parse(readFileSync(INDEX_PATH, 'utf8')) as ProgramVeilleIndex;
  let renifleur: RenifleurSnapshot = {
    fetched_at: new Date().toISOString(),
    enabled: false,
    traditional_media: true,
    disclaimer: '',
    feeds_ok: 0,
    feeds_error: 0,
    items: [],
  };

  try {
    renifleur = JSON.parse(readFileSync(RENIFLEUR_PATH, 'utf8')) as RenifleurSnapshot;
  } catch {
    console.warn('programme-veille: renifleur/latest.json absent — npm run renifleur');
  }

  const programHits = filterProgramNewsItems(renifleur.items);
  const detectedAt = new Date().toISOString().slice(0, 10);
  const signals = findPressSignalsForCandidates(renifleur.items, index.candidates, {
    detectedAt,
  });

  index.updated = detectedAt;
  index.veille_scan_at = renifleur.fetched_at;
  index.program_press_hits = programHits.length;

  for (const c of index.candidates) {
    const hits = signals.get(c.slug);
    if (hits?.length) {
      c.press_signals = hits;
      console.log(`[veille] ${c.name}: ${hits.length} signal(aux) presse`);
      for (const h of hits) {
        console.log(`  → ${h.title}`);
      }
    } else {
      delete c.press_signals;
    }
  }

  writeFileSync(INDEX_PATH, `${JSON.stringify(index, null, 2)}\n`);
  console.log(
    `programme-veille: index MAJ — ${programHits.length} articles programme · ${signals.size} candidat(s) mentionné(s)`,
  );
}

main();
