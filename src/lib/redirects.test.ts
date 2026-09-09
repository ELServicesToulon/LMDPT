import { describe, expect, it } from 'vitest';
import config from '../../astro.config.mjs';

describe('legacy analysis redirects', () => {
  it('permanently redirects retired GSC 404 slugs to /analyses/', () => {
    const redirects = config.redirects ?? {};
    const expected = { status: 301, destination: '/analyses/' };

    expect(redirects['/analyses/quatremer-marianne']).toEqual(expected);
    expect(redirects['/analyses/livres-candidats']).toEqual(expected);
  });
});
