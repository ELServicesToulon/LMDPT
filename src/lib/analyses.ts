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
    title: 'Assemblée du premier tour — simulation 2024',
    description:
      'Hémicycle virtuel proportionnel au 1er tour législatif, comparé à l\'Assemblée élue au 2nd tour.',
    date: '2026-07-02',
    href: '/analyses/assemblee-premier-tour',
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
