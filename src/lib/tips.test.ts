import { describe, expect, it } from 'vitest';
import { isHttpUrl, isTipType, tipBodyOk, tipSourceOk, tipTitleOk } from './tips';

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

  it('exige une URL http(s) pour une alerte, pas pour une suggestion', () => {
    expect(tipSourceOk('alerte', '')).toBe(false);
    expect(tipSourceOk('alerte', '   ')).toBe(false);
    expect(tipSourceOk('alerte', 'https://www.senat.fr/dossier/ppl.html')).toBe(true);
    expect(tipSourceOk('alerte', 'http://www.assemblee-nationale.fr/')).toBe(true);
    expect(tipSourceOk('suggestion', '')).toBe(true);
    expect(tipSourceOk('suggestion', 'https://www.senat.fr/dossier/ppl.html')).toBe(true);
  });

  it('refuse une URL non http(s)', () => {
    expect(isHttpUrl('javascript:alert(1)')).toBe(false);
    expect(isHttpUrl('ftp://example.fr/doc')).toBe(false);
    expect(tipSourceOk('alerte', 'javascript:alert(1)')).toBe(false);
    expect(tipSourceOk('suggestion', 'ftp://example.fr/doc')).toBe(false);
  });
});
