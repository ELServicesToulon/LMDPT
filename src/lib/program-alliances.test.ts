import { describe, expect, it } from 'vitest';
import {
  buildAlliancesMatrix,
  buildMultiScrutinMatrices,
  comparePair,
  jaccardLabels,
  topCompatiblePairs,
  topFracturePairs,
} from './program-alliances';
import { getCandidateProgram, listCandidates } from './programs';

describe('program-alliances', () => {
  it('jaccard is 1 for identical labels', () => {
    expect(jaccardLabels(['retraite a 60 ans'], ['retraite a 60 ans'])).toBe(1);
  });

  it('scores 2022 macron-pecresse more compatible than macron-melenchon', () => {
    const macron = getCandidateProgram('presidentielle-2022', 'macron')!;
    const pecresse = getCandidateProgram('presidentielle-2022', 'pecresse')!;
    const mel = getCandidateProgram('presidentielle-2022', 'melenchon')!;
    const mp = comparePair(macron, pecresse);
    const mm = comparePair(macron, mel);
    expect(mp.compat).not.toBeNull();
    expect(mm.compat).not.toBeNull();
    expect(mp.compat!).toBeGreaterThan(mm.compat!);
  });

  it('builds full matrix for 2017', () => {
    const m = buildAlliancesMatrix('presidentielle-2017', '2026-07-17T00:00:00.000Z');
    expect(m.schema).toBe('lmdpt-alliances-matrix-v1');
    expect(m.candidates).toHaveLength(5);
    const n = listCandidates('presidentielle-2017').length;
    expect(m.pairs).toHaveLength((n * (n - 1)) / 2);
    expect(topCompatiblePairs(m.pairs, 3).length).toBeGreaterThan(0);
    expect(topFracturePairs(m.pairs, 3).length).toBeGreaterThan(0);
  });

  it('builds multi-scrutin including 2027', () => {
    const multi = buildMultiScrutinMatrices();
    expect(Object.keys(multi)).toEqual([
      'presidentielle-2017',
      'presidentielle-2022',
      'presidentielle-2027',
    ]);
    expect(multi['presidentielle-2027']!.candidates.length).toBe(11);
  });

  it('marks fracture europe/retraites when opposite axes', () => {
    const macron = getCandidateProgram('presidentielle-2022', 'macron')!;
    const mel = getCandidateProgram('presidentielle-2022', 'melenchon')!;
    const pair = comparePair(macron, mel);
    expect(pair.fracture.length + pair.negotiable.length).toBeGreaterThan(0);
    // At least one structural theme should not be strongly aligned
    const hard = [...pair.fracture, ...pair.negotiable];
    expect(hard.some((t) => ['retraites', 'europe', 'institutions', 'fiscalite'].includes(t))).toBe(
      true,
    );
  });
});
