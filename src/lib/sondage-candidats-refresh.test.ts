import { describe, expect, it } from 'vitest';
import {
  generatedTextHasPredictionClaim,
  isPlausibleIntentionsWave,
  parseWaveSortDate,
  rebuildCandidatsFromWaves,
  selectWavesLatest,
  uniquePlausibleIntentionsWaves,
  type CandidatsFile,
} from './sondage-candidats-refresh';
import { seedKnownWaves, type DetectedWave } from './sondage-veille';

function wave(partial: Partial<DetectedWave> & Pick<DetectedWave, 'id'>): DetectedWave {
  return {
    firm: 'Elabe',
    firm_id: 'elabe',
    fieldwork: '2026-07-09/12',
    published_hint: '2026-07-12',
    source_url: 'https://example.com',
    source_id: 'manual',
    scores: {},
    raw_snippet: '',
    metric: 'intentions_vote',
    ...partial,
  };
}

const BASE_FILE: CandidatsFile = {
  title: 'Intentions de vote — Présidentielle 2027 (1er tour)',
  updated: '2026-07-17',
  disclaimer:
    "Agrégats pédagogiques d'intentions de vote. Ce ne sont ni des résultats officiels ni des prédictions.",
  method: 'manuel',
  sources: [],
  notes: [],
  waves_latest: [
    { firm: 'Elabe', fieldwork: '2026-07-09/12', n: 1503, hypothesis: 'hyp.1', scores: {} },
  ],
  candidates: [
    {
      slug: 'le-pen',
      name: 'Marine Le Pen',
      affiliation: 'RN',
      bloc: 'rn',
      status: 'candidature_declaree',
      avg_pct: 34.5,
      latest_pct: 35.5,
      latest_range: '34–37 %',
      latest_source: 'ancien',
      note: 'Candidature 7 juil.',
    },
    {
      slug: 'bardella',
      name: 'Jordan Bardella',
      affiliation: 'RN',
      bloc: 'rn',
      status: 'designe_parti_substitution',
      avg_pct: 34.5,
      latest_pct: null,
      latest_range: '33–37 % (vagues mai–juin 2026)',
      latest_source: 'historique',
      note: 'Substitution RN',
    },
    {
      slug: 'philippe',
      name: 'Édouard Philippe',
      affiliation: 'Horizons',
      bloc: 'centre-droit',
      avg_pct: 17.5,
      latest_pct: 16.5,
      note: null,
    },
  ],
};

describe('sondage-candidats-refresh', () => {
  it('parses ISO ranges and French fieldwork dates', () => {
    expect(parseWaveSortDate('2026-07-09/12')).toBe('2026-07-12');
    expect(parseWaveSortDate('12/07/2026')).toBe('2026-07-12');
    expect(parseWaveSortDate('8–10 juillet 2026')).toBe('2026-07-10');
    expect(parseWaveSortDate('14 juillet')).toBe('2026-07-14');
  });

  it('rejects souhait_victoire and mixed-hypothesis extracts for averages', () => {
    expect(
      isPlausibleIntentionsWave(
        wave({
          id: 'sv',
          metric: 'souhait_victoire',
          scores: { 'le-pen': 35, philippe: 16, melenchon: 15 },
        }),
      ),
    ).toBe(false);
    expect(
      isPlausibleIntentionsWave(
        wave({
          id: 'mixed',
          scores: {
            'le-pen': 35,
            philippe: 18,
            attal: 15.5,
            melenchon: 16,
            hollande: 8,
            ruffin: 6,
            glucksmann: 11,
            retailleau: 8,
          },
        }),
      ),
    ).toBe(false);
    expect(
      isPlausibleIntentionsWave(
        wave({
          id: 'ok',
          scores: { 'le-pen': 35, philippe: 16.5, melenchon: 16, glucksmann: 10.5, retailleau: 8 },
        }),
      ),
    ).toBe(true);
  });

  it('rebuilds latest_pct from IV waves and leaves substitution candidates untouched', () => {
    const waves = seedKnownWaves();
    const next = rebuildCandidatsFromWaves(BASE_FILE, waves, '2026-09-15T18:00:00.000Z');
    expect(next.updated).toBe('2026-09-15');
    const mlp = next.candidates.find((c) => c.slug === 'le-pen');
    expect(mlp?.latest_pct).toBe(35.6);
    expect(mlp?.avg_pct).toBe(35.6);
    expect(mlp?.note).toBe('Candidature 7 juil.');
    const jb = next.candidates.find((c) => c.slug === 'bardella');
    expect(jb?.avg_pct).toBe(34.5);
    expect(jb?.latest_pct).toBeNull();
    expect(jb?.latest_source).toBe('historique');
    expect(next.waves_latest.length).toBe(5);
    expect(next.waves_latest.some((w) => w.firm === 'Elabe' && w.n === 1503)).toBe(true);
    const ifop = next.waves_latest.find((w) => /ifop/i.test(w.firm));
    expect(ifop?.hypothesis).toMatch(/Philippe/);
    expect(ifop?.hypothesis).not.toMatch(/sans Philippe/);
    expect(next.sources.some((s) => s.metric === 'souhait_victoire')).toBe(true);
  });

  it('is idempotent for the same waves and fetchedAt', () => {
    const waves = seedKnownWaves();
    const a = rebuildCandidatsFromWaves(BASE_FILE, waves, '2026-09-15T18:00:00.000Z');
    const b = rebuildCandidatsFromWaves(a, waves, '2026-09-15T18:00:00.000Z');
    expect(b).toEqual(a);
  });

  it('does not put prediction claims in generated method or disclaimer', () => {
    const next = rebuildCandidatsFromWaves(
      BASE_FILE,
      seedKnownWaves(),
      '2026-09-15T12:00:00.000Z',
    );
    expect(generatedTextHasPredictionClaim(next.method)).toBe(false);
    expect(generatedTextHasPredictionClaim(next.disclaimer)).toBe(false);
    expect(next.method).toMatch(/pas une prédiction/i);
    expect(next.disclaimer).toMatch(/ni des prédictions/i);
  });

  it('prefers one wave per firm and ignores empty commission notices', () => {
    const waves: DetectedWave[] = [
      ...seedKnownWaves(),
      wave({
        id: 'epoc-mixed',
        source_id: 'epoc',
        scores: {
          'le-pen': 34.5,
          philippe: 18,
          attal: 15.5,
          melenchon: 15,
          hollande: 8,
          ruffin: 6,
        },
      }),
      wave({
        id: 'commission-elabe',
        source_id: 'commission-sondages',
        fieldwork: '14 juillet',
        scores: {},
      }),
    ];
    const unique = uniquePlausibleIntentionsWaves(waves);
    expect(unique.every((w) => w.id !== 'epoc-mixed')).toBe(true);
    const latest = selectWavesLatest(waves);
    expect(latest.filter((w) => w.firm_id === 'elabe')).toHaveLength(1);
    expect(latest.every((w) => Object.keys(w.scores).length >= 3)).toBe(true);
  });

  it('keeps previous scores when the scan has no scorable IV wave', () => {
    const empty = rebuildCandidatsFromWaves(
      BASE_FILE,
      [
        wave({
          id: 'notice',
          scores: {},
          fieldwork: '23 juillet',
          source_id: 'commission-sondages',
        }),
      ],
      '2026-09-15T08:00:00.000Z',
    );
    expect(empty.updated).toBe('2026-09-15');
    expect(empty.candidates.find((c) => c.slug === 'le-pen')?.latest_pct).toBe(35.5);
    expect(empty.waves_latest).toHaveLength(0);
    expect(empty.method).toMatch(/aucune vague/i);
  });
});
