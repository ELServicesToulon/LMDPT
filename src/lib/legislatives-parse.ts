/** Parsing CSV officiels législatives 2024 (data.gouv.fr / Ministère de l'Intérieur). */

import type { CirconscriptionElectionDataset, CirconscriptionResult, ElectionDataset } from './election-types';
import { parseFrenchNumber } from './department-parse';

export const LEGISLATIVES_2024_CIRCO_SOURCE_URL =
  'https://static.data.gouv.fr/resources/resultats-du-1er-tour-des-elections-legislatives-2024-par-circonscription/20240701-162301/lg2024-resultats-circonscriptions-une-ligne-par-circo2.csv';

export const LEGISLATIVES_2024_CAND_SOURCE_URL =
  'https://static.data.gouv.fr/resources/resultats-du-1er-tour-des-elections-legislatives-2024-par-circonscription/20240701-162320/lg2024-resultats-circonscriptions-une-ligne-par-candidat2.csv';

export const LEGISLATIVES_2024_DATASET_PAGE =
  'https://www.data.gouv.fr/fr/datasets/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-1er-tour/';

export const LEGISLATIVES_2024_CIRCO_DATASET_PAGE =
  'https://www.data.gouv.fr/fr/datasets/resultats-du-1er-tour-des-elections-legislatives-2024-par-circonscription/';

function parseCsv(content: string): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length < 2) return rows;

  const headers = parseCsvLine(lines[0]!);
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]!);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]!] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === ',' && !inQuotes) {
      cols.push(current);
      current = '';
      continue;
    }
    current += ch;
  }
  cols.push(current);
  return cols;
}

function pctExprimes(value: string): number {
  return parseFrenchNumber(String(value).replace('%', ''));
}

function normalizeDept(value: string): string {
  const trimmed = value.trim();
  if (/^\d+$/.test(trimmed)) return trimmed.padStart(2, '0');
  return trimmed;
}

export function parseCirconscriptionsCsv(content: string): CirconscriptionResult[] {
  const rows = parseCsv(content);
  const results: CirconscriptionResult[] = [];

  for (const row of rows) {
    const departement = normalizeDept(row.Departement ?? '');
    const code = String(row.CodCirElec ?? '').trim();
    if (!code) continue;

    let leader:
      | {
          nom: string;
          prenom: string;
          nuance_code: string;
          nuance: string;
          voix: number;
          pct: number;
          qualif_t2: boolean;
        }
      | undefined;
    let nbCandidats = 0;

    for (let i = 1; i <= 19; i += 1) {
      const prefix = `Candidat_${i}_`;
      const nom = row[`${prefix}NomPsn`];
      if (!nom) continue;
      nbCandidats += 1;
      const voix = Number(row[`${prefix}NbVoix`] ?? 0);
      const candidate = {
        nom,
        prenom: row[`${prefix}PrenomPsn`] ?? '',
        nuance_code: row[`${prefix}CodNuaCand`] ?? '',
        nuance: row[`${prefix}LibNuaCand`] ?? '',
        voix,
        pct: pctExprimes(row[`${prefix}RapportExprimes`] ?? '0'),
        qualif_t2: String(row[`${prefix}Elu`] ?? '').includes('QUALIF'),
      };
      if (!leader || candidate.voix > leader.voix) {
        leader = candidate;
      }
    }

    if (!leader) continue;

    results.push({
      code,
      departement,
      nom: row.LibCirElec ?? code,
      inscrits: Number(row.Inscrits ?? 0),
      exprimes: Number(row.Exprimes ?? 0),
      nb_candidats: nbCandidats,
      leader_nom: leader.nom,
      leader_prenom: leader.prenom,
      leader_nuance_code: leader.nuance_code,
      leader_nuance: leader.nuance,
      leader_voix: leader.voix,
      leader_pct: leader.pct,
      qualifie_t2: leader.qualif_t2,
    });
  }

  return results.sort((a, b) => a.code.localeCompare(b.code));
}

export function parseNationalFromCandidatesCsv(
  content: string,
  meta: { inscrits: number; votants: number; abstention_pct: number; blancs: number; nuls: number; exprimes: number },
): ElectionDataset {
  const rows = parseCsv(content);
  const byNuance = new Map<string, { code: string; label: string; voix: number }>();

  for (const row of rows) {
    const code = row.CodNuaCand ?? 'AUT';
    const label = row.LibNuaCand ?? code;
    const voix = Number(row.NbVoix ?? 0);
    const existing = byNuance.get(code);
    if (existing) {
      existing.voix += voix;
    } else {
      byNuance.set(code, { code, label, voix });
    }
  }

  const candidats = [...byNuance.values()]
    .sort((a, b) => b.voix - a.voix)
    .map((entry) => ({
      nom: entry.label,
      nuance: entry.code,
      voix: entry.voix,
      pourcentage_exprimes: Math.round((entry.voix / meta.exprimes) * 10000) / 100,
      pourcentage_inscrits: Math.round((entry.voix / meta.inscrits) * 10000) / 100,
    }));

  return {
    election: 'Législatives 2024 — 1er tour',
    date: '2024-06-30',
    tour: 1,
    source: LEGISLATIVES_2024_DATASET_PAGE,
    source_label: "Ministère de l'Intérieur — résultats définitifs 1er tour (data.gouv.fr)",
    national: {
      inscrits: meta.inscrits,
      abstention_pct: meta.abstention_pct,
      votants: meta.votants,
      blancs: meta.blancs,
      nuls: meta.nuls,
      exprimes: meta.exprimes,
      candidats,
    },
  };
}

export function buildCirconscriptionDataset(rows: CirconscriptionResult[]): CirconscriptionElectionDataset {
  return {
    election: 'Législatives 2024 — 1er tour (circonscriptions)',
    date: '2024-06-30',
    source: LEGISLATIVES_2024_CIRCO_SOURCE_URL,
    source_label:
      "Ministère de l'Intérieur — résultats par circonscription (data.gouv.fr, une ligne par circonscription)",
    circonscriptions: rows,
  };
}