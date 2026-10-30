/**
 * Tests teinte d’affichage — texte seul, déterministe, sans état.
 */
import { describe, it } from 'node:test';
import assert from 'node:assert/strict';
import { displayHueForText } from './display-hue.mjs';

describe('displayHueForText', () => {
  it('renvoie slug, label et color à partir du texte', () => {
    const hue = displayHueForText('Mélenchon propose le SMIC à 1600');
    assert.equal(hue.slug, 'melenchon');
    assert.equal(typeof hue.label, 'string');
    assert.ok(hue.label.length > 0);
    assert.match(hue.color, /^#/);
  });

  it('est déterministe', () => {
    const text = 'Gabriel Attal réforme l’école';
    assert.deepEqual(displayHueForText(text), displayHueForText(text));
  });

  it('tombe sur pluraliste si le texte est neutre ou vide', () => {
    assert.equal(displayHueForText('').slug, 'pluraliste');
    assert.equal(displayHueForText('calendrier électoral technique').slug, 'pluraliste');
    assert.equal(displayHueForText(null).slug, 'pluraliste');
  });

  it('n’expose ni confidence ni rationale', () => {
    const hue = displayHueForText('Marine Le Pen parle de frontières');
    assert.equal('confidence' in hue, false);
    assert.equal('rationale' in hue, false);
    assert.deepEqual(Object.keys(hue).sort(), ['color', 'label', 'slug']);
  });
});
