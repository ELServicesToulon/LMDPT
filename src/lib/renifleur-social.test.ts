import { describe, expect, it } from 'vitest';
import type { RenifleurItem } from './renifleur';
import {
  buildPostCopy,
  buildRenifleurSocialDraft,
  ideaColorBadgesForItem,
  pickDraftItems,
  truncateForX,
} from './renifleur-social';

const sampleItem: RenifleurItem = {
  title: 'Présidentielle 2027 : calendrier officialisé',
  url: 'https://example.com/article',
  published: '2026-07-02',
  summary: 'Le premier tour aura lieu le 18 avril.',
  source_id: 'lemonde',
  source_label: 'Le Monde',
  source_type: 'traditional',
};

const attalItem: RenifleurItem = {
  ...sampleItem,
  title: 'Gabriel Attal présente sa réforme de l’école',
  summary: 'Le Premier ministre Renaissance défend le réarmement civique.',
  url: 'https://example.com/attal',
};

describe('renifleur-social', () => {
  it('truncates long copy for X', () => {
    const long = 'a'.repeat(300);
    expect(truncateForX(long).length).toBeLessThanOrEqual(280);
    expect(truncateForX(long).endsWith('…')).toBe(true);
  });

  it('builds post copy with site link and idea-color badge tag', () => {
    const copy = buildPostCopy(sampleItem, 'https://lmdpt.iarbre.org/test?utm_campaign=x');
    expect(copy).toContain('lmdpt.iarbre.org');
    expect(copy).toContain('#renifleur-presse');
    expect(copy).toMatch(/\[.+\]/); // badge label tag
    expect(copy.length).toBeLessThanOrEqual(280);
  });

  it('ideaColorBadgesForItem always returns ≥1 badge', () => {
    const badges = ideaColorBadgesForItem(attalItem);
    expect(badges.length).toBeGreaterThanOrEqual(1);
    expect(badges[0]!.color).toMatch(/^#/);
    expect(badges[0]!.slug).toBe('attal');
  });

  it('picks top N items', () => {
    const items = [sampleItem, { ...sampleItem, url: 'https://example.com/b' }];
    expect(pickDraftItems(items, 1)).toHaveLength(1);
    expect(pickDraftItems(items, 5)).toHaveLength(2);
  });

  it('generates markdown draft with gate', () => {
    const md = buildRenifleurSocialDraft({
      fetched_at: '2026-07-02T12:00:00.000Z',
      enabled: true,
      traditional_media: true,
      disclaimer: 'Sources secondaires.',
      feeds_ok: 3,
      feeds_error: 0,
      items: [sampleItem],
    });
    expect(md).toContain('Brouillon X auto');
    expect(md).toContain('draft');
    expect(md).toContain('Gate REVIEW');
    expect(md).toContain('Le Monde');
    expect(md).toContain('Gate qualité rédaction');
    expect(md).toContain('Qualité rédaction');
    expect(md).toContain('Couleurs d’idées');
    expect(md).toContain('Badge(s) couleurs d’idées');
    expect(md).toContain(
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic&utm_campaign=renifleur_20260702',
    );
    expect(md).not.toMatch(/https:\s\/\//);
    expect(md).not.toMatch(/\?\s+utm_/);
  });

  it('cleans glued words in post copy', () => {
    const copy = buildPostCopy(
      { ...sampleItem, title: 'Plus de placesdenprison demandées' },
      'https://lmdpt.iarbre.org/test',
    );
    expect(copy).toMatch(/places d'emprisonnement/i);
    expect(copy).not.toContain('placesdenprison');
  });
});
