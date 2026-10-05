import { describe, expect, it } from 'vitest';
import { withTrailingSlash } from './internal-path';

describe('withTrailingSlash', () => {
  it('ajoute la barre finale aux pages internes', () => {
    expect(withTrailingSlash('/sources')).toBe('/sources/');
    expect(withTrailingSlash('/sources#methodologie-blocs')).toBe('/sources/#methodologie-blocs');
    expect(withTrailingSlash('/analyses/programmes-comparateur?scrutin=2022')).toBe(
      '/analyses/programmes-comparateur/?scrutin=2022',
    );
  });

  it('laisse l’accueil, les fichiers, l’API et l’externe', () => {
    expect(withTrailingSlash('/')).toBe('/');
    expect(withTrailingSlash('/#visuels-2027')).toBe('/#visuels-2027');
    expect(withTrailingSlash('/favicon.svg')).toBe('/favicon.svg');
    expect(withTrailingSlash('/sitemap.xml')).toBe('/sitemap.xml');
    expect(withTrailingSlash('/api/auth/start/google?next=%2F')).toBe('/api/auth/start/google?next=%2F');
    expect(withTrailingSlash('https://www.data.gouv.fr')).toBe('https://www.data.gouv.fr');
    expect(withTrailingSlash('/sources/')).toBe('/sources/');
  });
});
