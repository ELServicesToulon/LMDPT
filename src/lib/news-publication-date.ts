export interface NewsPublicationCatalogEntry {
  slug: string;
  href: string;
  date: string;
  published?: string;
}

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
