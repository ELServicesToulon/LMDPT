import { describe, expect, it } from 'vitest';
import {
  documentedHasHttps,
  httpsSources,
  loadObservatoire,
  mayShowOfficieux,
} from './observatoire-censure';

describe('observatoire-censure anti-diffamation gates', () => {
  const obs = loadObservatoire();

  it('has disclaimer and taxonomy', () => {
    expect(obs.disclaimer.toLowerCase()).toMatch(/pas d['’]avis juridique/);
    expect(obs.media.length).toBeGreaterThan(0);
    expect(obs.influencers.length).toBeGreaterThan(0);
  });

  it('every documented entry has ≥1 https source', () => {
    for (const m of obs.media) {
      expect(documentedHasHttps(m), m.id).toBe(true);
    }
    for (const i of obs.influencers) {
      expect(documentedHasHttps(i), i.id).toBe(true);
    }
  });

  it('every https source is well-formed', () => {
    for (const e of [...obs.media, ...obs.influencers]) {
      for (const s of httpsSources(e)) {
        expect(s.label.trim().length, e.id).toBeGreaterThan(2);
        expect(s.url, e.id).toMatch(/^https?:\/\//i);
      }
    }
  });

  it('valeurs actuelles is not labeled Fermeture', () => {
    const va = obs.media.find((m) => m.id === 'valeurs-actuelles');
    expect(va).toBeTruthy();
    expect(va!.action_label.toLowerCase()).not.toContain('fermeture');
  });

  it('officieux without https is not showable', () => {
    expect(
      mayShowOfficieux({ motif_officieux: 'rumeur', sources: [] }),
    ).toBe(false);
    expect(
      mayShowOfficieux({
        motif_officieux: 'lecture',
        sources: [{ label: 'x', url: 'https://example.org/a' }],
      }),
    ).toBe(true);
  });
});
