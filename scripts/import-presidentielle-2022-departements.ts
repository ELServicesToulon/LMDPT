import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { buildDepartmentDataset } from '../src/lib/department-build.ts';
import {
  parseDepartmentTxt,
  PRESIDENTIELLE_2022_DEPT_SOURCE_URL,
} from '../src/lib/department-parse.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  '../src/data/elections/2022-presidentielle-1er-tour-departements.json',
);

async function main(): Promise<void> {
  console.log('Téléchargement', PRESIDENTIELLE_2022_DEPT_SOURCE_URL);
  const response = await fetch(PRESIDENTIELLE_2022_DEPT_SOURCE_URL);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  const buffer = Buffer.from(await response.arrayBuffer());
  const content = buffer.toString('latin1');

  const rows = parseDepartmentTxt(content);
  if (rows.length === 0) {
    throw new Error('Aucune ligne parsée');
  }

  const dataset = buildDepartmentDataset(rows, {
    election: 'Présidentielle 2022 — 1er tour (départements)',
    date: '2022-04-10',
    source: PRESIDENTIELLE_2022_DEPT_SOURCE_URL,
    source_label:
      "Ministère de l'Intérieur — resultats-par-niveau-dpt-t1-france-entiere.txt (data.gouv.fr)",
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');

  console.log(`OK — ${dataset.departements.length} départements → ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
