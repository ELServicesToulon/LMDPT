/**
 * Contrats d'export AN1T (CSV / JSON) — pure functions testables.
 * Miroir pédagogique du simulateur client (An1tSimulator.astro).
 * Formats ouverts, usage documentaire uniquement (pas de prédiction).
 */
import type { HypotheticalShare, SeatAllocation } from './an1t';
import { simulateFromVoteShares } from './an1t';

export interface An1tExportMeta {
  tool: string;
  method: string;
  pedagogical: true;
  threshold_pct: number;
  total_seats: number;
  exported_at: string;
  url?: string;
}

export interface An1tExportPayload {
  meta: An1tExportMeta;
  inputs: HypotheticalShare[];
  results: SeatAllocation[];
}

export function buildAn1tExportPayload(input: {
  shares: HypotheticalShare[];
  thresholdPct: number;
  totalSeats?: number;
  exportedAt?: string;
  url?: string;
}): An1tExportPayload {
  const totalSeats = input.totalSeats ?? 577;
  const results = simulateFromVoteShares(input.shares, totalSeats, input.thresholdPct);
  return {
    meta: {
      tool: 'LMDPT AN1T simulator',
      method: 'Sainte-Laguë',
      pedagogical: true,
      threshold_pct: input.thresholdPct,
      total_seats: totalSeats,
      exported_at: input.exportedAt ?? new Date().toISOString(),
      ...(input.url ? { url: input.url } : {}),
    },
    inputs: input.shares,
    results,
  };
}

export function buildAn1tExportCsv(
  results: SeatAllocation[],
  thresholdPct: number,
  totalSeats = 577,
  exportedAt = new Date().toISOString(),
): string {
  const header = 'bloc_id,label,pct_voix,sieges,pct_sieges,seuil_pct,total_sieges';
  const lines = results.map(
    (r) =>
      `${r.id},"${r.label.replace(/"/g, '""')}",${r.pctExprimes.toFixed(1)},${r.seats},${r.pctSeats.toFixed(2)},${thresholdPct},${totalSeats}`,
  );
  return [header, ...lines, `# source=LMDPT AN1T pédagogique;date=${exportedAt}`].join('\n');
}

/** Contrats a11y minimaux attendus dans le markup simulateur / hémicycle. */
export const AN1T_A11Y_CONTRACT = {
  simulator: [
    'aria-labelledby="an1t-sim-title"',
    'aria-live="polite"',
    'id="an1t-export-csv"',
    'id="an1t-export-json"',
    'id="an1t-export-png"',
    'id="an1t-share-url"',
    'role="group"',
    'aria-label="Scénarios types"',
    'step="0.1"',
    'tip-sainte-lague',
    'aria-label="Exporter les sièges simulés en CSV',
  ],
  hemicycle: [
    'role="img"',
    'aria-live="polite"',
    'aria-pressed',
    'tabindex="0"',
    'role="group"',
  ],
} as const;

/** Share URL compacte : v1_th_id:pct,id:pct… (P16-1) */
export function encodeAn1tShareQuery(
  shares: Array<{ id: string; pct: number }>,
  thresholdPct: number,
): string {
  const th = Math.max(0, Math.min(15, Math.round(thresholdPct * 10) / 10));
  const body = shares
    .map((s) => `${s.id}:${(Math.round(Math.max(0, s.pct) * 10) / 10).toFixed(1)}`)
    .join(',');
  return `v1_${th}_${body}`;
}

export function decodeAn1tShareQuery(
  raw: string | null | undefined,
): { thresholdPct: number; shares: Array<{ id: string; pct: number }> } | null {
  if (!raw || typeof raw !== 'string') return null;
  const m = raw.trim().match(/^v1_([0-9]+(?:\.[0-9]+)?)_(.+)$/);
  if (!m) return null;
  const thresholdPct = Math.max(0, Math.min(15, parseFloat(m[1]) || 0));
  const shares: Array<{ id: string; pct: number }> = [];
  for (const part of m[2].split(',')) {
    const [id, pctStr] = part.split(':');
    if (!id || pctStr === undefined) continue;
    const pct = Math.max(0, Math.min(100, parseFloat(pctStr) || 0));
    if (/^[a-z0-9_-]+$/i.test(id)) shares.push({ id, pct });
  }
  if (!shares.length) return null;
  return { thresholdPct, shares };
}

export function buildAn1tShareUrl(
  baseUrl: string,
  shares: Array<{ id: string; pct: number }>,
  thresholdPct: number,
): string {
  const u = new URL(baseUrl, 'https://lmdpt.iarbre.org');
  u.searchParams.set('an1t', encodeAn1tShareQuery(shares, thresholdPct));
  return u.toString();
}
