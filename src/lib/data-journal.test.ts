import { describe, expect, it } from 'vitest';
import {
  ATLAS_PAGES,
  getJournalLastUpdate,
  getSortedJournal,
  journalCoversAtlasPage,
} from './data-journal';

describe('data journal (/sources#mises-a-jour)', () => {
  it('sorts entries newest first', () => {
    const sorted = getSortedJournal();
    for (let i = 1; i < sorted.length; i += 1) {
      expect(sorted[i - 1]!.date >= sorted[i]!.date).toBe(true);
    }
  });

  it('exposes last update date', () => {
    expect(getJournalLastUpdate()).toBe('2026-06-29');
  });

  it('covers every published atlas page', () => {
    for (const page of ATLAS_PAGES) {
      expect(journalCoversAtlasPage(page), page).toBe(true);
    }
  });

  it('every entry has license and at least one page', () => {
    for (const entry of getSortedJournal()) {
      expect(entry.license, entry.label).toBeTruthy();
      expect(entry.pages?.length, entry.label).toBeGreaterThan(0);
    }
  });

  it('legislatives 2024 has national and circonscription entries', () => {
    const legislatives = getSortedJournal().filter((e) =>
      e.pages?.includes('/atlas/2024-legislatives'),
    );
    expect(legislatives.length).toBeGreaterThanOrEqual(2);
    expect(legislatives.some((e) => /nationaux?/i.test(e.label))).toBe(true);
    expect(legislatives.some((e) => /circonscription/i.test(e.label))).toBe(true);
  });
});