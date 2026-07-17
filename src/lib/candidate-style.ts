/** Slugs, couleurs et libellés candidats — élections présidentielles. */

export const CANDIDATE_PALETTE: Record<string, string> = {
  macron: '#1e4d6b',
  'le-pen': '#5c4a72',
  melenchon: '#c0392b',
  fillon: '#0066cc',
  hamon: '#e91e8c',
  zemmour: '#8b6914',
  pecresse: '#336699',
  jadot: '#2d8a4e',
  lassalle: '#6b8e23',
  roussel: '#cc3333',
  'dupont-aignan': '#555555',
  hidalgo: '#9b59b6',
  poutou: '#444444',
  arthaud: '#990000',
  asselineau: '#2c5282',
  cheminade: '#718096',
};

export const CANDIDATE_LABELS: Record<string, string> = {
  macron: 'Macron',
  'le-pen': 'Le Pen',
  melenchon: 'Mélenchon',
  fillon: 'Fillon',
  hamon: 'Hamon',
  zemmour: 'Zemmour',
  pecresse: 'Pécresse',
  jadot: 'Jadot',
  lassalle: 'Lassalle',
  roussel: 'Roussel',
  'dupont-aignan': 'Dupont-Aignan',
  hidalgo: 'Hidalgo',
  poutou: 'Poutou',
  arthaud: 'Arthaud',
  asselineau: 'Asselineau',
  cheminade: 'Cheminade',
};

const SLUG_RULES: Array<[RegExp, string]> = [
  [/MACRON/, 'macron'],
  [/LE PEN/, 'le-pen'],
  [/MELENCHON|MÉLENCHON/, 'melenchon'],
  [/FILLON/, 'fillon'],
  [/HAMON/, 'hamon'],
  [/ZEMMOUR/, 'zemmour'],
  [/PECRESSE|PÉCRESSE/, 'pecresse'],
  [/JADOT/, 'jadot'],
  [/LASSALLE/, 'lassalle'],
  [/ROUSSEL/, 'roussel'],
  [/DUPONT/, 'dupont-aignan'],
  [/HIDALGO/, 'hidalgo'],
  [/POUTOU/, 'poutou'],
  [/ARTHAUD/, 'arthaud'],
  [/ASSELINEAU/, 'asselineau'],
  [/CHEMINADE/, 'cheminade'],
  // 2027 + candidats courants
  [/PHILIPPE/, 'philippe'],
  [/ATTAL/, 'attal'],
  [/GLUCKSMANN/, 'glucksmann'],
  [/RETAILLEAU/, 'retailleau'],
  [/TONDELIER/, 'tondelier'],
  [/BARDELLA/, 'bardella'],
  [/VILLEPIN/, 'villepin'],
  [/RUFFIN/, 'ruffin'],
];

export function candidateSlug(nom: string, prenom: string): string {
  const key = `${prenom} ${nom}`.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  for (const [pattern, slug] of SLUG_RULES) {
    if (pattern.test(key)) return slug;
  }
  return key
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40);
}

export function candidateColor(slug: string): string {
  return CANDIDATE_PALETTE[slug] ?? '#888888';
}

export function candidateLabel(slug: string, fallbackNom?: string): string {
  return CANDIDATE_LABELS[slug] ?? fallbackNom ?? slug;
}

export function legendForSlugs(slugs: string[]): Array<{ slug: string; label: string; color: string }> {
  const seen = new Set<string>();
  const items: Array<{ slug: string; label: string; color: string }> = [];
  for (const slug of slugs) {
    if (seen.has(slug)) continue;
    seen.add(slug);
    items.push({ slug, label: candidateLabel(slug), color: candidateColor(slug) });
  }
  return items;
}
