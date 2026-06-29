import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import * as XLSX from 'xlsx';
import {
  buildCirconscriptionDataset,
  LEGISLATIVES_2024_CAND_SOURCE_URL,
  LEGISLATIVES_2024_CIRCO_SOURCE_URL,
  parseCirconscriptionsCsv,
  parseNationalFromCandidatesCsv,
} from '../src/lib/legislatives-parse.ts';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const nationalOut = path.join(__dirname, '../src/data/elections/2024-legislatives-1er-tour-national.json');
const circoOut = path.join(__dirname, '../src/data/elections/2024-legislatives-1er-tour-circonscriptions.json');
const franceXlsxUrl =
  'https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-1er-tour/20240710-171253/resultats-definitifs-france-entiere.xlsx';

async function fetchLatin1(url: string): Promise<string> {
  const response = await fetch(url);
  if (!response.ok) {
    throw new Error(`HTTP ${response.status} — ${url}`);
  }
  const buffer = Buffer.from(await response.arrayBuffer());
  return buffer.toString('latin1');
}

function readFranceMeta(xlsxBuffer: Buffer): {
  inscrits: number;
  votants: number;
  abstention_pct: number;
  blancs: number;
  nuls: number;
  exprimes: number;
} {
  const workbook = XLSX.read(xlsxBuffer, { type: 'buffer' });
  const sheet = workbook.Sheets[workbook.SheetNames[0]!];
  const rows = XLSX.utils.sheet_to_json<string[]>(sheet, { header: 1, defval: '' });
  const data = rows[1];
  if (!data) {
    throw new Error('France entière : ligne de données absente');
  }

  const parsePct = (value: string | number): number =>
    Number(String(value).replace('%', '').replace(',', '.'));

  return {
    inscrits: Number(data[2]),
    votants: Number(data[3]),
    abstention_pct: parsePct(data[6] ?? 0),
    blancs: Number(data[10] ?? 0),
    nuls: Number(data[13] ?? 0),
    exprimes: Number(data[7]),
  };
}

async function main(): Promise<void> {
  console.log('Téléchargement France entière…');
  const franceResponse = await fetch(franceXlsxUrl);
  if (!franceResponse.ok) {
    throw new Error(`HTTP ${franceResponse.status} — France entière`);
  }
  const franceBuffer = Buffer.from(await franceResponse.arrayBuffer());
  const meta = readFranceMeta(franceBuffer);

  console.log('Téléchargement circonscriptions…', LEGISLATIVES_2024_CIRCO_SOURCE_URL);
  const circoContent = await fetchLatin1(LEGISLATIVES_2024_CIRCO_SOURCE_URL);
  const circonscriptions = parseCirconscriptionsCsv(circoContent);
  if (circonscriptions.length < 500) {
    throw new Error(`Circonscriptions insuffisantes : ${circonscriptions.length}`);
  }

  console.log('Téléchargement candidats…', LEGISLATIVES_2024_CAND_SOURCE_URL);
  const candContent = await fetchLatin1(LEGISLATIVES_2024_CAND_SOURCE_URL);
  const national = parseNationalFromCandidatesCsv(candContent, meta);
  const circoDataset = buildCirconscriptionDataset(circonscriptions);

  fs.mkdirSync(path.dirname(nationalOut), { recursive: true });
  fs.writeFileSync(nationalOut, `${JSON.stringify(national, null, 2)}\n`, 'utf8');
  fs.writeFileSync(circoOut, `${JSON.stringify(circoDataset, null, 2)}\n`, 'utf8');

  console.log(`OK — national (${national.national.candidats.length} nuances) → ${nationalOut}`);
  console.log(`OK — ${circoDataset.circonscriptions.length} circonscriptions → ${circoOut}`);
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});