import { ANALYSIS_CATALOG } from './analyses';
import { FIRST_ROUND_HUES, ROLE_LEVEL, type CommentRole } from './comment-politics';
import rawArena from '../data/chroniqueurs-arena.json';

export type ArenaSide = 'gauche' | 'droite' | 'centre' | 'exclu';
export type FactCheckStatus = 'confirme' | 'partiel' | 'debattu' | 'non_etaye';
export type ChroniqueurStatus = 'actif' | 'invite_vide';
export type ChroniqueCatalog = 'public' | 'archive';

const FACT_CHECK_STATUSES = ['confirme', 'partiel', 'debattu', 'non_etaye'] as const;
const ARENA_SIDES = ['gauche', 'droite', 'centre', 'exclu'] as const;
const CHRONIQUEUR_STATUSES = ['actif', 'invite_vide'] as const;
const CHRONIQUE_CATALOGS = ['public', 'archive'] as const;

export const STATUS_MULTIPLIER: Record<FactCheckStatus, number> = {
  confirme: 1,
  partiel: 0.5,
  debattu: 0,
  non_etaye: 0,
};

export const FACT_CHECK_STATUS_LABEL: Record<FactCheckStatus, string> = {
  confirme: 'Confirmé',
  partiel: 'Partiel',
  debattu: 'Débattu',
  non_etaye: 'Non étayé',
};

export const MIN_REVIEWER_ROLE: CommentRole = 'modo';

export interface ArenaRope {
  left_label: string;
  right_label: string;
  left_color: string;
  right_color: string;
  neutral_zone_pct: number;
}

export interface Chroniqueur {
  id: string;
  nom: string;
  role: string;
  status: ChroniqueurStatus;
  bio_courte: string;
  avatar?: string;
}

export interface Chronique {
  slug: string;
  href: string | null;
  chroniqueur_id: string;
  title: string;
  date: string;
  catalog: ChroniqueCatalog;
  thesis_hues: string[];
  factual_dossier?: string;
}

export interface FactCheckSource {
  label: string;
  url: string;
}

export interface FactCheck {
  id: string;
  chronique_slug: string;
  label: string;
  status: FactCheckStatus;
  weight: number;
  supports_hues: string[];
  source: FactCheckSource;
  reviewed_at: string;
  reviewer_role: CommentRole;
  weight_left?: number;
  weight_right?: number;
}

export interface ChroniqueursArenaData {
  meta: {
    updated: string;
    disclaimer: string;
    method_url: string;
  };
  rope: ArenaRope;
  hue_to_side: Record<string, ArenaSide>;
  chroniqueurs: Chroniqueur[];
  chroniques: Chronique[];
  fact_checks: FactCheck[];
}

export interface ArenaTotals {
  gauche: number;
  droite: number;
  transversal: number;
}

export interface ArenaKnot {
  totals: ArenaTotals;
  knotRatio: number;
  knotPercent: number;
  inNeutralZone: boolean;
  checkCount: number;
  pullingCheckCount: number;
  lastReviewed: string | null;
  bootstrapping: boolean;
}

export interface ChroniqueTeaser {
  slug: string;
  title: string;
  href: string | null;
  catalog: ChroniqueCatalog;
  checkCount: number;
  pullingCount: number;
}

export class ArenaValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = 'ArenaValidationError';
  }
}

function isFactCheckStatus(value: string): value is FactCheckStatus {
  return (FACT_CHECK_STATUSES as readonly string[]).includes(value);
}

function isArenaSide(value: string): value is ArenaSide {
  return (ARENA_SIDES as readonly string[]).includes(value);
}

function isChroniqueurStatus(value: string): value is ChroniqueurStatus {
  return (CHRONIQUEUR_STATUSES as readonly string[]).includes(value);
}

function isChroniqueCatalog(value: string): value is ChroniqueCatalog {
  return (CHRONIQUE_CATALOGS as readonly string[]).includes(value);
}

function isCommentRole(value: string): value is CommentRole {
  return value in ROLE_LEVEL;
}

function assertIsoDate(value: string, ctx: string): void {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || Number.isNaN(Date.parse(`${value}T00:00:00Z`))) {
    throw new ArenaValidationError(`${ctx}: date invalide (${value})`);
  }
}

function assertHttpUrl(value: string, ctx: string): void {
  try {
    const url = new URL(value);
    if (url.protocol !== 'http:' && url.protocol !== 'https:') {
      throw new Error('protocol');
    }
  } catch {
    throw new ArenaValidationError(`${ctx}: URL invalide`);
  }
}

export function validateArenaData(data: ChroniqueursArenaData): ChroniqueursArenaData {
  if (!data.meta?.disclaimer?.trim()) {
    throw new ArenaValidationError('meta.disclaimer manquant');
  }
  if (!data.meta.method_url?.startsWith('/')) {
    throw new ArenaValidationError('meta.method_url doit être un chemin interne');
  }
  assertIsoDate(data.meta.updated, 'meta.updated');

  if (!data.rope?.left_label || !data.rope.right_label) {
    throw new ArenaValidationError('rope.labels manquants');
  }
  if (!(data.rope.neutral_zone_pct >= 0 && data.rope.neutral_zone_pct <= 50)) {
    throw new ArenaValidationError('rope.neutral_zone_pct hors [0, 50]');
  }

  for (const hue of FIRST_ROUND_HUES) {
    if (!isArenaSide(data.hue_to_side[hue.slug] ?? '')) {
      throw new ArenaValidationError(`hue_to_side manque ${hue.slug}`);
    }
  }
  for (const [slug, side] of Object.entries(data.hue_to_side)) {
    if (!isArenaSide(side)) {
      throw new ArenaValidationError(`hue_to_side.${slug} côté invalide`);
    }
  }

  const chroniqueurIds = new Set<string>();
  for (const chroniqueur of data.chroniqueurs) {
    if (!chroniqueur.id || chroniqueurIds.has(chroniqueur.id)) {
      throw new ArenaValidationError(`chroniqueur id dupliqué ou vide (${chroniqueur.id})`);
    }
    if (!isChroniqueurStatus(chroniqueur.status)) {
      throw new ArenaValidationError(`chroniqueur ${chroniqueur.id}: statut invalide`);
    }
    chroniqueurIds.add(chroniqueur.id);
  }

  const chroniqueBySlug = new Map<string, Chronique>();
  for (const chronique of data.chroniques) {
    if (!chronique.slug || chroniqueBySlug.has(chronique.slug)) {
      throw new ArenaValidationError(`chronique slug dupliqué ou vide (${chronique.slug})`);
    }
    if (!isChroniqueCatalog(chronique.catalog)) {
      throw new ArenaValidationError(`chronique ${chronique.slug}: catalog invalide`);
    }
    if (!chroniqueurIds.has(chronique.chroniqueur_id)) {
      throw new ArenaValidationError(`chronique ${chronique.slug}: chroniqueur inconnu`);
    }
    for (const hue of chronique.thesis_hues) {
      if (!isArenaSide(data.hue_to_side[hue] ?? '')) {
        throw new ArenaValidationError(`chronique ${chronique.slug}: hue inconnu ${hue}`);
      }
    }
    assertIsoDate(chronique.date, `chronique ${chronique.slug}.date`);

    const inCatalog = ANALYSIS_CATALOG.some((entry) => entry.slug === chronique.slug);
    if (chronique.catalog === 'public') {
      if (!chronique.href?.startsWith('/')) {
        throw new ArenaValidationError(`chronique ${chronique.slug}: href public manquant`);
      }
      if (!inCatalog) {
        throw new ArenaValidationError(`chronique ${chronique.slug}: absente du catalogue Analyses`);
      }
    } else {
      if (chronique.href !== null) {
        throw new ArenaValidationError(`chronique ${chronique.slug}: archive doit avoir href null`);
      }
      if (inCatalog) {
        throw new ArenaValidationError(`chronique ${chronique.slug}: archive encore au catalogue`);
      }
    }
    chroniqueBySlug.set(chronique.slug, chronique);
  }

  const checkIds = new Set<string>();
  for (const check of data.fact_checks) {
    if (!check.id || checkIds.has(check.id)) {
      throw new ArenaValidationError(`fact_check id dupliqué ou vide (${check.id})`);
    }
    checkIds.add(check.id);
    if (!chroniqueBySlug.has(check.chronique_slug)) {
      throw new ArenaValidationError(`fact_check ${check.id}: chronique inconnue`);
    }
    if (!isFactCheckStatus(check.status)) {
      throw new ArenaValidationError(`fact_check ${check.id}: statut invalide`);
    }
    if (!(check.weight > 0)) {
      throw new ArenaValidationError(`fact_check ${check.id}: weight doit être > 0`);
    }
    if (check.weight_left != null && check.weight_left < 0) {
      throw new ArenaValidationError(`fact_check ${check.id}: weight_left négatif`);
    }
    if (check.weight_right != null && check.weight_right < 0) {
      throw new ArenaValidationError(`fact_check ${check.id}: weight_right négatif`);
    }
    if (!isCommentRole(check.reviewer_role) || ROLE_LEVEL[check.reviewer_role] < ROLE_LEVEL[MIN_REVIEWER_ROLE]) {
      throw new ArenaValidationError(`fact_check ${check.id}: reviewer_role < ${MIN_REVIEWER_ROLE}`);
    }
    assertIsoDate(check.reviewed_at, `fact_check ${check.id}.reviewed_at`);
    if (!check.label?.trim()) {
      throw new ArenaValidationError(`fact_check ${check.id}: label vide`);
    }
    if (!check.source?.label?.trim()) {
      throw new ArenaValidationError(`fact_check ${check.id}: source.label vide`);
    }
    assertHttpUrl(check.source.url, `fact_check ${check.id}.source.url`);
    if (check.supports_hues.length === 0) {
      throw new ArenaValidationError(`fact_check ${check.id}: supports_hues vide`);
    }
    for (const hue of check.supports_hues) {
      if (!isArenaSide(data.hue_to_side[hue] ?? '')) {
        throw new ArenaValidationError(`fact_check ${check.id}: hue inconnu ${hue}`);
      }
    }
  }

  return data;
}

export function loadArena(): ChroniqueursArenaData {
  return validateArenaData(rawArena as ChroniqueursArenaData);
}

export interface CheckAllocation {
  gauche: number;
  droite: number;
  transversal: number;
}

export function allocateCheck(
  check: FactCheck,
  hueToSide: Record<string, ArenaSide>,
): CheckAllocation {
  const multiplier = STATUS_MULTIPLIER[check.status] ?? 0;
  if (multiplier === 0) {
    return { gauche: 0, droite: 0, transversal: 0 };
  }

  if (check.weight_left != null || check.weight_right != null) {
    return {
      gauche: (check.weight_left ?? 0) * multiplier,
      droite: (check.weight_right ?? 0) * multiplier,
      transversal: 0,
    };
  }

  const pulling = new Set<'gauche' | 'droite'>();
  for (const hue of check.supports_hues) {
    const side = hueToSide[hue];
    if (side === 'gauche' || side === 'droite') pulling.add(side);
  }

  const weight = check.weight * multiplier;
  if (pulling.has('gauche') && pulling.has('droite')) {
    return { gauche: weight / 2, droite: weight / 2, transversal: 0 };
  }
  if (pulling.has('gauche')) return { gauche: weight, droite: 0, transversal: 0 };
  if (pulling.has('droite')) return { gauche: 0, droite: weight, transversal: 0 };
  return { gauche: 0, droite: 0, transversal: weight };
}

export function computeKnot(
  data: ChroniqueursArenaData,
  checks: FactCheck[] = data.fact_checks,
): ArenaKnot {
  const totals: ArenaTotals = { gauche: 0, droite: 0, transversal: 0 };
  let pullingCheckCount = 0;
  let lastReviewed: string | null = null;

  for (const check of checks) {
    const allocation = allocateCheck(check, data.hue_to_side);
    totals.gauche += allocation.gauche;
    totals.droite += allocation.droite;
    totals.transversal += allocation.transversal;
    if (allocation.gauche + allocation.droite > 0) pullingCheckCount += 1;
    if (!lastReviewed || check.reviewed_at > lastReviewed) lastReviewed = check.reviewed_at;
  }

  const pullingTotal = totals.gauche + totals.droite;
  const knotRatio = pullingTotal === 0 ? 0 : (totals.droite - totals.gauche) / pullingTotal;
  const knotPercent = 50 + knotRatio * 40;
  const inNeutralZone = Math.abs(knotRatio) * 100 <= data.rope.neutral_zone_pct;

  return {
    totals,
    knotRatio,
    knotPercent,
    inNeutralZone,
    checkCount: checks.length,
    pullingCheckCount,
    lastReviewed,
    bootstrapping: pullingCheckCount === 0,
  };
}

export function teaserForChronique(
  slug: string,
  data: ChroniqueursArenaData = loadArena(),
): ChroniqueTeaser | null {
  const chronique = data.chroniques.find((entry) => entry.slug === slug);
  if (!chronique) return null;
  const checks = data.fact_checks.filter((check) => check.chronique_slug === slug);
  const knot = computeKnot(data, checks);
  return {
    slug: chronique.slug,
    title: chronique.title,
    href: chronique.href,
    catalog: chronique.catalog,
    checkCount: knot.checkCount,
    pullingCount: knot.pullingCheckCount,
  };
}

export function checksForChronique(
  slug: string,
  data: ChroniqueursArenaData = loadArena(),
): FactCheck[] {
  return data.fact_checks.filter((check) => check.chronique_slug === slug);
}

export function knotAriaText(knot: ArenaKnot, rope: ArenaRope): string {
  if (knot.bootstrapping) {
    return 'Arène en amorçage. Aucune affirmation ne tire encore la corde. Nœud à l’équilibre documentaire.';
  }
  if (knot.inNeutralZone) {
    return `Équilibre documentaire. ${rope.left_label} ${knot.totals.gauche.toFixed(1)}, ${rope.right_label} ${knot.totals.droite.toFixed(1)}.`;
  }
  const heavier = knot.knotRatio < 0 ? rope.left_label : rope.right_label;
  return `Le nœud penche vers ${heavier}. ${rope.left_label} ${knot.totals.gauche.toFixed(1)}, ${rope.right_label} ${knot.totals.droite.toFixed(1)}. Ce n’est pas un camp gagnant.`;
}
