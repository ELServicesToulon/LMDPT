import { describe, expect, it } from 'vitest';
import data from '../data/elections/2027-livres-candidats.json';
import {
  isValidIsbn13,
  sortLivresByDateDesc,
  validateLivresCandidats,
  type LivresCandidatsFile,
} from './livres-candidats';

describe('livres-candidats', () => {
  it('validates live registry', () => {
    const problems = validateLivresCandidats(data as LivresCandidatsFile);
    expect(problems).toEqual([]);
  });

  it('includes Knafo Fayard primary + Kindle ASIN mirror', () => {
    const knafo = data.entries.find((e) => e.candidate_slug === 'knafo');
    expect(knafo).toBeTruthy();
    expect(knafo!.isbn13).toBe('9782213733135');
    expect(knafo!.asin_kindle).toBe('B0H8KTYM81');
    expect(knafo!.primary_url).toMatch(/fayard\.fr/);
    expect(knafo!.status).toBe('a_paraitre');
    expect(isValidIsbn13(knafo!.isbn13)).toBe(true);
  });

  it('includes Bardella Fayard entry', () => {
    const b = data.entries.find((e) => e.candidate_slug === 'bardella');
    expect(b?.isbn13).toBe('9782213731704');
    expect(b?.primary_url).toMatch(/fayard\.fr/);
  });

  it('sorts by published_on desc', () => {
    const sorted = sortLivresByDateDesc(data.entries);
    expect(sorted[0].candidate_slug).toBe('knafo');
  });

  it('rejects affiliate tags', () => {
    const bad = structuredClone(data) as LivresCandidatsFile;
    bad.entries[0].mirrors = [
      { label: 'aff', url: 'https://www.amazon.fr/dp/B0H8KTYM81?tag=lmdpt-21' },
    ];
    expect(validateLivresCandidats(bad).some((p) => p.includes('affilié'))).toBe(true);
  });
});
