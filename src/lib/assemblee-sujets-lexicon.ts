/**
 * Lexique fermé des sujets de campagne (assemblée des sujets).
 * Couleurs distinctes des teintes candidats politicalHue.
 */
export interface ThemeDef {
  id: string;
  label: string;
  color: string;
  /** Mots / expressions (minuscules, sans accents pour matching) */
  keywords: string[];
}

export const THEME_LEXICON: ThemeDef[] = [
  {
    id: 'ia',
    label: 'Intelligence artificielle',
    color: '#2a6f7a',
    keywords: [
      'intelligence artificielle',
      'ia',
      'data center',
      'datacenter',
      'cloud act',
      'mistral',
      'chatgpt',
      'algorithme',
    ],
  },
  {
    id: 'ukraine',
    label: 'Ukraine / Europe',
    color: '#3d5a80',
    keywords: ['ukraine', 'ukrainien', 'poutine', 'kiev', 'otan', 'russie'],
  },
  {
    id: 'laicite',
    label: 'Laïcité / religion',
    color: '#6b5b8c',
    keywords: ['laicite', 'laïcité', 'religion', 'pape', 'leon xiv', 'églis', 'eglise', 'culte'],
  },
  {
    id: 'ecole',
    label: 'École',
    color: '#4a7c59',
    keywords: ['ecole', 'école', 'education', 'éducation', 'enseignant', 'college', 'collège', 'lycee', 'lycée'],
  },
  {
    id: 'emploi',
    label: 'Emploi / travail',
    color: '#8b6914',
    keywords: ['emploi', 'chomage', 'chômage', 'travail', 'salarie', 'salarié', 'licenciement'],
  },
  {
    id: 'retraites',
    label: 'Retraites',
    color: '#a0522d',
    keywords: ['retraite', 'retraites', 'age de depart', 'âge de départ'],
  },
  {
    id: 'immigration',
    label: 'Immigration',
    color: '#7a4e2d',
    keywords: ['immigration', 'migrant', 'asile', 'frontier', 'frontière', 'expuls'],
  },
  {
    id: 'pouvoir-achat',
    label: 'Pouvoir d’achat',
    color: '#c45c26',
    keywords: ['pouvoir d achat', "pouvoir d'achat", 'inflation', 'prix', 'salaire', 'fiscal'],
  },
  {
    id: 'sante',
    label: 'Santé',
    color: '#b91c1c',
    keywords: ['sante', 'santé', 'hopital', 'hôpital', 'medecin', 'médecin', 'soignant'],
  },
  {
    id: 'securite',
    label: 'Sécurité',
    color: '#1e3a5f',
    keywords: ['securite', 'sécurité', 'police', 'delinquance', 'délinquance', 'criminalite', 'criminalité'],
  },
  {
    id: 'climat',
    label: 'Climat / énergie',
    color: '#2d6a4f',
    keywords: ['climat', 'energie', 'énergie', 'nucleaire', 'nucléaire', 'renouvelable', 'ecologie', 'écologie'],
  },
  {
    id: 'institutions',
    label: 'Institutions / élections',
    color: '#495057',
    keywords: [
      'institutions',
      'constitution',
      'assemblee',
      'assemblée',
      'senat',
      'sénat',
      'senatoriale',
      'sénatoriale',
      'presidentielle',
      'présidentielle',
      'primaire',
      'candidat',
    ],
  },
];

export const THEME_UNCLASSIFIED: ThemeDef = {
  id: 'non-classe',
  label: 'Non classé',
  color: '#9aa0a6',
  keywords: [],
};

/** Normalise pour matching (minuscules, sans accents). */
export function normalizeForMatch(text: string): string {
  return ` ${String(text || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^\p{L}\p{N}\s'-]/gu, ' ')
    .replace(/\s+/g, ' ')
    .trim()} `;
}

/**
 * Premier thème dont un mot-clé apparaît. Ordre = priorité du lexique.
 * Mots courts (≤3) : bornes espaces (évite « ia » dans « special »).
 */
export function matchTheme(title: string, summary: string): ThemeDef {
  const blob = normalizeForMatch(`${title} ${summary}`);
  for (const theme of THEME_LEXICON) {
    for (const kw of theme.keywords) {
      const needle = normalizeForMatch(kw).trim();
      if (needle.length < 2) continue;
      if (needle.length <= 3) {
        if (blob.includes(` ${needle} `)) return theme;
      } else if (blob.includes(needle)) {
        return theme;
      }
    }
  }
  return THEME_UNCLASSIFIED;
}
