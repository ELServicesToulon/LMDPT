/**
 * Multi-scrutins AN1T (P10-5) — modes présidentielle + législatives pour le simulateur.
 * DOE : illustration pédagogique, pas de prédiction.
 */
import {
  AN1T_BLOCS,
  aggregatePresidentialPctByBloc,
  simulateFromVoteShares,
  type SeatAllocation,
} from './an1t';
import type { ElectionDataset } from './election-types';
import { getElection } from './elections';
import {
  buildScrutinDual,
  listScrutinDuals,
  type ScrutinDualPair,
} from './scrutin-dual';

export type An1tScrutinModeId =
  | 'legislatives-2024'
  | 'presidentielle-2022'
  | 'presidentielle-2017'
  | 'presidentielle-2027';

export interface An1tScrutinMode {
  id: An1tScrutinModeId;
  label: string;
  kind: 'presidentielle' | 'legislatives' | 'projection';
  /** Preset % par bloc (somme ~100) */
  blocPcts: Record<string, number>;
  /** Sièges « réels » post-2nd tour pour comparaison (si connus) */
  realSeats: Record<string, number>;
  realPending: boolean;
  realLabel: string;
  t1Label: string;
  totalSeats: number;
  defaultThreshold: number;
  /** dual pair si disponible (atlas / DualAssemblee) */
  dualSlug?: string;
  sourceNote: string;
}

/** Agrégat pédagogique T1 2024 législatives (blocs LMDPT) — aligné An1tSimulator. */
export const LEGISLATIVES_2024_T1_BLOCS: Record<string, number> = {
  rn: 33.0,
  nfp: 28.0,
  ensemble: 20.0,
  lr: 6.5,
  autres: 12.5,
};

export const LEGISLATIVES_2024_REAL_SEATS: Record<string, number> = {
  nfp: 182,
  ensemble: 99,
  rn: 125,
  lr: 47,
  autres: 124,
};

/** Projection 2027 pédagogique (pas un sondage unique). */
export const PROJECTION_2027_BLOCS: Record<string, number> = {
  rn: 35,
  nfp: 26,
  ensemble: 16,
  lr: 8,
  autres: 15,
};

function emptyBlocPcts(): Record<string, number> {
  return Object.fromEntries(AN1T_BLOCS.map((b) => [b.id, 0]));
}

function realSeatsFromDual(dual: ScrutinDualPair | null): {
  seats: Record<string, number>;
  pending: boolean;
  label: string;
} {
  if (!dual || dual.realPending || !dual.real.length) {
    return {
      seats: emptyBlocPcts(),
      pending: true,
      label: dual?.realLabel ?? 'Assemblée réelle à venir',
    };
  }
  const seats = emptyBlocPcts();
  for (const r of dual.real) {
    seats[r.id] = (seats[r.id] ?? 0) + r.seats;
  }
  return { seats, pending: false, label: dual.realLabel };
}

function pctsFromPresidentialDataset(dataset: ElectionDataset): Record<string, number> {
  return aggregatePresidentialPctByBloc(
    dataset.national.candidats,
    dataset.national.exprimes,
  );
}

/**
 * Catalogue multi-scrutins pour le simulateur (prés + légis + projection).
 */
export function listAn1tScrutinModes(): An1tScrutinMode[] {
  const dual2017 = buildScrutinDual('2017-presidentielle');
  const dual2022 = buildScrutinDual('2022-presidentielle');
  const dual2027 = buildScrutinDual('2027-presidentielle');
  const dual2024 = buildScrutinDual('2024-legislatives');

  const e2017 = getElection('2017-presidentielle');
  const e2022 = getElection('2022-presidentielle');

  const real2017 = realSeatsFromDual(dual2017);
  const real2022 = realSeatsFromDual(dual2022);
  const real2027 = realSeatsFromDual(dual2027);

  return [
    {
      id: 'legislatives-2024',
      label: 'Législatives 2024 (T1 → AN1T)',
      kind: 'legislatives',
      blocPcts: { ...LEGISLATIVES_2024_T1_BLOCS },
      realSeats: { ...LEGISLATIVES_2024_REAL_SEATS },
      realPending: false,
      realLabel: dual2024?.realLabel ?? 'Assemblée réelle 2024',
      t1Label: dual2024?.t1Label ?? '1er tour législatives 2024',
      totalSeats: 577,
      defaultThreshold: 3,
      dualSlug: '2024-legislatives',
      sourceNote: 'Open data Min. Intérieur · agrégat blocs LMDPT',
    },
    {
      id: 'presidentielle-2022',
      label: 'Présidentielle 2022 (T1 → AN1T)',
      kind: 'presidentielle',
      blocPcts: e2022
        ? pctsFromPresidentialDataset(e2022)
        : { rn: 32, nfp: 32, ensemble: 28, lr: 5, autres: 3 },
      realSeats: real2022.seats,
      realPending: real2022.pending,
      realLabel: real2022.label,
      t1Label: dual2022?.t1Label ?? '1er tour présidentielle 2022',
      totalSeats: 577,
      defaultThreshold: 1,
      dualSlug: '2022-presidentielle',
      sourceNote: 'Voix candidats → blocs AN1T · comparaison législatives juin 2022',
    },
    {
      id: 'presidentielle-2017',
      label: 'Présidentielle 2017 (T1 → AN1T)',
      kind: 'presidentielle',
      blocPcts: e2017
        ? pctsFromPresidentialDataset(e2017)
        : { rn: 21, nfp: 28, ensemble: 24, lr: 20, autres: 7 },
      realSeats: real2017.seats,
      realPending: real2017.pending,
      realLabel: real2017.label,
      t1Label: dual2017?.t1Label ?? '1er tour présidentielle 2017',
      totalSeats: 577,
      defaultThreshold: 1,
      dualSlug: '2017-presidentielle',
      sourceNote: 'Voix candidats → blocs AN1T · comparaison législatives juin 2017',
    },
    {
      id: 'presidentielle-2027',
      label: 'Présidentielle 2027 (projection pédagogique)',
      kind: 'projection',
      blocPcts: { ...PROJECTION_2027_BLOCS },
      realSeats: real2027.seats,
      realPending: true,
      realLabel: real2027.label,
      t1Label: dual2027?.t1Label ?? 'Projection 1er tour 2027',
      totalSeats: 577,
      defaultThreshold: 3,
      dualSlug: '2027-presidentielle',
      sourceNote: 'Projection pédagogique uniquement — pas de prédiction · législatives 2027 en attente',
    },
  ];
}

export function getAn1tScrutinMode(id: An1tScrutinModeId): An1tScrutinMode | undefined {
  return listAn1tScrutinModes().find((m) => m.id === id);
}

/** Simule AN1T pour un mode (Sainte-Laguë). */
export function simulateMode(mode: An1tScrutinMode): SeatAllocation[] {
  const shares = AN1T_BLOCS.map((b) => ({
    id: b.id,
    label: b.label,
    color: b.color,
    pct: mode.blocPcts[b.id] ?? 0,
  }));
  return simulateFromVoteShares(shares, mode.totalSeats, mode.defaultThreshold);
}

/** Payload JSON pour injecter dans An1tSimulator (client). */
export function an1tMultiScrutinClientPayload(): {
  modes: An1tScrutinMode[];
  dualCount: number;
} {
  return {
    modes: listAn1tScrutinModes(),
    dualCount: listScrutinDuals().length,
  };
}
