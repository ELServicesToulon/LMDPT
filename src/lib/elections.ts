import type { ElectionDataset } from './election-types';
import presidentielle2022 from '../data/elections/2022-presidentielle-1er-tour-national.json';

const REGISTRY: Record<string, ElectionDataset> = {
  '2022-presidentielle': presidentielle2022 as ElectionDataset,
};

export interface ElectionSummary {
  slug: string;
  title: string;
  date: string;
  tour: 1 | 2;
}

export const ELECTION_CATALOG: ElectionSummary[] = [
  {
    slug: '2022-presidentielle',
    title: 'Présidentielle 2022 — 1er tour',
    date: '2022-04-10',
    tour: 1,
  },
];

export function getElection(slug: string): ElectionDataset | undefined {
  return REGISTRY[slug];
}

export function formatVoix(n: number): string {
  return n.toLocaleString('fr-FR');
}

export function formatPct(n: number): string {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}
