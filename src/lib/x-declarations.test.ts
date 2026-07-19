import { describe, expect, it } from 'vitest';
import {
  filterBySlug,
  formatDeclarationDate,
  parseXCreatedAt,
  sortDeclarationsChrono,
  type XDeclarationItem,
} from './x-declarations';

const sample: XDeclarationItem[] = [
  {
    id: '2',
    text: 'plus tard',
    created_at: '2026-07-17T12:00:00.000Z',
    url: 'https://x.com/a/status/2',
    handle: 'a',
    slug: 'a',
    name: 'A',
    source: 'candidate',
  },
  {
    id: '1',
    text: 'plus tôt',
    created_at: '2026-07-16T12:00:00.000Z',
    url: 'https://x.com/b/status/1',
    handle: 'b',
    slug: 'b',
    name: 'B',
    source: 'candidate',
  },
];

describe('x-declarations', () => {
  it('sorts newest first by default', () => {
    const s = sortDeclarationsChrono(sample, 'desc');
    expect(s[0]!.id).toBe('2');
    expect(s[1]!.id).toBe('1');
  });

  it('sorts oldest first when asc', () => {
    const s = sortDeclarationsChrono(sample, 'asc');
    expect(s[0]!.id).toBe('1');
  });

  it('filters by slug', () => {
    expect(filterBySlug(sample, 'b')).toHaveLength(1);
    expect(filterBySlug(sample, null)).toHaveLength(2);
  });

  it('parses twitter date strings', () => {
    const iso = parseXCreatedAt('Thu Jul 16 15:58:34 +0000 2026');
    expect(iso.startsWith('2026-07-16')).toBe(true);
  });

  it('formats fr date', () => {
    expect(formatDeclarationDate('2026-07-16T15:58:34.000Z')).toMatch(/2026/);
  });
});
