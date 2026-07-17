import { describe, expect, it } from 'vitest';
import {
  formatXHandle,
  getXRegistry,
  xForAffiliation,
  xForCandidate,
} from './x-officiels';
import candidatures from '../data/elections/2027-candidatures-declarees.json';

describe('x-officiels', () => {
  it('loads registry with candidates and parties', () => {
    const r = getXRegistry();
    expect(r.candidates.length).toBeGreaterThanOrEqual(20);
    expect(r.parties.length).toBeGreaterThanOrEqual(10);
  });

  it('resolves major candidates', () => {
    expect(xForCandidate('le-pen')?.handle).toBe('MLP_officiel');
    expect(xForCandidate('attal')?.url).toBe('https://x.com/GabrielAttal');
    expect(xForCandidate('melenchon')?.handle).toBe('JLMelenchon');
    expect(xForCandidate('philippe')?.url).toContain('edouardphilippe');
  });

  it('resolves major parties by affiliation', () => {
    expect(xForAffiliation('Rassemblement national')?.handle).toBe('RNational_off');
    expect(xForAffiliation('Parti socialiste')?.handle).toBe('partisocialiste');
    expect(xForAffiliation('Les Écologistes (EELV)')?.handle).toBe('EELV');
    expect(xForAffiliation('Horizons')?.url).toBe('https://x.com/Horizons');
  });

  it('covers every declared candidature slug when known', () => {
    for (const e of candidatures.entries) {
      const x = xForCandidate(e.slug);
      // all listed entries should have a registry row (url may be null)
      expect(x, `missing X registry for ${e.slug}`).not.toBeNull();
    }
  });

  it('formats handles with @', () => {
    expect(formatXHandle('MLP_officiel')).toBe('@MLP_officiel');
    expect(formatXHandle('@foo')).toBe('@foo');
    expect(formatXHandle(null)).toBe('');
  });
});
