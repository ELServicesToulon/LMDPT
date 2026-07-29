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
import audienceOverrides from '../data/assemblee-audience-overrides.json';
import foreignLinksOverrides from '../data/assemblee-foreign-links.json';

export type StanceStatus = 'declare' | 'estime';
export type AudienceStatus = 'estimate' | 'documented';
export type SeatRankBy = 'audience' | 'foreign';

export type ForeignLinkKind =
  | 'organe_etat'
  | 'sanction_ue'
  | 'reseau_media_etranger'
  | 'financement_etranger'
  | 'autre';

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

/** Historique pédagogique d’évolution de teinte (motifs sourcés). */
export interface StanceHistoryEntry {
  as_of: string;
  family: PoliticalFamilyId | string;
  label: string;
  status: StanceStatus;
  confidence?: number;
  motifs: string[];
  sources: SourceLink[];
}

export interface DependencyStream {
  id: string;
  kind: DependencyKind;
  label: string;
  share_note?: string;
  sources: SourceLink[];
}

export interface AudienceInfo {
  followers_total: number;
  primary_platform?: string;
  as_of: string;
  status: AudienceStatus;
  note?: string;
  sources?: SourceLink[];
}

export interface ForeignLink {
  id: string;
  kind: ForeignLinkKind;
  state_or_entity: string;
  label: string;
  /** Poids pédagogique optionnel (sinon poids par kind). */
  weight?: number;
  sources: SourceLink[];
}

export interface ForeignSignal {
  links: ForeignLink[];
  /** Somme des poids — placement des rangs uniquement, pas un score moral. */
  signal: number;
  as_of: string;
}

export interface InfluencerEntry {
  id: string;
  display_name: string;
  handle?: string;
  platforms: PlatformLink[];
  summary: string;
  stance: Stance;
  /** Évolutions documentées — « il n’y a que les imbéciles qui ne changent pas d’avis ». */
  stance_history?: StanceHistoryEntry[];
  dependencies: DependencyStream[];
  verification: VerificationStatus;
  observatoire_ref?: string;
  /** Source / rôle dans le schéma (influenceur, elu-parlementaire, societe-civile, …) */
  category?: string;
  /** Audience multi-plateformes (ordres de grandeur pour le rang). */
  audience?: AudienceInfo;
  /** Liens d’État / financement étranger (inline, rare — préférer overrides). */
  foreign_links?: ForeignLink[];
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
  /** Audience résolue (override ou défaut pédagogique). */
  audienceResolved: AudienceInfo;
  /** Signaux liens d’État / étrangers documentés (fail-closed). */
  foreignResolved: ForeignSignal;
  /** Position alternative si classement par liens étrangers. */
  seatForeign?: HemicycleSeatPos;
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

export const VALID_FOREIGN_LINK_KINDS = new Set<ForeignLinkKind>([
  'organe_etat',
  'sanction_ue',
  'reseau_media_etranger',
  'financement_etranger',
  'autre',
]);

export const DEFAULT_FOREIGN_WEIGHTS: Record<ForeignLinkKind, number> = {
  organe_etat: 3,
  sanction_ue: 3,
  reseau_media_etranger: 2,
  financement_etranger: 2,
  autre: 1,
};

export const FOREIGN_LINK_KIND_LABELS: Record<ForeignLinkKind, string> = {
  organe_etat: 'Organe d’État',
  sanction_ue: 'Sanction / mesure UE',
  reseau_media_etranger: 'Réseau média étranger',
  financement_etranger: 'Financement étranger',
  autre: 'Autre lien documenté',
};

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

/** Hash déterministe pour étaler les estimations hors overrides. */
function hashRange(id: string, min: number, max: number): number {
  let h = 2166136261;
  for (let i = 0; i < id.length; i += 1) {
    h ^= id.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  const span = Math.max(1, max - min + 1);
  return min + (h >>> 0) % span;
}

type AudienceOverrideFile = {
  as_of?: string;
  defaults?: Record<string, { min: number; max: number }>;
  by_id?: Record<
    string,
    {
      followers_total: number;
      primary_platform?: string;
      status?: AudienceStatus;
      note?: string;
      sources?: SourceLink[];
    }
  >;
};

/**
 * Résout l’audience pédagogique : override sourcé > champ JSON > fourchette par catégorie.
 * Sert uniquement au rang (1er rang = plus d’abonnés), pas à un score moral.
 */
export function resolveAudience(inf: InfluencerEntry): AudienceInfo {
  if (inf.audience?.followers_total != null && inf.audience.followers_total > 0) {
    return {
      followers_total: Math.round(inf.audience.followers_total),
      primary_platform: inf.audience.primary_platform,
      as_of: inf.audience.as_of || '2026-07',
      status: inf.audience.status || 'estimate',
      note: inf.audience.note,
      sources: inf.audience.sources,
    };
  }
  const ov = audienceOverrides as AudienceOverrideFile;
  const hit = ov.by_id?.[inf.id];
  if (hit?.followers_total != null) {
    return {
      followers_total: Math.round(hit.followers_total),
      primary_platform: hit.primary_platform,
      as_of: ov.as_of || '2026-07',
      status: hit.status || 'estimate',
      note: hit.note,
      sources: hit.sources,
    };
  }
  const cat =
    inf.category === 'elu-parlementaire'
      ? 'elu-parlementaire'
      : inf.category === 'societe-civile'
        ? 'societe-civile'
        : 'influenceur';
  const range =
    ov.defaults?.[cat] ||
    ov.defaults?.other ||
    (cat === 'elu-parlementaire'
      ? { min: 2500, max: 45000 }
      : cat === 'societe-civile'
        ? { min: 50000, max: 400000 }
        : { min: 40000, max: 180000 });
  return {
    followers_total: hashRange(inf.id, range.min, range.max),
    as_of: ov.as_of || '2026-07',
    status: 'estimate',
    note:
      cat === 'elu-parlementaire'
        ? 'Fourchette basse estimée (député·e hors liste d’overrides).'
        : cat === 'societe-civile'
          ? 'Fourchette estimée (société civile hors liste d’overrides).'
          : 'Fourchette estimée (compte hors liste d’overrides).',
  };
}

export function formatFollowersFr(n: number): string {
  if (n >= 1_000_000) {
    const m = n / 1_000_000;
    return `${m >= 10 ? Math.round(m) : m.toFixed(1).replace(/\.0$/, '')} M`;
  }
  if (n >= 1000) {
    const k = n / 1000;
    return `${k >= 100 ? Math.round(k) : k.toFixed(k >= 10 ? 0 : 1).replace(/\.0$/, '')} k`;
  }
  return String(n);
}

type ForeignOverrideFile = {
  updated?: string;
  weight_kinds?: Partial<Record<ForeignLinkKind, number>>;
  by_id?: Record<string, { links: ForeignLink[] }>;
};

function linkWeight(
  link: ForeignLink,
  weights: Record<ForeignLinkKind, number>,
): number {
  if (typeof link.weight === 'number' && Number.isFinite(link.weight) && link.weight > 0) {
    return link.weight;
  }
  return weights[link.kind] ?? 1;
}

/**
 * Résout les liens d’État / financement étranger documentés (fail-closed).
 * Override JSON > champ inline. Placement pédagogique des rangs — pas un score moral.
 */
export function resolveForeignSignal(inf: InfluencerEntry): ForeignSignal {
  const file = foreignLinksOverrides as ForeignOverrideFile;
  const weights: Record<ForeignLinkKind, number> = {
    ...DEFAULT_FOREIGN_WEIGHTS,
    ...(file.weight_kinds as Partial<Record<ForeignLinkKind, number>>),
  };
  const fromOverride = file.by_id?.[inf.id]?.links ?? [];
  const fromInline = inf.foreign_links ?? [];
  const seen = new Set<string>();
  const links: ForeignLink[] = [];
  for (const link of [...fromOverride, ...fromInline]) {
    if (!link?.id || !VALID_FOREIGN_LINK_KINDS.has(link.kind)) continue;
    if (!Array.isArray(link.sources) || link.sources.length === 0) continue;
    if (!link.sources.every((s) => /^https?:\/\//.test(s.url))) continue;
    if (seen.has(link.id)) continue;
    seen.add(link.id);
    links.push(link);
  }
  const signal = links.reduce((acc, l) => acc + linkWeight(l, weights), 0);
  return {
    links,
    signal,
    as_of: file.updated || '2026-07',
  };
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
    (n >= 500 ? 2.15 : n >= 200 ? 2.6 : n >= 80 ? 3.6 : 5.2);

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

/**
 * Place les sièges :
 * - `audience` (défaut) : **1er rang = plus d’abonnés**
 * - `foreign` : **1er rang = plus de liens d’État / étrangers documentés**
 * Au sein de chaque rangée : familles gauche → droite (axe pédagogique).
 */
export function assignSeats(
  influencers: InfluencerEntry[],
  opts: { rankBy?: SeatRankBy } = {},
): SeatedInfluencer[] {
  const rankBy: SeatRankBy = opts.rankBy ?? 'audience';
  const seats = layoutHemicycleSeats(influencers.length);
  const byRow = new Map<number, HemicycleSeatPos[]>();
  for (const seat of seats) {
    const list = byRow.get(seat.row) ?? [];
    list.push(seat);
    byRow.set(seat.row, list);
  }
  for (const list of byRow.values()) {
    list.sort((a, b) => b.angle - a.angle); // gauche → droite
  }
  const rows = [...byRow.keys()].sort((a, b) => a - b);

  const withMeta = influencers.map((inf) => ({
    inf,
    audienceResolved: resolveAudience(inf),
    foreignResolved: resolveForeignSignal(inf),
  }));
  withMeta.sort((a, b) => {
    if (rankBy === 'foreign') {
      const df = b.foreignResolved.signal - a.foreignResolved.signal;
      if (df !== 0) return df;
      // À signal égal : audience en départage, puis famille
      const da =
        b.audienceResolved.followers_total - a.audienceResolved.followers_total;
      if (da !== 0) return da;
    } else {
      const df =
        b.audienceResolved.followers_total - a.audienceResolved.followers_total;
      if (df !== 0) return df;
    }
    const ra = familyRank(String(a.inf.stance.family));
    const rb = familyRank(String(b.inf.stance.family));
    if (ra !== rb) return ra - rb;
    return a.inf.display_name.localeCompare(b.inf.display_name, 'fr', {
      sensitivity: 'base',
    });
  });

  const seated: SeatedInfluencer[] = [];
  let cursor = 0;
  for (const row of rows) {
    const rowSeats = byRow.get(row)!;
    const chunk = withMeta.slice(cursor, cursor + rowSeats.length);
    cursor += rowSeats.length;
    chunk.sort((a, b) => {
      const ra = familyRank(String(a.inf.stance.family));
      const rb = familyRank(String(b.inf.stance.family));
      if (ra !== rb) return ra - rb;
      return a.inf.display_name.localeCompare(b.inf.display_name, 'fr', {
        sensitivity: 'base',
      });
    });
    for (let i = 0; i < chunk.length; i += 1) {
      const { inf, audienceResolved, foreignResolved } = chunk[i]!;
      const hue: PoliticalHueRef = {
        family: inf.stance.family,
        label: inf.stance.label,
      };
      seated.push({
        ...inf,
        seat: rowSeats[i]!,
        color: resolveHueColor(hue),
        stanceLabel: resolveHueLabel(hue),
        audienceResolved,
        foreignResolved,
      });
    }
  }
  return seated;
}

/** Catégorie corpus normalisée (null / absent → influenceur). */
export type AssembleeCategory =
  | 'influenceur'
  | 'societe-civile'
  | 'elu-parlementaire';

export function normalizeAssembleeCategory(
  category?: string | null,
): AssembleeCategory {
  if (category === 'elu-parlementaire') return 'elu-parlementaire';
  if (category === 'societe-civile') return 'societe-civile';
  return 'influenceur';
}

/** Paliers zoom hémicycle (Fit / Lire / Détail). */
export const HEMI_ZOOM_TIERS = {
  fit: 1,
  lire: 2,
  detail: 3.5,
} as const;

export type HemiZoomTier = keyof typeof HEMI_ZOOM_TIERS;

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
  const seatedAudience = assignSeats(influencers, { rankBy: 'audience' });
  const seatedForeign = assignSeats(influencers, { rankBy: 'foreign' });
  const foreignById = new Map(seatedForeign.map((s) => [s.id, s.seat]));
  const seated: SeatedInfluencer[] = seatedAudience.map((s) => ({
    ...s,
    seatForeign: foreignById.get(s.id),
  }));
  const foreignDocumented = seated.filter((s) => s.foreignResolved.signal > 0).length;
  const byFamily: Record<string, number> = {};
  for (const f of FAMILY_HEMI_ORDER) byFamily[f] = 0;
  const byCategory: Record<AssembleeCategory, number> = {
    influenceur: 0,
    'societe-civile': 0,
    'elu-parlementaire': 0,
  };
  let declareCount = 0;
  let estimeCount = 0;
  for (const inf of influencers) {
    const fam = String(inf.stance.family);
    byFamily[fam] = (byFamily[fam] ?? 0) + 1;
    byCategory[normalizeAssembleeCategory(inf.category)] += 1;
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
      foreignDocumented,
      byFamily,
      byCategory,
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

/** Payload client unique (hémicycle + fiches développement). */
export function buildClientPayload(seated: SeatedInfluencer[]) {
  return Object.fromEntries(
    seated.map((s) => [
      s.id,
      {
        id: s.id,
        display_name: s.display_name,
        handle: s.handle ?? '',
        summary: s.summary,
        color: s.color,
        family: String(s.stance.family),
        stance_status: s.stance.status,
        stance_label: s.stanceLabel,
        statusLabel: STANCE_STATUS_LABELS[s.stance.status],
        confidence: s.stance.confidence ?? null,
        rationale: s.stance.rationale ?? '',
        platforms: s.platforms,
        dependencies: s.dependencies.map((d) => ({
          kind: d.kind,
          kindLabel: DEPENDENCY_KIND_LABELS[d.kind],
          label: d.label,
          share_note: d.share_note ?? '',
          sources: d.sources,
        })),
        foreign_signal: s.foreignResolved.signal,
        foreign_links: s.foreignResolved.links.map((l) => ({
          id: l.id,
          kind: l.kind,
          kindLabel: FOREIGN_LINK_KIND_LABELS[l.kind],
          state_or_entity: l.state_or_entity,
          label: l.label,
          sources: l.sources,
        })),
        verification: s.verification,
        observatoire_ref: s.observatoire_ref ?? '',
        stance_sources: s.stance.sources,
        stance_history: (s.stance_history ?? []).map((h) => ({
          as_of: h.as_of,
          family: String(h.family),
          label: h.label,
          status: h.status,
          confidence: h.confidence ?? null,
          motifs: h.motifs ?? [],
          sources: h.sources ?? [],
        })),
        category: s.category ?? 'influenceur',
        followers_total: s.audienceResolved.followers_total,
        followers_label: formatFollowersFr(s.audienceResolved.followers_total),
        audience_status: s.audienceResolved.status,
        audience_note: s.audienceResolved.note ?? '',
        audience_platform: s.audienceResolved.primary_platform ?? '',
        row: s.seat.row,
        row_foreign: s.seatForeign?.row ?? s.seat.row,
        x_foreign: s.seatForeign ? Number(s.seatForeign.x.toFixed(2)) : undefined,
        y_foreign: s.seatForeign ? Number(s.seatForeign.y.toFixed(2)) : undefined,
        r_foreign: s.seatForeign ? Number(s.seatForeign.r.toFixed(2)) : undefined,
      },
    ]),
  );
}
