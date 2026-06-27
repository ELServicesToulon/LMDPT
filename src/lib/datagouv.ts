import type {
  CatalogHit,
  CatalogSearchResult,
  DataGouvApiError,
  DataGouvDataset,
  DataGouvResource,
} from './types';

export const DATA_GOUV_API_ROOT = 'https://www.data.gouv.fr/api/1';

const DEFAULT_USER_AGENT = 'LeMediaDuPremierTour/0.1 (civic open-data; contact: editorial@example.com)';
const MAX_RETRIES = 3;
const RETRYABLE_STATUSES = new Set([429, 502, 503, 504]);

function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null;
}

function apiError(message: string, status: number, url: string): DataGouvApiError {
  const error = new Error(message) as DataGouvApiError;
  error.status = status;
  error.url = url;
  return error;
}

export function createDataGouvClient(options?: {
  fetchImpl?: typeof fetch;
  userAgent?: string;
  minDelayMs?: number;
}) {
  const fetchImpl = options?.fetchImpl ?? fetch;
  const userAgent = options?.userAgent ?? DEFAULT_USER_AGENT;
  const minDelayMs = options?.minDelayMs ?? 250;
  let lastRequestAt = 0;

  async function throttle(): Promise<void> {
    const now = Date.now();
    const wait = minDelayMs - (now - lastRequestAt);
    if (wait > 0) {
      await sleep(wait);
    }
    lastRequestAt = Date.now();
  }

  async function requestJson<T>(url: string): Promise<T> {
    let lastError: Error | null = null;

    for (let attempt = 0; attempt < MAX_RETRIES; attempt += 1) {
      await throttle();
      try {
        const response = await fetchImpl(url, {
          headers: {
            Accept: 'application/json',
            'User-Agent': userAgent,
          },
        });

        if (!response.ok) {
          if (RETRYABLE_STATUSES.has(response.status) && attempt < MAX_RETRIES - 1) {
            await sleep(500 * (attempt + 1));
            continue;
          }
          throw apiError(
            `data.gouv.fr ${response.status}: ${response.statusText}`,
            response.status,
            url,
          );
        }

        return (await response.json()) as T;
      } catch (error) {
        lastError = error instanceof Error ? error : new Error(String(error));
        if (attempt < MAX_RETRIES - 1 && !(error instanceof Error && 'status' in error)) {
          await sleep(500 * (attempt + 1));
          continue;
        }
        throw lastError;
      }
    }

    throw lastError ?? new Error('data.gouv.fr request failed');
  }

  function mapResource(raw: Record<string, unknown>): DataGouvResource {
    return {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? 'Ressource'),
      url: String(raw.url ?? raw.latest ?? ''),
      format: raw.format ? String(raw.format) : undefined,
      filesize: typeof raw.filesize === 'number' ? raw.filesize : undefined,
      mime: raw.mime ? String(raw.mime) : undefined,
    };
  }

  function mapDataset(raw: Record<string, unknown>): DataGouvDataset {
    const organization = isRecord(raw.organization) ? String(raw.organization.name ?? '') : undefined;
    const license = isRecord(raw.license)
      ? String(raw.license.title ?? raw.license.id ?? '')
      : raw.license
        ? String(raw.license)
        : undefined;
    const resources = Array.isArray(raw.resources)
      ? raw.resources.filter(isRecord).map(mapResource).filter((r) => r.url)
      : [];

    return {
      id: String(raw.id ?? ''),
      title: String(raw.title ?? 'Dataset'),
      slug: String(raw.slug ?? ''),
      description: raw.description ? String(raw.description) : undefined,
      page: String(raw.page ?? `https://www.data.gouv.fr/fr/datasets/${String(raw.slug ?? raw.id ?? '')}/`),
      resources,
      organization: organization || undefined,
      license: license || undefined,
      last_update: raw.last_update ? String(raw.last_update) : undefined,
    };
  }

  function extractDataGouvDatasetId(value: string): string | null {
    const match = value.match(/data\.gouv\.fr\/datasets\/([a-f0-9]{24})/i);
    return match?.[1] ?? null;
  }

  function resolveLandingPage(raw: Record<string, unknown>): string {
    const landing = raw.landingPage;
    if (isRecord(landing) && landing['@id']) {
      return String(landing['@id']);
    }
    if (typeof raw.page === 'string') {
      return raw.page;
    }
    const id = String(raw.id ?? '');
    if (extractDataGouvDatasetId(id)) {
      return `https://www.data.gouv.fr/fr/datasets/${extractDataGouvDatasetId(id)}/`;
    }
    return String(raw['@id'] ?? raw.url ?? '');
  }

  function mapCatalogDatasetFromJsonLd(raw: Record<string, unknown>): CatalogHit | null {
    const type = String(raw['@type'] ?? raw.type ?? '');
    if (type && type !== 'Dataset' && type !== 'dataset') {
      return null;
    }

    const title = String(raw.title ?? raw.name ?? '');
    if (!title) {
      return null;
    }

    let id = String(raw.id ?? '');
    if (!extractDataGouvDatasetId(id) && Array.isArray(raw.distribution)) {
      for (const entry of raw.distribution) {
        const fromDistribution = extractDataGouvDatasetId(String(entry));
        if (fromDistribution) {
          id = fromDistribution;
          break;
        }
      }
    }
    if (!id) {
      id = String(raw['@id'] ?? '');
    }

    const page = resolveLandingPage(raw);
    if (!id && !page) {
      return null;
    }

    return {
      id: extractDataGouvDatasetId(id) ?? id,
      title,
      description: raw.description ? String(raw.description) : undefined,
      page: page || `https://www.data.gouv.fr/fr/datasets/${id}/`,
    };
  }

  function mapCatalogHit(raw: Record<string, unknown>): CatalogHit | null {
    if (raw['@type'] === 'Dataset' || raw['@graph']) {
      return mapCatalogDatasetFromJsonLd(raw);
    }

    const type = raw.type ? String(raw.type) : '';
    if (type && type !== 'dataset') {
      return null;
    }

    const id = String(raw.id ?? raw._id ?? '');
    const title = String(raw.title ?? raw.name ?? '');
    if (!id || !title) {
      return null;
    }

    const organization = isRecord(raw.organization) ? String(raw.organization.name ?? '') : undefined;

    return {
      id,
      title,
      description: raw.description ? String(raw.description) : undefined,
      page: String(raw.url ?? raw.page ?? `https://www.data.gouv.fr/fr/datasets/${String(raw.slug ?? id)}/`),
      organization: organization || undefined,
    };
  }

  async function searchCatalog(query: string, pageSize = 12): Promise<CatalogSearchResult> {
    const url = new URL(`${DATA_GOUV_API_ROOT}/site/catalog`);
    url.searchParams.set('q', query);
    url.searchParams.set('page_size', String(pageSize));

    const payload = await requestJson<unknown>(url.toString());
    const hits: CatalogHit[] = [];
    const seen = new Set<string>();

    function pushHit(hit: CatalogHit | null): void {
      if (!hit) return;
      const key = hit.id || hit.page;
      if (seen.has(key)) return;
      seen.add(key);
      hits.push(hit);
    }

    if (Array.isArray(payload)) {
      for (const item of payload) {
        if (isRecord(item)) pushHit(mapCatalogHit(item));
      }
    } else if (isRecord(payload)) {
      if (Array.isArray(payload['@graph'])) {
        for (const item of payload['@graph']) {
          if (isRecord(item)) pushHit(mapCatalogDatasetFromJsonLd(item));
        }
      }
      if (Array.isArray(payload.data)) {
        for (const item of payload.data) {
          if (isRecord(item)) pushHit(mapCatalogHit(item));
        }
      }
    }

    return {
      query,
      fetchedAt: new Date().toISOString(),
      hits,
    };
  }

  async function searchDatasets(query: string, pageSize = 12): Promise<CatalogHit[]> {
    const url = new URL(`${DATA_GOUV_API_ROOT}/datasets/`);
    url.searchParams.set('q', query);
    url.searchParams.set('page_size', String(pageSize));

    const payload = await requestJson<unknown>(url.toString());
    const hits: CatalogHit[] = [];

    if (isRecord(payload) && Array.isArray(payload.data)) {
      for (const item of payload.data) {
        if (isRecord(item)) {
          hits.push({
            id: String(item.id ?? ''),
            title: String(item.title ?? ''),
            description: item.description ? String(item.description) : undefined,
            page: String(item.page ?? `https://www.data.gouv.fr/fr/datasets/${String(item.slug ?? item.id)}/`),
            organization: isRecord(item.organization) ? String(item.organization.name ?? '') : undefined,
          });
        }
      }
    }

    return hits.filter((h) => h.id && h.title);
  }

  async function getDataset(idOrSlug: string): Promise<DataGouvDataset> {
    const url = `${DATA_GOUV_API_ROOT}/datasets/${encodeURIComponent(idOrSlug)}/`;
    const payload = await requestJson<unknown>(url);
    if (!isRecord(payload)) {
      throw apiError('Invalid dataset payload', 500, url);
    }
    return mapDataset(payload);
  }

  return {
    searchCatalog,
    searchDatasets,
    getDataset,
    requestJson,
  };
}

export const dataGouv = createDataGouvClient();
