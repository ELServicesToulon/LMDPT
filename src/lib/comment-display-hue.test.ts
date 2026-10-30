import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { FIRST_ROUND_HUES } from './comment-politics';
import {
  COMMENT_DISPLAY_CURRENT,
  COMMENT_DISPLAY_FALLBACK,
  displayCurrentForSlug,
} from './comment-display-hue';

function normalizeLex(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

describe('comment-display-hue — courants génériques (commentaires seulement)', () => {
  it('chaque slug de FIRST_ROUND_HUES a une entrée', () => {
    for (const hue of FIRST_ROUND_HUES) {
      expect(COMMENT_DISPLAY_CURRENT[hue.slug], hue.slug).toBeTruthy();
    }
  });

  it('aucun label affiché ne contient un nom de personne de names', () => {
    const names = FIRST_ROUND_HUES.flatMap((h) => h.names ?? []);
    for (const hue of FIRST_ROUND_HUES) {
      const label = displayCurrentForSlug(hue.slug);
      const normLabel = normalizeLex(label);
      for (const name of names) {
        const n = normalizeLex(name);
        if (n.length <= 3) {
          const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          expect(
            new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(normLabel),
            `${hue.slug} label « ${label} » contient « ${name} »`,
          ).toBe(false);
        } else {
          expect(normLabel.includes(n), `${hue.slug} label « ${label} » contient « ${name} »`).toBe(
            false,
          );
        }
      }
    }
  });

  it('slug inconnu → Pluraliste / transversal', () => {
    expect(displayCurrentForSlug('inconnu-fictif')).toBe(COMMENT_DISPLAY_FALLBACK);
    expect(displayCurrentForSlug(null)).toBe(COMMENT_DISPLAY_FALLBACK);
    expect(displayCurrentForSlug('')).toBe(COMMENT_DISPLAY_FALLBACK);
  });
});

describe('CitizenCommentModule — libellé public', () => {
  it('dit Tendance estimée du message, plus Couleur politique (transparence)', () => {
    const src = readFileSync(
      path.join(process.cwd(), 'src/components/CitizenCommentModule.astro'),
      'utf8',
    );
    expect(src).toContain('Tendance estimée du message :');
    expect(src).not.toContain('Couleur politique (transparence)');
  });
});
