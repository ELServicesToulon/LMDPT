/**
 * Helpers tips lecteurs (alignés sur comments-api) — tests Vitest.
 */
export type TipType = 'suggestion' | 'alerte';

export function isTipType(v: string): v is TipType {
  return v === 'suggestion' || v === 'alerte';
}

export function tipTitleOk(title: string): boolean {
  return String(title || '').trim().length >= 5;
}

export function tipBodyOk(body: string): boolean {
  return String(body || '').trim().length >= 20;
}

export function isHttpUrl(value: string): boolean {
  const raw = String(value || '').trim();
  if (!raw) return false;
  try {
    const parsed = new URL(raw);
    return parsed.protocol === 'http:' || parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Alerte : URL http(s) obligatoire. Suggestion : URL facultative, mais http(s) si fournie. */
export function tipSourceOk(type: TipType, sourceUrl: string): boolean {
  const raw = String(sourceUrl || '').trim();
  if (type === 'alerte') return isHttpUrl(raw);
  if (!raw) return true;
  return isHttpUrl(raw);
}
