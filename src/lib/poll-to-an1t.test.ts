import { describe, expect, it } from 'vitest';
import {
  aggregateScoresToBlocShares,
  buildPollAn1tBundle,
  buildWaveAn1tBundles,
  findWaveForInstitute,
  isIntentionsVoteWave,
  pickPrimaryWaveScores,
  slugToAn1tBloc,
} from './poll-to-an1t';
import type { PollSondagesFile } from './poll-to-an1t';
import sondages from '../data/elections/2027-sondages-candidats.json';
import { pageMeta } from './seo';

describe('poll-to-an1t', () => {
  it('maps candidate slugs to AN1T blocs', () => {
    expect(slugToAn1tBloc('le-pen')).toBe('rn');
    expect(slugToAn1tBloc('melenchon')).toBe('nfp');
    expect(slugToAn1tBloc('philippe')).toBe('ensemble');
    expect(slugToAn1tBloc('retailleau')).toBe('lr');
  });

  it('aggregates Elabe-like scores without double-counting Bardella+Le Pen', () => {
    const shares = aggregateScoresToBlocShares({
      'le-pen': 35,
      bardella: 34,
      philippe: 16.5,
      melenchon: 16,
      glucksmann: 10.5,
      retailleau: 8,
      tondelier: 3.5,
      zemmour: 3,
    });
    const rn = shares.find((s) => s.id === 'rn');
    // bardella ignored when le-pen present; zemmour counts in rn
    expect(rn?.pct).toBeGreaterThan(35);
    expect(rn?.pct).toBeLessThan(50);
    const sum = shares.reduce((a, s) => a + s.pct, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101.5);
  });

  it('picks primary wave from live sondages file', () => {
    const { scores, label } = pickPrimaryWaveScores(sondages);
    expect(Object.keys(scores).length).toBeGreaterThanOrEqual(5);
    expect(label.length).toBeGreaterThan(3);
    expect(scores['le-pen'] ?? scores.bardella).toBeGreaterThan(30);
  });

  it('builds seat allocations that sum to 577', () => {
    const bundle = buildPollAn1tBundle(sondages, 577, 3);
    const seats = bundle.baseAlloc.reduce((s, a) => s + a.seats, 0);
    expect(seats).toBe(577);
    expect(bundle.baseShares.length).toBe(5);
    expect(bundle.diviseeAlloc.length).toBeGreaterThanOrEqual(5);
  });

  it('treats scored waves without metric as intentions de vote', () => {
    expect(
      isIntentionsVoteWave({
        firm: 'Elabe',
        scores: { 'le-pen': 35, philippe: 16, melenchon: 16, glucksmann: 10 },
      }),
    ).toBe(true);
  });

  it('skips souhait_victoire and baromètre even with scores', () => {
    expect(
      isIntentionsVoteWave({
        firm: 'Cluster17',
        metric: 'souhait_victoire',
        scores: { 'le-pen': 40, melenchon: 20, philippe: 15, glucksmann: 10 },
      }),
    ).toBe(false);
    expect(
      isIntentionsVoteWave({
        firm: 'YouGov',
        metric: 'barometre',
        scores: { 'le-pen': 30, philippe: 20, melenchon: 15, glucksmann: 10 },
      }),
    ).toBe(false);
  });

  it('buildWaveAn1tBundles allocates 577 per IV wave and skips hors-IV', () => {
    const mixed: PollSondagesFile = {
      waves_latest: [
        ...(sondages.waves_latest ?? []),
        {
          firm: 'Cluster17',
          fieldwork: '2026-07-10/11',
          metric: 'souhait_victoire',
          scores: { 'le-pen': 40, melenchon: 22, philippe: 12, glucksmann: 8 },
        },
        {
          firm: 'Ipsos-BVA',
          metric: 'barometre',
          scores: { 'le-pen': 33, philippe: 18, melenchon: 14, glucksmann: 9 },
        },
        { firm: 'EmptyCo', fieldwork: '2026-08-01' },
      ],
      candidates: sondages.candidates,
    };
    const { included, skipped } = buildWaveAn1tBundles(mixed, 577, 3);
    expect(included.length).toBe((sondages.waves_latest ?? []).length);
    for (const wave of included) {
      expect(wave.alloc.reduce((s, a) => s + a.seats, 0)).toBe(577);
      expect(wave.hemiRows.reduce((s, a) => s + a.seats, 0)).toBe(577);
      expect(wave.metric).toBe('intentions_vote');
    }
    expect(skipped.map((s) => s.firm)).toEqual(
      expect.arrayContaining(['Cluster17', 'Ipsos-BVA', 'EmptyCo']),
    );
    expect(skipped.find((s) => s.firm === 'Cluster17')?.reason).toBe('not_iv');
    expect(skipped.find((s) => s.firm === 'Ipsos-BVA')?.reason).toBe('not_iv');
    expect(skipped.find((s) => s.firm === 'EmptyCo')?.reason).toBe('no_scores');
  });

  it('matches institute labels to IV waves', () => {
    const { included } = buildWaveAn1tBundles(sondages, 577, 3);
    expect(findWaveForInstitute('Elabe', included)?.firm).toBe('Elabe');
    expect(findWaveForInstitute('Harris', included)?.firm).toMatch(/Harris/i);
    expect(findWaveForInstitute('Cluster17', included)).toBeUndefined();
  });
});

describe('assemblee-sondages page SEO', () => {
  it('pageMeta is indexable with pedagogy keywords', () => {
    const meta = pageMeta({
      title: 'Assemblée des sondages',
      description:
        'Hémicycle pédagogique 577 sièges à partir d’intentions de vote (Sainte-Laguë). Illustration, pas une prédiction ni un classement de favoris.',
      siteUrl: 'https://lmdpt.iarbre.org',
      pathname: '/assemblee-sondages',
      type: 'website',
      keywords: 'assemblée sondages, hémicycle, intentions de vote, Sainte-Laguë, LMDPT, pluralité',
    });
    expect(meta.canonical).toBe('https://lmdpt.iarbre.org/assemblee-sondages/');
    expect(meta.robots).toContain('index');
    expect(meta.fullTitle).toContain('Assemblée des sondages');
    expect(meta.description.toLowerCase()).toMatch(/pédagog|illustration|prédiction|intention/);
    expect(meta.keywords.toLowerCase()).toMatch(/sondage|hémicycle|pluralité/);
  });
});


describe('poll-to-an1t', () => {
  it('maps candidate slugs to AN1T blocs', () => {
    expect(slugToAn1tBloc('le-pen')).toBe('rn');
    expect(slugToAn1tBloc('melenchon')).toBe('nfp');
    expect(slugToAn1tBloc('philippe')).toBe('ensemble');
    expect(slugToAn1tBloc('retailleau')).toBe('lr');
  });

  it('aggregates Elabe-like scores without double-counting Bardella+Le Pen', () => {
    const shares = aggregateScoresToBlocShares({
      'le-pen': 35,
      bardella: 34,
      philippe: 16.5,
      melenchon: 16,
      glucksmann: 10.5,
      retailleau: 8,
      tondelier: 3.5,
      zemmour: 3,
    });
    const rn = shares.find((s) => s.id === 'rn');
    // bardella ignored when le-pen present; zemmour counts in rn
    expect(rn?.pct).toBeGreaterThan(35);
    expect(rn?.pct).toBeLessThan(50);
    const sum = shares.reduce((a, s) => a + s.pct, 0);
    expect(sum).toBeGreaterThan(99);
    expect(sum).toBeLessThan(101.5);
  });

  it('picks primary wave from live sondages file', () => {
    const { scores, label } = pickPrimaryWaveScores(sondages);
    expect(Object.keys(scores).length).toBeGreaterThanOrEqual(5);
    expect(label.length).toBeGreaterThan(3);
    expect(scores['le-pen'] ?? scores.bardella).toBeGreaterThan(30);
  });

  it('builds seat allocations that sum to 577', () => {
    const bundle = buildPollAn1tBundle(sondages, 577, 3);
    const seats = bundle.baseAlloc.reduce((s, a) => s + a.seats, 0);
    expect(seats).toBe(577);
    expect(bundle.baseShares.length).toBe(5);
    expect(bundle.diviseeAlloc.length).toBeGreaterThanOrEqual(5);
  });
});
