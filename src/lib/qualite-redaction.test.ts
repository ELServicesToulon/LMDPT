import { describe, expect, it } from 'vitest';
import {
  applyQualiteToDraftMarkdown,
  repairFalsePositiveGlue,
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

  it('keeps UTM URLs clickable (no space after : or ?)', () => {
    const url =
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic&utm_campaign=renifleur_20260822#renifleur-presse';
    const r = reviewQualiteRedaction(`Veille presse — titre.\n\n${url}`);
    expect(r.corrected).toContain(url);
    expect(r.corrected).not.toMatch(/https:\s\/\//);
    expect(r.corrected).not.toMatch(/\?\s+utm_/);
    expect(r.corrected).not.toContain('présidentielle-2027-preparation');
  });

  it('repairs already-broken scheme and query spaces', () => {
    const broken =
      'https: //lmdpt.iarbre.org/analyses/présidentielle-2027-preparation? utm_source=x&utm_medium=organic#renifleur-presse';
    const r = reviewQualiteRedaction(`Copy\n\n${broken}`);
    expect(r.corrected).toContain(
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic#renifleur-presse',
    );
    expect(r.corrected).not.toMatch(/https:\s\/\//);
    expect(r.changed).toBe(true);
  });

  it('repairs space after ampersand in query', () => {
    const r = reviewQualiteRedaction(
      'https://lmdpt.iarbre.org/x? utm_source=x& utm_medium=organic',
    );
    expect(r.corrected).toBe(
      'https://lmdpt.iarbre.org/x?utm_source=x&utm_medium=organic',
    );
  });

  it('still accents presidentielle in prose, not in the URL path', () => {
    const r = reviewQualiteRedaction(
      'La presidentielle.\n\nhttps://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x',
    );
    expect(r.corrected).toContain('La présidentielle.');
    expect(r.corrected).toContain(
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x',
    );
  });

  it('applies gate to draft markdown code fences', () => {
    const md = `# Draft\n\n### Copy\n\n\`\`\`\nplacesdenprison\n\`\`\`\n\n## Gate REVIEW\n\n- [ ] Lien\n`;
    const { markdown, reports } = applyQualiteToDraftMarkdown(md);
    expect(markdown).toContain("places d'emprisonnement");
    expect(markdown).toContain('Gate qualité rédaction');
    expect(markdown).toContain('Qualité rédaction');
    expect(reports[0]!.stats.glue).toBeGreaterThanOrEqual(1);
  });

  it('recovers false-positive glue on hashtags and adverbs', () => {
    const raw = '#Assemblée Du PremierTour naturel le ment';
    expect(repairFalsePositiveGlue(raw)).toBe('#AssembléeDuPremierTour naturellement');
    const r = reviewQualiteRedaction(raw);
    expect(r.corrected).toContain('#AssembléeDuPremierTour');
    expect(r.corrected).toContain('naturellement');
  });
});
