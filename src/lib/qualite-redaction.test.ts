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

  it('applies gate to draft markdown code fences', () => {
    const md = `# Draft\n\n### Copy\n\n\`\`\`\nplacesdenprison\n\`\`\`\n\n## Gate REVIEW\n\n- [ ] Lien\n`;
    const { markdown, reports } = applyQualiteToDraftMarkdown(md);
    expect(markdown).toContain("places d'emprisonnement");
    expect(markdown).toContain('Gate qualité rédaction');
    expect(markdown).toContain('Qualité rédaction');
    expect(reports[0]!.stats.glue).toBeGreaterThanOrEqual(1);
  });
});
