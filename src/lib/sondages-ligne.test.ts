import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import { HOME_META_DESCRIPTION, SONDAGES_LIGNE } from './sondages-ligne';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('ligne sondages', () => {
  it('tient la meta d’accueil sous 160 caractères, sans « zéro sondage »', () => {
    expect(HOME_META_DESCRIPTION.length).toBeLessThanOrEqual(160);
    expect(HOME_META_DESCRIPTION).not.toMatch(/zéro sondage/i);
    expect(HOME_META_DESCRIPTION).toMatch(/2027/);
    expect(HOME_META_DESCRIPTION).toMatch(/classement/);
  });

  it('retire le placeholder du journal tout en gardant Ifop, Harris et Ipsos', () => {
    const journal = readFileSync(join(ROOT, 'src/data/data-journal.json'), 'utf8');
    expect(journal).not.toMatch(/Placeholder/);
    expect(journal).toMatch(/Ifop/);
    expect(journal).toMatch(/Harris/);
    expect(journal).toMatch(/Ipsos/);
    expect(journal).toContain(SONDAGES_LIGNE);
  });
});
