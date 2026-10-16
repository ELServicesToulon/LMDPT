import { describe, expect, it } from 'vitest';
import {
  commentForNewWave,
  commentForShift,
  extractScores,
  matchFirm,
  parseEpocHtml,
  parseCommissionNotices,
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
    expect(waves[0].id).toBe('epoc-elabe-12072026-h1');
  });

  it('parses EPOC Odoxa 15/10/2026 as separate 1er-tour hypotheses, ignoring 2nd tour and aggregates', () => {
    const html = `
      <html><body>
        <div class="latest-poll-banner">
          <div class="lp-label">Dernier sondage</div>
          <div class="lp-text"><strong>ODOXA</strong></div>
          <div class="lp-date">15/10/2026</div>
        </div>
        <div class="box-title">1er Tour · Hypothèse N°1</div>
        <div class="bar-value">37%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">18%</div><div class="bar-label">MÉLENCHON</div>
        <div class="bar-value">17%</div><div class="bar-label">PHILIPPE</div>
        <div class="bar-value">9.5%</div><div class="bar-label">GLUCKSMANN</div>
        <div class="bar-value">6.5%</div><div class="bar-label">RETAILLEAU</div>
        <div class="bar-value">4.5%</div><div class="bar-label">ZEMMOUR</div>
        <div class="bar-value">3%</div><div class="bar-label">TONDELIER</div>
        <div class="bar-value">2%</div><div class="bar-label">ROUSSEL</div>
        <div class="bar-value">2%</div><div class="bar-label">DUPONT-AIGNAN</div>
        <div class="bar-value">0.5%</div><div class="bar-label">ARTHAUD</div>
        <div class="box-title">1er Tour · Hypothèse N°2</div>
        <div class="bar-value">38%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">18.5%</div><div class="bar-label">MÉLENCHON</div>
        <div class="bar-value">11%</div><div class="bar-label">ATTAL</div>
        <div class="bar-value">10.5%</div><div class="bar-label">GLUCKSMANN</div>
        <div class="bar-value">9%</div><div class="bar-label">RETAILLEAU</div>
        <div class="bar-value">4.1%</div><div class="bar-label">ZEMMOUR</div>
        <div class="bar-value">3.5%</div><div class="bar-label">TONDELIER</div>
        <div class="bar-value">2%</div><div class="bar-label">ROUSSEL</div>
        <div class="bar-value">2%</div><div class="bar-label">DUPONT-AIGNAN</div>
        <div class="bar-value">1%</div><div class="bar-label">ARTHAUD</div>
        <div class="box-title">2ème Tour · Hypothèse N°1</div>
        <div class="bar-value">68%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">32%</div><div class="bar-label">MÉLENCHON</div>
        <div class="box-title">2ème Tour · Hypothèse N°2</div>
        <div class="bar-value">53%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">47%</div><div class="bar-label">PHILIPPE</div>
        <div>Moyennes globales</div>
        <div>1er Tour Basée sur l'ensemble des sondages saisis</div>
        <div class="bar-value">34.1%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">14.7%</div><div class="bar-label">MÉLENCHON</div>
        <div>2ème Tour Basée sur l'ensemble des sondages saisis</div>
        <div class="bar-value">57.3%</div><div class="bar-label">LE PEN</div>
        <table>
          <tr><th>Date</th><th>Institut</th><th>Hyp.</th><th>LE PEN</th><th>MÉLENCHON</th></tr>
          <tr><td>15/10/2026</td><td>ODOXA</td><td>1</td><td>37%</td><td>18%</td></tr>
          <tr><td>15/10/2026</td><td>ODOXA</td><td>2</td><td>38%</td><td>18.5%</td></tr>
        </table>
      </body></html>
    `;
    const waves = parseEpocHtml(html, 'https://www.epocinfo.fr/ep2027.php');
    const scored = waves.filter((w) => Object.keys(w.scores).length > 0);
    expect(scored).toHaveLength(2);

    const h1 = scored.find((w) => w.id === 'epoc-odoxa-15102026-h1');
    const h2 = scored.find((w) => w.id === 'epoc-odoxa-15102026-h2');
    expect(h1).toBeDefined();
    expect(h2).toBeDefined();
    expect(h1?.hypothesis).toBe('hyp. 1');
    expect(h2?.hypothesis).toBe('hyp. 2');
    expect(h1?.scores['le-pen']).toBe(37);
    expect(h1?.scores.melenchon).toBe(18);
    expect(h1?.scores.philippe).toBe(17);
    expect(h1?.scores.attal).toBeUndefined();
    expect(h2?.scores['le-pen']).toBe(38);
    expect(h2?.scores.melenchon).toBe(18.5);
    expect(h2?.scores.attal).toBe(11);
    expect(h2?.scores.philippe).toBeUndefined();

    const forbidden = [53, 47, 68, 32, 34.1, 14.7];
    for (const w of waves) {
      for (const pct of Object.values(w.scores)) {
        expect(forbidden).not.toContain(pct);
      }
    }
    expect(commentForNewWave(h1!)).toMatch(/hyp\. 1/);
    expect(commentForNewWave(h1!)).toMatch(/37/);
    expect(commentForNewWave(h2!)).toMatch(/hyp\. 2/);
    expect(commentForNewWave(h2!)).toMatch(/38/);
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

  it('treats EPOC hypotheses of the same firm and date as distinct waves', () => {
    const h1: DetectedWave = {
      id: 'epoc-odoxa-15102026-h1',
      firm: 'Odoxa',
      firm_id: 'odoxa',
      fieldwork: '15/10/2026',
      published_hint: '15/10/2026',
      source_url: 'https://www.epocinfo.fr/ep2027.php',
      source_id: 'epoc',
      scores: { 'le-pen': 37, melenchon: 18, philippe: 17 },
      raw_snippet: '',
      metric: 'intentions_vote',
      hypothesis: 'hyp. 1',
    };
    const h2: DetectedWave = {
      ...h1,
      id: 'epoc-odoxa-15102026-h2',
      scores: { 'le-pen': 38, melenchon: 18.5, attal: 11 },
      hypothesis: 'hyp. 2',
    };
    const moves = diffWaves([], [h1, h2], '2026-10-16T12:00:00.000Z');
    expect(moves.filter((m) => m.kind === 'new_wave')).toHaveLength(2);
    expect(moves.filter((m) => m.kind === 'score_shift' || m.kind === 'head_change')).toHaveLength(
      0,
    );
    expect(moves.map((m) => m.wave_id).sort()).toEqual([
      'epoc-odoxa-15102026-h1',
      'epoc-odoxa-15102026-h2',
    ]);
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

  it('parses Commission notices without inventing scores', () => {
    const html = `
      <p class="download-line"><a>10228 Pres Baromètre Cluster17 Le Point 14 juillet</a></p>
      <p class="download-line"><a>10225 Pres IV 1er tour VERIAN LHemicycle 10 juillet</a></p>
      <p class="download-line"><a>10223 Pres IV TOLUNA HARRIS INTERACTIVE RTL 8 juillet</a></p>
    `;
    const waves = parseCommissionNotices(html, 'https://www.commission-des-sondages.fr/notices/');
    expect(waves.length).toBeGreaterThanOrEqual(2);
    expect(waves.every((w) => Object.keys(w.scores).length === 0)).toBe(true);
    expect(waves.some((w) => /verian/i.test(w.firm))).toBe(true);
  });

  it('does not re-flag empty-score firm+fieldwork already known', () => {
    const base: DetectedWave = {
      id: 'commission-elabe-14juillet',
      firm: 'Elabe',
      firm_id: 'elabe',
      fieldwork: '14 juillet',
      published_hint: null,
      source_url: 'https://www.commission-des-sondages.fr/notices/',
      source_id: 'commission-sondages',
      scores: {},
      raw_snippet: 'Notice Commission : ELABE 14 juillet',
      metric: 'intentions_vote',
    };
    const moves = diffWaves([base], [{ ...base, id: 'commission-elabe-14juillet-b' }], '2026-07-17T12:00:00.000Z');
    expect(moves).toHaveLength(0);
  });

  it('does not compare historical Bardella scores to current Le Pen wave', () => {
    const prev: DetectedWave[] = [
      {
        id: 'manual-elabe-20260712-h1',
        firm: 'Elabe',
        firm_id: 'elabe',
        fieldwork: '2026-07-09/12',
        published_hint: '2026-07-12',
        source_url: 'https://example.com',
        source_id: 'manual',
        scores: { 'le-pen': 35, philippe: 16.5 },
        raw_snippet: '',
        metric: 'intentions_vote',
      },
    ];
    const next: DetectedWave[] = [
      ...prev,
      {
        id: '2027pres-elabe-2527mars',
        firm: 'Elabe',
        firm_id: 'elabe',
        fieldwork: '25-27 mars',
        published_hint: null,
        source_url: 'https://2027presidentielle.com/',
        source_id: '2027presidentielle',
        scores: { bardella: 38.5, philippe: 13 },
        raw_snippet: '',
        metric: 'intentions_vote',
      },
    ];
    const moves = diffWaves(prev, next, '2026-07-17T12:00:00.000Z');
    expect(moves.filter((m) => m.kind === 'head_change' || m.kind === 'score_shift')).toHaveLength(
      0,
    );
  });
});
