#!/usr/bin/env tsx
/**
 * Agent veille sondages — scan 2×/jour (systemd timer) ou manuel.
 *
 * Usage:
 *   npm run sondage:veille
 *   npm run sondage:veille -- --seed-only
 *   npm run sondage:veille -- --dry-run
 */
import { writeFile, mkdir } from 'node:fs/promises';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  loadPreviousSnapshot,
  persistSnapshot,
  runSondageVeille,
  seedKnownWaves,
} from '../src/lib/sondage-veille';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const BRIEF_PATH = join(ROOT, 'src/data/sondages/brief-latest.md');

function hasFlag(name: string): boolean {
  return process.argv.includes(`--${name}`);
}

async function main(): Promise<void> {
  console.log('LMDPT — Veille sondages présidentielle 2027');
  const seedOnly = hasFlag('seed-only');
  const dryRun = hasFlag('dry-run');

  const previous = seedOnly ? null : await loadPreviousSnapshot();
  const seed = seedKnownWaves();

  const snapshot = seedOnly
    ? await runSondageVeille({
        previous: null,
        seedWaves: seed,
        fetchImpl: async () => new Response('', { status: 503 }),
      })
    : await runSondageVeille({ previous, seedWaves: seed });

  // If live scan wiped scores, keep seed waves that have scores
  if (!seedOnly) {
    const byId = new Map(snapshot.waves.map((w) => [w.id, w]));
    for (const s of seed) {
      const existing = byId.get(s.id);
      if (!existing) byId.set(s.id, s);
      else if (!Object.keys(existing.scores).length && Object.keys(s.scores).length) {
        byId.set(s.id, s);
      }
    }
    snapshot.waves = [...byId.values()];
  }

  console.log(
    `Providers indexés : ${snapshot.providers_indexed} · sources OK ${snapshot.sources_ok} · erreurs ${snapshot.sources_error}`,
  );
  console.log(`Vagues en mémoire : ${snapshot.waves.length}`);
  console.log('— Brief mouvements —');
  for (const line of snapshot.brief) {
    console.log(`• ${line}`);
  }

  if (dryRun) {
    console.log('(dry-run : pas d’écriture disque)');
    return;
  }

  await persistSnapshot(snapshot);

  const md = [
    `# Veille sondages — brief`,
    ``,
    `**Scan** : ${snapshot.fetched_at}`,
    ``,
    `> ${snapshot.disclaimer}`,
    ``,
    `## Mouvements`,
    ``,
    ...snapshot.brief.map((b) => `- ${b}`),
    ``,
    `## Têtes de vague (scores extraits)`,
    ``,
    ...(snapshot.head_by_wave.length
      ? snapshot.head_by_wave.map(
          (h) => `- **${h.firm}** : ${h.head.replace(/-/g, ' ')} — ${h.pct} %`,
        )
      : ['- (aucune tête scorée dans ce scan)']),
    ``,
    `## Sources`,
    ``,
    `- OK : ${snapshot.sources_ok}`,
    `- Erreurs : ${snapshot.sources_error}`,
    ...(snapshot.errors.length
      ? snapshot.errors.map((e) => `  - \`${e.source_id}\` : ${e.error}`)
      : []),
    ``,
    `## Le Point / Cluster17`,
    ``,
    `- [Le Pen aux avant-postes, Mélenchon en embuscade](https://www.lepoint.fr/politique/le-pen-aux-avant-postes-melenchon-en-embuscade-notre-sondage-exclusif-sur-la-presidentielle-BG2OJRSOURAELJ5VYKDLTEFBVE/) — Cluster17 pour *Le Point* (souhait de victoire ; paywall).`,
    ``,
  ].join('\n');

  await mkdir(dirname(BRIEF_PATH), { recursive: true });
  await writeFile(BRIEF_PATH, md, 'utf8');
  console.log(`Écrit : src/data/sondages/latest.json + movements.jsonl + brief-latest.md`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
