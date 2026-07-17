/**
 * Agrège intentions de vote présidentielles (sondages pédagogiques)
 * en parts de voix par blocs AN1T pour le simulateur Sainte-Laguë.
 *
 * DOE : illustration uniquement — pas de prédiction ni de tier list.
 */
import { simulateFromVoteShares, type SeatAllocation } from './an1t';
import type { HypotheticalShare } from './an1t';

export interface PollCandidateMeta {
  slug: string;
  name?: string;
  bloc?: string;
  latest_pct?: number | null;
  avg_pct?: number | null;
}

export interface PollWave {
  firm?: string;
  fieldwork?: string;
  hypothesis?: string;
  scores: Record<string, number>;
}

export interface PollSondagesFile {
  updated?: string;
  disclaimer?: string;
  waves_latest?: PollWave[];
  candidates?: PollCandidateMeta[];
  sources?: Array<{ label: string; url: string; as_of?: string }>;
}

/** Couleurs hémicycle LMDPT (alignées page assemblee-premier-tour). */
export const AN1T_BLOC_UI: Record<
  string,
  { id: string; label: string; color: string }
> = {
  rn: { id: 'rn', label: 'Rassemblement national & alliés', color: '#0d378a' },
  nfp: { id: 'nfp', label: 'Nouveau Front populaire', color: '#cc2443' },
  ensemble: { id: 'ensemble', label: 'Ensemble / centre', color: '#ffeb00' },
  lr: { id: 'lr', label: 'Droite républicaine', color: '#0066cc' },
  autres: { id: 'autres', label: 'Autres & divers', color: '#dddddd' },
};

/**
 * Map slug candidat → bloc AN1T législatif (agrégat pédagogique).
 * RN / Reconquête / extrême droite → rn ; gauches → nfp ; centre → ensemble ; LR → lr.
 */
const SLUG_TO_BLOC: Record<string, keyof typeof AN1T_BLOC_UI> = {
  'le-pen': 'rn',
  bardella: 'rn',
  zemmour: 'rn',
  'dupont-aignan': 'rn',
  philippot: 'rn',
  melenchon: 'nfp',
  glucksmann: 'nfp',
  tondelier: 'nfp',
  roussel: 'nfp',
  hollande: 'nfp',
  ruffin: 'nfp',
  batho: 'nfp',
  guedj: 'nfp',
  bouamrane: 'nfp',
  philippe: 'ensemble',
  attal: 'ensemble',
  villepin: 'ensemble',
  darmanin: 'ensemble',
  lecornu: 'ensemble',
  retailleau: 'lr',
  wauquiez: 'lr',
  arthaud: 'autres',
  lisnard: 'autres',
  bertrand: 'autres',
};

export function slugToAn1tBloc(slug: string): keyof typeof AN1T_BLOC_UI {
  return SLUG_TO_BLOC[slug] ?? 'autres';
}

export function metaBlocToAn1t(bloc: string | undefined): keyof typeof AN1T_BLOC_UI {
  if (!bloc) return 'autres';
  const b = bloc.toLowerCase();
  if (b === 'rn' || b.includes('national') || b.includes('reconqu')) return 'rn';
  if (b === 'gauche' || b.includes('nfp') || b.includes('sociale') || b.includes('ecolo')) return 'nfp';
  if (b.includes('centre') || b === 'ensemble' || b.includes('horizons')) return 'ensemble';
  if (b === 'droite' || b === 'lr' || b.includes('républicain') || b.includes('republicain')) return 'lr';
  return 'autres';
}

/** Agrège un dictionnaire slug→% en parts de blocs (normalisées à 100). */
export function aggregateScoresToBlocShares(
  scores: Record<string, number>,
  options: { candidateMeta?: PollCandidateMeta[] } = {},
): HypotheticalShare[] {
  const metaBySlug = new Map((options.candidateMeta ?? []).map((c) => [c.slug, c]));
  const totals: Record<string, number> = {
    rn: 0,
    nfp: 0,
    ensemble: 0,
    lr: 0,
    autres: 0,
  };

  for (const [slug, pct] of Object.entries(scores)) {
    if (pct == null || Number.isNaN(pct) || pct <= 0) continue;
    const meta = metaBySlug.get(slug);
    const bloc = meta?.bloc ? metaBlocToAn1t(meta.bloc) : slugToAn1tBloc(slug);
    // Exclusion mutuelle RN : ne pas additionner le-pen + bardella (hyp. exclusives)
    if (slug === 'bardella' && scores['le-pen'] != null && scores['le-pen'] > 0) continue;
    if (slug === 'le-pen' && scores.bardella != null && scores['le-pen'] == null) {
      /* keep bardella only when le-pen absent */
    }
    totals[bloc] = (totals[bloc] ?? 0) + pct;
  }

  const raw = Object.entries(AN1T_BLOC_UI).map(([id, ui]) => ({
    id: ui.id,
    label: ui.label,
    color: ui.color,
    pct: totals[id] ?? 0,
  }));

  const sum = raw.reduce((s, r) => s + r.pct, 0);
  if (sum <= 0) {
    return raw.map((r) => ({ ...r, pct: idDefaultPct(r.id) }));
  }

  // Normalise à ~100 pour Sainte-Laguë stable (arrondi 0.1)
  return raw.map((r) => ({
    ...r,
    pct: Math.round((r.pct / sum) * 1000) / 10,
  }));
}

function idDefaultPct(id: string): number {
  const d: Record<string, number> = { rn: 35, nfp: 26, ensemble: 16, lr: 8, autres: 15 };
  return d[id] ?? 0;
}

/**
 * Scénario « moyenne juil. 2026 » : 1ʳᵉ vague scorée des waves_latest,
 * sinon moyenne des latest_pct candidats (hors substitution exclusive).
 */
export function pickPrimaryWaveScores(data: PollSondagesFile): {
  scores: Record<string, number>;
  label: string;
} {
  const waves = data.waves_latest ?? [];
  for (const w of waves) {
    if (w.scores && Object.keys(w.scores).length >= 4) {
      return {
        scores: w.scores,
        label: [w.firm, w.fieldwork, w.hypothesis].filter(Boolean).join(' · '),
      };
    }
  }

  const scores: Record<string, number> = {};
  for (const c of data.candidates ?? []) {
    const pct = c.latest_pct ?? c.avg_pct;
    if (pct != null && pct > 0) scores[c.slug] = pct;
  }
  return { scores, label: 'moyenne latest_pct candidats' };
}

/** Scénario gauche unie : nfp = somme gauches ; divisée : split LFI vs reste. */
export function buildUnitedLeftShares(base: HypotheticalShare[]): HypotheticalShare[] {
  return base.map((s) => {
    if (s.id === 'nfp') return { ...s, label: 'Gauche unie (NFP-like)' };
    return s;
  });
}

export function buildSplitLeftShares(
  scores: Record<string, number>,
  candidateMeta?: PollCandidateMeta[],
): HypotheticalShare[] {
  const base = aggregateScoresToBlocShares(scores, { candidateMeta });
  const lfi = scores.melenchon ?? scores['mélenchon'] ?? 0;
  const nfpBloc = base.find((b) => b.id === 'nfp');
  const nfpTotal = nfpBloc?.pct ?? 0;
  const restGauche = Math.max(0, Math.round((nfpTotal - lfi) * 10) / 10);
  const lfiPct = Math.min(nfpTotal, Math.round(lfi * 10) / 10);

  const out: HypotheticalShare[] = base
    .filter((b) => b.id !== 'nfp')
    .concat([
      {
        id: 'nfp-union',
        label: 'Union PS/EELV/PCF',
        color: '#cc2443',
        pct: restGauche > 0 ? restGauche : Math.round(nfpTotal * 0.55 * 10) / 10,
      },
      {
        id: 'lfi',
        label: 'LFI & alliés',
        color: '#9b1b30',
        pct: lfiPct > 0 ? lfiPct : Math.round(nfpTotal * 0.45 * 10) / 10,
      },
    ]);

  const sum = out.reduce((s, x) => s + x.pct, 0) || 100;
  return out.map((x) => ({ ...x, pct: Math.round((x.pct / sum) * 1000) / 10 }));
}

export interface PollAn1tBundle {
  updated: string;
  waveLabel: string;
  disclaimer: string;
  sources: Array<{ label: string; url: string }>;
  baseShares: HypotheticalShare[];
  unieShares: HypotheticalShare[];
  diviseeShares: HypotheticalShare[];
  baseAlloc: SeatAllocation[];
  unieAlloc: SeatAllocation[];
  diviseeAlloc: SeatAllocation[];
}

export function buildPollAn1tBundle(
  data: PollSondagesFile,
  totalSeats = 577,
  thresholdPct = 3,
): PollAn1tBundle {
  const { scores, label } = pickPrimaryWaveScores(data);
  const baseShares = aggregateScoresToBlocShares(scores, {
    candidateMeta: data.candidates,
  });
  const unieShares = buildUnitedLeftShares(baseShares);
  const diviseeShares = buildSplitLeftShares(scores, data.candidates);

  return {
    updated: data.updated ?? new Date().toISOString().slice(0, 10),
    waveLabel: label,
    disclaimer:
      data.disclaimer ??
      'Agrégats pédagogiques d’intentions de vote. Ce ne sont ni des résultats officiels ni des prédictions.',
    sources: (data.sources ?? []).map((s) => ({ label: s.label, url: s.url })),
    baseShares,
    unieShares,
    diviseeShares,
    baseAlloc: simulateFromVoteShares(baseShares, totalSeats, thresholdPct),
    unieAlloc: simulateFromVoteShares(unieShares, totalSeats, thresholdPct),
    diviseeAlloc: simulateFromVoteShares(diviseeShares, totalSeats, thresholdPct),
  };
}

/** Format UI hémicycle : seats + pct voix + pollPct. */
export function allocToHemiRows(
  alloc: SeatAllocation[],
): Array<{ id: string; label: string; color: string; seats: number; pct: number; pollPct: number }> {
  return alloc.map((a) => ({
    id: a.id,
    label: a.label,
    color: a.color,
    seats: a.seats,
    pct: Math.round(a.pctExprimes * 10) / 10,
    pollPct: Math.round(a.pctExprimes * 10) / 10,
  }));
}
