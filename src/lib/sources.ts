import { readManifest } from './cache';
import { dataGouv } from './datagouv';
import { ELECTION_CATALOG_QUERIES } from './datasets-map';
import type { CatalogHit, DataGouvDataset, SourcesManifest } from './types';

const MAX_DATASETS_TO_FETCH = 8;
const DATA_GOUV_ID = /^[a-f0-9]{24}$/i;

function isDataGouvDatasetId(id: string): boolean {
  return DATA_GOUV_ID.test(id);
}

function mergeCatalogHits(catalogHits: CatalogHit[], datasetHits: CatalogHit[]): CatalogHit[] {
  const seen = new Set<string>();
  const merged: CatalogHit[] = [];

  for (const hit of [...catalogHits, ...datasetHits]) {
    const key = isDataGouvDatasetId(hit.id) ? hit.id : hit.page;
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(hit);
  }

  return merged;
}

async function buildManifestLive(): Promise<SourcesManifest> {
  const catalogSearches = [];
  const datasetIds = new Set<string>();
  const datasets: DataGouvDataset[] = [];

  for (const query of ELECTION_CATALOG_QUERIES) {
    const [catalog, datasetList] = await Promise.all([
      dataGouv.searchCatalog(query, 8),
      dataGouv.searchDatasets(query, 6),
    ]);
    const hits = mergeCatalogHits(catalog.hits, datasetList);
    catalogSearches.push({ ...catalog, hits });
    for (const hit of hits) {
      if (isDataGouvDatasetId(hit.id)) {
        datasetIds.add(hit.id);
      }
    }
  }

  for (const id of [...datasetIds].slice(0, MAX_DATASETS_TO_FETCH)) {
    try {
      datasets.push(await dataGouv.getDataset(id));
    } catch {
      // Dataset indisponible — on continue avec les autres sources.
    }
  }

  return {
    fetchedAt: new Date().toISOString(),
    catalogSearches,
    datasets,
  };
}

export async function loadSourcesManifest(): Promise<SourcesManifest> {
  const cached = await readManifest();
  if (cached) {
    return cached;
  }
  return buildManifestLive();
}

export { buildManifestLive };
