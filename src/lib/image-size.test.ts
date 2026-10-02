import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { publicImageSize, readImageSize } from './image-size';
import { DEFAULT_OG_IMAGE } from './seo';

describe('publicImageSize', () => {
  it('sert la carte par défaut en 1200×630', () => {
    const size = publicImageSize(DEFAULT_OG_IMAGE);
    expect(size).toEqual({ width: 1200, height: 630 });
    expect(publicImageSize('/brand/og-default.png')).toEqual({ width: 1200, height: 630 });
  });

  it('lit les illustrations d’analyse sans les recadrer', () => {
    const size = publicImageSize('/illustrations/unes/analyses/trump-ia-guardrails-anthropic.jpg');
    expect(size).not.toBeNull();
    expect(size!.width).toBeGreaterThan(600);
    expect(size!.height).toBeGreaterThan(300);
  });

  it('refuse un chemin qui sort de public/', () => {
    expect(publicImageSize('../package.json')).toBeNull();
  });
});

describe('hero daily override public', () => {
  it('ne publie pas la note interne du pipeline', () => {
    const raw = readFileSync(
      path.join(process.cwd(), 'public/illustrations/2027/hero-daily-override.json'),
      'utf8',
    );
    const data = JSON.parse(raw) as { note?: string };
    expect(data.note).toBeUndefined();
    expect(raw).not.toMatch(/ZDR|upload_url|API Imagine/);
    expect(readImageSize(Buffer.from(raw))).toBeNull();
  });
});
