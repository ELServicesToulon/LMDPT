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
    slug: 'presidentielle-2022-legislatives',
    title: 'Présidentielle 2022 → législatives',
    description:
      'Sondages et 1er tour présidentiel 2022 comparés aux législatives de juin (participation, blocs, 577 sièges). Données officielles.',
    date: '2026-07-16',
    href: '/analyses/presidentielle-2022-legislatives',
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
    slug: 'assemblee-sondages',
    title: 'Assemblée des sondages',
    description:
      'Hémicycle pédagogique 577 sièges à partir d’intentions de vote (Sainte-Laguë). Illustration, pas une prédiction ni un classement de favoris.',
    date: '2026-08-26',
    href: '/assemblee-sondages',
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
    slug: 'gouvernance-an1t-droit',
    title: 'Droit électoral, AN1T et gouvernance non bloquée',
    description:
      'Corpus juridique (Constitution, Code électoral), chemins pour 100 % 1er tour ou dose proportionnelle, études de cas 2017–2022–2024, gouvernance sans 49.3 ni décrets de contournement. Synthèse documentaire (démocratie avant l’élimination).',
    date: '2026-07-17',
    href: '/analyses/gouvernance-an1t-droit',
  },
  {
    slug: 'dgfip-fuites-2026',
    title: 'Fuites DGFiP 2026 — chiffres officiels et revendications',
    description:
      'Enquête : 678 000 comptes (impôts) et environ 200 000 comptes cadastraux selon la DGFiP, face à une revendication de 2 041 778 propriétaires. Sources signalées, zéro donnée personnelle.',
    date: '2026-08-15',
    href: '/analyses/dgfip-fuites-2026',
  },
  {
    slug: 'alerte-citoyenne',
    title: 'Alerte citoyenne — débat public',
    description:
      'Tour d’horizon documenté (France / UE) des textes et projets cités comme encadrant la liberté d’expression avant le premier tour 2027.',
    date: '2026-07-16',
    href: '/analyses/alerte-citoyenne',
  },
  {
    slug: 'temps-parole-equite',
    title: 'Temps de parole — équité d’exposition',
    description:
      'Indices d’équité du temps de parole (données ouvertes Arcom) vs étalon — sur/sous-exposition documentée, pas de prédiction.',
    date: '2026-07-26',
    href: '/analyses/temps-parole-equite',
  },
  {
    slug: 'presidentielle-2027-preparation',
    title: 'Présidentielle 2027 — préparation',
    description:
      'Calendrier officialisé (18 avril / 2 mai 2027), veille factuelle et feuille de route en données ouvertes — sans prédiction ni sondage.',
    date: '2026-07-02',
    href: '/analyses/presidentielle-2027-preparation',
    preparation: true,
  },
  {
    slug: 'declarations-x-candidats',
    title: 'Déclarations X des candidats',
    description:
      'Fil chronologique des posts publics des comptes X officiels (personnalités 2027) — pas de classement.',
    date: '2026-07-17',
    href: '/analyses/declarations-x-candidats',
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
