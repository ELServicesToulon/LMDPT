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

  it('applies gate to draft markdown code fences', () => {
    const md = `# Draft\n\n### Copy\n\n\`\`\`\nplacesdenprison\n\`\`\`\n\n## Gate REVIEW\n\n- [ ] Lien\n`;
    const { markdown, reports } = applyQualiteToDraftMarkdown(md);
    expect(markdown).toContain("places d'emprisonnement");
    expect(markdown).toContain('Gate qualité rédaction');
    expect(markdown).toContain('Qualité rédaction');
    expect(reports[0]!.stats.glue).toBeGreaterThanOrEqual(1);
  });

  const UTM_URL =
    'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic&utm_campaign=renifleur_20261002#renifleur-presse';

  it('leaves utm URLs unchanged including query, hash, and draft markdown fences', () => {
    const r = reviewQualiteRedaction(UTM_URL);
    expect(r.corrected).toBe(UTM_URL);
    expect(r.anomalies).toHaveLength(0);

    const md = `# Draft\n\n### Copy\n\n\`\`\`\n${UTM_URL}\n\`\`\`\n\n## Gate REVIEW\n\n- [ ] Lien\n`;
    const { markdown, reports } = applyQualiteToDraftMarkdown(md);
    expect(markdown).toContain(UTM_URL);
    expect(markdown).not.toContain('https: //');
    expect(markdown).not.toContain('? utm_');
    expect(markdown).not.toContain('présidentielle-2027');
    expect(reports.some((rep) => rep.anomalies.some((a) => a.before.includes('http')))).toBe(
      false,
    );
  });

  it('leaves URLs with port and query unchanged', () => {
    const url = 'https://exemple.org:8080/a?b=c';
    const r = reviewQualiteRedaction(`Lien ${url} ici.`);
    expect(r.corrected).toContain(url);
    expect(r.corrected).not.toMatch(/https: \/\//);
    expect(r.corrected).not.toContain('? b=');
  });

  it('corrects spelling outside URLs but not inside', () => {
    const url =
      'https://lmdpt.iarbre.org/analyses/presidentielle-elections-democratie-securite-meme-deja';
    const r = reviewQualiteRedaction(
      `La democratie et la presidentielle voient ${url} puis elections securite meme deja.`,
    );
    expect(r.corrected).toContain(url);
    expect(r.corrected).toContain('démocratie');
    expect(r.corrected).toContain('présidentielle');
    expect(r.corrected).toMatch(/élections/);
    expect(r.corrected).toContain('sécurité');
    expect(r.corrected).toContain('même');
    expect(r.corrected).toContain('déjà');
    expect(r.anomalies.every((a) => !/https?:/i.test(a.before) && !/https?:/i.test(a.after))).toBe(
      true,
    );
  });

  it('leaves inline code unchanged', () => {
    const r = reviewQualiteRedaction('Code `presidentielle?x=1` en ligne.');
    expect(r.corrected).toContain('`presidentielle?x=1`');
    expect(r.anomalies.every((a) => !a.before.includes('presidentielle?x=1'))).toBe(true);
  });

  it('leaves markdown link URLs unchanged', () => {
    const url =
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x';
    const r = reviewQualiteRedaction(`Voir [analyse](${url}) aujourd'hui.`);
    expect(r.corrected).toContain(`](${url})`);
    expect(r.corrected).not.toContain('https: //');
    expect(r.corrected).not.toContain('présidentielle-2027');
  });

  it('keeps a sentence-final period after a URL', () => {
    const r = reviewQualiteRedaction('voir https://x.org/a.');
    expect(r.corrected).toBe('voir https://x.org/a.');
  });

  it('does not split real words that contain a preposition', () => {
    const quote = "Avec plus d'interpellations qu'au plus fort de mai 1968.";
    const r = reviewQualiteRedaction(quote);
    expect(r.corrected).toBe(quote);

    const handles = reviewQualiteRedaction(
      'Réponse à @marinetondelier et @GabrielAttal, intégralement.',
    );
    expect(handles.corrected).toContain('@marinetondelier');
    expect(handles.corrected).toContain('@GabrielAttal');
    expect(handles.corrected).toContain('intégralement');
    expect(handles.corrected).not.toContain(' de lier');
    expect(handles.corrected).not.toContain('lA ttal');
    expect(handles.corrected).not.toContain('le ment');
  });

  it('folds every lmdpt.iarbre.org path to ascii and leaves external URLs', () => {
    const r = reviewQualiteRedaction(
      [
        'https://lmdpt.iarbre.org/analyses/présidentielle-distorsion/?utm_source=x',
        'https://lmdpt.iarbre.org/atlas/2022-présidentielle',
        'https://lmdpt.iarbre.org/analyses/aim-marseille-2026-métiers/',
        'https://www.rtl.fr/la-présidentielle-2027',
      ].join('\n'),
    );
    expect(r.corrected).toContain('/analyses/presidentielle-distorsion/?utm_source=x');
    expect(r.corrected).toContain('/atlas/2022-presidentielle');
    expect(r.corrected).toContain('/analyses/aim-marseille-2026-metiers/');
    expect(r.corrected).toContain('https://www.rtl.fr/la-présidentielle-2027');
    expect(r.corrected).not.toMatch(/lmdpt\.iarbre\.org[^\s]*[àâäéèêëïîôùûüç]/i);
  });

  it('restores known glue splits and ascii route slugs', () => {
    const broken = [
      "Avec plus d'interpel la tions.",
      'https: //lmdpt.iarbre.org/liberté-d-expression/? utm_source=x',
      'https://lmdpt.iarbre.org/analyses/présidentielle-2027-preparation?utm_source=x',
    ].join('\n');
    const r = reviewQualiteRedaction(broken);
    expect(r.corrected).toContain("d'interpellations");
    expect(r.corrected).not.toContain('interpel la tions');
    expect(r.corrected).toContain('https://lmdpt.iarbre.org/liberte-d-expression/?utm_source=x');
    expect(r.corrected).toContain(
      'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x',
    );
    expect(repairFalsePositiveGlue('Gabrie lA ttal et marineton de lier')).toBe(
      'GabrielAttal et marinetondelier',
    );
    expect(repairFalsePositiveGlue('intégra le ment')).toBe('intégralement');
  });
});
