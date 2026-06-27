import type { DepartmentElectionDataset, DepartmentResults } from './election-types';
import { candidateSlug, type RawDeptRow } from './department-parse';

export function buildDepartmentDataset(
  rows: RawDeptRow[],
  meta: Pick<DepartmentElectionDataset, 'election' | 'date' | 'source' | 'source_label'>,
): DepartmentElectionDataset {
  const byCode = new Map<string, RawDeptRow[]>();
  for (const row of rows) {
    const list = byCode.get(row.code) ?? [];
    list.push(row);
    byCode.set(row.code, list);
  }

  const departements: DepartmentResults[] = [...byCode.entries()]
    .map(([code, group]) => {
      const head = group[0]!;
      const candidats = group
        .map((r) => ({
          slug: candidateSlug(r.nom, r.prenom),
          nom: `${r.prenom} ${r.nom}`.trim(),
          voix: r.voix,
          pourcentage_exprimes: r.pctExprimes,
        }))
        .sort((a, b) => b.pourcentage_exprimes - a.pourcentage_exprimes);

      const leader = candidats[0]!;

      return {
        code: normalizeDeptCode(code),
        nom: head.libelle,
        inscrits: head.inscrits,
        exprimes: head.exprimes,
        leader_slug: leader.slug,
        candidats,
      };
    })
    .sort((a, b) => a.code.localeCompare(b.code, 'fr'));

  return { ...meta, departements };
}

export function normalizeDeptCode(code: string | number): string {
  const raw = String(code).trim();
  if (/^\d$/.test(raw)) return raw.padStart(2, '0');
  return raw;
}

export interface WideDeptRow {
  code: string;
  libelle: string;
  inscrits: number;
  exprimes: number;
  candidates: Array<{ nom: string; prenom: string; voix: number; pctExprimes: number }>;
}

export function wideDeptRowToRawRows(row: WideDeptRow): RawDeptRow[] {
  return row.candidates.map((c) => ({
    code: row.code,
    libelle: row.libelle,
    inscrits: row.inscrits,
    exprimes: row.exprimes,
    nom: c.nom,
    prenom: c.prenom,
    voix: c.voix,
    pctExprimes: c.pctExprimes,
  }));
}

export function buildDepartmentDatasetFromWide(
  wideRows: WideDeptRow[],
  meta: Pick<DepartmentElectionDataset, 'election' | 'date' | 'source' | 'source_label'>,
): DepartmentElectionDataset {
  const raw = wideRows.flatMap(wideDeptRowToRawRows);
  return buildDepartmentDataset(raw, meta);
}
