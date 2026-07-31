/** Scoop curated homepage — bande « À la une » (pas de renifleur auto). */

export interface ScoopCurated {
  schema: string;
  active: boolean;
  badge?: string;
  title: string;
  url: string;
  updated_at?: string;
  curated_by?: string;
  note?: string;
}

export function shouldShowScoop(data: ScoopCurated | null | undefined): boolean {
  if (!data?.active) return false;
  if (!data.title?.trim()) return false;
  if (!data.url?.trim()) return false;
  return true;
}

export function validateScoopCurated(data: ScoopCurated): string[] {
  const problems: string[] = [];
  if (data.schema !== 'lmdpt-scoop-curated-v1') {
    problems.push(`schema inattendu: ${data.schema}`);
  }
  if (typeof data.active !== 'boolean') problems.push('active manquant');
  if (data.active) {
    if (!data.title?.trim()) problems.push('title requis si active');
    if (!data.url?.startsWith('/')) problems.push('url interne requise (commence par /)');
  }
  return problems;
}
