#!/usr/bin/env tsx
import { execFileSync } from 'node:child_process';
import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRenifleurBundle } from '../src/lib/renifleur';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/renifleur/latest.json');
const MIX_OUT = join(ROOT, 'src/data/renifleur/mix-report.json');
const TSX = join(ROOT, 'node_modules/.bin/tsx');

async function main(): Promise<void> {
  console.log('Renifleur — médias traditionnels → src/data/renifleur/latest.json');
  const { snapshot, mixReport } = await fetchRenifleurBundle();
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(
    `OK — ${snapshot.items.length} articles · ${snapshot.feeds_ok} flux OK · ${snapshot.feeds_error} erreurs`,
  );
  console.log(`Horodatage : ${snapshot.fetched_at}`);

  if (mixReport) {
    await writeFile(MIX_OUT, `${JSON.stringify(mixReport, null, 2)}\n`, 'utf8');
    console.log(
      `Mix — L1 avant ${mixReport.before.l1_deviation} → après ${mixReport.after.l1_deviation} (cible couverture, pas prédiction)`,
    );
    for (const row of mixReport.after.observed.slice(0, 6)) {
      console.log(
        `  ${row.bloc}: cible ${row.target_pct}% · obs ${row.observed_pct}% (${row.count})`,
      );
    }
    console.log(`Rapport : src/data/renifleur/mix-report.json`);
  }

  // Assemblée des sujets (7 j) — lit latest.json, n’appelle pas le réseau
  console.log('\n=== assemblée des sujets ===');
  execFileSync(TSX, [join(ROOT, 'scripts', 'assemblee-sujets.ts')], {
    cwd: ROOT,
    stdio: 'inherit',
    env: process.env,
  });

  if (snapshot.feeds_error > 0 && snapshot.feeds_ok === 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
