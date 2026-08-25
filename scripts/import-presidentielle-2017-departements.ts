import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
// xlsx 0.18.5 = last public npm build (SheetJS). Known CVEs; import-only, never in `astro build`.
// See docs/DEPENDENCIES.md. Do not add this package to runtime/Docker.
import * as XLSX from 'xlsx';
import { buildDepartmentDatasetFromWide } from '../src/lib/department-build.ts';
import { parse2017DepartmentSheet } from '../src/lib/department-parse-xls.ts';
import { PRESIDENTIELLE_2017_DEPT_SOURCE_URL } from '../src/lib/department-parse.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const outPath = path.join(
  __dirname,
  '../src/data/elections/2017-presidentielle-1er-tour-departements.json',
);

async function main(): Promise<void> {
  console.log('Téléchargement', PRESIDENTIELLE_2017_DEPT_SOURCE_URL);
  const response = await fetch(PRESIDENTIELLE_2017_DEPT_SOURCE_URL);
  if (!response.ok) throw new Error(`HTTP ${response.status}`);

  const workbook = XLSX.read(await response.arrayBuffer());
  const sheet = workbook.Sheets['Départements Tour 1'];
  if (!sheet) throw new Error('Feuille « Départements Tour 1 » introuvable');

  const rows = XLSX.utils.sheet_to_json(sheet, { header: 1, defval: '' }) as Array<
    Array<string | number>
  >;
  const wideRows = parse2017DepartmentSheet(rows);
  if (wideRows.length === 0) throw new Error('Aucun département parsé');

  const dataset = buildDepartmentDatasetFromWide(wideRows, {
    election: 'Présidentielle 2017 — 1er tour (départements)',
    date: '2017-04-23',
    source: PRESIDENTIELLE_2017_DEPT_SOURCE_URL,
    source_label:
      "Ministère de l'Intérieur — Presidentielle_2017_Resultats_Tour_1_c.xls (data.gouv.fr)",
  });

  fs.mkdirSync(path.dirname(outPath), { recursive: true });
  fs.writeFileSync(outPath, `${JSON.stringify(dataset, null, 2)}\n`, 'utf8');
  console.log(`OK — ${dataset.departements.length} départements → ${outPath}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
