import { describe, expect, it } from 'vitest';
import { resolveParcoursOpen } from './parcours';

describe('resolveParcoursOpen', () => {
  it('replie par défaut sur mobile et sur ordinateur', () => {
    expect(resolveParcoursOpen(null, false)).toBe(false);
    expect(resolveParcoursOpen(null, true)).toBe(false);
  });

  it('respecte le choix enregistré', () => {
    expect(resolveParcoursOpen('1', false)).toBe(true);
    expect(resolveParcoursOpen('0', true)).toBe(false);
  });
});
