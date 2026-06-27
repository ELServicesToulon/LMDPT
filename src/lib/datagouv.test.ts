import { describe, expect, it, vi } from 'vitest';
import { createDataGouvClient } from './datagouv';
import { catalogCacheKey } from './datasets-map';

describe('catalogCacheKey', () => {
  it('normalise les requêtes accentuées', () => {
    expect(catalogCacheKey('élection présidentielle')).toBe('catalog-election-presidentielle');
  });
});

describe('createDataGouvClient', () => {
  it('parse une recherche catalogue JSON-LD', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        '@graph': [
          {
            '@type': 'Dataset',
            title: 'Résultats élection',
            description: 'Tour 1',
            distribution: [
              'https://www.data.gouv.fr/datasets/5369937da3a729239d2041e6?resource_id=abc',
            ],
            landingPage: { '@id': 'https://www.data.gouv.fr/fr/datasets/resultats/' },
          },
        ],
      }),
    });

    const client = createDataGouvClient({ fetchImpl, minDelayMs: 0 });
    const result = await client.searchCatalog('élection');

    expect(result.query).toBe('élection');
    expect(result.hits).toHaveLength(1);
    expect(result.hits[0]?.id).toBe('5369937da3a729239d2041e6');
    expect(result.hits[0]?.title).toBe('Résultats élection');
  });

  it('retente sur erreur 503', async () => {
    const fetchImpl = vi
      .fn()
      .mockResolvedValueOnce({ ok: false, status: 503, statusText: 'Service Unavailable' })
      .mockResolvedValueOnce({
        ok: true,
        json: async () => ({ data: [] }),
      });

    const client = createDataGouvClient({ fetchImpl, minDelayMs: 0 });
    const result = await client.searchCatalog('test');

    expect(fetchImpl).toHaveBeenCalledTimes(2);
    expect(result.hits).toEqual([]);
  });

  it('extrait les ressources d’un dataset', async () => {
    const fetchImpl = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({
        id: 'ds1',
        title: 'Jeux électoral',
        slug: 'jeux-electoral',
        page: 'https://www.data.gouv.fr/fr/datasets/jeux-electoral/',
        resources: [
          { id: 'r1', title: 'CSV', url: 'https://example.com/data.csv', format: 'csv' },
        ],
        organization: { name: 'INSEE' },
        license: { title: 'Licence Ouverte' },
      }),
    });

    const client = createDataGouvClient({ fetchImpl, minDelayMs: 0 });
    const dataset = await client.getDataset('ds1');

    expect(dataset.title).toBe('Jeux électoral');
    expect(dataset.resources).toHaveLength(1);
    expect(dataset.resources[0]?.format).toBe('csv');
    expect(dataset.organization).toBe('INSEE');
  });
});
