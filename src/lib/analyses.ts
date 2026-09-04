import type { EditorialCover } from './editorial-types';

export interface AnalysisSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  /** Route Astro sans slash final */
  href: string;
  /** Croquis dédié — fichier unique, jamais partagé avec un autre texte. */
  cover: EditorialCover | null;
  /** Dossier stub — données officielles pas encore intégrées */
  preparation?: boolean;
}

function uneCover(slug: string, alt: string): EditorialCover {
  return { src: `/illustrations/unes/analyses/${slug}.jpg`, alt };
}

export const ANALYSIS_CATALOG: AnalysisSummary[] = [
  {
    slug: 'presidentielle-distorsion',
    title: 'Présidentielle — distorsion 1er / 2nd tour',
    description:
      'Comment le passage au duel binaire efface la pluralité du premier tour — 2017, 2022 et mécanismes communs.',
    date: '2026-06-27',
    href: '/analyses/presidentielle-distorsion',
    cover: uneCover(
      'presidentielle-distorsion',
      'Croquis encre et aquarelle : un citoyen brise une flèche à double sens à côté d’une urne transparente',
    ),
  },
  {
    slug: 'presidentielle-2022-legislatives',
    title: 'Présidentielle 2022 → législatives',
    description:
      'Sondages et 1er tour présidentiel 2022 comparés aux législatives de juin (participation, blocs, 577 sièges). Données officielles.',
    date: '2026-07-16',
    href: '/analyses/presidentielle-2022-legislatives',
    cover: uneCover(
      'presidentielle-2022-legislatives',
      'Croquis encre et aquarelle : rédaction open data autour d’une table de cartes et de graphiques',
    ),
  },
  {
    slug: 'legislatives-2024-desistements',
    title: 'Législatives 2024 — désistements',
    description:
      '306 triangulaires potentielles → 89 après 215 désistements officiels. Impact sur la représentation au second tour.',
    date: '2024-07-07',
    href: '/analyses/legislatives-2024-desistements',
    cover: uneCover(
      'legislatives-2024-desistements',
      'Croquis encre et aquarelle : trois chaises de tribune, l’une est repliée et mise de côté près d’une urne',
    ),
  },
  {
    slug: 'assemblee-premier-tour',
    title: 'L\'Assemblée du Premier Tour 2027',
    description:
      'Projections et hémicycle interactif des 577 sièges basés sur le 1er tour. Priorité 2027 : scénarios sondages + programmes candidats.',
    date: '2026-07-08',
    href: '/analyses/assemblee-premier-tour',
    cover: uneCover(
      'assemblee-premier-tour',
      'Croquis encre et aquarelle : hémicycle de bancs garnis de bulletins colorés, urne au centre',
    ),
  },
  {
    slug: 'assemblee-premier-tour-mecanismes',
    title: 'Mécanismes pour une Assemblée du Premier Tour',
    description:
      'Résumé accessible : idée d’intégrer la pluralité du premier tour à l’Assemblée. Options détaillées (abaisser seuils, sièges proportionnels 5-25%, systèmes mixtes majoritaire+proportionnel, meilleurs perdants), avantages et limites pour refléter les votes T1 sans déstabiliser la gouvernance. Propositions graduelles : minimal (Code électoral), moyen (25% proportionnel), ambitieux (constitutionnel). Liens vers outils existants (hémicycle hybride, simulateur). Sources du rapport institutionnel. Pédagogique, factuel, neutre.',
    date: '2026-07-10',
    href: '/analyses/assemblee-premier-tour-mecanismes',
    cover: uneCover(
      'assemblee-premier-tour-mecanismes',
      'Croquis encre et aquarelle : urne reliée par des leviers de bois à une rangée de sièges vides',
    ),
  },
  {
    slug: 'gouvernance-an1t-droit',
    title: 'Droit électoral, AN1T et gouvernance non bloquée',
    description:
      'Corpus juridique (Constitution, Code électoral), chemins pour 100 % 1er tour ou dose proportionnelle, études de cas 2017–2022–2024, gouvernance sans 49.3 ni décrets de contournement. Synthèse documentaire (démocratie avant l’élimination).',
    date: '2026-07-17',
    href: '/analyses/gouvernance-an1t-droit',
    cover: uneCover(
      'gouvernance-an1t-droit',
      'Croquis encre et aquarelle : bureau juridique, livre ouvert, balance et urne transparente',
    ),
  },
  {
    slug: 'alerte-citoyenne',
    title: 'Alerte citoyenne — débat public',
    description:
      'Tour d’horizon documenté (France / UE) des textes et projets cités comme encadrant la liberté d’expression avant le premier tour 2027.',
    date: '2026-07-16',
    href: '/analyses/alerte-citoyenne',
    cover: uneCover(
      'alerte-citoyenne',
      'Croquis encre et aquarelle : place publique, pupitre vide, citoyens et oiseau en vol',
    ),
  },
  {
    slug: 'temps-parole-equite',
    title: 'Temps de parole — équité d’exposition',
    description:
      'Indices d’équité du temps de parole (données ouvertes Arcom) vs étalon — sur/sous-exposition documentée, pas de prédiction.',
    date: '2026-07-26',
    href: '/analyses/temps-parole-equite',
    cover: uneCover(
      'temps-parole-equite',
      'Croquis encre et aquarelle : balance à plateaux égaux surmontée d’une urne transparente',
    ),
  },
  {
    slug: 'presidentielle-2027-preparation',
    title: 'Présidentielle 2027 — préparation',
    description:
      'Calendrier officialisé (18 avril / 2 mai 2027), veille factuelle et feuille de route en données ouvertes — sans prédiction ni sondage.',
    date: '2026-07-02',
    href: '/analyses/presidentielle-2027-preparation',
    cover: uneCover(
      'presidentielle-2027-preparation',
      'Croquis encre et aquarelle : urne transparente au ruban tricolore et miroir reflétant une foule diverse',
    ),
    preparation: true,
  },
  {
    slug: 'declarations-x-candidats',
    title: 'Déclarations X des candidats',
    description:
      'Fil chronologique des posts publics des comptes X officiels (personnalités 2027) — pas de classement.',
    date: '2026-07-17',
    href: '/analyses/declarations-x-candidats',
    cover: uneCover(
      'declarations-x-candidats',
      'Croquis encre et aquarelle : corde à linge de cartes et d’enveloppes blanches, plume sur la table',
    ),
  },
  {
    slug: 'programmes',
    title: 'Programmes électoraux',
    description:
      'Mesures phares, tableau différentiel et chiffrages sourcés — 2017, 2022 et veille 2027.',
    date: '2026-07-02',
    href: '/analyses/programmes',
    cover: uneCover(
      'programmes',
      'Croquis encre et aquarelle : livrets ouverts et brochures sur une table de café',
    ),
  },
  {
    slug: 'programmes-comparateur',
    title: 'Comparateur de programmes',
    description:
      'Tableau différentiel inter-candidats, évolution 2017→2022 et chiffrages Institut Montaigne / LMDPT.',
    date: '2026-07-02',
    href: '/analyses/programmes-comparateur',
    cover: uneCover(
      'programmes-comparateur',
      'Croquis encre et aquarelle : deux livrets ouverts comparés à la loupe',
    ),
  },
];

export function getAnalysis(slug: string): AnalysisSummary | undefined {
  return ANALYSIS_CATALOG.find((a) => a.slug === slug);
}
