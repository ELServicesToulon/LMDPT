/**
 * Comptes X officiels candidats & partis — Présidentielle 2027.
 * Source : src/data/elections/2027-x-officiels.json
 */
import registry from '../data/elections/2027-x-officiels.json';

export interface XAccount {
  handle: string | null;
  url: string | null;
  label?: string;
  note?: string | null;
}

type CandidateRow = (typeof registry.candidates)[number];
type PartyRow = (typeof registry.parties)[number];

const bySlug = new Map<string, CandidateRow>(
  registry.candidates.map((c) => [c.slug, c]),
);

export function getXRegistry() {
  return registry;
}

export function xForCandidate(slug: string): XAccount | null {
  const row = bySlug.get(slug);
  if (!row) return null;
  return {
    handle: row.handle,
    url: row.url,
    label: row.name,
    note: row.note ?? null,
  };
}

/** Resolve by display name (accents-insensitive). */
export function xForCandidateName(name: string): XAccount | null {
  const norm = (s: string) =>
    s
      .normalize('NFD')
      .replace(/\p{M}/gu, '')
      .toLowerCase()
      .trim();
  const target = norm(name);
  for (const row of registry.candidates as CandidateRow[]) {
    if (norm(row.name) === target) {
      return {
        handle: row.handle,
        url: row.url,
        label: row.name,
        note: row.note ?? null,
      };
    }
  }
  return null;
}

/** Match party X account from free-text affiliation. */
export function xForAffiliation(affiliation: string): XAccount | null {
  const raw = affiliation?.trim() ?? '';
  if (!raw) return null;
  for (const p of registry.parties as PartyRow[]) {
    for (const m of p.affiliation_match ?? []) {
      if (m.toLowerCase() === raw.toLowerCase()) {
        return {
          handle: p.handle,
          url: p.url,
          label: p.label,
          note: (p as { note?: string | null }).note ?? null,
        };
      }
    }
  }
  // fuzzy contains
  const lower = raw.toLowerCase();
  for (const p of registry.parties as PartyRow[]) {
    if (lower.includes(p.label.toLowerCase()) || p.label.toLowerCase().includes(lower)) {
      return {
        handle: p.handle,
        url: p.url,
        label: p.label,
        note: (p as { note?: string | null }).note ?? null,
      };
    }
  }
  return null;
}

export function formatXHandle(handle: string | null | undefined): string {
  if (!handle) return '';
  return handle.startsWith('@') ? handle : `@${handle}`;
}
