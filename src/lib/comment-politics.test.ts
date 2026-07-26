import { describe, expect, it } from 'vitest';
import {
  hueBadgesForPublication,
  hueBadgesForText,
  hueFromCandidateSlug,
  resolvePoliticalHue,
  resolvePoliticalHues,
} from './comment-politics';

describe('comment-politics — badges couleurs d’idées', () => {
  it('hueFromCandidateSlug maps 2027 + historiques', () => {
    expect(hueFromCandidateSlug('attal').color).toBe('#ffeb00');
    expect(hueFromCandidateSlug('macron').slug).toBe('attal');
    expect(hueFromCandidateSlug('le-pen').color).toBe('#0d378a');
    expect(hueFromCandidateSlug('melenchon').color).toBe('#cc2443');
    expect(hueFromCandidateSlug('jadot').slug).toBe('ecolo');
    expect(hueFromCandidateSlug('hamon').slug).toBe('parti-socialiste');
  });

  it('hueFromCandidateSlug always returns a badge (fallback pluraliste)', () => {
    const h = hueFromCandidateSlug('');
    expect(h.slug).toBe('pluraliste');
    expect(h.color).toMatch(/^#/);
  });

  it('resolvePoliticalHues returns multiple badges when multi-camp', () => {
    const hues = resolvePoliticalHues(
      'Gabriel Attal et Marine Le Pen s’affrontent sur l’immigration et l’école',
    );
    expect(hues.length).toBeGreaterThanOrEqual(2);
    const colors = new Set(hues.map((h) => h.color.toLowerCase()));
    expect(colors.size).toBe(hues.length);
  });

  it('resolvePoliticalHue keeps pluraliste primary on multi-camp (compat)', () => {
    const primary = resolvePoliticalHue(
      'Gabriel Attal et Marine Le Pen s’affrontent sur l’immigration et l’école',
    );
    expect(primary.slug).toBe('pluraliste');
  });

  it('hueBadgesForPublication prioritizes candidate slug', () => {
    const badges = hueBadgesForPublication({
      candidateSlug: 'bardella',
      text: 'Gabriel Attal réforme l’école',
    });
    expect(badges).toHaveLength(1);
    expect(badges[0]!.slug).toBe('bardella');
  });

  it('hueBadgesForPublication falls back to text then pluraliste', () => {
    const fromText = hueBadgesForPublication({ text: 'Mélenchon propose le SMIC à 1600' });
    expect(fromText[0]!.slug).toBe('melenchon');
    const empty = hueBadgesForPublication({});
    expect(empty[0]!.slug).toBe('pluraliste');
  });

  it('hueBadgesForText always returns at least one badge', () => {
    expect(hueBadgesForText('calendrier électoral technique').length).toBeGreaterThanOrEqual(1);
  });
});
