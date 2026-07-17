/**
 * Couleurs par proximité de programmes / idées (spectre 1er tour).
 * Pas une carte d’adhésion : teintes continues gauche → droite
 * pour lire la pluralité dans l’hémicycle AN1T.
 *
 * Aligné sur FIRST_ROUND_HUES (comment-politics) + couleurs Wiki groupes.
 */

/** Position sur un axe 0 (gauche radicale) → 1 (droite nationale) — blocs + candidats */
export const BLOC_SPECTRUM_AXIS: Record<string, number> = {
  // blocs législatifs
  nfp: 0.12,
  'nfp-union': 0.22,
  lfi: 0.08,
  eco: 0.28,
  ps: 0.32,
  ensemble: 0.48,
  horizons: 0.55,
  democrates: 0.5,
  lr: 0.68,
  udr: 0.78,
  rn: 0.92,
  autres: 0.5,
  // candidats présidentiels (proximité programmes)
  arthaud: 0.02,
  poutou: 0.05,
  melenchon: 0.1,
  roussel: 0.16,
  hidalgo: 0.28,
  hamon: 0.3,
  jadot: 0.32,
  glucksmann: 0.3,
  tondelier: 0.28,
  lassalle: 0.42,
  cheminade: 0.45,
  macron: 0.5,
  attal: 0.48,
  philippe: 0.55,
  fillon: 0.68,
  pecresse: 0.7,
  retailleau: 0.7,
  asselineau: 0.75,
  'dupont-aignan': 0.82,
  zemmour: 0.88,
  bardella: 0.9,
  'le-pen': 0.92,
  villepin: 0.58,
  ruffin: 0.12,
  vacant: 0.5,
};

/**
 * Spectre HSL : magenta-rouge (gauche) → jaune (centre) → bleu (droite).
 * Proximité de programmes = teintes proches sur l’arc.
 */
export function colorFromSpectrumAxis(t: number): string {
  const x = Math.min(1, Math.max(0, t));
  // 3 points : gauche #c0392b (hue≈8), centre #f1c40f (hue≈48), droite #0d378a (hue≈220)
  let h: number;
  let s: number;
  let l: number;
  if (x < 0.5) {
    const u = x / 0.5;
    h = 8 + u * (48 - 8);
    s = 68 + u * (10);
    l = 42 + u * (8);
  } else {
    const u = (x - 0.5) / 0.5;
    h = 48 + u * (220 - 48);
    s = 78 - u * 18;
    l = 50 - u * 12;
  }
  return hslToHex(h, s, l);
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, '0');
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

/** Couleur bloc pour hémicycle « 1er tour pur » (proximité programmes). */
export function programProximityColor(blocId: string | undefined, fallback = '#95a5a6'): string {
  if (!blocId) return fallback;
  const id = blocId.toLowerCase();
  if (BLOC_SPECTRUM_AXIS[id] != null) {
    return colorFromSpectrumAxis(BLOC_SPECTRUM_AXIS[id]);
  }
  // fallback keywords
  if (/nfp|gauche|lfi|insoumis|social|eco/.test(id)) return colorFromSpectrumAxis(0.15);
  if (/ensemble|centre|horizons|modem|democrate/.test(id)) return colorFromSpectrumAxis(0.5);
  if (/lr|droite|republic/.test(id)) return colorFromSpectrumAxis(0.7);
  if (/rn|rassemblement|national/.test(id)) return colorFromSpectrumAxis(0.92);
  return fallback;
}

/**
 * Ordre de placement dans l’hémicycle — convention Assemblée nationale :
 * **gauche** (écran gauche) → **centre** → **droite** (écran droite).
 * Vue face à l’hémicycle (président d’assemblée en bas).
 */
export const SPECTRUM_SEAT_ORDER = ['nfp', 'ensemble', 'lr', 'rn', 'autres'] as const;

export function spectrumSortKey(blocId: string): number {
  // Candidats & sous-blocs : ordre continu sur l’axe 0 (gauche) → 1 (droite)
  if (BLOC_SPECTRUM_AXIS[blocId] != null && !(SPECTRUM_SEAT_ORDER as readonly string[]).includes(blocId)) {
    return BLOC_SPECTRUM_AXIS[blocId];
  }
  const i = SPECTRUM_SEAT_ORDER.indexOf(blocId as (typeof SPECTRUM_SEAT_ORDER)[number]);
  if (i >= 0) {
    // indices 0..4 mappés sur 0..1 pour rester comparable aux axes candidats
    return i / Math.max(1, SPECTRUM_SEAT_ORDER.length - 1);
  }
  return BLOC_SPECTRUM_AXIS[blocId] ?? 0.5;
}

export type HemiPos = { x: number; y: number };

/**
 * Trie les sièges le long de l’arc hémicycle : **gauche → droite**.
 * Centre géométrique approximatif du modèle Wikimedia (viewBox 360×185).
 */
export function sortHemicycleLeftToRight(
  positions: HemiPos[],
  cx = 180,
  cy = 185,
): HemiPos[] {
  return [...positions].sort((a, b) => {
    // atan2 depuis le bas de l’hémicycle : angB - angA = parcours de gauche (x bas) à droite (x haut)
    const angA = Math.atan2(cy - a.y, a.x - cx);
    const angB = Math.atan2(cy - b.y, b.x - cx);
    return angB - angA;
  });
}

/**
 * Couleurs Assemblée réelle (législatives post-T1) :
 * teintes Wiki / groupes officiels — lisibilité institutionnelle.
 */
export const REAL_ASSEMBLY_BLOC_COLORS: Record<string, string> = {
  nfp: '#cc2443',
  ensemble: '#ffeb00',
  lr: '#0066cc',
  rn: '#0d378a',
  autres: '#b0b0b0',
};

export function realAssemblyColor(blocId: string | undefined, fallback = '#b0b0b0'): string {
  if (!blocId) return fallback;
  return REAL_ASSEMBLY_BLOC_COLORS[blocId] ?? fallback;
}
