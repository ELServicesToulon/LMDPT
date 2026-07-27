import type { ElectionDataset } from './election-types';
import presidentielle2017 from '../data/elections/2017-presidentielle-1er-tour-national.json';
import presidentielle2022 from '../data/elections/2022-presidentielle-1er-tour-national.json';
import presidentielle2027 from '../data/elections/2027-presidentielle-1er-tour-national.json';
import legislatives2024 from '../data/elections/2024-legislatives-1er-tour-national.json';

const REGISTRY: Record<string, ElectionDataset> = {
  '2027-presidentielle': presidentielle2027 as ElectionDataset,
  '2017-presidentielle': presidentielle2017 as ElectionDataset,
  '2022-presidentielle': presidentielle2022 as ElectionDataset,
  '2024-legislatives': legislatives2024 as ElectionDataset,
};

export interface ElectionSummary {
  slug: string;
  title: string;
  date: string;
  tour: 1 | 2;
  /** Texte court pour la section distorsion 1er/2nd tour */
  distorsion_note?: string;
}

export const ELECTION_CATALOG: ElectionSummary[] = [
  {
    slug: '2027-presidentielle',
    title: 'Présidentielle 2027 — 1er tour (projection)',
    date: '2027-04-18',
    tour: 1,
    distorsion_note:
      'Projection : Assemblée 1er tour présidentiel (Sainte-Laguë) vs législatives 2027 à venir — fil directeur « démocratie avant l’élimination ».',
  },
  {
    slug: '2024-legislatives',
    title: 'Législatives 2024 — 1er tour',
    date: '2024-06-30',
    tour: 1,
    distorsion_note:
      'Assemblée 100 % T1 législatif vs composition réelle juil. 2024 (désistements, uninominal).',
  },
  {
    slug: '2022-presidentielle',
    title: 'Présidentielle 2022 — 1er tour',
    date: '2022-04-10',
    tour: 1,
    distorsion_note:
      'Assemblée 1er tour présidentiel (Sainte-Laguë) vs Assemblée réelle des législatives juin 2022 (Ensemble 251, NUPES 159, RN 89, LR 72…).',
  },
  {
    slug: '2017-presidentielle',
    title: 'Présidentielle 2017 — 1er tour',
    date: '2017-04-23',
    tour: 1,
    distorsion_note:
      'Assemblée 1er tour présidentiel (Sainte-Laguë) vs Assemblée réelle des législatives juin 2017 (majorité REM/MoDem dominante).',
  },
];

export function getElection(slug: string): ElectionDataset | undefined {
  return REGISTRY[slug];
}

export function getElectionSummary(slug: string): ElectionSummary | undefined {
  return ELECTION_CATALOG.find((e) => e.slug === slug);
}

export function formatVoix(n: number): string {
  return n.toLocaleString('fr-FR');
}

export function formatPct(n: number): string {
  return `${n.toLocaleString('fr-FR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} %`;
}

/** Part des trois premiers candidats (indicateur de concentration, pas un score éliminatoire). */
export function top3PctExprimes(dataset: ElectionDataset): number {
  const top3 = [...dataset.national.candidats]
    .sort((a, b) => b.pourcentage_exprimes - a.pourcentage_exprimes)
    .slice(0, 3);
  return top3.reduce((acc, c) => acc + c.pourcentage_exprimes, 0);
}
