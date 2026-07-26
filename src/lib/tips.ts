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
