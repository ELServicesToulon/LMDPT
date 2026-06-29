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