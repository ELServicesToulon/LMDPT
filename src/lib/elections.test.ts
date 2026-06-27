import { describe, expect, it } from 'vitest';
import { ELECTION_CATALOG, formatPct, formatVoix, getElection } from './elections';

describe('elections', () => {
  it('loads 2022 presidential dataset', () => {
    const data = getElection('2022-presidentielle');
    expect(data).toBeDefined();
    expect(data?.national.candidats).toHaveLength(12);
    expect(data?.national.candidats[0]?.nom).toContain('MACRON');
  });

  it('candidate votes sum to exprimes total', () => {
    const data = getElection('2022-presidentielle');
    const sum = data!.national.candidats.reduce((acc, c) => acc + c.voix, 0);
    expect(sum).toBe(data!.national.exprimes);
  });

  it('catalog lists available elections', () => {
    expect(ELECTION_CATALOG.length).toBeGreaterThan(0);
    expect(ELECTION_CATALOG[0]?.slug).toBe('2022-presidentielle');
  });

  it('formats numbers in fr-FR', () => {
    expect(formatVoix(9783058)).toMatch(/9/);
    expect(formatPct(27.85)).toContain('%');
  });
});
