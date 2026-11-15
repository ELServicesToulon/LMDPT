export interface NewsPublicationCatalogEntry {
  slug: string;
  href: string;
  date: string;
  published?: string;
  title?: string;
  preparation?: boolean;
}

export type NewsSitemapRoute = {
  path: string;
  title: string;
  keywords: string;
};

/** Fenêtre Google News : 30 jours calendaires, bornes incluses. */
export const NEWS_SITEMAP_WINDOW_DAYS = 30;

const MS_PER_DAY = 86_400_000;

const DATE_ONLY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_DATETIME =
  /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})(?::(\d{2})(?:\.\d+)?)?(?:Z|[+-]\d{2}:\d{2})?$/;

function isCalendarDate(year: number, month: number, day: number): boolean {
  if (month < 1 || month > 12 || day < 1 || day > 31) return false;
  const dt = new Date(Date.UTC(year, month - 1, day));
  return dt.getUTCFullYear() === year && dt.getUTCMonth() === month - 1 && dt.getUTCDate() === day;
}

function normalizePath(routePath: string): string {
  const path = routePath.trim().split(/[?#]/, 1)[0] ?? '';
  if (path === '/' || path === '') return '/';
  return path.replace(/\/+$/, '') || '/';
}

function slugFromPath(normalizedPath: string): string {
  if (normalizedPath === '/') return '';
  const i = normalizedPath.lastIndexOf('/');
  return i >= 0 ? normalizedPath.slice(i + 1) : normalizedPath;
}

/** Valide une date ISO catalogue. Date seule → YYYY-MM-DD ; horodatage complet conservé tel quel. */
export function formatNewsPublicationDate(raw: string): string | null {
  const value = raw.trim();
  if (!value) return null;

  const dateOnly = DATE_ONLY.exec(value);
  if (dateOnly) {
    const year = Number(dateOnly[1]);
    const month = Number(dateOnly[2]);
    const day = Number(dateOnly[3]);
    return isCalendarDate(year, month, day) ? value : null;
  }

  const dateTime = ISO_DATETIME.exec(value);
  if (!dateTime) return null;
  const year = Number(dateTime[1]);
  const month = Number(dateTime[2]);
  const day = Number(dateTime[3]);
  const hour = Number(dateTime[4]);
  const minute = Number(dateTime[5]);
  const second = dateTime[6] === undefined ? 0 : Number(dateTime[6]);
  if (!isCalendarDate(year, month, day)) return null;
  if (hour > 23 || minute > 59 || second > 59) return null;
  return value;
}

/** Date de publication Google News : `published ?? date` du catalogue, jamais aujourd'hui. */
export function newsPublicationDate(
  routePath: string,
  catalog: readonly NewsPublicationCatalogEntry[],
): string | null {
  const normalized = normalizePath(routePath);
  const slug = slugFromPath(normalized);
  const entry = catalog.find(
    (item) => item.slug === slug || normalizePath(item.href) === normalized,
  );
  if (!entry) return null;
  return formatNewsPublicationDate(entry.published ?? entry.date);
}

function utcDayMs(raw: string): number | null {
  const formatted = formatNewsPublicationDate(raw);
  if (!formatted) return null;
  const day = formatted.slice(0, 10);
  const match = DATE_ONLY.exec(day);
  if (!match) return null;
  const year = Number(match[1]);
  const month = Number(match[2]);
  const date = Number(match[3]);
  return Date.UTC(year, month - 1, date);
}

/** `publicationDate` et `referenceDate` comparées en UTC sur YYYY-MM-DD, bornes incluses. */
export function isNewsDateInWindow(
  publicationDate: string,
  referenceDate: string,
  windowDays: number = NEWS_SITEMAP_WINDOW_DAYS,
): boolean {
  const pub = utcDayMs(publicationDate);
  const ref = utcDayMs(referenceDate);
  if (pub === null || ref === null) return false;
  const start = ref - windowDays * MS_PER_DAY;
  return pub >= start && pub <= ref;
}

/**
 * Manuels d’abord (ordre et keywords conservés), puis catalogue dans l’ordre donné.
 * Dédoublonnage par chemin normalisé ; `preparation` et date hors fenêtre / invalide exclus.
 */
export function selectNewsSitemapRoutes(
  catalog: readonly NewsPublicationCatalogEntry[],
  manual: readonly NewsSitemapRoute[],
  referenceDate: string,
  windowDays: number = NEWS_SITEMAP_WINDOW_DAYS,
): NewsSitemapRoute[] {
  const seen = new Set<string>();
  const selected: NewsSitemapRoute[] = [];

  for (const route of manual) {
    const key = normalizePath(route.path);
    if (seen.has(key)) continue;
    seen.add(key);
    selected.push(route);
  }

  for (const entry of catalog) {
    if (entry.preparation === true) continue;
    const publicationDate = formatNewsPublicationDate(entry.published ?? entry.date);
    if (!publicationDate) continue;
    if (!isNewsDateInWindow(publicationDate, referenceDate, windowDays)) continue;
    const key = normalizePath(entry.href);
    if (seen.has(key)) continue;
    seen.add(key);
    const title = entry.title ?? '';
    selected.push({ path: entry.href, title, keywords: title });
  }

  return selected;
}
