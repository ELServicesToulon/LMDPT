/**
 * Observatoire de la censure — types factuels, dates de mesure, sources officielles.
 * Les dates viennent du texte des fiches (motif_officiel, à défaut motif_officieux).
 * Aucune fiche n’a de date d’ajout.
 */
import raw from '../data/observatoire-censure.json';

export const FACTUAL_TYPES = [
  'chaîne TV',
  'plateforme',
  'média en ligne',
  'autorité publique',
] as const;

export type FactualType = (typeof FACTUAL_TYPES)[number];

export type ObsKind = 'media' | 'influencer';

export type ObservatoireEntry = {
  id: string;
  kind: ObsKind;
  name: string;
  handle?: string;
  factual_type: FactualType;
  action_label: string;
  authority: string;
  measure_date?: string;
  official_source_url?: string;
  official_source_label?: string;
  motif_officiel: string;
  motif_officieux?: string;
  verification: string;
};

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

export function isFactualType(value: string): value is FactualType {
  return (FACTUAL_TYPES as readonly string[]).includes(value);
}

/** Affiche une date de mesure ISO (jour ou mois) extraite des fiches. */
export function formatMeasureDate(iso: string | undefined): string {
  const rawDate = String(iso || '').trim();
  const full = rawDate.match(/^(\d{4})-(\d{2})-(\d{2})$/);
  if (full) {
    const month = Number(full[2]);
    const day = Number(full[3]);
    const monthLabel = MONTHS_FR[month - 1];
    if (!monthLabel || day < 1 || day > 31) return '—';
    return `${day} ${monthLabel} ${full[1]}`;
  }
  const monthOnly = rawDate.match(/^(\d{4})-(\d{2})$/);
  if (monthOnly) {
    const monthLabel = MONTHS_FR[Number(monthOnly[2]) - 1];
    if (!monthLabel) return '—';
    return `${monthLabel} ${monthOnly[1]}`;
  }
  return '—';
}

/** Comparaison lexicographique après normalisation YYYY-MM-DD. */
export function measureDateSortKey(iso: string | undefined): string {
  const rawDate = String(iso || '').trim();
  if (/^\d{4}-\d{2}-\d{2}$/.test(rawDate)) return rawDate;
  if (/^\d{4}-\d{2}$/.test(rawDate)) return `${rawDate}-01`;
  return '';
}

export function latestMeasureDate(entries: { measure_date?: string }[]): string | undefined {
  let best: string | undefined;
  let bestKey = '';
  for (const entry of entries) {
    const key = measureDateSortKey(entry.measure_date);
    if (key && key > bestKey) {
      bestKey = key;
      best = entry.measure_date;
    }
  }
  return best;
}

type MediaRaw = {
  id: string;
  name: string;
  factual_type: string;
  action_label: string;
  authority?: string;
  measure_date?: string;
  official_source_url?: string;
  official_source_label?: string;
  motif_officiel: string;
  motif_officieux?: string;
  verification: string;
};

type InfluencerRaw = {
  id: string;
  display_name: string;
  handle?: string;
  factual_type: string;
  action_label?: string;
  authority?: string;
  measure_date?: string;
  official_source_url?: string;
  official_source_label?: string;
  motif_officiel: string;
  motif_officieux?: string;
  verification: string;
};

function asFactualType(value: string, id: string): FactualType {
  if (!isFactualType(value)) {
    throw new Error(`Type factuel inconnu pour ${id}: ${value}`);
  }
  return value;
}

export function observatoireEntries(): ObservatoireEntry[] {
  const media = (raw.media as MediaRaw[]).map((m) => ({
    id: m.id,
    kind: 'media' as const,
    name: m.name,
    factual_type: asFactualType(m.factual_type, m.id),
    action_label: m.action_label,
    authority: m.authority?.trim() || '—',
    measure_date: m.measure_date,
    official_source_url: m.official_source_url,
    official_source_label: m.official_source_label,
    motif_officiel: m.motif_officiel,
    motif_officieux: m.motif_officieux,
    verification: m.verification,
  }));
  const influencers = (raw.influencers as InfluencerRaw[]).map((inf) => ({
    id: inf.id,
    kind: 'influencer' as const,
    name: inf.display_name,
    handle: inf.handle,
    factual_type: asFactualType(inf.factual_type, inf.id),
    action_label: inf.action_label?.trim() || '—',
    authority: inf.authority?.trim() || '—',
    measure_date: inf.measure_date,
    official_source_url: inf.official_source_url,
    official_source_label: inf.official_source_label,
    motif_officiel: inf.motif_officiel,
    motif_officieux: inf.motif_officieux,
    verification: inf.verification,
  }));
  return [...media, ...influencers];
}

export function observatoireDataset() {
  return {
    title: raw.title as string,
    disclaimer: raw.disclaimer as string,
    taxonomy_note: raw.taxonomy_note as string,
    period_label: raw.period.label as string,
    media_count: raw.media.length,
    influencer_count: raw.influencers.length,
  };
}
