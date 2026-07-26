import { describe, expect, it } from 'vitest';
import {
  aggregateScoresToBlocShares,
  buildPollAn1tBundle,
  pickPrimaryWaveScores,
  slugToAn1tBloc,
} from './poll-to-an1t';
import sondages from '../data/elections/2027-sondages-candidats.json';

describe('poll-to-an1t', () => {
  it('maps candidate slugs to AN1T blocs', () => {
    expect(slugToAn1tBloc('le-pen')).toBe('rn');
    expect(slugToAn1tBloc('melenchon')).toBe('nfp');
    expect(slugToAn1tBloc('philippe')).toBe('ensemble');
    expect(slugToAn1tBloc('retailleau')).toBe('lr');
  });

  it('aggregates Elabe-like scores without double-counting Bardella+Le Pen', () => {
    const shares = aggregateScoresToBlocShares({
      'le-pen': 35,
      bardella: 34,
      philippe: 16.5,
      melenchon: 16,
      glucksmann: 10.5,
      retailleau: 8,
      tondelier: 3.5,
      zemmour: 3,
    });
    const rn = shares.find((s) => s.id === 'rn');
    // bardella ignored when le-pen present; zemmour counts in rn
    expect(rn?.pct).toBeGreaterThan(35);
    expect(rn?.pct).toBeLessThan(50);
    const sum = shares.reduce((a, s) => a + s.pct, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101.5);
  });

  it('picks primary wave from live sondages file', () => {
    const { scores, label } = pickPrimaryWaveScores(sondages);
    expect(Object.keys(scores).length).toBeGreaterThanOrEqual(5);
    expect(label.length).toBeGreaterThan(3);
    expect(scores['le-pen'] ?? scores.bardella).toBeGreaterThan(30);
  });

  it('builds seat allocations that sum to 577', () => {
    const bundle = buildPollAn1tBundle(sondages, 577, 3);
    const seats = bundle.baseAlloc.reduce((s, a) => s + a.seats, 0);
    expect(seats).toBe(577);
    expect(bundle.baseShares.length).toBe(5);
    expect(bundle.diviseeAlloc.length).toBeGreaterThanOrEqual(5);
  });
});
