import { describe, expect, it } from 'vitest';
import preparation from '../data/analyses/presidentielle-2027-preparation.json';
import alertes from '../data/alertes-citoyennes.json';
import lfiBfmtv from '../data/analyses/lfi-bfmtv-exigence-pluralisme.json';
import ukraineEnergie from '../data/analyses/ukraine-energie-triangle-europe-algerie-russie.json';
import trumpIa from '../data/analyses/trump-ia-guardrails-anthropic.json';
import ecolesJournalisme from '../data/analyses/ecoles-journalisme-pluralite.json';
import { ANALYSIS_CATALOG, getAnalysis } from './analyses';

describe('analyses', () => {
  it('lists presidential, legislatives, 2027 preparation and programmes', () => {
    expect(ANALYSIS_CATALOG.length).toBeGreaterThanOrEqual(5);
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('legislatives-2024-desistements');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('assemblee-premier-tour');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('presidentielle-distorsion');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('presidentielle-2022-legislatives');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('presidentielle-2027-preparation');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('programmes-comparateur');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('alerte-citoyenne');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('declarations-x-candidats');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('lfi-bfmtv-exigence-pluralisme');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain(
      'ukraine-energie-triangle-europe-algerie-russie',
    );
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('trump-ia-guardrails-anthropic');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('ecoles-journalisme-pluralite');
  });

  it('alerte citoyenne documents 11 points with X signal source', () => {
    expect(alertes.items.length).toBe(11);
    expect(alertes.signal.status_id).toBe('2077697375322140699');
    expect(alertes.signal.url).toContain('2077697375322140699');
    expect(alertes.items.filter((i) => i.region === 'fr').length).toBe(8);
    expect(alertes.items.filter((i) => i.region === 'ue').length).toBe(3);
  });

  it('resolves analysis by slug', () => {
    expect(getAnalysis('legislatives-2024-desistements')?.href).toBe(
      '/analyses/legislatives-2024-desistements',
    );
    expect(getAnalysis('presidentielle-2027-preparation')?.preparation).toBe(true);
  });

  it('each analysis has its own cover path', () => {
    const srcs = ANALYSIS_CATALOG.map((a) => a.cover?.src);
    expect(srcs.every(Boolean)).toBe(true);
    expect(new Set(srcs).size).toBe(srcs.length);
  });

  it('LFI / BFMTV enquête keeps dual narratives and primary sources', () => {
    expect(lfiBfmtv.date).toBe('2026-09-17');
    expect(lfiBfmtv.updated).toBe('2026-09-17');
    expect(getAnalysis('lfi-bfmtv-exigence-pluralisme')?.title).toBe(lfiBfmtv.title);
    expect(lfiBfmtv.engagements_lfi).toHaveLength(4);
    expect(lfiBfmtv.point_attention).toMatch(/affirmés par LFI/i);
    expect(lfiBfmtv.point_attention).toMatch(/deux récits/i);
    const urls = lfiBfmtv.sources.map((s) => s.url);
    expect(urls).toContain(
      'https://lafranceinsoumise.fr/2026/09/09/pourquoi-nous-ne-repondrons-a-aucune-invitation-de-bfmtv-cette-semaine/',
    );
    expect(urls).toContain(
      'https://lafranceinsoumise.fr/2026/09/16/a-propos-de-la-presence-de-la-france-insoumise-sur-bfmtv/',
    );
  });

  it('Ukraine energy enquête cites iarbre seed and HI-strict A–E over UI web', () => {
    expect(ukraineEnergie.seed).toBe('seed_lmdpt_ukraine_energie_triangle_ae');
    expect(ukraineEnergie.updated).toBe('2026-09-17');
    expect(getAnalysis('ukraine-energie-triangle-europe-algerie-russie')?.title).toBe(
      ukraineEnergie.title,
    );
    expect(ukraineEnergie.oracle_url).toBe('https://iarbre.org');
    expect(ukraineEnergie.oracle_citation).toMatch(/définition HI stricte/);
    expect(ukraineEnergie.hi_definition).toMatch(/Affrontement armé/);
    expect(ukraineEnergie.branches.map((b) => b.id)).toEqual(['A', 'B', 'C', 'D', 'E']);
    expect(ukraineEnergie.disclaimer).toMatch(/signal secondaire/i);
    expect(ukraineEnergie.ui_web.intro).toMatch(/Signal secondaire/i);
    expect(ukraineEnergie.branches[0]?.range).toMatch(/45–55/);
    expect(ukraineEnergie.branches[4]?.range).toMatch(/2–5/);
  });

  it('Trump IA enquête anchors Truth Social primary source and dual narratives', () => {
    expect(trumpIa.slug).toBe('trump-ia-guardrails-anthropic');
    expect(trumpIa.date).toBe('2026-09-18');
    expect(trumpIa.updated).toBe('2026-09-20');
    expect(getAnalysis('trump-ia-guardrails-anthropic')?.title).toBe(trumpIa.title);
    expect(trumpIa.truth_social.status_id).toBe('117269745153543631');
    expect(trumpIa.point_attention).toMatch(/deux lectures/i);
    const urls = trumpIa.sources.map((s) => s.url);
    expect(urls).toContain('https://truthsocial.com/@realDonaldTrump/posts/117269745153543631');
    expect(urls.some((u) => u.includes('trumpstruth.org'))).toBe(true);
  });

  it('enquête écoles de journalisme laisse les sièges vides et cite la CPNEJ', () => {
    expect(ecolesJournalisme.date).toBe('2026-09-23');
    expect(getAnalysis('ecoles-journalisme-pluralite')?.title).toBe(ecolesJournalisme.title);
    expect(ecolesJournalisme.cursus).toHaveLength(16);
    expect(ecolesJournalisme.cursus.filter((c) => c.audition.startsWith('Entendue'))).toHaveLength(3);
    expect(ecolesJournalisme.assemblee.every((row) => row.statut === 'Siège vide')).toBe(true);
    expect(ecolesJournalisme.disclaimer).toMatch(/ni un vote fictif/i);
    expect(JSON.stringify(ecolesJournalisme)).not.toMatch(/74\s*%/);
    expect(JSON.stringify(ecolesJournalisme)).not.toMatch(/100\s*%/);
    const urls = ecolesJournalisme.sources.map((s) => s.url);
    expect(urls).toContain('https://cpnej.fr/les-cursus-de-journalisme-reconnus-par-le-cpnej/');
    expect(urls).toContain(
      'https://www.assemblee-nationale.fr/dyn/opendata/CRCANR5L17S2026PO874480N007.html',
    );
    expect(ecolesJournalisme.facultes).toHaveLength(11);
    const places = ecolesJournalisme.facultes
      .map((f) => f.places_2023)
      .filter((n): n is number => typeof n === 'number');
    expect(places.reduce((s, n) => s + n, 0)).toBe(ecolesJournalisme.facultes_somme);
    expect(ecolesJournalisme.facultes_somme).toBe(292);
    expect(
      ecolesJournalisme.facultes.filter((f) => f.audition.startsWith('Entendue')).map((f) => f.nom),
    ).toEqual(['IJBA']);
    expect(ecolesJournalisme.facultes_intro[0]).toMatch(/faculté veut dire université/);
    expect(ecolesJournalisme.facultes_critere).toMatch(/diversité de la société/);
    expect(ecolesJournalisme.facultes_critere).not.toMatch(/quota/);
    expect(urls).toContain('https://cej.education/wp-content/uploads/2023/06/CEJ_2023_Livre_Blanc_Web.pdf');
    expect(ecolesJournalisme.pistes.map((p) => p.horizon)).toEqual(['Court', 'Moyen', 'Long']);
    expect(ecolesJournalisme.pistes.every((p) => p.garde_fou.length > 20)).toBe(true);
    expect(ecolesJournalisme.pigistes_chiffres[0]?.valeur).toMatch(/4 282/);
    expect(ecolesJournalisme.redaction_lmdpt.join(' ')).toMatch(/ne publie pas de liste de pigistes/);
    expect(ecolesJournalisme.pistes[2]?.garde_fou).toMatch(/donnée sensible/);
    expect(urls).toContain('https://ccijp.fr/notre-faq/');
  });

  it('2027 preparation stub lists official sources and calendar', () => {
    expect(preparation.status).toBe('preparation');
    expect(preparation.sources.length).toBeGreaterThanOrEqual(7);
    expect(preparation.milestones.length).toBeGreaterThanOrEqual(3);
    expect(preparation.scope.exclu.some((item) => /sondage/i.test(item))).toBe(true);
    expect(preparation.calendar.status).toBe('official');
    expect(preparation.calendar.premier_tour_indicatif).toBe('2027-04-18');
    expect(preparation.veille.length).toBeGreaterThanOrEqual(3);
    expect(preparation.candidatures_veille.entries.length).toBeGreaterThanOrEqual(5);
  });
});
