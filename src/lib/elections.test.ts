import { describe, expect, it } from 'vitest';
import { ELECTION_CATALOG, formatPct, formatVoix, getElection } from './elections';

describe('elections', () => {
  it('loads 2022 presidential dataset', () => {
    const data = getElection('2022-presidentielle');
    expect(data).toBeDefined();
    expect(data?.national.candidats).toHaveLength(12);
    expect(data?.national.candidats[0]?.nom).toContain('MACRON');
  });

  it('loads 2017 presidential dataset', () => {
    const data = getElection('2017-presidentielle');
    expect(data?.national.candidats).toHaveLength(11);
    expect(data?.national.candidats[0]?.pourcentage_exprimes).toBe(24.01);
  });

  it('loads 2027 presidential projection placeholder', () => {
    const data = getElection('2027-presidentielle');
    expect(data).toBeDefined();
    expect(data?.election).toContain('2027');
    expect(data?.national.candidats.length).toBeGreaterThan(10);
    // Placeholder sum check (tolerance for rounding)
    const sum = data!.national.candidats.reduce((acc, c) => acc + c.voix, 0);
    expect(Math.abs(sum - data!.national.exprimes)).toBeLessThan(100);
  });

  it('candidate votes sum to exprimes total (2022)', () => {
    const data = getElection('2022-presidentielle');
    const sum = data!.national.candidats.reduce((acc, c) => acc + c.voix, 0);
    expect(sum).toBe(data!.national.exprimes);
  });

  it('candidate votes sum to exprimes total (2017)', () => {
    const data = getElection('2017-presidentielle');
    const sum = data!.national.candidats.reduce((acc, c) => acc + c.voix, 0);
    expect(sum).toBe(data!.national.exprimes);
  });

  it('catalog lists 2017, 2022, 2024 T1/T2 and 2027 presidential projection', () => {
    expect(ELECTION_CATALOG.length).toBe(5);
    expect(ELECTION_CATALOG.map((e) => e.slug)).toContain('2017-presidentielle');
    expect(ELECTION_CATALOG.map((e) => e.slug)).toContain('2024-legislatives');
    expect(ELECTION_CATALOG.map((e) => e.slug)).toContain('2024-legislatives-t2');
    expect(ELECTION_CATALOG.map((e) => e.slug)).toContain('2027-presidentielle');
  });

  it('formats numbers in fr-FR', () => {
    expect(formatVoix(9783058)).toMatch(/9/);
    expect(formatPct(27.85)).toContain('%');
  });
});
