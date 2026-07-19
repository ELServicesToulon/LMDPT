/**
 * Déclarations X des candidats — agrégat chronologique (1er tour 2027).
 * Source collecte : FxEmbed / scripts/x-candidats-declarations-run.ts
 */
import type { ProgramThemeId } from './program-types';

export interface XDeclarationItem {
  id: string;
  text: string;
  created_at: string;
  url: string;
  handle: string;
  slug: string;
  name: string;
  source: 'candidate' | 'party';
}

export interface XDeclarationsSnapshot {
  title: string;
  updated: string;
  fetched_at: string;
  disclaimer: string;
  method: string;
  follow_account?: string | null;
  accounts_ok: number;
  accounts_error: number;
  items: XDeclarationItem[];
  errors?: Array<{ handle: string; slug?: string; message: string }>;
}

export function sortDeclarationsChrono(
  items: XDeclarationItem[],
  order: 'desc' | 'asc' = 'desc',
): XDeclarationItem[] {
  const sorted = [...items].sort((a, b) => {
    const ta = Date.parse(a.created_at) || 0;
    const tb = Date.parse(b.created_at) || 0;
    if (tb !== ta) return order === 'desc' ? tb - ta : ta - tb;
    // snowflake fallback
    try {
      const ia = BigInt(a.id);
      const ib = BigInt(b.id);
      if (ia === ib) return 0;
      return order === 'desc' ? (ia > ib ? -1 : 1) : ia > ib ? 1 : -1;
    } catch {
      return 0;
    }
  });
  return sorted;
}

export function filterBySlug(
  items: XDeclarationItem[],
  slug: string | null | undefined,
): XDeclarationItem[] {
  if (!slug) return items;
  return items.filter((i) => i.slug === slug);
}

export function formatDeclarationDate(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('fr-FR', {
    dateStyle: 'medium',
    timeStyle: 'short',
  });
}

/** Twitter/X created_at string → ISO */
export function parseXCreatedAt(raw: string | undefined | null): string {
  if (!raw) return new Date(0).toISOString();
  const d = new Date(raw);
  if (!Number.isNaN(d.getTime())) return d.toISOString();
  return raw;
}

export type { ProgramThemeId };
