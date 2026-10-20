import { chmod, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import {
  commentForNewWave,
  commentForShift,
  extractScores,
  matchFirm,
  parseEpocHtml,
  parseCommissionNotices,
  diffWaves,
  persistSnapshot,
  readStateJson,
  seedKnownWaves,
  SondageStateError,
  type DetectedWave,
  type SondageVeilleSnapshot,
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

  it('parses EPOC historique 1er tour by header (non-standard column order), ignoring 2nd tour and aggregates', () => {
    const html = `
      <html><body>
        <div class="latest-poll-banner">
          <div class="lp-label">Dernier sondage</div>
          <div class="lp-text"><strong>YOUGOV</strong></div>
          <div class="lp-date">18/10/2026</div>
        </div>
        <div class="box-title">1er Tour · Hypothèse N°1</div>
        <div class="bar-value">36%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">15%</div><div class="bar-label">MÉLENCHON</div>
        <div class="bar-value">13%</div><div class="bar-label">PHILIPPE</div>
        <div class="bar-value">13%</div><div class="bar-label">GLUCKSMANN</div>
        <div class="inner-section-title">Moyennes globales</div>
        <div class="box-title">1er Tour</div>
        <p class="box-subtitle">Basée sur l'ensemble des sondages saisis</p>
        <div class="bar-value">34.1%</div><div class="bar-label">LE PEN</div>
        <div class="bar-value">14.8%</div><div class="bar-label">MÉLENCHON</div>
        <div class="box-title"><i data-lucide="table"></i> 1er Tour</div>
        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Hyp.</th>
                <th>Institut</th>
                <th>PHILIPPE</th>
                <th>LE PEN</th>
                <th>MÉLENCHON</th>
                <th>ATTAL</th>
                <th>LISNARD</th>
                <th>GLUCKSMANN</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>18/10/2026</td><td>1</td><td><strong>YOUGOV</strong></td>
                <td class="score-active">13%</td><td class="score-active">36%</td>
                <td class="score-active">15%</td><td class="score-empty">—</td>
                <td class="score-empty">—</td><td class="score-active">13%</td>
              </tr>
              <tr>
                <td>18/10/2026</td><td>5</td><td><strong>YOUGOV</strong></td>
                <td class="score-active">8%</td><td class="score-active">35%</td>
                <td class="score-active">13%</td><td class="score-active">6%</td>
                <td class="score-active">4%</td><td class="score-active">12%</td>
              </tr>
              <tr>
                <td>18/10/2026</td><td>1</td><td><strong>ELABE</strong></td>
                <td class="score-active">16.5%</td><td class="score-active">32.5%</td>
                <td class="score-active">15%</td><td class="score-empty">—</td>
                <td class="score-empty">—</td><td class="score-active">15.5%</td>
              </tr>
              <tr>
                <td>18/10/2026</td><td>2</td><td><strong>ELABE</strong></td>
                <td class="score-empty">—</td><td class="score-active">33.5%</td>
                <td class="score-active">16%</td><td class="score-active">10.5%</td>
                <td class="score-empty">—</td><td class="score-active">16.5%</td>
              </tr>
              <tr>
                <td>14/10/2026</td><td>1</td><td><strong>IFOP</strong></td>
                <td class="score-active">13%</td><td class="score-active">32%</td>
                <td class="score-active">16%</td><td class="score-active">5%</td>
                <td class="score-active">6%</td><td class="score-active">11.5%</td>
              </tr>
              <tr>
                <td>12/03/2026</td><td>1</td><td><strong>ELABE</strong></td>
                <td class="score-active">20%</td><td class="score-active">34%</td>
                <td class="score-active">14%</td><td class="score-empty">—</td>
                <td class="score-empty">—</td><td class="score-active">10%</td>
              </tr>
            </tbody>
          </table>
        </div>
        <div class="box-title"><i data-lucide="table"></i> 2ème Tour</div>
        <div class="history-table-wrapper">
          <table class="history-table">
            <thead>
              <tr>
                <th>Date</th><th>Institut</th><th>Hyp.</th>
                <th>LE PEN</th><th>PHILIPPE</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td>18/10/2026</td><td>YOUGOV</td><td>1</td>
                <td>52%</td><td>48%</td>
              </tr>
              <tr>
                <td>16/10/2026</td><td>OPINIONWAY</td><td>1</td>
                <td>56%</td><td>44%</td>
              </tr>
            </tbody>
          </table>
        </div>
      </body></html>
    `;
    const waves = parseEpocHtml(html, 'https://www.epocinfo.fr/ep2027.php');
    const scored = waves.filter((w) => Object.keys(w.scores).length > 0);
    const byId = Object.fromEntries(scored.map((w) => [w.id, w]));

    expect(byId['epoc-yougov-18102026-h1']).toBeDefined();
    expect(byId['epoc-yougov-18102026-h5']).toBeDefined();
    expect(byId['epoc-elabe-18102026-h1']).toBeDefined();
    expect(byId['epoc-elabe-18102026-h2']).toBeDefined();
    expect(byId['epoc-ifop-14102026-h1']).toBeDefined();
    expect(byId['epoc-elabe-12032026-h1']).toBeUndefined();

    const yougovH1 = byId['epoc-yougov-18102026-h1'];
    const yougovH5 = byId['epoc-yougov-18102026-h5'];
    expect(yougovH1.hypothesis).toBe('hyp. 1');
    expect(yougovH1.scores['le-pen']).toBe(36);
    expect(yougovH1.scores.philippe).toBe(13);
    expect(yougovH1.scores.attal).toBeUndefined();
    expect(yougovH1.scores.lisnard).toBeUndefined();
    expect(yougovH5.hypothesis).toBe('hyp. 5');
    expect(yougovH5.scores['le-pen']).toBe(35);
    expect(yougovH5.scores.philippe).toBe(8);
    expect(yougovH5.scores.attal).toBe(6);
    expect(yougovH5.scores.lisnard).toBe(4);
    expect(yougovH1.scores.philippe).not.toBe(8);

    expect(byId['epoc-elabe-18102026-h1'].scores['le-pen']).toBe(32.5);
    expect(byId['epoc-elabe-18102026-h1'].scores.philippe).toBe(16.5);
    expect(byId['epoc-elabe-18102026-h1'].scores.attal).toBeUndefined();
    expect(byId['epoc-elabe-18102026-h2'].scores['le-pen']).toBe(33.5);
    expect(byId['epoc-elabe-18102026-h2'].scores.attal).toBe(10.5);
    expect(byId['epoc-elabe-18102026-h2'].scores.philippe).toBeUndefined();

    expect(byId['epoc-ifop-14102026-h1'].scores['le-pen']).toBe(32);
    expect(byId['epoc-ifop-14102026-h1'].scores.lisnard).toBe(6);
    expect(byId['epoc-ifop-14102026-h1'].scores.philippe).toBe(13);

    expect(scored.filter((w) => w.id.startsWith('epoc-yougov-18102026-h1'))).toHaveLength(1);

    const forbidden = [52, 48, 56, 44, 34.1, 14.8, 20];
    for (const w of waves) {
      for (const pct of Object.values(w.scores)) {
        expect(forbidden).not.toContain(pct);
      }
    }
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

describe('état JSON de la veille (readStateJson)', () => {
  async function withTempDir<T>(fn: (dir: string) => Promise<T>): Promise<T> {
    const dir = await mkdtemp(join(tmpdir(), 'sondage-etat-'));
    try {
      return await fn(dir);
    } finally {
      await rm(dir, { recursive: true, force: true });
    }
  }

  it('fichier absent → null', async () => {
    await withTempDir(async (dir) => {
      await expect(readStateJson(join(dir, 'latest.json'), 'latest.json')).resolves.toBeNull();
    });
  });

  it('marqueurs de conflit → SondageStateError conflict-markers', async () => {
    await withTempDir(async (dir) => {
      const path = join(dir, 'latest.json');
      await writeFile(
        path,
        ['<<<<<<< HEAD', '{"ok":true}', '=======', '{"ok":false}', '>>>>>>> other', ''].join('\n'),
        'utf8',
      );
      try {
        await readStateJson(path, 'latest.json');
        expect.unreachable('devait lever SondageStateError');
      } catch (err) {
        expect(err).toBeInstanceOf(SondageStateError);
        const e = err as SondageStateError;
        expect(e.reason).toBe('conflict-markers');
        expect(e.path).toBe(path);
        expect(e.message).toMatch(/marqueurs de conflit git/);
        expect(e.message).toMatch(/Ne pas relancer la veille/);
        expect(e.message).toMatch(/git show origin\/Main:/);
        expect(e.message).toMatch(/refuse de repartir d'un état vide/);
      }
    });
  });

  it('JSON invalide → invalid-json', async () => {
    await withTempDir(async (dir) => {
      const path = join(dir, 'latest.json');
      await writeFile(path, '{pas du json', 'utf8');
      try {
        await readStateJson(path, 'latest.json');
        expect.unreachable('devait lever SondageStateError');
      } catch (err) {
        expect(err).toBeInstanceOf(SondageStateError);
        expect((err as SondageStateError).reason).toBe('invalid-json');
        expect((err as SondageStateError).path).toBe(path);
      }
    });
  });

  it('fichier illisible (dossier) → unreadable', async () => {
    await withTempDir(async (dir) => {
      try {
        await readStateJson(dir, 'latest.json');
        expect.unreachable('devait lever SondageStateError');
      } catch (err) {
        expect(err).toBeInstanceOf(SondageStateError);
        expect((err as SondageStateError).reason).toBe('unreadable');
        expect((err as SondageStateError).path).toBe(dir);
      }

      if (typeof process.getuid === 'function' && process.getuid() !== 0) {
        const locked = join(dir, 'locked.json');
        await writeFile(locked, '{"ok":true}\n', 'utf8');
        await chmod(locked, 0o000);
        try {
          await readStateJson(locked, 'locked.json');
          expect.unreachable('devait lever SondageStateError');
        } catch (err) {
          expect(err).toBeInstanceOf(SondageStateError);
          expect((err as SondageStateError).reason).toBe('unreadable');
        } finally {
          await chmod(locked, 0o644);
        }
      }
    });
  });

  it('JSON valide → objet', async () => {
    await withTempDir(async (dir) => {
      const path = join(dir, 'latest.json');
      await writeFile(path, '{"ok":true,"n":1}\n', 'utf8');
      await expect(readStateJson<{ ok: boolean; n: number }>(path, 'latest.json')).resolves.toEqual({
        ok: true,
        n: 1,
      });
    });
  });

  it('persistSnapshot registre en conflit → rejette et n’écrit rien', async () => {
    await withTempDir(async (dir) => {
      const latest = join(dir, 'latest.json');
      const waves = join(dir, 'waves-registry.json');
      const movements = join(dir, 'movements.jsonl');
      const candidats = join(dir, '2027-sondages-candidats.json');
      const latestBefore = '{"keep":"latest"}\n';
      const movementsBefore = '{"kind":"new_wave","comment":"existant"}\n';
      const registryConflict = [
        '<<<<<<< HEAD',
        '{"updated":"2026-10-19","waves":[]}',
        '=======',
        '{"updated":"2026-10-18","waves":[]}',
        '>>>>>>> other',
        '',
      ].join('\n');
      await writeFile(latest, latestBefore, 'utf8');
      await writeFile(movements, movementsBefore, 'utf8');
      await writeFile(waves, registryConflict, 'utf8');

      const snapshot: SondageVeilleSnapshot = {
        fetched_at: '2026-10-20T06:47:00.000Z',
        disclaimer: 'test',
        providers_indexed: 0,
        sources_ok: 0,
        sources_error: 0,
        waves: [],
        head_by_wave: [],
        movements: [
          {
            at: '2026-10-20T06:47:00.000Z',
            kind: 'new_wave',
            comment: 'ne doit pas être appendu',
          },
        ],
        brief: [],
        errors: [],
      };

      try {
        await persistSnapshot(snapshot, { latest, waves, movements, candidats });
        expect.unreachable('devait lever SondageStateError');
      } catch (err) {
        expect(err).toBeInstanceOf(SondageStateError);
        expect((err as SondageStateError).reason).toBe('conflict-markers');
        expect((err as SondageStateError).path).toBe(waves);
      }

      expect(await readFile(latest, 'utf8')).toBe(latestBefore);
      expect(await readFile(movements, 'utf8')).toBe(movementsBefore);
      expect(await readFile(waves, 'utf8')).toBe(registryConflict);
    });
  });

  it('persistSnapshot candidats en conflit → rejette et n’écrit rien', async () => {
    await withTempDir(async (dir) => {
      const latest = join(dir, 'latest.json');
      const waves = join(dir, 'waves-registry.json');
      const movements = join(dir, 'movements.jsonl');
      const candidats = join(dir, '2027-sondages-candidats.json');
      const latestBefore = '{"keep":"latest"}\n';
      const movementsBefore = '{"kind":"new_wave","comment":"existant"}\n';
      const registryBefore = '{"updated":"2026-10-19","waves":[]}\n';
      const candidatsConflict = [
        '<<<<<<< HEAD',
        '{"title":"a","updated":"2026-10-19","candidates":[]}',
        '=======',
        '{"title":"b","updated":"2026-10-18","candidates":[]}',
        '>>>>>>> other',
        '',
      ].join('\n');
      await writeFile(latest, latestBefore, 'utf8');
      await writeFile(movements, movementsBefore, 'utf8');
      await writeFile(waves, registryBefore, 'utf8');
      await writeFile(candidats, candidatsConflict, 'utf8');

      const snapshot: SondageVeilleSnapshot = {
        fetched_at: '2026-10-20T06:47:00.000Z',
        disclaimer: 'test',
        providers_indexed: 0,
        sources_ok: 0,
        sources_error: 0,
        waves: [],
        head_by_wave: [],
        movements: [
          {
            at: '2026-10-20T06:47:00.000Z',
            kind: 'new_wave',
            comment: 'ne doit pas être appendu',
          },
        ],
        brief: [],
        errors: [],
      };

      try {
        await persistSnapshot(snapshot, { latest, waves, movements, candidats });
        expect.unreachable('devait lever SondageStateError');
      } catch (err) {
        expect(err).toBeInstanceOf(SondageStateError);
        expect((err as SondageStateError).reason).toBe('conflict-markers');
        expect((err as SondageStateError).path).toBe(candidats);
      }

      expect(await readFile(latest, 'utf8')).toBe(latestBefore);
      expect(await readFile(movements, 'utf8')).toBe(movementsBefore);
      expect(await readFile(waves, 'utf8')).toBe(registryBefore);
      expect(await readFile(candidats, 'utf8')).toBe(candidatsConflict);
    });
  });
});
