/**
 * Fil directeur LMDPT — pour **tout scrutin** :
 *
 * Présidentielle :
 *   Gauche = Assemblée 100 % 1er tour présidentiel (Sainte-Laguë, blocs AN1T, proximité programmes)
 *   Droite = Assemblée réelle des **législatives qui ont suivi**
 *
 * Législatives :
 *   Gauche = Sainte-Laguë sur nuances T1
 *   Droite = composition post-T2
 */
import type { ElectionDataset } from './election-types';
import { simulateAn1tSeats, simulateFromVoteShares, type SeatAllocation } from './an1t';
import { candidateSlug } from './candidate-style';
import { getElection, ELECTION_CATALOG } from './elections';
import {
  BLOC_SPECTRUM_AXIS,
  colorFromSpectrumAxis,
  programProximityColor,
  realAssemblyColor,
  spectrumSortKey,
} from './program-proximity';
import leg2024Real from '../data/analyses/assemblee-premier-tour-2024.json';
import chain from '../data/analyses/presidentielle-legislatives-chain.json';

export interface DualSeatRow {
  id: string;
  label: string;
  seats: number;
  color?: string;
  pctExprimes?: number;
  pctSeats?: number;
}

export interface SeatDifferential {
  id: string;
  label: string;
  firstRoundSeats: number;
  realSeats: number;
  delta: number;
  color: string;
}

export interface ScrutinDualPair {
  slug: string;
  kind: 'presidentielle' | 'legislatives' | 'projection';
  title: string;
  t1Label: string;
  realLabel: string;
  firstRoundTitle: string;
  realTitle: string;
  firstRoundMeta: string;
  realMeta: string;
  firstRound: DualSeatRow[];
  real: DualSeatRow[];
  realPending: boolean;
  totalSeats: number;
  thresholdPct: number;
  distorsionNote?: string;
  /** Différentiel sièges T1→réel (blocs comparables) */
  differential?: SeatDifferential[];
}

const TOTAL = 577;

const BLOC_LABELS: Record<string, string> = {
  nfp: 'Gauche / NFP (ou équivalent)',
  ensemble: 'Centre / majorité présidentielle',
  lr: 'Droite républicaine (LR)',
  rn: 'Extrême droite / RN (ou FN)',
  autres: 'Autres & divers',
};

/** Candidat présidentiel → bloc AN1T comparable aux législatives. */
const CANDIDATE_TO_BLOC: Record<string, string> = {
  macron: 'ensemble',
  attal: 'ensemble',
  philippe: 'ensemble',
  hamon: 'nfp',
  melenchon: 'nfp',
  roussel: 'nfp',
  hidalgo: 'nfp',
  jadot: 'nfp',
  glucksmann: 'nfp',
  tondelier: 'nfp',
  ruffin: 'nfp',
  batho: 'nfp',
  poutou: 'nfp',
  arthaud: 'nfp',
  fillon: 'lr',
  pecresse: 'lr',
  retailleau: 'lr',
  'le-pen': 'rn',
  bardella: 'rn',
  zemmour: 'rn',
  'dupont-aignan': 'rn',
  lassalle: 'autres',
  asselineau: 'autres',
  villepin: 'autres',
  cheminade: 'autres',
};

export function candidateProgramColor(slug: string): string {
  if (BLOC_SPECTRUM_AXIS[slug] != null) return colorFromSpectrumAxis(BLOC_SPECTRUM_AXIS[slug]);
  return programProximityColor(slug);
}

export function candidateToBloc(slug: string): string {
  return CANDIDATE_TO_BLOC[slug] ?? 'autres';
}

/**
 * Assemblée 100 % 1er tour présidentiel :
 * voix des candidats agrégées en blocs AN1T, puis Sainte-Laguë (seuil bas pour garder la pluralité).
 */
export function firstRoundPresidentielleAsBlocs(
  dataset: ElectionDataset,
  totalSeats = TOTAL,
  thresholdPct = 1,
): DualSeatRow[] {
  const voiceByBloc: Record<string, number> = {
    nfp: 0,
    ensemble: 0,
    lr: 0,
    rn: 0,
    autres: 0,
  };

  for (const c of dataset.national.candidats) {
    const parts = c.nom.trim().split(/\s+/);
    const prenom = parts.length > 1 ? parts[0] : '';
    const nom = parts.length > 1 ? parts.slice(1).join(' ') : c.nom;
    const slug = candidateSlug(nom, prenom);
    const bloc = candidateToBloc(slug);
    voiceByBloc[bloc] = (voiceByBloc[bloc] ?? 0) + c.pourcentage_exprimes;
  }

  const shares = Object.entries(voiceByBloc)
    .filter(([, pct]) => pct > 0)
    .map(([id, pct]) => ({
      id,
      label: BLOC_LABELS[id] ?? id,
      color: programProximityColor(id),
      pct,
    }));

  const alloc = simulateFromVoteShares(shares, totalSeats, thresholdPct);
  return alloc.map((a) => ({
    id: a.id,
    label: a.label,
    seats: a.seats,
    color: programProximityColor(a.id, a.color),
    pctExprimes: a.pctExprimes,
    pctSeats: a.pctSeats,
  }));
}

/** Détail candidats (optionnel / tests) — Sainte-Laguë candidature par candidature. */
export function firstRoundFromPresidentielle(
  dataset: ElectionDataset,
  totalSeats = TOTAL,
  thresholdPct = 0.5,
): DualSeatRow[] {
  const shares = dataset.national.candidats.map((c) => {
    const parts = c.nom.trim().split(/\s+/);
    const prenom = parts.length > 1 ? parts[0] : '';
    const nom = parts.length > 1 ? parts.slice(1).join(' ') : c.nom;
    const slug = candidateSlug(nom, prenom);
    return {
      id: slug,
      label: c.nom,
      color: candidateProgramColor(slug),
      pct: c.pourcentage_exprimes,
    };
  });
  const alloc = simulateFromVoteShares(shares, totalSeats, thresholdPct);
  return alloc.map((a) => ({
    id: a.id,
    label: a.label,
    seats: a.seats,
    color: candidateProgramColor(a.id),
    pctExprimes: a.pctExprimes,
    pctSeats: a.pctSeats,
  }));
}

export function firstRoundFromLegislatives(
  dataset: ElectionDataset,
  totalSeats = TOTAL,
  thresholdPct = 3,
): DualSeatRow[] {
  const alloc = simulateAn1tSeats(dataset, totalSeats, thresholdPct);
  return alloc.map((a) => ({
    id: a.id,
    label: a.label,
    seats: a.seats,
    color: programProximityColor(a.id, a.color),
    pctExprimes: a.pctExprimes,
    pctSeats: a.pctSeats,
  }));
}

export function realFromLegislatives2024(): DualSeatRow[] {
  return leg2024Real.an_reelle.blocs.map((b) => ({
    id: b.id,
    label: b.label,
    seats: b.seats,
    color: realAssemblyColor(b.id, b.color),
  }));
}

/** Assemblée réelle des législatives suivant une présidentielle. */
export function realFromFollowingLegislatives(presSlug: string): {
  rows: DualSeatRow[];
  pending: boolean;
  label: string;
  source: string | null;
} {
  const entry = (chain.chains as Record<string, {
    legislatives_label: string;
    legislatives_source: string | null;
    legislatives_seats: Array<{ id: string; label: string; seats: number; detail?: string }>;
    pending?: boolean;
  }>)[presSlug];

  if (!entry || entry.pending || !entry.legislatives_seats?.length) {
    return {
      rows: [],
      pending: true,
      label: entry?.legislatives_label ?? 'Législatives à venir',
      source: entry?.legislatives_source ?? null,
    };
  }

  const rows = entry.legislatives_seats.map((s) => ({
    id: s.id,
    label: s.label,
    seats: s.seats,
    color: realAssemblyColor(s.id),
  }));

  const sum = rows.reduce((a, r) => a + r.seats, 0);
  if (sum !== TOTAL && rows.length) {
    // normaliser au besoin
    const autres = rows.find((r) => r.id === 'autres');
    if (autres) autres.seats += TOTAL - sum;
  }

  return {
    rows,
    pending: false,
    label: entry.legislatives_label,
    source: entry.legislatives_source,
  };
}

export function computeDifferential(
  first: DualSeatRow[],
  real: DualSeatRow[],
): SeatDifferential[] {
  const ids = new Set([...first.map((f) => f.id), ...real.map((r) => r.id)]);
  const out: SeatDifferential[] = [];
  for (const id of ids) {
    if (id === 'vacant') continue;
    const f = first.find((x) => x.id === id);
    const r = real.find((x) => x.id === id);
    const firstSeats = f?.seats ?? 0;
    const realSeats = r?.seats ?? 0;
    out.push({
      id,
      label: f?.label ?? r?.label ?? BLOC_LABELS[id] ?? id,
      firstRoundSeats: firstSeats,
      realSeats,
      delta: realSeats - firstSeats,
      color: programProximityColor(id, f?.color ?? r?.color),
    });
  }
  return out.sort((a, b) => spectrumSortKey(a.id) - spectrumSortKey(b.id));
}

export function buildScrutinDual(slug: string): ScrutinDualPair | null {
  const summary = ELECTION_CATALOG.find((e) => e.slug === slug);
  const dataset = getElection(slug);
  if (!summary || !dataset) return null;

  if (slug === '2024-legislatives') {
    const first = firstRoundFromLegislatives(dataset);
    const real = realFromLegislatives2024();
    return {
      slug,
      kind: 'legislatives',
      title: summary.title,
      t1Label: '1er tour 30 juin 2024',
      realLabel: 'Assemblée réelle (juil. 2024)',
      firstRoundTitle: 'Assemblée 100 % 1er tour législatif',
      realTitle: 'Assemblée réelle post-législatives',
      firstRoundMeta:
        'Sainte-Laguë nationale sur les nuances T1 (seuil 3 %). Couleurs = proximité de programmes.',
      realMeta: leg2024Real.an_reelle.source_note,
      firstRound: first,
      real,
      realPending: false,
      totalSeats: TOTAL,
      thresholdPct: 3,
      distorsionNote: summary.distorsion_note,
      differential: computeDifferential(first, real),
    };
  }

  // Présidentielles : T1 présidentiel → vs législatives qui suivent
  if (
    slug === '2017-presidentielle' ||
    slug === '2022-presidentielle' ||
    slug === '2027-presidentielle'
  ) {
    const first = firstRoundPresidentielleAsBlocs(dataset);
    const following = realFromFollowingLegislatives(slug);
    const isProjection = slug === '2027-presidentielle';

    return {
      slug,
      kind: isProjection ? 'projection' : 'presidentielle',
      title: summary.title,
      t1Label: `1er tour présidentiel ${new Date(dataset.date).toLocaleDateString('fr-FR', { dateStyle: 'long' })}${isProjection ? ' (projection)' : ''}`,
      realLabel: following.label,
      firstRoundTitle: 'Assemblée du 1er tour présidentiel',
      realTitle: following.pending
        ? 'Législatives suivantes — en attente'
        : 'Assemblée réelle (législatives suivantes)',
      firstRoundMeta:
        'Voix du 1er tour présidentiel regroupées en blocs (proximité de programmes), puis Sainte-Laguë sur 577 sièges. Ce n’est pas le résultat du second tour présidentiel — c’est la photo proportionnelle de la pluralité T1.',
      realMeta: following.pending
        ? 'Les législatives suivent toujours la présidentielle. Résultats à publier après le scrutin — fil directeur DOE : documenter d’abord le 1er tour.'
        : `Sièges réels après les législatives qui ont suivi cette présidentielle. ${following.source ?? ''}`.trim(),
      firstRound: first,
      real: following.rows,
      realPending: following.pending,
      totalSeats: TOTAL,
      thresholdPct: 1,
      distorsionNote: summary.distorsion_note,
      differential:
        following.pending || !following.rows.length
          ? undefined
          : computeDifferential(first, following.rows),
    };
  }

  return null;
}

export function listScrutinDuals(): ScrutinDualPair[] {
  return ELECTION_CATALOG.map((e) => buildScrutinDual(e.slug)).filter(
    (x): x is ScrutinDualPair => x != null,
  );
}

export function dualToAlloc(rows: DualSeatRow[]): SeatAllocation[] {
  return rows.map((r) => ({
    id: r.id,
    label: r.label,
    color: r.color ?? '#888',
    votes: 0,
    pctExprimes: r.pctExprimes ?? 0,
    seats: r.seats,
    pctSeats: r.pctSeats ?? 0,
  }));
}

export function spectrumOrderIds(rows: DualSeatRow[]): string[] {
  return [...rows].sort((a, b) => spectrumSortKey(a.id) - spectrumSortKey(b.id)).map((r) => r.id);
}
