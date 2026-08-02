import { describe, expect, it } from 'vitest';
import {
  applyQualiteToDraftMarkdown,
  reviewQualiteRedaction,
} from './qualite-redaction';

describe('qualite-redaction', () => {
  it('splits known glued prison phrase', () => {
    const r = reviewQualiteRedaction('Il faut plus de placesdenprison en France.');
    expect(r.corrected).toMatch(/places d'emprisonnement/i);
    expect(r.stats.glue).toBeGreaterThanOrEqual(1);
    expect(r.changed).toBe(true);
  });

  it('fixes common accents', () => {
    const r = reviewQualiteRedaction('La democratie et la presidentielle.');
    expect(r.corrected).toContain('démocratie');
    expect(r.corrected).toContain('présidentielle');
  });

  it('leaves clean text mostly unchanged', () => {
    const t = 'Veille presse — calendrier du premier tour officiel.';
    const r = reviewQualiteRedaction(t);
    expect(r.corrected).toBe(t);
    expect(r.decision).toBe('SHIP');
  });

  it('preserves URLs (no space after : or ?)', () => {
    const url =
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic';
    const r = reviewQualiteRedaction(
      `Veille presse — titre.\n\n${url}`,
    );
    expect(r.corrected).toContain(url);
    expect(r.corrected).not.toMatch(/https:\s\/\//);
    expect(r.corrected).not.toMatch(/\?\s+utm_/);
    // slug non accentué conservé dans l'URL
    expect(r.corrected).toContain('/presidentielle-2027-preparation?');
  });

  it('repairs already-broken URLs from prior punct pass', () => {
    const broken =
      'https: //lmdpt.iarbre.org/analyses/presidentielle-2027-preparation? utm_source=x';
    const r = reviewQualiteRedaction(broken);
    expect(r.corrected).toBe(
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x',
    );
    expect(r.anomalies.some((a) => a.before === 'URL espacée')).toBe(true);
  });

  it('does not split manuellement or CamelCase hashtags', () => {
    const t = 'Publier manuellement #AssembléeDuPremierTour #FinDesBaudruches';
    const r = reviewQualiteRedaction(t);
    expect(r.corrected).toContain('manuellement');
    expect(r.corrected).toContain('#AssembléeDuPremierTour');
    expect(r.corrected).toContain('#FinDesBaudruches');
    expect(r.stats.glue).toBe(0);
  });

  it('recovers prior false-positive glue on hashtags', () => {
    const t = '#Assemblée Du PremierTour #FinDesB au druches manuel le ment';
    const r = reviewQualiteRedaction(t);
    expect(r.corrected).toContain('#AssembléeDuPremierTour');
    expect(r.corrected).toContain('#FinDesBaudruches');
    expect(r.corrected).toContain('manuellement');
  });

  it('applies gate to draft markdown code fences', () => {
    const md = `# Draft\n\n### Copy\n\n\`\`\`\nplacesdenprison\n\`\`\`\n\n## Gate REVIEW\n\n- [ ] Lien\n`;
    const { markdown, reports } = applyQualiteToDraftMarkdown(md);
    expect(markdown).toContain("places d'emprisonnement");
    expect(markdown).toContain('Gate qualité rédaction');
    expect(markdown).toContain('Qualité rédaction');
    expect(reports[0]!.stats.glue).toBeGreaterThanOrEqual(1);
  });
});
