import type { ElectionCandidate, ElectionDataset } from './election-types';
import type { CirconscriptionElectionDataset } from './election-types';

export interface An1tBloc {
  id: string;
  label: string;
  color: string;
  nuanceCodes: string[];
}

/** Regroupement éditorial LMDPT — nuances CodNuaCand → blocs civiques. */
export const AN1T_BLOCS: An1tBloc[] = [
  {
    id: 'nfp',
    label: 'Nouveau Front populaire',
    color: '#c0392b',
    nuanceCodes: ['UG', 'DVG', 'EXG', 'FI', 'SOC', 'COM', 'VEC', 'ECO', 'RDG'],
  },
  {
    id: 'ensemble',
    label: 'Ensemble / centre présidentiel',
    color: '#1e4d6b',
    nuanceCodes: ['ENS', 'HOR', 'UDI', 'DVC'],
  },
  {
    id: 'rn',
    label: 'Rassemblement national & alliés droite',
    color: '#5c4a72',
    nuanceCodes: ['RN', 'UXD', 'DVD', 'REC', 'DSV', 'EXD'],
  },
  {
    id: 'lr',
    label: 'Droite républicaine',
    color: '#0066cc',
    nuanceCodes: ['LR'],
  },
  {
    id: 'autres',
    label: 'Régionalistes & divers',
    color: '#718096',
    nuanceCodes: ['REG', 'DIV'],
  },
];

const nuanceToBlocMap = new Map<string, string>(
  AN1T_BLOCS.flatMap((b) => b.nuanceCodes.map((code) => [code, b.id] as const)),
);

export function nuanceToBlocId(nuanceCode: string): string {
  return nuanceToBlocMap.get(nuanceCode) ?? 'autres';
}

export function getBloc(id: string): An1tBloc | undefined {
  return AN1T_BLOCS.find((b) => b.id === id);
}

export interface VoteShare {
  id: string;
  label: string;
  color: string;
  votes: number;
  pctExprimes: number;
}

export interface SeatAllocation {
  id: string;
  label: string;
  color: string;
  votes: number;
  pctExprimes: number;
  seats: number;
  pctSeats: number;
}

export function aggregateVotesByBloc(
  candidates: ElectionCandidate[],
  exprimes: number,
): VoteShare[] {
  const votes = new Map<string, number>();
  for (const c of candidates) {
    const blocId = nuanceToBlocId(c.nuance);
    votes.set(blocId, (votes.get(blocId) ?? 0) + c.voix);
  }
  return AN1T_BLOCS.map((bloc) => {
    const v = votes.get(bloc.id) ?? 0;
    return {
      id: bloc.id,
      label: bloc.label,
      color: bloc.color,
      votes: v,
      pctExprimes: exprimes > 0 ? (v / exprimes) * 100 : 0,
    };
  }).filter((b) => b.votes > 0);
}

/** Répartition Sainte-Laguë (diviseurs impairs 1, 3, 5…). */
export function allocateSainteLague(
  items: Array<{ id: string; votes: number }>,
  totalSeats: number,
  thresholdPct = 3,
): Map<string, number> {
  const totalVotes = items.reduce((sum, i) => sum + i.votes, 0);
  if (totalVotes === 0 || totalSeats <= 0) return new Map();

  const minVotes = (totalVotes * thresholdPct) / 100;
  const eligible = items.filter((i) => i.votes >= minVotes);
  if (eligible.length === 0) return new Map();

  const seats = new Map<string, number>(eligible.map((i) => [i.id, 0]));
  const quotients: Array<{ id: string; quotient: number }> = [];

  for (let assigned = 0; assigned < totalSeats; assigned += 1) {
    quotients.length = 0;
    for (const item of eligible) {
      const current = seats.get(item.id) ?? 0;
      quotients.push({ id: item.id, quotient: item.votes / (2 * current + 1) });
    }
    quotients.sort((a, b) => b.quotient - a.quotient);
    const winner = quotients[0]?.id;
    if (!winner) break;
    seats.set(winner, (seats.get(winner) ?? 0) + 1);
  }

  return seats;
}

export function simulateAn1tSeats(
  dataset: ElectionDataset,
  totalSeats: number,
  thresholdPct = 3,
): SeatAllocation[] {
  const { candidats, exprimes } = dataset.national;
  const blocVotes = aggregateVotesByBloc(candidats, exprimes);
  const seatMap = allocateSainteLague(
    blocVotes.map((b) => ({ id: b.id, votes: b.votes })),
    totalSeats,
    thresholdPct,
  );

  return blocVotes
    .map((b) => ({
      ...b,
      seats: seatMap.get(b.id) ?? 0,
      pctSeats: totalSeats > 0 ? ((seatMap.get(b.id) ?? 0) / totalSeats) * 100 : 0,
    }))
    .sort((a, b) => b.seats - a.seats || b.votes - a.votes);
}

export interface RealAssemblyBloc {
  id: string;
  label: string;
  color: string;
  seats: number;
}

export function compareSeatAllocations(
  an1t: SeatAllocation[],
  reelle: RealAssemblyBloc[],
  totalSeats: number,
): Array<{
  id: string;
  label: string;
  color: string;
  an1tSeats: number;
  reelleSeats: number;
  delta: number;
}> {
  const an1tMap = new Map(an1t.map((a) => [a.id, a.seats]));
  const reelleMap = new Map(reelle.map((r) => [r.id, r.seats]));
  const ids = [...new Set([...an1tMap.keys(), ...reelleMap.keys()])];

  return ids
    .map((id) => {
      const meta = getBloc(id) ?? reelle.find((r) => r.id === id);
      const an1tSeats = an1tMap.get(id) ?? 0;
      const reelleSeats = reelleMap.get(id) ?? 0;
      return {
        id,
        label: meta?.label ?? id,
        color: meta?.color ?? '#888',
        an1tSeats,
        reelleSeats,
        delta: an1tSeats - reelleSeats,
      };
    })
    .sort((a, b) => b.reelleSeats - a.reelleSeats || b.an1tSeats - a.an1tSeats);
}

/** Circonscriptions en tête par bloc (géographie de la pluralité T1). */
export function countCircosByBloc(
  dataset: CirconscriptionElectionDataset,
): Array<{ id: string; label: string; color: string; count: number }> {
  const counts = new Map<string, number>();
  for (const c of dataset.circonscriptions) {
    const blocId = nuanceToBlocId(c.leader_nuance_code);
    counts.set(blocId, (counts.get(blocId) ?? 0) + 1);
  }
  return AN1T_BLOCS.map((b) => ({
    id: b.id,
    label: b.label,
    color: b.color,
    count: counts.get(b.id) ?? 0,
  }))
    .filter((b) => b.count > 0)
    .sort((a, b) => b.count - a.count);
}

export interface DepartmentBlocSummary {
  code: string;
  nom: string;
  leader_bloc_id: string;
  circo_count: number;
  breakdown: Array<{ blocId: string; count: number; avgPct: number }>;
}

export function aggregateDepartmentBlocsFromCircos(
  dataset: CirconscriptionElectionDataset,
  departmentNames: Map<string, string>,
): DepartmentBlocSummary[] {
  const byDept = new Map<string, typeof dataset.circonscriptions>();

  for (const c of dataset.circonscriptions) {
    const list = byDept.get(c.departement) ?? [];
    list.push(c);
    byDept.set(c.departement, list);
  }

  const summaries: DepartmentBlocSummary[] = [];

  for (const [code, circos] of byDept) {
    const blocStats = new Map<string, { count: number; pctSum: number }>();
    for (const c of circos) {
      const blocId = nuanceToBlocId(c.leader_nuance_code);
      const prev = blocStats.get(blocId) ?? { count: 0, pctSum: 0 };
      blocStats.set(blocId, {
        count: prev.count + 1,
        pctSum: prev.pctSum + c.leader_pct,
      });
    }

    const breakdown = [...blocStats.entries()]
      .map(([blocId, stats]) => ({
        blocId,
        count: stats.count,
        avgPct: stats.pctSum / stats.count,
      }))
      .sort((a, b) => b.count - a.count || b.avgPct - a.avgPct);

    summaries.push({
      code,
      nom: departmentNames.get(code) ?? `Département ${code}`,
      leader_bloc_id: breakdown[0]?.blocId ?? 'autres',
      circo_count: circos.length,
      breakdown,
    });
  }

  return summaries.sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }));
}
