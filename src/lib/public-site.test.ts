import { describe, expect, it } from 'vitest';
import {
  analysesRedirectStubCanonical,
  DEFAULT_PUBLIC_SITE,
  REDIRECT_STUB_HTML_PATHS,
} from './public-site';

describe('public site defaults', () => {
  it('defaults canonical public site to lemediadupremiertour.fr', () => {
    expect(DEFAULT_PUBLIC_SITE).toBe('https://lemediadupremiertour.fr');
  });

  it('sets absolute analyses index canonical for redirect stubs', () => {
    expect(analysesRedirectStubCanonical()).toBe('https://lemediadupremiertour.fr/analyses/');
  });

  it('covers the three retired analysis redirect stubs', () => {
    expect(REDIRECT_STUB_HTML_PATHS).toEqual([
      'analyses/livres-candidats/index.html',
      'analyses/quatremer-marianne/index.html',
      'analyses/on-a-vole-la-revolution-puis-la-revolte/index.html',
    ]);
  });
});
