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
    slug: 'presidentielle-2027-preparation',
    title: 'Présidentielle 2027 — préparation',
    description:
      'Sources officielles, calendrier indicatif et feuille de route pour documenter le premier tour 2027 — sans prédiction.',
    date: '2026-06-29',
    href: '/analyses/presidentielle-2027-preparation',
    preparation: true,
  },
];

export function getAnalysis(slug: string): AnalysisSummary | undefined {
  return ANALYSIS_CATALOG.find((a) => a.slug === slug);
}
