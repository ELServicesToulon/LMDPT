/**
 * Fil directeur LMDPT — pour **tout scrutin** :
 *  Gauche : répartition 100 % 1er tour (Sainte-Laguë, modèle 577 sièges)
 *  Droite : résultat réel qui a suivi (T2 présidentiel, ou Assemblée post-législatives)
 *
 * Couleurs T1 = proximité de programmes / idées (spectre).
 * Couleurs « réel » = lecture institutionnelle (duel T2 ou blocs AN).
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

export interface DualSeatRow {
  id: string;
  label: string;
  seats: number;
  color?: string;
  pctExprimes?: number;
  pctSeats?: number;
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
  /** true if real outcome not yet known (ex. 2027) */
  realPending: boolean;
  totalSeats: number;
  thresholdPct: number;
  distorsionNote?: string;
}

const TOTAL = 577;

export function candidateProgramColor(slug: string): string {
  if (BLOC_SPECTRUM_AXIS[slug] != null) return colorFromSpectrumAxis(BLOC_SPECTRUM_AXIS[slug]);
  return programProximityColor(slug);
}

/** Second tours présidentiels officiels (Conseil constitutionnel). */
const PRES_T2: Record<
  string,
  {
    date: string;
    candidates: Array<{ id: string; label: string; pct: number }>;
  }
> = {
  '2017-presidentielle': {
    date: '2017-05-07',
    candidates: [
      { id: 'macron', label: 'Emmanuel Macron', pct: 66.1 },
      { id: 'le-pen', label: 'Marine Le Pen', pct: 33.9 },
    ],
  },
  '2022-presidentielle': {
    date: '2022-04-24',
    candidates: [
      { id: 'macron', label: 'Emmanuel Macron', pct: 58.55 },
      { id: 'le-pen', label: 'Marine Le Pen', pct: 41.45 },
    ],
  },
};

function seatsFromPct(pct: number, total: number): number {
  return Math.max(0, Math.round((pct / 100) * total));
}

/** Sainte-Laguë sur tous les candidats du 1er tour (présidentielle). */
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

/** Blocs AN1T depuis nuances législatives T1. */
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

/** T2 présidentiel → 2 « blocs » de sièges (métaphore hémicycle binaire). */
export function realFromPresidentielleT2(slug: string, totalSeats = TOTAL): DualSeatRow[] {
  const t2 = PRES_T2[slug];
  if (!t2) return [];
  const rows = t2.candidates.map((c) => ({
    id: c.id,
    label: c.label,
    seats: seatsFromPct(c.pct, totalSeats),
    color: realAssemblyColor(
      c.id === 'le-pen' ? 'rn' : c.id === 'macron' ? 'ensemble' : c.id,
      candidateProgramColor(c.id),
    ),
    pctExprimes: c.pct,
  }));
  const sum = rows.reduce((s, r) => s + r.seats, 0);
  if (sum !== totalSeats && rows.length) {
    rows[0].seats += totalSeats - sum;
  }
  return rows;
}

export function realFromLegislatives2024(): DualSeatRow[] {
  return leg2024Real.an_reelle.blocs.map((b) => ({
    id: b.id,
    label: b.label,
    seats: b.seats,
    color: realAssemblyColor(b.id, b.color),
  }));
}

export function buildScrutinDual(slug: string): ScrutinDualPair | null {
  const summary = ELECTION_CATALOG.find((e) => e.slug === slug);
  const dataset = getElection(slug);
  if (!summary || !dataset) return null;

  if (slug === '2024-legislatives') {
    return {
      slug,
      kind: 'legislatives',
      title: summary.title,
      t1Label: '1er tour 30 juin 2024',
      realLabel: 'Après législatives (juil. 2024)',
      firstRoundTitle: 'Assemblée 100 % 1er tour',
      realTitle: 'Assemblée réelle post-législatives',
      firstRoundMeta:
        'Sainte-Laguë nationale sur les nuances T1 (seuil 3 %). Couleurs = proximité de programmes. Géométrie Wikimedia 577 sièges.',
      realMeta: leg2024Real.an_reelle.source_note,
      firstRound: firstRoundFromLegislatives(dataset),
      real: realFromLegislatives2024(),
      realPending: false,
      totalSeats: TOTAL,
      thresholdPct: 3,
      distorsionNote: summary.distorsion_note,
    };
  }

  if (slug === '2017-presidentielle' || slug === '2022-presidentielle') {
    const t2 = PRES_T2[slug]!;
    return {
      slug,
      kind: 'presidentielle',
      title: summary.title,
      t1Label: `1er tour ${new Date(dataset.date).toLocaleDateString('fr-FR', { dateStyle: 'long' })}`,
      realLabel: `Second tour ${new Date(t2.date).toLocaleDateString('fr-FR', { dateStyle: 'long' })}`,
      firstRoundTitle: 'Pluralité 100 % 1er tour',
      realTitle: 'Duel du second tour (binaire)',
      firstRoundMeta:
        'Sainte-Laguë sur tous les candidats du 1er tour (seuil 0,5 %). Couleurs = proximité de programmes / idées. Métaphore 577 sièges — photo proportionnelle du T1, pas une Assemblée élue.',
      realMeta:
        'Second tour présidentiel : seuls deux candidats restent. Même géométrie pour visualiser la réduction binaire — résultats officiels Conseil constitutionnel.',
      firstRound: firstRoundFromPresidentielle(dataset),
      real: realFromPresidentielleT2(slug),
      realPending: false,
      totalSeats: TOTAL,
      thresholdPct: 0.5,
      distorsionNote: summary.distorsion_note,
    };
  }

  if (slug === '2027-presidentielle') {
    return {
      slug,
      kind: 'projection',
      title: summary.title,
      t1Label: '1er tour 18 avril 2027 (projection)',
      realLabel: 'Second tour 2 mai 2027 — à venir',
      firstRoundTitle: 'Pluralité projetée 1er tour',
      realTitle: 'Résultat réel — en attente',
      firstRoundMeta:
        'Projection pédagogique (données illustratives / sondages). Sainte-Laguë, couleurs proximité programmes. Pas une prédiction.',
      realMeta:
        'Le second tour n’a pas encore eu lieu. La case de droite reste en attente des résultats officiels — fil directeur DOE : documenter le T1 avant le filtre binaire.',
      firstRound: firstRoundFromPresidentielle(dataset, TOTAL, 0.5),
      real: [],
      realPending: true,
      totalSeats: TOTAL,
      thresholdPct: 0.5,
      distorsionNote: summary.distorsion_note,
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
