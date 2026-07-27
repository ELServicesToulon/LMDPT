/**
 * Assemblée des influenceurs LMDPT — types, layout hémicycle, vue agrégée.
 * Distinct de l’observatoire (sanctions) et de l’indépendance médias (aides presse).
 */
import { getFamilyMeta, type PoliticalFamilyId } from './program-families';
import {
  FAMILY_COLORS,
  VALID_FAMILIES,
  resolveHueColor,
  resolveHueLabel,
  type SourceLink,
  type PoliticalHueRef,
  type VerificationStatus,
} from './independance-medias';
import raw from '../data/assemblee-influenceurs.json';

export type StanceStatus = 'declare' | 'estime';

export type PlatformKind =
  | 'x'
  | 'youtube'
  | 'twitch'
  | 'tiktok'
  | 'facebook'
  | 'instagram'
  | 'site'
  | 'autre';

export type DependencyKind =
  | 'sponsor'
  | 'investisseur'
  | 'subvention_publique'
  | 'mcn'
  | 'plateforme'
  | 'dons'
  | 'autre';

export type BackerKind =
  | 'fonds'
  | 'mecene'
  | 'groupe_media'
  | 'plateforme'
  | 'public'
  | 'autre';

export interface PlatformLink {
  kind: PlatformKind;
  label: string;
  url: string;
}

export interface Stance {
  status: StanceStatus;
  family: PoliticalFamilyId | string;
  label: string;
  confidence?: number;
  rationale?: string;
  sources: SourceLink[];
}

export interface DependencyStream {
  id: string;
  kind: DependencyKind;
  label: string;
  share_note?: string;
  sources: SourceLink[];
}

export interface InfluencerEntry {
  id: string;
  display_name: string;
  handle?: string;
  platforms: PlatformLink[];
  summary: string;
  stance: Stance;
  dependencies: DependencyStream[];
  verification: VerificationStatus;
  observatoire_ref?: string;
}

export interface BackerEntry {
  id: string;
  name: string;
  kind: BackerKind;
  summary: string;
  linked_influencers: string[];
  political_hue: PoliticalHueRef;
  sources: SourceLink[];
}

export interface AssembleeInfluenceursDataset {
  schema: string;
  title: string;
  updated: string;
  period: { from: string; label: string };
  disclaimer: string;
  methodology_note: string;
  influencers: InfluencerEntry[];
  backers: BackerEntry[];
}

export interface HemicycleSeatPos {
  x: number;
  y: number;
  r: number;
  angle: number;
  row: number;
  indexInRow: number;
}

export interface SeatedInfluencer extends InfluencerEntry {
  seat: HemicycleSeatPos;
  color: string;
  stanceLabel: string;
}

/** Ordre pédagogique gauche → droite (familles 1er tour). « autre » en dernier (fond). */
export const FAMILY_HEMI_ORDER: string[] = [
  'gauche-radicale',
  'social-democrate',
  'centre',
  'droite',
  'droite-nationale',
  'autre',
];

export const VALID_STANCE_STATUS = new Set<StanceStatus>(['declare', 'estime']);

export const VALID_DEPENDENCY_KINDS = new Set<DependencyKind>([
  'sponsor',
  'investisseur',
  'subvention_publique',
  'mcn',
  'plateforme',
  'dons',
  'autre',
]);

export const VALID_BACKER_KINDS = new Set<BackerKind>([
  'fonds',
  'mecene',
  'groupe_media',
  'plateforme',
  'public',
  'autre',
]);

export const DEPENDENCY_KIND_LABELS: Record<DependencyKind, string> = {
  sponsor: 'Sponsor',
  investisseur: 'Investisseur',
  subvention_publique: 'Subvention publique',
  mcn: 'MCN / réseau',
  plateforme: 'Plateforme',
  dons: 'Dons / abonnements',
  autre: 'Autre',
};

export const BACKER_KIND_LABELS: Record<BackerKind, string> = {
  fonds: 'Fonds / capital',
  mecene: 'Mécène',
  groupe_media: 'Groupe média',
  plateforme: 'Plateforme',
  public: 'Public / institutionnel',
  autre: 'Autre',
};

export const STANCE_STATUS_LABELS: Record<StanceStatus, string> = {
  declare: 'Déclarée (sourcée)',
  estime: 'Estimée (faisceau d’indices)',
};

export { FAMILY_COLORS, VALID_FAMILIES, resolveHueColor, resolveHueLabel };

export function loadAssembleeInfluenceurs(): AssembleeInfluenceursDataset {
  return raw as AssembleeInfluenceursDataset;
}

function familyRank(family: string): number {
  const i = FAMILY_HEMI_ORDER.indexOf(family);
  return i >= 0 ? i : FAMILY_HEMI_ORDER.length;
}

/**
 * Générateur d’arcs paramétriques (rangées concentriques).
 * Ordre de sortie = gauche → droite (angle décroissant depuis le bas).
 * Adapte rangées + rayon de siège à N (jusqu’à l’étalon AN 577).
 */
export function layoutHemicycleSeats(
  n: number,
  opts: {
    cx?: number;
    cy?: number;
    rMin?: number;
    rMax?: number;
    seatR?: number;
    viewW?: number;
    viewH?: number;
  } = {},
): HemicycleSeatPos[] {
  if (n <= 0) return [];
  const cx = opts.cx ?? 180;
  const cy = opts.cy ?? 185;
  const rMin = opts.rMin ?? (n >= 200 ? 28 : 52);
  const rMax = opts.rMax ?? (n >= 200 ? 178 : 168);
  // Rayon siège : décroît avec N pour limiter les collisions
  const seatR =
    opts.seatR ??
    (n >= 500 ? 1.65 : n >= 200 ? 2.4 : n >= 80 ? 3.6 : 5.2);

  // Rangées : plus nombreuses pour grands N (plafond 14)
  const rows = Math.max(
    1,
    Math.min(n >= 400 ? 14 : n >= 100 ? 10 : 6, Math.ceil(Math.sqrt(n / 1.8))),
  );
  const seatsPerRow: number[] = [];
  let remaining = n;
  for (let row = 0; row < rows; row += 1) {
    const leftRows = rows - row;
    // Rangées extérieures un peu plus denses
    const weight = 0.85 + (row / Math.max(1, rows - 1)) * 0.35;
    const share = Math.max(1, Math.ceil((remaining / leftRows) * weight));
    seatsPerRow.push(Math.min(share, remaining));
    remaining -= seatsPerRow[row]!;
  }
  // Ajuster si surplus / déficit
  while (seatsPerRow.reduce((a, b) => a + b, 0) > n) {
    for (let i = seatsPerRow.length - 1; i >= 0; i -= 1) {
      if (seatsPerRow[i]! > 1) {
        seatsPerRow[i]! -= 1;
        break;
      }
    }
  }
  while (seatsPerRow.reduce((a, b) => a + b, 0) < n) {
    seatsPerRow[seatsPerRow.length - 1]! += 1;
  }

  const rawSeats: HemicycleSeatPos[] = [];
  for (let row = 0; row < seatsPerRow.length; row += 1) {
    const count = seatsPerRow[row]!;
    const t = seatsPerRow.length === 1 ? 1 : row / (seatsPerRow.length - 1);
    const radius = rMin + t * (rMax - rMin);
    // Arc ~ 170° (presque demi-cercle), marges latérales
    const startAng = Math.PI - 0.12; // gauche
    const endAng = 0.12; // droite
    for (let i = 0; i < count; i += 1) {
      const u = count === 1 ? 0.5 : i / (count - 1);
      const angle = startAng + u * (endAng - startAng);
      const x = cx + radius * Math.cos(angle);
      const y = cy - radius * Math.sin(angle);
      rawSeats.push({ x, y, r: seatR, angle, row, indexInRow: i });
    }
  }

  // Tri gauche → droite (même convention que sortHemicycleLeftToRight)
  return rawSeats.sort((a, b) => {
    const angA = Math.atan2(cy - a.y, a.x - cx);
    const angB = Math.atan2(cy - b.y, b.x - cx);
    return angB - angA;
  });
}

/** Place les influenceurs sur les sièges : familles gauche→droite, « autre » en dernier. */
export function assignSeats(
  influencers: InfluencerEntry[],
): SeatedInfluencer[] {
  const sorted = [...influencers].sort((a, b) => {
    const ra = familyRank(String(a.stance.family));
    const rb = familyRank(String(b.stance.family));
    if (ra !== rb) return ra - rb;
    return a.display_name.localeCompare(b.display_name, 'fr', {
      sensitivity: 'base',
    });
  });
  const seats = layoutHemicycleSeats(sorted.length);
  return sorted.map((inf, i) => {
    const hue: PoliticalHueRef = {
      family: inf.stance.family,
      label: inf.stance.label,
    };
    return {
      ...inf,
      seat: seats[i]!,
      color: resolveHueColor(hue),
      stanceLabel: resolveHueLabel(hue),
    };
  });
}

export function getAssembleeInfluenceursView() {
  const data = loadAssembleeInfluenceurs();
  const influencers = data.influencers.map((inf) => ({
    ...inf,
    stance: {
      ...inf.stance,
      label:
        inf.stance.label?.trim() ||
        getFamilyMeta(inf.stance.family).shortLabel,
    },
  }));
  const seated = assignSeats(influencers);
  const byFamily: Record<string, number> = {};
  for (const f of FAMILY_HEMI_ORDER) byFamily[f] = 0;
  let declareCount = 0;
  let estimeCount = 0;
  for (const inf of influencers) {
    const fam = String(inf.stance.family);
    byFamily[fam] = (byFamily[fam] ?? 0) + 1;
    if (inf.stance.status === 'declare') declareCount += 1;
    else estimeCount += 1;
  }
  const backers = data.backers.map((b) => ({
    ...b,
    political_hue: {
      ...b.political_hue,
      color: resolveHueColor(b.political_hue),
      label: resolveHueLabel(b.political_hue),
    },
  }));
  return {
    ...data,
    influencers,
    seated,
    backers,
    counts: {
      total: influencers.length,
      declare: declareCount,
      estime: estimeCount,
      byFamily,
    },
  };
}

export function familyHueBadge(family: string, label?: string) {
  const fam = family in FAMILY_COLORS ? family : 'autre';
  const meta = getFamilyMeta(fam);
  const FAMILY_TO_SLUG: Record<string, string> = {
    'gauche-radicale': 'melenchon',
    'social-democrate': 'parti-socialiste',
    centre: 'attal',
    droite: 'retailleau',
    'droite-nationale': 'le-pen',
    autre: 'pluraliste',
  };
  return {
    slug: FAMILY_TO_SLUG[fam] ?? 'pluraliste',
    label: label?.trim() || meta.shortLabel,
    color: FAMILY_COLORS[fam] ?? FAMILY_COLORS.autre,
  };
}
