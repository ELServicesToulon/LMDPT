import { describe, expect, it } from 'vitest';
import {
  getAn1tScrutinMode,
  listAn1tScrutinModes,
  simulateMode,
  an1tMultiScrutinClientPayload,
} from './an1t-multi-scrutin';
import { presidentialNuanceToBlocId } from './an1t';

describe('an1t-multi-scrutin (P10-5)', () => {
  it('lists 4 modes: 2 présidentielles historiques + légis 2024 + projection 2027', () => {
    const modes = listAn1tScrutinModes();
    expect(modes.map((m) => m.id)).toEqual([
      'legislatives-2024',
      'presidentielle-2022',
      'presidentielle-2017',
      'presidentielle-2027',
    ]);
    expect(modes.every((m) => m.totalSeats === 577)).toBe(true);
  });

  it('maps 2017 nuances FN/EM into blocs and produces non-zero T1 pcts', () => {
    expect(presidentialNuanceToBlocId('FN')).toBe('rn');
    expect(presidentialNuanceToBlocId('EM')).toBe('ensemble');
    const m = getAn1tScrutinMode('presidentielle-2017')!;
    const sum = Object.values(m.blocPcts).reduce((a, b) => a + b, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101.5);
    expect(m.blocPcts.ensemble).toBeGreaterThan(15);
    expect(m.blocPcts.rn).toBeGreaterThan(15);
    expect(m.realPending).toBe(false);
    expect(Object.values(m.realSeats).reduce((a, b) => a + b, 0)).toBe(577);
  });

  it('2022 presidential mode has real assembly comparison', () => {
    const m = getAn1tScrutinMode('presidentielle-2022')!;
    expect(m.kind).toBe('presidentielle');
    expect(m.realPending).toBe(false);
    expect(m.realSeats.ensemble).toBe(251);
  });

  it('2027 projection is pending real assembly', () => {
    const m = getAn1tScrutinMode('presidentielle-2027')!;
    expect(m.kind).toBe('projection');
    expect(m.realPending).toBe(true);
  });

  it('simulateMode allocates 577 seats', () => {
    for (const m of listAn1tScrutinModes()) {
      const seats = simulateMode(m);
      expect(seats.reduce((s, r) => s + r.seats, 0)).toBe(577);
    }
  });

  it('client payload serializes modes', () => {
    const p = an1tMultiScrutinClientPayload();
    expect(p.modes.length).toBe(4);
    expect(p.dualCount).toBeGreaterThanOrEqual(4);
  });
});
