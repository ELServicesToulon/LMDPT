/**
 * Logos / pastilles des partis pour candidatures déclarées 2027.
 * SVG locaux (monogrammes couleurs parti) — pas de hotlink externe.
 * Usage éditorial neutre DOE : identification visuelle, pas d’endorsement.
 */

export interface PartyLogo {
  /** Clé fichier sous /logos/partis/{id}.svg */
  id: string;
  /** Libellé court affiché (accessibilité) */
  shortLabel: string;
  /** Couleur de fond de secours */
  color: string;
  /** Initiales si le fichier SVG est absent */
  monogram: string;
}

/** Mapping affiliation JSON → logo */
const AFFILIATION_RULES: Array<{ test: RegExp; logo: PartyLogo }> = [
  { test: /^horizons$/i, logo: { id: 'horizons', shortLabel: 'Horizons', color: '#0001b8', monogram: 'H' } },
  { test: /^renaissance$/i, logo: { id: 'renaissance', shortLabel: 'Renaissance', color: '#ffeb00', monogram: 'RE' } },
  {
    test: /r[ée]publicains|^lr\b/i,
    logo: { id: 'lr', shortLabel: 'LR', color: '#0066cc', monogram: 'LR' },
  },
  {
    test: /nouvelle\s*[ée]nergie/i,
    logo: { id: 'nouvelle-energie', shortLabel: 'Nouvelle Énergie', color: '#162561', monogram: 'NE' },
  },
  { test: /nous\s*france/i, logo: { id: 'nous-france', shortLabel: 'Nous France', color: '#1a3a6b', monogram: 'NF' } },
  {
    test: /rassemblement\s*national|^rn\b/i,
    logo: { id: 'rn', shortLabel: 'RN', color: '#0d378a', monogram: 'RN' },
  },
  {
    test: /france\s*insoumise|^lfi\b/i,
    logo: { id: 'lfi', shortLabel: 'LFI', color: '#cc2443', monogram: 'LFI' },
  },
  {
    test: /g[ée]n[ée]ration\s*[ée]cologie/i,
    logo: { id: 'generation-ecologie', shortLabel: 'GÉ', color: '#2d8a4e', monogram: 'GÉ' },
  },
  {
    test: /gauche\s*r[ée]publicaine/i,
    logo: { id: 'gauche-republicaine', shortLabel: 'GRS', color: '#e74c6f', monogram: 'GR' },
  },
  {
    test: /parti\s*socialiste|^ps\b/i,
    logo: { id: 'ps', shortLabel: 'PS', color: '#e5007d', monogram: 'PS' },
  },
  {
    test: /lutte\s*ouvri[eè]re|^lo\b/i,
    logo: { id: 'lo', shortLabel: 'LO', color: '#990000', monogram: 'LO' },
  },
  {
    test: /debout\s*la\s*france/i,
    logo: { id: 'dlf', shortLabel: 'DLF', color: '#555555', monogram: 'DLF' },
  },
  {
    test: /les\s*patriotes/i,
    logo: { id: 'les-patriotes', shortLabel: 'Les Patriotes', color: '#002395', monogram: 'LP' },
  },
  {
    test: /union\s*populaire\s*r[ée]publicaine|^upr\b/i,
    logo: { id: 'upr', shortLabel: 'UPR', color: '#2c5282', monogram: 'UPR' },
  },
  {
    test: /solution\s*d[ée]mocratique/i,
    logo: { id: 'solution-democratique', shortLabel: 'SD', color: '#0e7490', monogram: 'SD' },
  },
  {
    test: /[ée]quinoxe/i,
    logo: { id: 'equinoxe', shortLabel: 'Équinoxe', color: '#0d9488', monogram: 'ÉQ' },
  },
  {
    test: /[ée]cologistes|eelv/i,
    logo: { id: 'eelv', shortLabel: 'Écologistes', color: '#00c000', monogram: 'É' },
  },
  {
    test: /picardie\s*debout|ind[ée]pendant/i,
    logo: { id: 'picardie-debout', shortLabel: 'Picardie debout', color: '#c0392b', monogram: 'PD' },
  },
  {
    test: /reconqu[eê]te/i,
    logo: { id: 'reconquete', shortLabel: 'Reconquête', color: '#8b6914', monogram: 'R!' },
  },
  {
    test: /l['’]apr[eè]s/i,
    logo: { id: 'lapres', shortLabel: "L'Après", color: '#9b2c2c', monogram: 'LA' },
  },
  {
    test: /g[ée]n[ée]ration[·.]?s/i,
    logo: { id: 'generations', shortLabel: 'Génération·s', color: '#c2185b', monogram: 'G·s' },
  },
];

const FALLBACK: PartyLogo = {
  id: 'independant',
  shortLabel: 'Sans étiquette',
  color: '#5a6570',
  monogram: '—',
};

export function partyLogoForAffiliation(affiliation: string): PartyLogo {
  const raw = affiliation?.trim() ?? '';
  for (const { test, logo } of AFFILIATION_RULES) {
    if (test.test(raw)) return logo;
  }
  return FALLBACK;
}

/** Chemin public du logo SVG */
export function partyLogoSrc(logo: PartyLogo): string {
  return `/logos/partis/${logo.id}.svg`;
}

/** Contraste texte sur fond parti (jaune Renaissance → noir) */
export function partyLogoTextColor(bg: string): string {
  const hex = bg.replace('#', '');
  if (hex.length !== 6) return '#ffffff';
  const r = parseInt(hex.slice(0, 2), 16);
  const g = parseInt(hex.slice(2, 4), 16);
  const b = parseInt(hex.slice(4, 6), 16);
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
  return luminance > 0.65 ? '#0a0a0a' : '#ffffff';
}
