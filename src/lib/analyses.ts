export interface AnalysisSummary {
  slug: string;
  title: string;
  description: string;
  date: string;
  /** Route Astro sans slash final */
  href: string;
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
];

export function getAnalysis(slug: string): AnalysisSummary | undefined {
  return ANALYSIS_CATALOG.find((a) => a.slug === slug);
}
