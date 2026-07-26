import { describe, expect, it } from 'vitest';
import { isTipType, tipBodyOk, tipTitleOk } from './tips';

describe('tips helpers', () => {
  it('accepte suggestion et alerte', () => {
    expect(isTipType('suggestion')).toBe(true);
    expect(isTipType('alerte')).toBe(true);
    expect(isTipType('spam')).toBe(false);
  });

  it('exige titres et corps minimaux', () => {
    expect(tipTitleOk('abcd')).toBe(false);
    expect(tipTitleOk('Alerte PPL')).toBe(true);
    expect(tipBodyOk('trop court')).toBe(false);
    expect(tipBodyOk('Un signalement sourcé avec assez de contexte pour la rédaction.')).toBe(true);
  });
});
