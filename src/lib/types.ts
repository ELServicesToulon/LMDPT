export interface DataGouvResource {
  id: string;
  title: string;
  url: string;
  format?: string;
  filesize?: number;
  mime?: string;
}

export interface DataGouvDataset {
  id: string;
  title: string;
  slug: string;
  description?: string;
  page: string;
  resources: DataGouvResource[];
  organization?: string;
  license?: string;
  last_update?: string;
}

export interface CatalogHit {
  id: string;
  title: string;
  description?: string;
  page: string;
  organization?: string;
}

export interface CatalogSearchResult {
  query: string;
  fetchedAt: string;
  hits: CatalogHit[];
}

export interface DatasetCacheEntry {
  id: string;
  fetchedAt: string;
  dataset: DataGouvDataset;
}

export interface SourcesManifest {
  fetchedAt: string;
  catalogSearches: CatalogSearchResult[];
  datasets: DataGouvDataset[];
}

export interface DataGouvApiError extends Error {
  status: number;
  url: string;
}
