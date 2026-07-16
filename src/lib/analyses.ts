export interface AnalysisSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  /** Route Astro sans slash final */
  href: string;
  /** Dossier stub — données officielles pas encore intégrées */
  preparation?: boolean;
}

export const ANALYSIS_CATALOG: AnalysisSummary[] = [
  {
    slug: 'presidentielle-distorsion',
    title: 'Présidentielle — distorsion 1er / 2nd tour',
    description:
      'Comment le passage au duel binaire efface la pluralité du premier tour — 2017, 2022 et mécanismes communs.',
    date: '2026-06-27',
    href: '/analyses/presidentielle-distorsion',
  },
  {
    slug: 'legislatives-2024-desistements',
    title: 'Législatives 2024 — désistements',
    description:
      '306 triangulaires potentielles → 89 après 215 désistements officiels. Impact sur la représentation au second tour.',
    date: '2024-07-07',
    href: '/analyses/legislatives-2024-desistements',
  },
  {
    slug: 'assemblee-premier-tour',
    title: 'L\'Assemblée du Premier Tour 2027',
    description:
      'Projections et hémicycle interactif des 577 sièges basés sur le 1er tour. Priorité 2027 : scénarios sondages + programmes candidats.',
    date: '2026-07-08',
    href: '/analyses/assemblee-premier-tour',
  },
  {
    slug: 'assemblee-premier-tour-mecanismes',
    title: 'Mécanismes pour une Assemblée du Premier Tour',
    description:
      'Résumé accessible : idée d’intégrer la pluralité du premier tour à l’Assemblée. Options détaillées (abaisser seuils, sièges proportionnels 5-25%, systèmes mixtes majoritaire+proportionnel, meilleurs perdants), avantages et limites pour refléter les votes T1 sans déstabiliser la gouvernance. Propositions graduelles : minimal (Code électoral), moyen (25% proportionnel), ambitieux (constitutionnel). Liens vers outils existants (hémicycle hybride, simulateur). Sources du rapport institutionnel. Pédagogique, factuel, neutre.',
    date: '2026-07-10',
    href: '/analyses/assemblee-premier-tour-mecanismes',
  },
  {
    slug: 'presidentielle-2027-preparation',
    title: 'Présidentielle 2027 — préparation',
    description:
      'Calendrier officialisé (18 avril / 2 mai 2027), veille factuelle et feuille de route open data — sans prédiction ni sondage.',
    date: '2026-07-02',
    href: '/analyses/presidentielle-2027-preparation',
    preparation: true,
  },
  {
    slug: 'programmes',
    title: 'Programmes électoraux',
    description:
      'Mesures phares, tableau différentiel et chiffrages sourcés — 2017, 2022 et veille 2027.',
    date: '2026-07-02',
    href: '/analyses/programmes',
  },
  {
    slug: 'programmes-comparateur',
    title: 'Comparateur de programmes',
    description:
      'Tableau différentiel inter-candidats, évolution 2017→2022 et chiffrages Institut Montaigne / LMDPT.',
    date: '2026-07-02',
    href: '/analyses/programmes-comparateur',
  },
];

export function getAnalysis(slug: string): AnalysisSummary | undefined {
  return ANALYSIS_CATALOG.find((a) => a.slug === slug);
}
