import { describe, expect, it } from 'vitest';
import { ECOSYSTEM_LINKS, IARBRE_HUB, getPublicEcosystemLinks } from './ecosystem';

describe('iarbre hub backlink', () => {
  it('uses a short French label and an absolute hub URL', () => {
    expect(IARBRE_HUB.label).toBe('Hub iarbre');
    expect(IARBRE_HUB.url).toBe('https://iarbre.org/hub');
    expect(IARBRE_HUB.url.startsWith('https://')).toBe(true);
  });

  it('stays distinct from the existing IArbre 2084 homepage tool link', () => {
    const homepage = ECOSYSTEM_LINKS.find((link) => link.id === 'iarbre');
    expect(homepage).toBeDefined();
    expect(IARBRE_HUB.url).not.toBe(homepage?.url);
    expect(getPublicEcosystemLinks().some((link) => link.id === 'hub')).toBe(false);
  });
});
