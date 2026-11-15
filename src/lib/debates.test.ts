import { describe, expect, it } from 'vitest';
import voteUtilePluralite from '../data/debates/vote-utile-pluralite.json';
import desistementsSecondTour from '../data/debates/desistements-second-tour.json';
import assembleePremierTour from '../data/debates/assemblee-premier-tour.json';
import {
  DEBATE_CATALOG,
  formatDebateOpenedLabel,
  getDebate,
  getDebateSummary,
  getOpenDebates,
} from './debates';
import { readFileSync } from 'node:fs';
import path from 'node:path';
import type { DebateDataset } from './debate-types';

const ALL_DEBATES = [voteUtilePluralite, desistementsSecondTour, assembleePremierTour] as DebateDataset[];

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
  it('each debate has its own cover path', () => {
    const srcs = DEBATE_CATALOG.map((d) => d.cover?.src);
    expect(srcs.every(Boolean)).toBe(true);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it('lists pilot debates with unique slugs', () => {
    expect(DEBATE_CATALOG.length).toBeGreaterThanOrEqual(3);
    const slugs = DEBATE_CATALOG.map((d) => d.slug);
    expect(new Set(slugs).size).toBe(slugs.length);
    expect(slugs).toContain('vote-utile-pluralite');
    expect(slugs).toContain('desistements-second-tour');
    expect(slugs).toContain('assemblee-premier-tour');
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

  it('assemblee premier tour debate links to simulation', () => {
    expect(assembleePremierTour.related).toContain('/analyses/assemblee-premier-tour');
    expect(assembleePremierTour.positions.length).toBeGreaterThanOrEqual(3);
  });
});

describe('debate list page copy', () => {
  const indexSrc = readFileSync(path.join(process.cwd(), 'src/pages/debats/index.astro'), 'utf8');

  it('uses an H2 for Fils ouverts and Loulou’s document title', () => {
    expect(indexSrc).toMatch(/<h2 class="section-title">Fils ouverts<\/h2>/);
    expect(indexSrc).toContain(
      'documentTitle="Débats ouverts sur le 1er tour et la présidentielle 2027 | LMDPT"',
    );
    expect(indexSrc).not.toMatch(/<h3 class="section-title">Fils ouverts<\/h3>/);
  });

  it('labels card dates with the opening date, never « Dernière activité » without a comment date', () => {
    expect(formatDebateOpenedLabel('2026-07-02')).toBe('Ouvert le 2 juillet 2026');
    expect(indexSrc).toContain('datePrefix="Ouvert le "');
    expect(indexSrc).not.toContain('Dernière activité');
    expect(indexSrc).not.toContain('debateActivityDate');
    expect(indexSrc).not.toContain('formatDebateActivityLabel');
  });
});
