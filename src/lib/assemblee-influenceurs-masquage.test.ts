import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');

describe('page assemblée influenceurs masquée', () => {
  const page = readFileSync(
    join(ROOT, 'src/pages/assemblee-influenceurs/index.astro'),
    'utf8',
  );
  const seoScript = readFileSync(join(ROOT, 'scripts/generate-seo-assets.ts'), 'utf8');
  const layout = readFileSync(join(ROOT, 'src/layouts/BaseLayout.astro'), 'utf8');

  it('est noindex, porte l’avis et le contact, sans hémicycle ni fiches', () => {
    expect(page).toContain('noindex');
    expect(page).toContain(
      'Page en cours de refonte. Elle reviendra avec des sources vérifiées et un contact pour la rectification.',
    );
    expect(page).toContain('lemediadupremiertour@gmail.com');
    expect(page).not.toContain('Déclarée (sourcée)');
    expect(page).not.toContain('InfluenceursHemicycle');
    expect(page).not.toContain('getAssembleeInfluenceursView');
  });

  it('retire la route des sitemaps et du menu, disallow robots', () => {
    expect(seoScript).toContain("Disallow: /assemblee-influenceurs/");
    expect(layout).not.toContain('href="/assemblee-influenceurs/"');
  });
});

describe('données nominatives assemblée influenceurs hors dépôt public', () => {
  const SCHEMA_MARKER = ['lmdpt', 'assemblee', 'influenceurs', 'v1'].join('-');

  it('retire les 4 JSON et le script, et aucun fichier de src/ ne contient le schéma nominatif', () => {
    const gone = [
      'src/data/assemblee-influenceurs.json',
      'src/data/influenceurs-platforms-inventory.json',
      'src/data/influenceurs-network-hue-estimate.json',
      'src/data/assemblee-stance-veille-watchlist.json',
      'scripts/assemblee-stance-veille.ts',
    ];
    for (const rel of gone) {
      expect(existsSync(join(ROOT, rel)), rel).toBe(false);
    }

    for (const abs of walkFiles(join(ROOT, 'src'))) {
      const text = readFileSync(abs, 'utf8');
      expect(text, abs.slice(ROOT.length + 1)).not.toContain(SCHEMA_MARKER);
    }
  });
});

function walkFiles(dir: string): string[] {
  const out: string[] = [];
  for (const name of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, name.name);
    if (name.isDirectory()) out.push(...walkFiles(p));
    else if (name.isFile()) out.push(p);
  }
  return out;
}
