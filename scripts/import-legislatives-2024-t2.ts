/**
 * Import législatives 2024 — 2nd tour (circonscriptions) + élus T1.
 * Données publiques Ministère / data.gouv.fr — Licence Ouverte.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  LEGISLATIVES_2024_T2_CIRCO_SOURCE_URL,
  LEGISLATIVES_2024_T2_NATIONAL_SOURCE_URL,
  mergeLegislatives2024RealSeats,
  parseT2CirconscriptionsCsv,
  parseT2NationalCsv,
} from '../src/lib/legislatives-parse.ts';
import type { CirconscriptionElectionDataset } from '../src/lib/election-types.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const UA = 'Manusk-ELS-Bot/1.0 (+https://elservicestoulon@gmail.com)';
const t1Path = path.join(
  __dirname,
  '../src/data/elections/2024-legislatives-1er-tour-circonscriptions.json',
);
const nationalOut = path.join(
  __dirname,
  '../src/data/elections/2024-legislatives-2nd-tour-national.json',
);
const circoOut = path.join(
  __dirname,
  '../src/data/elections/2024-legislatives-2nd-tour-circonscriptions.json',
);

async function fetchText(url: string): Promise<string> {
  const response = await fetch(url, { headers: { 'User-Agent': UA } });
  if (!response.ok) throw new Error(`HTTP ${response.status} — ${url}`);
  return response.text();
}

async function main(): Promise<void> {
  console.log('Téléchargement T2 France entière…');
  const national = parseT2NationalCsv(await fetchText(LEGISLATIVES_2024_T2_NATIONAL_SOURCE_URL));

  console.log('Téléchargement T2 circonscriptions…');
  const t2Rows = parseT2CirconscriptionsCsv(await fetchText(LEGISLATIVES_2024_T2_CIRCO_SOURCE_URL));
  if (t2Rows.length < 400) {
    throw new Error(`Circonscriptions T2 insuffisantes : ${t2Rows.length}`);
  }

  const t1 = JSON.parse(fs.readFileSync(t1Path, 'utf8')) as CirconscriptionElectionDataset;
  const seats = mergeLegislatives2024RealSeats(t2Rows, t1);
  if (seats.circonscriptions.length !== 577) {
    throw new Error(`Sièges réels attendus 577, obtenu ${seats.circonscriptions.length}`);
  }

  fs.mkdirSync(path.dirname(nationalOut), { recursive: true });
  fs.writeFileSync(nationalOut, `${JSON.stringify(national, null, 2)}\n`, 'utf8');
  fs.writeFileSync(circoOut, `${JSON.stringify(seats, null, 2)}\n`, 'utf8');
  const t1Count = seats.circonscriptions.filter((c) => c.elu_tour === 1).length;
  const t2Count = seats.circonscriptions.filter((c) => c.elu_tour === 2).length;
  console.log(`OK — national (${national.national.candidats.length} nuances) → ${nationalOut}`);
  console.log(`OK — ${seats.circonscriptions.length} sièges (T1 ${t1Count} + T2 ${t2Count}) → ${circoOut}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
