import { describe, expect, it } from 'vitest';
import raw from '../data/scoop/curated.json';
import { shouldShowScoop, validateScoopCurated, type ScoopCurated } from './scoop';

const data = raw as ScoopCurated;

describe('scoop curated', () => {
  it('valide le JSON de production', () => {
    expect(validateScoopCurated(data)).toEqual([]);
  });

  it('affiche quand active + titre + url', () => {
    expect(shouldShowScoop(data)).toBe(true);
  });

  it('masque si inactive', () => {
    expect(shouldShowScoop({ ...data, active: false })).toBe(false);
  });
});
