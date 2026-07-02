import type { CirconscriptionElectionDataset } from './election-types';
import circo2024 from '../data/elections/2024-legislatives-1er-tour-circonscriptions.json';

const CIRCO_REGISTRY: Record<string, CirconscriptionElectionDataset> = {
  '2024-legislatives': circo2024 as CirconscriptionElectionDataset,
};

export { legendForNuances, nuanceColor, nuanceLabel } from './legislative-style';

export function getCirconscriptionResults(slug: string): CirconscriptionElectionDataset | undefined {
  return CIRCO_REGISTRY[slug];
}

export function countLeadersByNuance(
  dataset: CirconscriptionElectionDataset,
): Array<{ code: string; count: number }> {
  const counts = new Map<string, number>();
  for (const c of dataset.circonscriptions) {
    const code = c.leader_nuance_code;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
}

export interface LegislativeDepartmentSummary {
  code: string;
  nom: string;
  leader_nuance_code: string;
  circo_count: number;
  /** Nuances en tête de circonscription, triées par nombre de sièges */
  breakdown: Array<{ code: string; count: number; avg_pct: number }>;
}

/** Agrège les leaders de circonscription par département (nuance la plus fréquente). */
export function aggregateDepartmentLeadersFromCircos(
  dataset: CirconscriptionElectionDataset,
  departmentNames: Map<string, string>,
): LegislativeDepartmentSummary[] {
  const byDept = new Map<string, typeof dataset.circonscriptions>();

  for (const c of dataset.circonscriptions) {
    const list = byDept.get(c.departement) ?? [];
    list.push(c);
    byDept.set(c.departement, list);
  }

  const summaries: LegislativeDepartmentSummary[] = [];

  for (const [code, circos] of byDept) {
    const nuanceStats = new Map<string, { count: number; pctSum: number }>();
    for (const c of circos) {
      const nuance = c.leader_nuance_code;
      const prev = nuanceStats.get(nuance) ?? { count: 0, pctSum: 0 };
      nuanceStats.set(nuance, {
        count: prev.count + 1,
        pctSum: prev.pctSum + c.leader_pct,
      });
    }

    const breakdown = [...nuanceStats.entries()]
      .map(([nuanceCode, stats]) => ({
        code: nuanceCode,
        count: stats.count,
        avg_pct: stats.pctSum / stats.count,
      }))
      .sort((a, b) => b.count - a.count || b.avg_pct - a.avg_pct);

    summaries.push({
      code,
      nom: departmentNames.get(code) ?? `Département ${code}`,
      leader_nuance_code: breakdown[0]?.code ?? 'DVC',
      circo_count: circos.length,
      breakdown,
    });
  }

  return summaries.sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }));
}