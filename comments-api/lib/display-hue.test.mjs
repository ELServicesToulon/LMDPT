/**
 * Tests teinte d’affichage — texte seul, déterministe, sans état.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { FIRST_ROUND_HUES } from '../../src/lib/comment-politics.ts';
import {
  COMMENT_DISPLAY_CURRENT,
  displayCurrentForSlug,
} from '../../src/lib/comment-display-hue.ts';
import { displayHueForText, displayRationale } from './display-hue.mjs';

function normalizeLex(text) {
  return String(text)
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

describe('displayHueForText', () => {
  it('renvoie slug, label et color à partir du texte', () => {
    const hue = displayHueForText('Mélenchon propose le SMIC à 1600');
    assert.equal(hue.slug, 'melenchon');
    assert.equal(hue.label, 'Gauche radicale');
    assert.match(hue.color, /^#/);
  });

  it('est déterministe', () => {
    const text = 'Gabriel Attal réforme l’école';
    assert.deepEqual(displayHueForText(text), displayHueForText(text));
  });

  it('tombe sur pluraliste si le texte est neutre ou vide', () => {
    assert.equal(displayHueForText('').slug, 'pluraliste');
    assert.equal(displayHueForText('').label, 'Pluraliste / transversal');
    assert.equal(displayHueForText('calendrier électoral technique').slug, 'pluraliste');
    assert.equal(displayHueForText(null).slug, 'pluraliste');
  });

  it('n’expose ni confidence ni rationale', () => {
    const hue = displayHueForText('Marine Le Pen parle de frontières');
    assert.equal('confidence' in hue, false);
    assert.equal('rationale' in hue, false);
    assert.deepEqual(Object.keys(hue).sort(), ['color', 'label', 'slug']);
  });

  it('chaque slug FIRST_ROUND_HUES a un courant générique sans nom de personne', () => {
    const names = FIRST_ROUND_HUES.flatMap((h) => h.names ?? []);
    for (const hue of FIRST_ROUND_HUES) {
      assert.ok(COMMENT_DISPLAY_CURRENT[hue.slug], hue.slug);
      const label = displayCurrentForSlug(hue.slug);
      const normLabel = normalizeLex(label);
      for (const name of names) {
        const n = normalizeLex(name);
        if (n.length <= 3) {
          const escaped = n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
          assert.equal(
            new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`).test(normLabel),
            false,
            `${hue.slug} « ${label} » contient « ${name} »`,
          );
        } else {
          assert.equal(
            normLabel.includes(n),
            false,
            `${hue.slug} « ${label} » contient « ${name} »`,
          );
        }
      }
    }
  });
});

describe('displayRationale', () => {
  it('ne cite aucun nom de personne de names', () => {
    const rationale = normalizeLex(displayRationale());
    for (const name of FIRST_ROUND_HUES.flatMap((h) => h.names ?? [])) {
      const n = normalizeLex(name);
      if (n.length <= 3) continue;
      assert.equal(rationale.includes(n), false, `rationale contient « ${name} »`);
    }
  });
});
