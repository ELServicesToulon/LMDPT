import voteUtilePluralite from '../data/debates/vote-utile-pluralite.json';
import desistementsSecondTour from '../data/debates/desistements-second-tour.json';
import assembleePremierTour from '../data/debates/assemblee-premier-tour.json';
import type { DebateDataset, DebateSummary } from './debate-types';

const DEBATE_DATASETS: Record<string, DebateDataset> = {
  'vote-utile-pluralite': voteUtilePluralite as DebateDataset,
  'desistements-second-tour': desistementsSecondTour as DebateDataset,
  'assemblee-premier-tour': assembleePremierTour as DebateDataset,
};

export const DEBATE_CATALOG: DebateSummary[] = [
  {
    slug: 'vote-utile-pluralite',
    question: voteUtilePluralite.question,
    description:
      'Le vote utile au premier tour préserve-t-il la pluralité démocratique ou la réduit-il ? Arguments sourcés des deux côtés.',
    date: voteUtilePluralite.date,
    status: voteUtilePluralite.status,
    href: '/debats/vote-utile-pluralite',
  },
  {
    slug: 'desistements-second-tour',
    question: desistementsSecondTour.question,
    description:
      'Les désistements entre les deux tours : mécanisme civique de clarification ou distorsion de la pluralité ?',
    date: desistementsSecondTour.date,
    status: desistementsSecondTour.status,
    href: '/debats/desistements-second-tour',
  },
  {
    slug: 'assemblee-premier-tour',
    question: assembleePremierTour.question,
    description:
      'Une chambre parlementaire élue sur le seul premier tour : simulation 2024 et arguments pour/contre.',
    date: assembleePremierTour.date,
    status: assembleePremierTour.status,
    href: '/debats/assemblee-premier-tour',
  },
];

export function getDebateSummary(slug: string): DebateSummary | undefined {
  return DEBATE_CATALOG.find((d) => d.slug === slug);
}

export function getDebate(slug: string): DebateDataset | undefined {
  return DEBATE_DATASETS[slug];
}

export function getOpenDebates(): DebateSummary[] {
  return DEBATE_CATALOG.filter((d) => d.status === 'ouvert');
}
