import { writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { fetchRenifleurSnapshot } from '../src/lib/renifleur';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const OUT = join(ROOT, 'src/data/renifleur/latest.json');

async function main(): Promise<void> {
  console.log('Renifleur — médias traditionnels → src/data/renifleur/latest.json');
  const snapshot = await fetchRenifleurSnapshot();
  await writeFile(OUT, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  console.log(
    `OK — ${snapshot.items.length} articles · ${snapshot.feeds_ok} flux OK · ${snapshot.feeds_error} erreurs`,
  );
  console.log(`Horodatage : ${snapshot.fetched_at}`);
  if (snapshot.feeds_error > 0 && snapshot.feeds_ok === 0) {
    process.exit(1);
  }
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
