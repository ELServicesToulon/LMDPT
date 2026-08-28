import { describe, expect, it } from 'vitest';
import {
  buildScrutinDual,
  computeDifferential,
  firstRoundPresidentielleAsBlocs,
  listScrutinDuals,
  realFromFollowingLegislatives,
} from './scrutin-dual';
import { getElection } from './elections';

describe('scrutin-dual — présidentielle → législatives', () => {
  it('covers every catalog election', () => {
    const duals = listScrutinDuals();
    expect(duals.length).toBeGreaterThanOrEqual(4);
  });

  it('2022: left = T1 présidentiel blocs, right = législatives juin 2022', () => {
    const d = buildScrutinDual('2022-presidentielle')!;
    expect(d.realPending).toBe(false);
    expect(d.realTitle.toLowerCase()).toMatch(/législatives/);
    expect(d.real.reduce((s, r) => s + r.seats, 0)).toBe(577);
    expect(d.firstRound.reduce((s, r) => s + r.seats, 0)).toBe(577);
    // NUPES 159, Ensemble 251 known
    expect(d.real.find((r) => r.id === 'ensemble')?.seats).toBe(251);
    expect(d.real.find((r) => r.id === 'nfp')?.seats).toBe(159);
    expect(d.differential?.length).toBeGreaterThanOrEqual(4);
  });

  it('2017: législatives following presidential', () => {
    const d = buildScrutinDual('2017-presidentielle')!;
    expect(d.realPending).toBe(false);
    expect(d.real.find((r) => r.id === 'ensemble')?.seats).toBeGreaterThan(300);
    expect(d.real.reduce((s, r) => s + r.seats, 0)).toBe(577);
    expect(d.differential).toBeDefined();
  });

  it('2027: législatives pending', () => {
    const d = buildScrutinDual('2027-presidentielle')!;
    expect(d.realPending).toBe(true);
    expect(d.real).toHaveLength(0);
    expect(d.differential).toBeUndefined();
  });

  it('aggregates presidential T1 into AN1T blocs', () => {
    const data = getElection('2022-presidentielle')!;
    const rows = firstRoundPresidentielleAsBlocs(data);
    const ids = rows.map((r) => r.id);
    expect(ids).toContain('ensemble');
    expect(ids).toContain('rn');
    expect(ids).toContain('nfp');
    expect(rows.reduce((s, r) => s + r.seats, 0)).toBe(577);
  });

  it('computes signed seat differential', () => {
    const first = [
      { id: 'nfp', label: 'NFP', seats: 200 },
      { id: 'ensemble', label: 'ENS', seats: 150 },
    ];
    const real = [
      { id: 'nfp', label: 'NFP', seats: 159 },
      { id: 'ensemble', label: 'ENS', seats: 251 },
    ];
    const diff = computeDifferential(first, real);
    expect(diff.find((d) => d.id === 'nfp')?.delta).toBe(-41);
    expect(diff.find((d) => d.id === 'ensemble')?.delta).toBe(101);
  });

  it('chain helper returns 2022 legislative seats', () => {
    const f = realFromFollowingLegislatives('2022-presidentielle');
    expect(f.pending).toBe(false);
    expect(f.rows.reduce((s, r) => s + r.seats, 0)).toBe(577);
  });

  it('2024 T2: Sainte-Laguë voix T2 vs 577 élus circo', () => {
    const d = buildScrutinDual('2024-legislatives-t2')!;
    expect(d.realPending).toBe(false);
    expect(d.firstRound.reduce((s, r) => s + r.seats, 0)).toBe(577);
    expect(d.real.reduce((s, r) => s + r.seats, 0)).toBe(577);
    expect(d.real.find((r) => r.id === 'nfp')?.seats).toBe(193);
    expect(d.real.find((r) => r.id === 'ensemble')?.seats).toBe(165);
    expect(d.real.find((r) => r.id === 'rn')?.seats).toBe(170);
    expect(d.real.find((r) => r.id === 'lr')?.seats).toBe(39);
    expect(d.differential?.length).toBeGreaterThanOrEqual(4);
  });
});
