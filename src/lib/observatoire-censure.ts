/**
 * Observatoire de la censure — types factuels, dates de mesure, sources officielles.
 * Les dates viennent du texte des fiches (motif_officiel, à défaut motif_officieux).
 * Aucune fiche n’a de date d’ajout.
 * Les fiches « En vérification » restent dans le JSON et sortent de la liste publique.
 */
import raw from '../data/observatoire-censure.json';

export const FACTUAL_TYPES = [
  'chaîne TV',
  'radio',
  'média en ligne',
  'personnalité',
  'plateforme',
  'autorité publique',
] as const;

export type FactualType = (typeof FACTUAL_TYPES)[number];

export const STATUS_EN_VERIFICATION = 'En vérification';

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
  official_sources?: OfficialSourceRef[];
  motif_officiel: string;
  motif_officieux?: string;
  verification: string;
  status?: string;
};

export type OfficialSourceRef = {
  url: string;
  label: string;
};

export type OfficialSourceSegment =
  | { type: 'text'; text: string }
  | { type: 'link'; url: string; label: string };

export function officialSourceSegments(entry: {
  official_source_url?: string;
  official_source_label?: string;
  official_sources?: OfficialSourceRef[];
}): OfficialSourceSegment[] {
  const label = entry.official_source_label;
  const refs = entry.official_sources;
  if (label && refs && refs.length > 0) {
    const segments: OfficialSourceSegment[] = [];
    let rest = label;
    for (const ref of refs) {
      const i = rest.indexOf(ref.label);
      if (i === -1) {
        return entry.official_source_url
          ? [{ type: 'link', url: entry.official_source_url, label }]
          : [{ type: 'text', text: label }];
      }
      if (i > 0) segments.push({ type: 'text', text: rest.slice(0, i) });
      segments.push({ type: 'link', url: ref.url, label: ref.label });
      rest = rest.slice(i + ref.label.length);
    }
    if (rest) segments.push({ type: 'text', text: rest });
    return segments;
  }
  if (entry.official_source_url && label) {
    return [{ type: 'link', url: entry.official_source_url, label }];
  }
  return [];
}

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

/** Mois + année d’une date de mesure ISO (jour ou mois). */
export function formatMeasureMonthYear(iso: string | undefined): string {
  const rawDate = String(iso || '').trim();
  const full = rawDate.match(/^(\d{4})-(\d{2})(?:-\d{2})?$/);
  if (!full) return '—';
  const monthLabel = MONTHS_FR[Number(full[2]) - 1];
  if (!monthLabel) return '—';
  return `${monthLabel} ${full[1]}`;
}

/** Libellé public de fraîcheur, calculé sur le max des dates de mesure fournies. */
export function documentedUntilLabel(entries: { measure_date?: string }[]): string | undefined {
  const latest = latestMeasureDate(entries);
  const monthYear = formatMeasureMonthYear(latest);
  if (!latest || monthYear === '—') return undefined;
  return `Fiches documentées jusqu’en ${monthYear}`;
}

export function isEnVerification(entry: { status?: string }): boolean {
  return entry.status === STATUS_EN_VERIFICATION;
}

export function observatoirePublicEntries(entries = observatoireEntries()): ObservatoireEntry[] {
  return entries.filter((entry) => !isEnVerification(entry));
}

export type ObservatoireFilterControl = {
  id: string;
  value: string;
  label: string;
};

export function factualTypeFilterId(type: FactualType): string {
  const slug = type
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .toLowerCase();
  return `obs-type-${slug}`;
}

/** Filtres publics : « Tous » + types qui ont au moins une fiche publique. */
export function observatoirePublicFilterControls(
  entries: ObservatoireEntry[] = observatoirePublicEntries(),
): ObservatoireFilterControl[] {
  const present = new Set(entries.map((entry) => entry.factual_type));
  return [
    { id: 'obs-type-all', value: 'all', label: 'Tous' },
    ...FACTUAL_TYPES.filter((type) => present.has(type)).map((type) => ({
      id: factualTypeFilterId(type),
      value: type,
      label: type,
    })),
  ];
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
  official_sources?: OfficialSourceRef[];
  motif_officiel: string;
  motif_officieux?: string;
  verification: string;
  status?: string;
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
  official_sources?: OfficialSourceRef[];
  motif_officiel: string;
  motif_officieux?: string;
  verification: string;
  status?: string;
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
    official_sources: m.official_sources,
    motif_officiel: m.motif_officiel,
    motif_officieux: m.motif_officieux,
    verification: m.verification,
    status: m.status,
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
    official_sources: inf.official_sources,
    motif_officiel: inf.motif_officiel,
    motif_officieux: inf.motif_officieux,
    verification: inf.verification,
    status: inf.status,
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
