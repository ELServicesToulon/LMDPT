import { describe, expect, it } from 'vitest';
import { buildScrutinDual, listScrutinDuals } from './scrutin-dual';

describe('scrutin-dual fil directeur', () => {
  it('covers every catalog election', () => {
    const duals = listScrutinDuals();
    expect(duals.length).toBeGreaterThanOrEqual(4);
    const slugs = duals.map((d) => d.slug);
    expect(slugs).toContain('2024-legislatives');
    expect(slugs).toContain('2022-presidentielle');
    expect(slugs).toContain('2017-presidentielle');
    expect(slugs).toContain('2027-presidentielle');
  });

  it('T1 seats sum to 577 for known scrutins', () => {
    for (const slug of ['2024-legislatives', '2022-presidentielle', '2017-presidentielle']) {
      const d = buildScrutinDual(slug)!;
      const sum = d.firstRound.reduce((s, r) => s + r.seats, 0);
      expect(sum, slug).toBe(577);
    }
  });

  it('real outcome seats sum to 577 when known', () => {
    for (const slug of ['2024-legislatives', '2022-presidentielle', '2017-presidentielle']) {
      const d = buildScrutinDual(slug)!;
      expect(d.realPending).toBe(false);
      const sum = d.real.reduce((s, r) => s + r.seats, 0);
      expect(sum, slug).toBe(577);
    }
  });

  it('2027 has pending real outcome', () => {
    const d = buildScrutinDual('2027-presidentielle')!;
    expect(d.realPending).toBe(true);
    expect(d.real).toHaveLength(0);
    expect(d.firstRound.reduce((s, r) => s + r.seats, 0)).toBe(577);
  });

  it('presidential T1 has more than 2 candidacies (plurality)', () => {
    const d = buildScrutinDual('2022-presidentielle')!;
    expect(d.firstRound.length).toBeGreaterThan(2);
    expect(d.real.length).toBe(2);
  });
});
