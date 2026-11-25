import { describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs';

describe('legacy analysis redirects', () => {
  it('permanently redirects retired GSC 404 slugs to /analyses/', () => {
    const redirects = config.redirects ?? {};
    const expected = { status: 301, destination: '/analyses/' };

    expect(redirects['/analyses/quatremer-marianne']).toEqual(expected);
    expect(redirects['/analyses/livres-candidats']).toEqual(expected);
    expect(redirects['/analyses/on-a-vole-la-revolution-puis-la-revolte']).toEqual(expected);
  });

  it('permanently redirects the renamed vote-à-16-ans slug to the new URL', () => {
    const redirects = config.redirects ?? {};
    expect(redirects['/analyses/voter-a-16-ans-l-urne-plutot-que-le-blocus']).toEqual({
      status: 301,
      destination: '/analyses/voter-a-16-ans-une-loi-suffirait-elle',
    });
  });
});
