import { describe, expect, it } from 'vitest';
import type { RenifleurItem } from './renifleur';
import {
  articleMentionsCandidate,
  filterProgramNewsItems,
  findPressSignalsForCandidates,
  matchesProgramNews,
} from './programme-veille';

const item = (title: string, summary = ''): RenifleurItem => ({
  title,
  url: `https://example.com/${title.slice(0, 8)}`,
  published: '2026-07-02',
  summary,
  source_id: 'test',
  source_label: 'Test',
  source_type: 'traditional',
});

describe('programme-veille', () => {
  it('detects programme keywords', () => {
    expect(matchesProgramNews('Son programme pour 2027')).toBe(true);
    expect(matchesProgramNews('Canicule en France')).toBe(false);
  });

  it('filters program news from renifleur items', () => {
    const items = [
      item('Gabriel Attal détaille ses propositions'),
      item('Météo : pluie'),
    ];
    expect(filterProgramNewsItems(items)).toHaveLength(1);
  });

  it('matches candidate by last name', () => {
    expect(
      articleMentionsCandidate(item('Attal veut réformer la fonction publique'), { slug: 'attal', name: 'Gabriel Attal' }),
    ).toBe(true);
    expect(
      articleMentionsCandidate(item('Budget 2027'), { slug: 'attal', name: 'Gabriel Attal' }),
    ).toBe(false);
  });

  it('does not match substring last names (Brun vs Bruno)', () => {
    expect(
      articleMentionsCandidate(item('Bruno Retailleau en campagne'), { slug: 'philippe-brun', name: 'Philippe Brun' }),
    ).toBe(false);
    expect(
      articleMentionsCandidate(item('Philippe Brun annonce sa candidature'), { slug: 'philippe-brun', name: 'Philippe Brun' }),
    ).toBe(true);
  });

  it('builds press signals per candidate', () => {
    const items = [
      item('Attal présente son programme économique', 'propositions'),
      item('Retailleau en campagne', 'programme LR'),
    ];
    const candidates = [
      { slug: 'attal', name: 'Gabriel Attal' },
      { slug: 'retailleau', name: 'Bruno Retailleau' },
    ];
    const map = findPressSignalsForCandidates(items, candidates, { detectedAt: '2026-07-02' });
    expect(map.get('attal')).toHaveLength(1);
    expect(map.get('retailleau')).toHaveLength(1);
  });
});
