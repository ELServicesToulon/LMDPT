/** Slugs, couleurs et libellés candidats — élections présidentielles.
 * Couleurs **consensus** (Wiki AN / médias FR) via assemblee-wiki-colors.
 * Ex. écologie = vert `#00c000`, RN = bleu nuit, Ensemble = jaune.
 */
import {
  CONSENSUS_CANDIDATE_COLORS,
  CONSENSUS_PARTY_COLORS,
  consensusPartyColor,
} from './assemblee-wiki-colors';

export const CANDIDATE_PALETTE: Record<string, string> = {
  // Consensus courants
  ...CONSENSUS_CANDIDATE_COLORS,
  // Alias / historiques 2017-2022 déjà dans CONSENSUS_* ; surcharges explicites :
  macron: CONSENSUS_PARTY_COLORS.ensemble,
  'le-pen': CONSENSUS_PARTY_COLORS.rn,
  melenchon: CONSENSUS_PARTY_COLORS.lfi,
  fillon: CONSENSUS_PARTY_COLORS.lr,
  hamon: CONSENSUS_PARTY_COLORS.ps,
  zemmour: CONSENSUS_PARTY_COLORS.reconquete,
  pecresse: CONSENSUS_PARTY_COLORS.lr,
  jadot: CONSENSUS_PARTY_COLORS.eco,
  lassalle: CONSENSUS_PARTY_COLORS.liot,
  roussel: CONSENSUS_PARTY_COLORS.pcf,
  'dupont-aignan': CONSENSUS_PARTY_COLORS.autres,
  hidalgo: CONSENSUS_PARTY_COLORS.ps,
  poutou: CONSENSUS_PARTY_COLORS.exg,
  arthaud: CONSENSUS_PARTY_COLORS.exg,
  asselineau: CONSENSUS_PARTY_COLORS.autres,
  cheminade: CONSENSUS_PARTY_COLORS.autres,
  // 2027
  attal: CONSENSUS_PARTY_COLORS.ensemble,
  bardella: CONSENSUS_PARTY_COLORS.rn,
  philippe: CONSENSUS_PARTY_COLORS.horizons,
  retailleau: CONSENSUS_PARTY_COLORS.lr,
  tondelier: CONSENSUS_PARTY_COLORS.eco,
  glucksmann: CONSENSUS_PARTY_COLORS.ps,
  ruffin: CONSENSUS_PARTY_COLORS.lfi,
  barrot: CONSENSUS_PARTY_COLORS.modem,
  lisnard: CONSENSUS_PARTY_COLORS.udr,
  'philippe-brun': CONSENSUS_PARTY_COLORS.ps,
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
  if (CANDIDATE_PALETTE[slug]) return CANDIDATE_PALETTE[slug];
  return consensusPartyColor(slug) ?? '#888888';
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
