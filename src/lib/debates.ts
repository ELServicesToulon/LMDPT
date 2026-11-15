import voteUtilePluralite from '../data/debates/vote-utile-pluralite.json';
import desistementsSecondTour from '../data/debates/desistements-second-tour.json';
import assembleePremierTour from '../data/debates/assemblee-premier-tour.json';
import type { EditorialCover } from './editorial-types';
import type { DebateDataset, DebateSummary } from './debate-types';

function uneCover(slug: string, alt: string): EditorialCover {
  return { src: `/illustrations/unes/debats/${slug}.jpg`, alt };
}

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
      'Voter pour celui qui peut gagner plutôt que pour celui qu\'on préfère : le « vote utile » réduit-il le choix au premier tour ? Débat ouvert.',
    date: voteUtilePluralite.date,
    status: voteUtilePluralite.status,
    href: '/debats/vote-utile-pluralite',
    cover: uneCover(
      'vote-utile-pluralite',
      'Croquis encre et aquarelle : urne d’où s’échappe une explosion de bulletins colorés, foule en liesse',
    ),
  },
  {
    slug: 'desistements-second-tour',
    question: desistementsSecondTour.question,
    description:
      'Entre les deux tours, des candidats se retirent pour en favoriser un autre, surtout dans les triangulaires. Faut-il les encadrer ? Débat ouvert.',
    date: desistementsSecondTour.date,
    status: desistementsSecondTour.status,
    href: '/debats/desistements-second-tour',
    cover: uneCover(
      'desistements-second-tour',
      'Croquis encre et aquarelle : deux pupitres sur scène, un troisième emporté dans les coulisses',
    ),
  },
  {
    slug: 'assemblee-premier-tour',
    question: assembleePremierTour.question,
    description:
      'Et si l\'on gardait le premier tour, celui où chacun vote pour qui il préfère ? Débat ouvert sur une Assemblée élue au premier tour, sources à l\'appui.',
    date: assembleePremierTour.date,
    status: assembleePremierTour.status,
    href: '/debats/assemblee-premier-tour',
    cover: uneCover(
      'assemblee-premier-tour',
      'Croquis encre et aquarelle : citoyens autour d’une maquette en bois d’hémicycle',
    ),
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
