/**
 * Mix couleurs renifleur — étape 2.
 *
 * DOE : les sondages calibrent une **cible de couverture presse** par bloc
 * idéologique. Ce n’est ni une prédiction, ni un classement, ni une consigne
 * d’adhésion. Les titres « sondage / baromètre / intentions de vote » restent
 * exclus du fil (`exclude_patterns`). Les badges `politicalHue` sont de la
 * transparence d’acteurs cités, pas un label partisan du média.
 */
import sondagesCandidats from '../data/elections/2027-sondages-candidats.json';
import { capItemsByHostShare, hostFromUrl, type RenifleurItem } from './renifleur';

/** Blocs du fichier sondages 2027 (clé `candidates[].bloc`). */
export const MIX_BLOCS = [
  'rn',
  'centre-droit',
  'gauche',
  'centre',
  'gauche-sociale-democrate',
  'droite',
  'ecologie',
  'extreme-droite',
  'droite-souverainiste',
  'extreme-gauche',
] as const;

export type MixBloc = (typeof MIX_BLOCS)[number];

/**
 * Mapping v1 — bloc sondage → slugs `politicalHue`.
 *
 * Un article compte pour le bloc si `item.politicalHue.slug` est dans la liste.
 * Teintes absentes (Dupont-Aignan, LO/NPA) : pas de slug dédié dans la palette
 * 1er tour — la cible existe mais n’est comblée que par dégradation.
 * `pluraliste` n’est **pas** un bloc sondage (filet lexical, cible 0 %).
 */
export const BLOC_TO_HUE_SLUGS: Record<MixBloc, readonly string[]> = {
  rn: ['le-pen', 'bardella'],
  'centre-droit': ['philippe'],
  gauche: ['melenchon', 'ruffin', 'roussel', 'parti-socialiste'],
  centre: ['attal', 'barrot'],
  'gauche-sociale-democrate': ['glucksmann'],
  droite: ['retailleau', 'lisnard'],
  ecologie: ['ecolo'],
  'extreme-droite': ['zemmour'],
  'droite-souverainiste': [],
  'extreme-gauche': [],
};

export const HUE_SLUG_TO_BLOC: Readonly<Record<string, MixBloc>> = Object.freeze(
  Object.fromEntries(
    MIX_BLOCS.flatMap((bloc) => BLOC_TO_HUE_SLUGS[bloc].map((slug) => [slug, bloc] as const)),
  ) as Record<string, MixBloc>,
);

export const MIX_SOURCE_FILE = 'src/data/elections/2027-sondages-candidats.json';

export type MixKey = MixBloc | 'pluraliste';

export interface PollMixCandidate {
  slug: string;
  name?: string;
  bloc?: string;
  latest_pct?: number | null;
  avg_pct?: number | null;
}

export interface MixTarget {
  bloc: string;
  hue_slugs: readonly string[];
  winner_slug: string;
  winner_name?: string;
  /** Meilleur score brut (latest_pct sinon avg_pct), avant renormalisation. */
  raw_pct: number;
  /** Part renormalisée à 100 %. */
  target_pct: number;
}

export interface MixSliceStats {
  item_count: number;
  l1_deviation: number;
  observed: Array<{
    bloc: string;
    hue_slugs: readonly string[];
    target_pct: number;
    observed_pct: number;
    count: number;
    delta_pct: number;
  }>;
  unmapped_hues: Record<string, number>;
  top_hosts: Array<{ host: string; count: number; share_pct: number }>;
}

export interface RenifleurMixReport {
  generated_at: string;
  doe: string;
  method: 'v1-best-per-bloc-renormalized';
  source: string;
  poll_updated?: string;
  mapping: Record<string, readonly string[]>;
  targets: MixTarget[];
  max_total_items: number;
  max_share_per_host: number;
  /** Sélection plafond-hôte seul (étape 1), avant rééquilibrage teinte. */
  before: MixSliceStats;
  /** Sélection après rééquilibrage |obs% − cible%|. */
  after: MixSliceStats;
}

export const MIX_DOE =
  'Les sondages calibrent une cible de couverture presse par bloc idéologique — pas une prédiction, pas un classement, pas une consigne d’adhésion.';

export function isMixBloc(value: string): value is MixBloc {
  return (MIX_BLOCS as readonly string[]).includes(value);
}

function assertMixBloc(bloc: MixBloc): MixBloc {
  switch (bloc) {
    case 'rn':
    case 'centre-droit':
    case 'gauche':
    case 'centre':
    case 'gauche-sociale-democrate':
    case 'droite':
    case 'ecologie':
    case 'extreme-droite':
    case 'droite-souverainiste':
    case 'extreme-gauche':
      return bloc;
    default: {
      const _exhaustive: never = bloc;
      return _exhaustive;
    }
  }
}

export function hueSlugsForBloc(bloc: string): readonly string[] {
  if (!isMixBloc(bloc)) return [];
  return BLOC_TO_HUE_SLUGS[assertMixBloc(bloc)];
}

/** Clé de mix d’un article : bloc sondage ou filet `pluraliste`. */
export function mixKeyForHueSlug(slug: string | undefined): MixKey {
  if (!slug) return 'pluraliste';
  return HUE_SLUG_TO_BLOC[slug] ?? 'pluraliste';
}

export function mixKeyForItem(item: RenifleurItem): MixKey {
  return mixKeyForHueSlug(item.politicalHue?.slug);
}

export function candidateMixScore(candidate: PollMixCandidate): number | null {
  const pct = candidate.latest_pct ?? candidate.avg_pct;
  if (pct == null || Number.isNaN(pct) || pct <= 0) return null;
  return pct;
}

/**
 * Cible v1 : 1 meilleur score par `bloc` (`latest_pct` sinon `avg_pct`),
 * puis renormalisation à 100 %.
 */
export function computeBlocMixTargets(candidates: PollMixCandidate[]): MixTarget[] {
  const best = new Map<
    string,
    { slug: string; name?: string; pct: number }
  >();

  for (const candidate of candidates) {
    const bloc = candidate.bloc?.trim();
    if (!bloc) continue;
    const pct = candidateMixScore(candidate);
    if (pct == null) continue;
    const prev = best.get(bloc);
    if (!prev || pct > prev.pct) {
      best.set(bloc, { slug: candidate.slug, name: candidate.name, pct });
    }
  }

  const rows = [...best.entries()].map(([bloc, winner]) => ({
    bloc,
    hue_slugs: hueSlugsForBloc(bloc),
    winner_slug: winner.slug,
    winner_name: winner.name,
    raw_pct: winner.pct,
    target_pct: 0,
  }));

  const sum = rows.reduce((acc, row) => acc + row.raw_pct, 0);
  if (sum <= 0) return rows;

  for (const row of rows) {
    row.target_pct = Math.round((row.raw_pct / sum) * 1000) / 10;
  }

  const drift =
    Math.round((100 - rows.reduce((acc, row) => acc + row.target_pct, 0)) * 10) / 10;
  if (Math.abs(drift) >= 0.05) {
    const main = rows.slice().sort((a, b) => b.target_pct - a.target_pct)[0];
    if (main) main.target_pct = Math.round((main.target_pct + drift) * 10) / 10;
  }

  return rows.sort((a, b) => b.target_pct - a.target_pct);
}

export function defaultMixTargets(): MixTarget[] {
  const candidates = (sondagesCandidats as { candidates?: PollMixCandidate[] }).candidates ?? [];
  return computeBlocMixTargets(candidates);
}

export function defaultPollUpdated(): string | undefined {
  return (sondagesCandidats as { updated?: string }).updated;
}

export function l1Deviation(
  items: RenifleurItem[],
  targetByBloc: Record<string, number>,
): number {
  const observed = observedPctByBloc(items);
  let sum = 0;
  for (const bloc of Object.keys(targetByBloc)) {
    sum += Math.abs((observed[bloc] ?? 0) - (targetByBloc[bloc] ?? 0));
  }
  return Math.round(sum * 10) / 10;
}

export function observedPctByBloc(items: RenifleurItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = mixKeyForItem(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }
  const n = items.length;
  const pcts: Record<string, number> = {};
  if (n === 0) return pcts;
  for (const [key, count] of Object.entries(counts)) {
    pcts[key] = (count / n) * 100;
  }
  return pcts;
}

function hostOf(item: RenifleurItem): string {
  return hostFromUrl(item.url) || item.source_id || 'unknown';
}

function topHosts(items: RenifleurItem[], limit = 8): MixSliceStats['top_hosts'] {
  const counts = new Map<string, number>();
  for (const item of items) {
    const host = hostOf(item);
    counts.set(host, (counts.get(host) ?? 0) + 1);
  }
  const n = items.length || 1;
  return [...counts.entries()]
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, limit)
    .map(([host, count]) => ({
      host,
      count,
      share_pct: Math.round((count / n) * 1000) / 10,
    }));
}

function unmappedHueCounts(items: RenifleurItem[]): Record<string, number> {
  const counts: Record<string, number> = {};
  for (const item of items) {
    const slug = item.politicalHue?.slug ?? 'pluraliste';
    if (HUE_SLUG_TO_BLOC[slug]) continue;
    counts[slug] = (counts[slug] ?? 0) + 1;
  }
  return counts;
}

export function sliceStats(items: RenifleurItem[], targets: MixTarget[]): MixSliceStats {
  const targetByBloc = Object.fromEntries(targets.map((t) => [t.bloc, t.target_pct]));
  const observed = observedPctByBloc(items);
  const counts: Record<string, number> = {};
  for (const item of items) {
    const key = mixKeyForItem(item);
    counts[key] = (counts[key] ?? 0) + 1;
  }

  return {
    item_count: items.length,
    l1_deviation: l1Deviation(items, targetByBloc),
    observed: targets.map((t) => {
      const count = counts[t.bloc] ?? 0;
      const observedPct = Math.round((observed[t.bloc] ?? 0) * 10) / 10;
      return {
        bloc: t.bloc,
        hue_slugs: t.hue_slugs,
        target_pct: t.target_pct,
        observed_pct: observedPct,
        count,
        delta_pct: Math.round((observedPct - t.target_pct) * 10) / 10,
      };
    }),
    unmapped_hues: unmappedHueCounts(items),
    top_hosts: topHosts(items),
  };
}

/**
 * Sélection greedy : à chaque cran, l’item éligible (plafond hôte) qui minimise
 * Σ |obs% − cible%| sur les blocs sondage. En cas d’égalité, le plus récent
 * (index le plus petit — le pool est déjà trié du plus récent au plus ancien).
 *
 * Dégradation : si la contrainte teinte+hôte vide le fil, retomber sur le
 * plafond hôte seul, puis sur un simple slice par date.
 */
export function rebalanceItemsByPoliticalHue(
  pool: RenifleurItem[],
  options: {
    maxTotal: number;
    maxSharePerHost: number;
    targets: MixTarget[];
  },
): RenifleurItem[] {
  const { maxTotal, maxSharePerHost, targets } = options;
  if (maxTotal <= 0 || pool.length === 0) return [];

  const applyShare = maxSharePerHost > 0 && maxSharePerHost < 1;
  const maxPerHost = applyShare ? Math.max(1, Math.floor(maxTotal * maxSharePerHost)) : maxTotal;
  const targetByBloc = Object.fromEntries(targets.map((t) => [t.bloc, t.target_pct]));

  const remaining = [...pool];
  const selected: RenifleurItem[] = [];
  const hostCounts = new Map<string, number>();

  while (selected.length < maxTotal && remaining.length > 0) {
    let bestIdx = -1;
    let bestL1 = Number.POSITIVE_INFINITY;

    for (let i = 0; i < remaining.length; i++) {
      const item = remaining[i]!;
      const host = hostOf(item);
      if ((hostCounts.get(host) ?? 0) >= maxPerHost) continue;
      const nextL1 = l1Deviation([...selected, item], targetByBloc);
      if (nextL1 < bestL1 - 1e-9) {
        bestL1 = nextL1;
        bestIdx = i;
      }
    }

    if (bestIdx < 0) break;
    const picked = remaining.splice(bestIdx, 1)[0]!;
    selected.push(picked);
    const host = hostOf(picked);
    hostCounts.set(host, (hostCounts.get(host) ?? 0) + 1);
  }

  if (selected.length === 0) {
    const hostOnly = capItemsByHostShare(pool, maxSharePerHost, maxTotal);
    if (hostOnly.length > 0) return hostOnly;
    return [...pool]
      .sort((a, b) => b.published.localeCompare(a.published))
      .slice(0, maxTotal);
  }

  selected.sort((a, b) => b.published.localeCompare(a.published));
  return selected;
}

export function selectItemsWithMixReport(
  collected: RenifleurItem[],
  options: {
    maxTotal: number;
    maxSharePerHost: number;
    targets?: MixTarget[];
    generatedAt?: string;
  },
): { items: RenifleurItem[]; report: RenifleurMixReport } {
  const targets = options.targets ?? defaultMixTargets();
  const baseline = capItemsByHostShare(collected, options.maxSharePerHost, options.maxTotal);
  const items = rebalanceItemsByPoliticalHue(collected, {
    maxTotal: options.maxTotal,
    maxSharePerHost: options.maxSharePerHost,
    targets,
  });

  const report: RenifleurMixReport = {
    generated_at: options.generatedAt ?? new Date().toISOString(),
    doe: MIX_DOE,
    method: 'v1-best-per-bloc-renormalized',
    source: MIX_SOURCE_FILE,
    poll_updated: defaultPollUpdated(),
    mapping: Object.fromEntries(MIX_BLOCS.map((bloc) => [bloc, BLOC_TO_HUE_SLUGS[bloc]])),
    targets,
    max_total_items: options.maxTotal,
    max_share_per_host: options.maxSharePerHost,
    before: sliceStats(baseline, targets),
    after: sliceStats(items, targets),
  };

  return { items, report };
}
