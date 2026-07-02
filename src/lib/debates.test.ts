import { describe, expect, it } from 'vitest';
import voteUtilePluralite from '../data/debates/vote-utile-pluralite.json';
import desistementsSecondTour from '../data/debates/desistements-second-tour.json';
import {
  DEBATE_CATALOG,
  getDebate,
  getDebateSummary,
  getOpenDebates,
} from './debates';
import type { DebateDataset } from './debate-types';

const ALL_DEBATES = [voteUtilePluralite, desistementsSecondTour] as DebateDataset[];

function assertDebateShape(debate: DebateDataset) {
  expect(debate.positions.length).toBeGreaterThanOrEqual(2);
  for (const position of debate.positions) {
    expect(position.arguments.length).toBeGreaterThanOrEqual(1);
    for (const arg of position.arguments) {
      expect(arg.text.length).toBeGreaterThan(0);
      expect(arg.source.label.length).toBeGreaterThan(0);
      expect(arg.source.url.length).toBeGreaterThan(0);
    }
  }
  if (debate.status === 'ouvert') {
    expect(debate.discussion_id).toBeTruthy();
  }
}

describe('debates', () => {
  it('lists pilot debates with unique slugs', () => {
    expect(DEBATE_CATALOG.length).toBeGreaterThanOrEqual(2);
    const slugs = DEBATE_CATALOG.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain('vote-utile-pluralite');
    expect(slugs).toContain('desistements-second-tour');
  });

  it('resolves debate by slug', () => {
    expect(getDebateSummary('vote-utile-pluralite')?.href).toBe('/debats/vote-utile-pluralite');
    expect(getDebate('desistements-second-tour')?.question).toMatch(/désistements/i);
  });

  it('returns open debates', () => {
    const open = getOpenDebates();
    expect(open.length).toBeGreaterThanOrEqual(2);
    expect(open.every((d) => d.status === 'ouvert')).toBe(true);
  });

  it.each(ALL_DEBATES)('debate $slug has valid structure', (debate) => {
    assertDebateShape(debate);
    expect(debate.slug).toBe(debate.discussion_id);
  });

  it('vote utile debate links to distorsion analysis', () => {
    expect(voteUtilePluralite.related).toContain('/analyses/presidentielle-distorsion');
    expect(voteUtilePluralite.positions.length).toBeGreaterThanOrEqual(2);
  });

  it('desistements debate links to legislatives analysis', () => {
    expect(desistementsSecondTour.related).toContain('/analyses/legislatives-2024-desistements');
    expect(desistementsSecondTour.positions.some((p) => p.id === 'distorsion')).toBe(true);
  });
});
