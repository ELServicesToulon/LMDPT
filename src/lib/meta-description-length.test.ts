import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';
import { describe, expect, it } from 'vitest';
import { getAnalysis } from './analyses';
import { DEBATE_CATALOG } from './debates';
import {
  AXES_2027_META_DESCRIPTION,
  INDEPENDANCE_MEDIAS_META_DESCRIPTION,
  LOULOU_META_DESCRIPTIONS,
  OBSERVATOIRE_CENSURE_META_DESCRIPTION,
} from './loulou-meta-descriptions';

describe('meta descriptions publiques', () => {
  it('les 33 textes de Loulou font au plus 155 caractères', () => {
    const entries = Object.entries(LOULOU_META_DESCRIPTIONS);
    expect(entries).toHaveLength(33);
    for (const [path, text] of entries) {
      expect(text.length, path).toBeLessThanOrEqual(155);
    }
  });

  it('le HTML généré (dist/) n’a aucune meta description de plus de 155 caractères', () => {
    const dist = resolve(process.cwd(), 'dist');
    if (!existsSync(dist) || process.env.CHECK_DIST_META !== '1') return;
    const files = readdirSync(dist, { recursive: true, encoding: 'utf8' }) as string[];
    const overs: string[] = [];
    for (const rel of files) {
      if (!rel.endsWith('.html')) continue;
      const html = readFileSync(join(dist, rel), 'utf8');
      const match = html.match(/<meta\s+name="description"\s+content="([^"]*)"/i)
        ?? html.match(/<meta\s+content="([^"]*)"\s+name="description"/i);
      if (!match) continue;
      const text = match[1].replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/&#39;/g, "'");
      if ([...text].length > 155) {
        overs.push(`${rel}: ${[...text].length}`);
      }
    }
    expect(overs, overs.join('\n')).toEqual([]);
  });

  it('reprend mot pour mot les 33 textes (catalogue, débats et pages hors catalogue)', () => {
    for (const [path, text] of Object.entries(LOULOU_META_DESCRIPTIONS)) {
      const clean = path.replace(/\/+$/, '') || '/';
      if (clean.startsWith('/debats/')) {
        const slug = clean.replace('/debats/', '');
        const entry = DEBATE_CATALOG.find((d) => d.slug === slug);
        expect(entry, path).toBeTruthy();
        expect(entry!.description).toBe(text);
        continue;
      }
      if (clean === '/independance-medias') {
        expect(INDEPENDANCE_MEDIAS_META_DESCRIPTION).toBe(text);
        continue;
      }
      if (clean === '/observatoire-censure') {
        expect(OBSERVATOIRE_CENSURE_META_DESCRIPTION).toBe(text);
        continue;
      }
      if (clean === '/analyses/programmes/axes') {
        expect(AXES_2027_META_DESCRIPTION).toBe(text);
        continue;
      }
      if (clean.startsWith('/analyses/')) {
        const slug = clean.replace('/analyses/', '');
        const entry = getAnalysis(slug);
        expect(entry, path).toBeTruthy();
        expect(entry!.description).toBe(text);
      }
    }
  });
});
