/**
 * Temps de parole — indices d'équité exposition / étalon (LMDPT)
 * indice = part_exposition / part_baseline
 */
export type EquityFlag = "over" | "under" | "in_band" | "no_poll_score" | "below_min_poll" | "n/a";

export type EquityRow = {
  id: string;
  label: string;
  part_expo_pct: number | null;
  part_poll_pct: number | null;
  indice: number | null;
  flag: EquityFlag | string;
};

export type EquityAlert = {
  id: string;
  label: string;
  kind: string;
  indice: number;
  part_expo_pct: number;
  part_poll_pct: number;
};

export type EquitySnapshot = {
  title: string;
  updated: string;
  disclaimer: string;
  formula: string;
  doe: string;
  delta: number;
  wave: {
    id: string;
    period?: { start?: string; end?: string; label?: string };
    media?: { name?: string; kind?: string };
    exposure_type?: string;
    unit?: string;
  };
  baseline: { kind: string; label?: string; note?: string };
  source?: { url?: string; title?: string; verification?: string; notes?: string };
  rows: EquityRow[];
  alerts: EquityAlert[];
  links?: Record<string, string>;
};

export function flagLabel(flag: string): string {
  switch (flag) {
    case "over":
      return "Sur-exposition";
    case "under":
      return "Sous-exposition";
    case "in_band":
      return "Dans la bande";
    case "below_min_poll":
      return "Sous seuil sondage";
    case "no_poll_score":
      return "Sans score étalon";
    default:
      return flag;
  }
}

export function sortRowsByIndiceDesc(rows: EquityRow[]): EquityRow[] {
  return [...rows].sort((a, b) => (b.indice ?? -1) - (a.indice ?? -1));
}

/** Largeur barre CSS 0–100 à partir de l'indice (1 = égalité). Cap à 3×. */
export function indiceBarPercent(indice: number | null, max = 3): number {
  if (indice == null || !Number.isFinite(indice) || indice < 0) return 0;
  return Math.min(100, Math.round((indice / max) * 100));
}

export function countByFlag(rows: EquityRow[]): Record<string, number> {
  const out: Record<string, number> = {};
  for (const r of rows) {
    out[r.flag] = (out[r.flag] ?? 0) + 1;
  }
  return out;
}
