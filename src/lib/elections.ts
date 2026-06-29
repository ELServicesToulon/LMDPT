import type { ElectionDataset } from './election-types';
import presidentielle2017 from '../data/elections/2017-presidentielle-1er-tour-national.json';
import presidentielle2022 from '../data/elections/2022-presidentielle-1er-tour-national.json';
import legislatives2024 from '../data/elections/2024-legislatives-1er-tour-national.json';

const REGISTRY: Record<string, ElectionDataset> = {
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
    slug: '2024-legislatives',
    title: 'Législatives 2024 — 1er tour',
    date: '2024-06-30',
    tour: 1,
    distorsion_note:
      'Second tour : 143 sièges RN — 215 désistements ont reconfiguré 306 triangulaires potentielles en 89 duels binaires.',
  },
  {
    slug: '2022-presidentielle',
    title: 'Présidentielle 2022 — 1er tour',
    date: '2022-04-10',
    tour: 1,
    distorsion_note:
      'Second tour : Macron 58,55 % vs Le Pen 41,45 % — les 21,95 % de Mélenchon et neuf autres candidats absents du duel.',
  },
  {
    slug: '2017-presidentielle',
    title: 'Présidentielle 2017 — 1er tour',
    date: '2017-04-23',
    tour: 1,
    distorsion_note:
      'Second tour : Macron 66,10 % vs Le Pen 33,90 % — Fillon (20,01 %), Mélenchon (19,58 %) et huit autres candidats hors du binaire.',
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
