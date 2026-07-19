#!/usr/bin/env tsx
/**
 * Génère les matrices de compatibilité programmes (alliances / vote des lois).
 *
 * Usage:
 *   npm run alliances:matrix
 *   npm run alliances:matrix -- --scrutin presidentielle-2027
 *   npm run alliances:matrix -- --stdout
 *
 * Sorties:
 *   - manusk/second-brain/projects/lmdpt/alliances/matrix-auto-YYYY-MM-DD.json
 *   - src/data/analyses/alliances-matrix-latest.json (copie site)
 */
import { existsSync, mkdirSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  buildAlliancesMatrix,
  buildMultiScrutinMatrices,
  topCompatiblePairs,
  topFracturePairs,
  type AlliancesMatrix,
} from '../src/lib/program-alliances';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');

const DEFAULT_ALLIANCES_DIR = resolve(
  ROOT,
  '../../manusk/second-brain/projects/lmdpt/alliances',
);

function resolveOutDir(): string {
  const override = process.env.LMDPT_ALLIANCES_DIR?.trim();
  if (override) return resolve(override);
  if (existsSync(DEFAULT_ALLIANCES_DIR)) return DEFAULT_ALLIANCES_DIR;
  return join(ROOT, 'data/alliances');
}

function summarize(m: AlliancesMatrix): string {
  const top = topCompatiblePairs(m.pairs, 3);
  const frac = topFracturePairs(m.pairs, 3);
  const lines = [
    `### ${m.scrutin}`,
    `- Candidats: ${m.candidates.length} · paires: ${m.pairs.length}`,
    `- Top compat: ${top.map((p) => `${p.a}+${p.b}(${p.compat})`).join(', ') || '—'}`,
    `- Top fracture: ${frac.map((p) => `${p.a}+${p.b}(${p.compat})`).join(', ') || '—'}`,
  ];
  return lines.join('\n');
}

function main() {
  const stdout = process.argv.includes('--stdout');
  const scrutinIdx = process.argv.indexOf('--scrutin');
  const single = scrutinIdx >= 0 ? process.argv[scrutinIdx + 1] : null;

  const generated = new Date().toISOString();
  const date = generated.slice(0, 10);

  let payload: Record<string, AlliancesMatrix> | AlliancesMatrix;
  if (single) {
    payload = buildAlliancesMatrix(single, generated);
  } else {
    payload = buildMultiScrutinMatrices();
  }

  if (stdout) {
    process.stdout.write(`${JSON.stringify(payload, null, 2)}\n`);
    return;
  }

  const outDir = resolveOutDir();
  mkdirSync(outDir, { recursive: true });

  const multiPath = join(outDir, `matrix-auto-${date}.json`);
  writeFileSync(multiPath, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');

  // Latest pointer (toujours multi si possible)
  const latestPayload =
    single && !('presidentielle-2017' in (payload as object))
      ? { [single]: payload as AlliancesMatrix }
      : (payload as Record<string, AlliancesMatrix>);

  if (!single) {
    writeFileSync(join(outDir, 'matrix-auto-latest.json'), `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  }

  const siteDir = join(ROOT, 'src/data/analyses');
  mkdirSync(siteDir, { recursive: true });
  writeFileSync(
    join(siteDir, 'alliances-matrix-latest.json'),
    `${JSON.stringify(latestPayload, null, 2)}\n`,
    'utf8',
  );

  // Brief markdown
  const briefLines = [
    `# Matrices alliances auto — ${date}`,
    '',
    `**Agent** : \`/lmdpt-alliances-lois\``,
    `**Généré** : ${generated}`,
    '',
    '> Scores indicatifs — pas de prédiction. Voir METHODO.md.',
    '',
  ];
  if (single) {
    briefLines.push(summarize(payload as AlliancesMatrix));
  } else {
    for (const m of Object.values(payload as Record<string, AlliancesMatrix>)) {
      briefLines.push(summarize(m), '');
    }
  }
  const briefPath = join(outDir, `matrix-auto-${date}-brief.md`);
  writeFileSync(briefPath, `${briefLines.join('\n')}\n`, 'utf8');

  console.log(`OK → ${multiPath}`);
  console.log(`OK → ${briefPath}`);
  console.log(`OK → ${join(siteDir, 'alliances-matrix-latest.json')}`);
  if (!single) {
    for (const m of Object.values(payload as Record<string, AlliancesMatrix>)) {
      console.log(summarize(m).replace(/\n/g, ' | '));
    }
  }
}

main();
