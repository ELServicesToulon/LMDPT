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
        code,
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
