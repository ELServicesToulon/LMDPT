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

export const LEGISLATIVES_2024_T2_DATASET_PAGE =
  'https://www.data.gouv.fr/fr/datasets/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-2nd-tour/';

export const LEGISLATIVES_2024_T2_CIRCO_SOURCE_URL =
  'https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-2nd-tour/20240710-170728/resultats-definitifs-par-circonscription.csv';

export const LEGISLATIVES_2024_T2_NATIONAL_SOURCE_URL =
  'https://static.data.gouv.fr/resources/elections-legislatives-des-30-juin-et-7-juillet-2024-resultats-definitifs-du-2nd-tour/20240710-170713/resultats-definitifs-france-entiere.csv';

function parseCsv(content: string, delimiter = ','): Record<string, string>[] {
  const rows: Record<string, string>[] = [];
  const lines = content.split(/\r?\n/).filter((line) => line.length > 0);
  if (lines.length < 2) return rows;

  const headers = parseCsvLine(lines[0]!, delimiter);
  for (let i = 1; i < lines.length; i += 1) {
    const cols = parseCsvLine(lines[i]!, delimiter);
    const row: Record<string, string> = {};
    for (let j = 0; j < headers.length; j += 1) {
      row[headers[j]!] = cols[j] ?? '';
    }
    rows.push(row);
  }
  return rows;
}

function parseCsvLine(line: string, delimiter = ','): string[] {
  const cols: string[] = [];
  let current = '';
  let inQuotes = false;

  for (let i = 0; i < line.length; i += 1) {
    const ch = line[i]!;
    if (ch === '"') {
      inQuotes = !inQuotes;
      continue;
    }
    if (ch === delimiter && !inQuotes) {
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

function isEluCell(value: string | undefined): boolean {
  const n = String(value ?? '')
    .trim()
    .toLowerCase();
  return n === 'élu' || n === 'elu';
}

/** CSV officiel T2 (séparateur `;`, une ligne par circonscription du 7 juillet). */
export function parseT2CirconscriptionsCsv(content: string): CirconscriptionResult[] {
  const rows = parseCsv(content, ';');
  const results: CirconscriptionResult[] = [];

  for (const row of rows) {
    const departement = normalizeDept(row['Code département'] ?? '');
    const code = String(row['Code circonscription législative'] ?? '').trim();
    if (!code) continue;

    let winner: CirconscriptionResult | undefined;
    let nbCandidats = 0;

    for (let i = 1; i <= 8; i += 1) {
      const nom = row[`Nom candidat ${i}`];
      if (!nom) continue;
      nbCandidats += 1;
      const candidate = {
        code,
        departement,
        nom: row['Libellé circonscription législative'] ?? code,
        inscrits: Number(row.Inscrits ?? 0),
        exprimes: Number(row.Exprimés ?? row.Exprimes ?? 0),
        nb_candidats: 0,
        leader_nom: nom,
        leader_prenom: row[`Prénom candidat ${i}`] ?? '',
        leader_nuance_code: row[`Nuance candidat ${i}`] ?? '',
        leader_nuance: row[`Nuance candidat ${i}`] ?? '',
        leader_voix: Number(row[`Voix ${i}`] ?? 0),
        leader_pct: pctExprimes(row[`% Voix/exprimés ${i}`] ?? '0'),
        qualifie_t2: false,
        elu_tour: 2 as const,
      };
      if (isEluCell(row[`Elu ${i}`])) {
        winner = candidate;
      }
    }

    if (!winner) {
      throw new Error(
        `T2 circo ${code} : aucun élu détecté (refuser le merge T1 pour éviter un faux élu T1)`,
      );
    }
    winner.nb_candidats = nbCandidats;
    results.push(winner);
  }

  return results.sort((a, b) => a.code.localeCompare(b.code));
}

export function parseT2NationalCsv(content: string): ElectionDataset {
  const rows = parseCsv(content, ';');
  const row = rows[0];
  if (!row) throw new Error('France entière T2 : ligne absente');

  const inscrits = Number(row.Inscrits ?? 0);
  const votants = Number(row.Votants ?? 0);
  const exprimes = Number(row.Exprimés ?? row.Exprimes ?? 0);
  const blancs = Number(row.Blancs ?? 0);
  const nuls = Number(row.Nuls ?? 0);
  const abstention_pct = pctExprimes(row['% Abstentions'] ?? '0');

  const candidats: ElectionDataset['national']['candidats'] = [];
  for (let i = 1; i <= 24; i += 1) {
    const label = row[`Nuance candidat ${i}`];
    if (!label) continue;
    const voix = Number(row[`Voix ${i}`] ?? 0);
    candidats.push({
      nom: label,
      nuance: label,
      voix,
      pourcentage_exprimes: pctExprimes(row[`% Voix/exprimés ${i}`] ?? '0'),
      pourcentage_inscrits: pctExprimes(row[`% Voix/inscrits ${i}`] ?? '0'),
    });
  }
  candidats.sort((a, b) => b.voix - a.voix);

  return {
    election: 'Législatives 2024 — 2nd tour',
    date: '2024-07-07',
    tour: 2,
    source: LEGISLATIVES_2024_T2_DATASET_PAGE,
    source_label: "Ministère de l'Intérieur — résultats définitifs 2nd tour (data.gouv.fr)",
    national: {
      inscrits,
      abstention_pct,
      votants,
      blancs,
      nuls,
      exprimes,
      candidats,
    },
  };
}

/** 577 sièges = élus T2 + élus dès le T1 (absents du CSV T2). */
export function mergeLegislatives2024RealSeats(
  t2: CirconscriptionResult[],
  t1: CirconscriptionElectionDataset,
): CirconscriptionElectionDataset {
  const t2Codes = new Set(t2.map((c) => c.code));
  const missingFromT2 = t1.circonscriptions.filter((c) => !t2Codes.has(c.code));
  const leakedT2 = missingFromT2.filter((c) => c.qualifie_t2);
  if (leakedT2.length > 0) {
    throw new Error(
      `Merge T2 : ${leakedT2.length} circo absentes du T2 mais qualifiées T1 (${leakedT2[0]?.code}) — CSV T2 incomplet`,
    );
  }
  const t1Elus: CirconscriptionResult[] = missingFromT2.map((c) => ({
    ...c,
    elu_tour: 1 as const,
    qualifie_t2: false,
  }));

  const merged = [...t2, ...t1Elus].sort((a, b) => a.code.localeCompare(b.code));
  return {
    election: 'Législatives 2024 — sièges réels (T1 élus + T2)',
    date: '2024-07-07',
    source: LEGISLATIVES_2024_T2_CIRCO_SOURCE_URL,
    source_label:
      "Ministère de l'Intérieur — T2 par circonscription + élus T1 (data.gouv.fr)",
    circonscriptions: merged,
  };
}