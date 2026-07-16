import { describe, expect, it } from 'vitest';
import {
  commentForNewWave,
  commentForShift,
  extractScores,
  matchFirm,
  parseEpocHtml,
  diffWaves,
  seedKnownWaves,
  type DetectedWave,
} from './sondage-veille';

describe('sondage-veille', () => {
  it('matches poll firms FR / EU / intl', () => {
    expect(matchFirm('Selon un sondage Elabe pour BFMTV')?.id).toBe('elabe');
    expect(matchFirm('Cluster 17 pour Le Point')?.id).toBe('cluster17');
    expect(matchFirm('Ifop-Fiducial pour Le Figaro')?.id).toBe('ifop');
    expect(matchFirm('Viavoice pour Libération')?.id).toBe('viavoice');
    expect(matchFirm('Europe Elects average')?.id).toBe('europe-elects');
    expect(matchFirm('Pew Research survey on France')?.id).toBe('pew-research');
  });

  it('indexes multi-region providers', async () => {
    const { getProviders } = await import('./sondage-veille');
    const p = getProviders();
    const fr = p.institutes.filter((i: { region?: string }) => i.region === 'fr');
    const eu = p.institutes.filter((i: { region?: string }) => i.region === 'eu');
    const intl = p.institutes.filter((i: { region?: string }) => i.region === 'intl');
    expect(fr.length).toBeGreaterThanOrEqual(10);
    expect(eu.length + intl.length).toBeGreaterThanOrEqual(5);
    expect(p.aggregators.some((a: { id: string }) => a.id === 'europe-elects')).toBe(true);
  });

  it('extracts candidate scores from text', () => {
    const scores = extractScores(
      'Marine Le Pen arrive en tête avec 36% des intentions de vote, devant Édouard Philippe (19%) et Jean-Luc Mélenchon 15%.',
    );
    expect(scores['le-pen']).toBe(36);
    expect(scores.philippe).toBe(19);
    expect(scores.melenchon).toBe(15);
  });

  it('parses EPOC dernier sondage block', () => {
    const html = `
      <html><body>
      Dernier sondage ELABE 12/07/2026
      1er Tour · Hypothèse N°1
      35% LE PEN 16.5% PHILIPPE 16% MÉLENCHON 10.5% GLUCKSMANN 8% RETAILLEAU
      </body></html>
    `;
    const waves = parseEpocHtml(html, 'https://www.epocinfo.fr/ep2027.php');
    expect(waves.length).toBeGreaterThanOrEqual(1);
    expect(waves[0].firm.toLowerCase()).toContain('elabe');
    expect(waves[0].scores['le-pen']).toBe(35);
    expect(waves[0].scores.philippe).toBe(16.5);
  });

  it('comments new wave and shifts briefly in French', () => {
    const wave: DetectedWave = {
      id: 't1',
      firm: 'Elabe',
      firm_id: 'elabe',
      fieldwork: '12/07/2026',
      published_hint: null,
      source_url: 'https://example.com',
      source_id: 'test',
      scores: { 'le-pen': 35, philippe: 16.5 },
      raw_snippet: '',
      metric: 'intentions_vote',
    };
    expect(commentForNewWave(wave)).toMatch(/Elabe/);
    expect(commentForNewWave(wave)).toMatch(/le pen/i);
    expect(commentForShift('Ifop', 'melenchon', 13, 16)).toMatch(/hausse/);
    expect(commentForShift('Ifop', 'philippe', 19, 16.5)).toMatch(/repli/);
  });

  it('detects new wave movements', () => {
    const prev: DetectedWave[] = [];
    const next = seedKnownWaves().filter((w) => Object.keys(w.scores).length > 0).slice(0, 2);
    const moves = diffWaves(prev, next, '2026-07-16T12:00:00.000Z');
    expect(moves.some((m) => m.kind === 'new_wave')).toBe(true);
    expect(moves[0].comment.length).toBeGreaterThan(10);
  });

  it('seeds include Le Point Cluster17 URL', () => {
    const seed = seedKnownWaves();
    const lp = seed.find((w) => w.id.includes('cluster17-lepoint'));
    expect(lp).toBeDefined();
    expect(lp?.source_url).toContain('lepoint.fr');
    expect(lp?.metric).toBe('souhait_victoire');
  });
});
