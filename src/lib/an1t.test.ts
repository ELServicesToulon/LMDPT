import { describe, expect, it } from 'vitest';
import leg2024National from '../data/elections/2024-legislatives-1er-tour-national.json';
import leg2024Circos from '../data/elections/2024-legislatives-1er-tour-circonscriptions.json';
import anReelle from '../data/analyses/assemblee-premier-tour-2024.json';
import {
  allocateSainteLague,
  compareSeatAllocations,
  countCircosByBloc,
  nuanceToBlocId,
  simulateAn1tSeats,
} from './an1t';
import type { ElectionDataset } from './election-types';
import type { CirconscriptionElectionDataset } from './election-types';

describe('an1t', () => {
  it('maps nuances to blocs', () => {
    expect(nuanceToBlocId('UG')).toBe('nfp');
    expect(nuanceToBlocId('RN')).toBe('rn');
    expect(nuanceToBlocId('ENS')).toBe('ensemble');
    expect(nuanceToBlocId('LR')).toBe('lr');
  });

  it('allocates exact seat total via Sainte-Laguë', () => {
    const seats = allocateSainteLague(
      [
        { id: 'a', votes: 40 },
        { id: 'b', votes: 35 },
        { id: 'c', votes: 25 },
      ],
      10,
      0,
    );
    expect([...seats.values()].reduce((s, n) => s + n, 0)).toBe(10);
  });

  it('simulates 577 AN1T seats from 2024 T1 national data', () => {
    const result = simulateAn1tSeats(leg2024National as ElectionDataset, 577, 3);
    const total = result.reduce((s, r) => s + r.seats, 0);
    expect(total).toBe(577);
    expect(result.some((r) => r.id === 'rn' && r.seats > 0)).toBe(true);
    expect(result.some((r) => r.id === 'nfp' && r.seats > 0)).toBe(true);
  });

  it('simulates 150-seat chamber proposal', () => {
    const result = simulateAn1tSeats(leg2024National as ElectionDataset, 150, 3);
    expect(result.reduce((s, r) => s + r.seats, 0)).toBe(150);
  });

  it('counts 577 circonscriptions by bloc leaders', () => {
    const counts = countCircosByBloc(leg2024Circos as CirconscriptionElectionDataset);
    expect(counts.reduce((s, c) => s + c.count, 0)).toBe(577);
  });

  it('compares AN1T vs réelle assembly blocs', () => {
    const an1t = simulateAn1tSeats(leg2024National as ElectionDataset, 577, 3);
    const cmp = compareSeatAllocations(an1t, anReelle.an_reelle.blocs, 577);
    expect(cmp.length).toBeGreaterThanOrEqual(4);
    expect(cmp.reduce((s, r) => s + r.reelleSeats, 0)).toBe(577);
  });
});
