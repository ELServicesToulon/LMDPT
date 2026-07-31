import { describe, expect, it } from 'vitest';
import raw from '../data/elections/2027-contexte-civique.json';
import {
  validateContexteCivique,
  type ContexteCiviqueFile,
} from './contexte-civique';

const data = raw as ContexteCiviqueFile;

describe('contexte-civique', () => {
  it('valide le fichier de production', () => {
    expect(validateContexteCivique(data)).toEqual([]);
  });

  it('porte une note de laïcité non vide', () => {
    expect(data.laicite_note.title.toLowerCase()).toContain('laïcité');
    expect(data.laicite_note.paragraphs.length).toBeGreaterThanOrEqual(3);
  });

  it('ne renseigne aucune conviction inventée (v1)', () => {
    for (const e of data.entries) {
      expect(e.conviction.status).toBe('non_renseigne');
      expect(e.conviction.kind).toBeNull();
      expect(e.conviction.label).toBeNull();
    }
  });

  it('refuse un « suppose » sans pluralité de sources', () => {
    const bad: ContexteCiviqueFile = structuredClone(data);
    bad.entries[0].conviction = {
      status: 'suppose_par_sources',
      kind: 'religion',
      label: 'exemple',
      summary: 'Supposé par la presse',
      sources: [{ label: 'une seule', url: 'https://example.com' }],
    };
    const problems = validateContexteCivique(bad);
    expect(problems.some((p) => p.includes('≥2 sources'))).toBe(true);
  });

  it('refuse un « revendique » sans source', () => {
    const bad: ContexteCiviqueFile = structuredClone(data);
    bad.entries[0].conviction = {
      status: 'revendique',
      kind: 'atheisme',
      label: 'athée',
      summary: 'Déclaration publique',
      sources: [],
    };
    const problems = validateContexteCivique(bad);
    expect(problems.some((p) => p.includes('source primaire'))).toBe(true);
  });
});
