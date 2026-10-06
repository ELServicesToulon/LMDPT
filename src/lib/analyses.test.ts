import { describe, expect, it } from 'vitest';
import preparation from '../data/analyses/presidentielle-2027-preparation.json';
import alertes from '../data/alertes-citoyennes.json';
import lfiBfmtv from '../data/analyses/lfi-bfmtv-exigence-pluralisme.json';
import ukraineEnergie from '../data/analyses/ukraine-energie-triangle-europe-algerie-russie.json';
import trumpIa from '../data/analyses/trump-ia-guardrails-anthropic.json';
import ecolesJournalisme from '../data/analyses/ecoles-journalisme-pluralite.json';
import dsaQuiDecide from '../data/analyses/dsa-qui-decide.json';
import lisnardAbonnes from '../data/analyses/lisnard-abonnes-electeurs.json';
import revolutionRevolte from '../data/analyses/on-a-vole-la-revolution-puis-la-revolte.json';
import { renderAnalysisInline } from './analysis-inline';
import { getUneDuJour } from './editorial';
import { socialTitleFrom, SOCIAL_TITLE_MAX } from './seo';
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
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('dsa-qui-decide');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('lisnard-abonnes-electeurs');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('on-a-vole-la-revolution-puis-la-revolte');
    expect(ANALYSIS_CATALOG[0]?.slug).toBe('on-a-vole-la-revolution-puis-la-revolte');
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
    const ukraineShare = getAnalysis('ukraine-energie-triangle-europe-algerie-russie')?.description ?? '';
    expect(ukraineShare).toMatch(/hypothèses/);
    expect(ukraineShare).not.toMatch(/oracle|iarbre|HI stricte|signal secondaire/i);
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

  it('enquête DSA distingue plateforme, loi et juge et cite les sources', () => {
    expect(dsaQuiDecide.slug).toBe('dsa-qui-decide');
    expect(dsaQuiDecide.date).toBe('2026-10-03');
    expect(dsaQuiDecide.updated).toBe('2026-10-03');
    expect(dsaQuiDecide.title).toBe(
      'Quand un compte disparaît, qui a décidé : la plateforme, l’État ou le juge ?',
    );
    const entry = getAnalysis('dsa-qui-decide');
    expect(entry?.title).toBe(dsaQuiDecide.title);
    expect(entry?.href).toBe('/analyses/dsa-qui-decide');
    expect(entry?.date).toBe('2026-10-03');
    expect(entry?.published).toBe('2026-10-03');
    expect(entry?.updated).toBe('2026-10-03');
    expect(entry?.description).toBe(dsaQuiDecide.chapo);
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/dsa-qui-decide.jpg');
    expect(entry?.cover?.alt.startsWith('Illustration à l’encre et à l’aquarelle :')).toBe(true);
    expect(getAnalysis('dsa-qui-decide')?.href).toBe('/analyses/dsa-qui-decide');
    expect(dsaQuiDecide.chapo.startsWith('Une amende pour des coches bleues')).toBe(true);
    expect(dsaQuiDecide.x_hook).toBe(dsaQuiDecide.title);
    expect(dsaQuiDecide.tags).toContain('presidentielle-2027');
    expect(dsaQuiDecide.disclaimer).toMatch(/traduites par LMDPT/);
    expect(dsaQuiDecide.disclaimer).toMatch(/ne vaut pas consigne de vote/);
    const encadre = dsaQuiDecide.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.cards).toHaveLength(8);
      expect(encadre.cards.map((card) => card.name)).toEqual([
        'Jean-Luc Mélenchon (La France insoumise)',
        'Marine Tondelier (Les Écologistes)',
        'Raphaël Glucksmann (Place publique)',
        'Gabriel Attal (Renaissance)',
        'Édouard Philippe (Horizons)',
        'Bruno Retailleau (Les Républicains)',
        'Marine Le Pen (Rassemblement national, en « binôme » avec Jordan Bardella)',
        'Éric Zemmour (Reconquête)',
      ]);
      expect(encadre.cards.every((card) => card.frotte.startsWith('Le point qui frotte'))).toBe(true);
      expect(encadre.intro).toMatch(/ne classe personne/);
    }
    expect(JSON.stringify(dsaQuiDecide.sections)).toMatch(
      /Note de méthode : la consultation directe d’EUR-Lex, en échec le 15 septembre puis dans la journée du 3 octobre, a abouti le 3 octobre au soir/,
    );
    expect(dsaQuiDecide.title.length).toBeGreaterThan(SOCIAL_TITLE_MAX);
    expect(socialTitleFrom(dsaQuiDecide.title).length).toBeLessThanOrEqual(SOCIAL_TITLE_MAX);
    expect(socialTitleFrom(dsaQuiDecide.title).endsWith('…')).toBe(true);
    const sourceUrls = dsaQuiDecide.sources_groups.flatMap((group) =>
      group.items.flatMap((item) => item.links.map((link) => link.url)),
    );
    const cardUrls =
      encadre?.kind === 'candidats'
        ? encadre.cards.flatMap((card) => [...card.sources.matchAll(/\((https?:\/\/[^)]+)\)/g)].map((m) => m[1]))
        : [];
    const urls = [...sourceUrls, ...cardUrls];
    expect(new Set(urls).size).toBe(62);
    expect(urls).toContain('https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32022R2065');
    expect(urls).toContain(
      'https://www.justice.gov/opa/pr/united-states-files-request-intervene-case-brought-x-corp-and-elon-musk-seeking-annul',
    );
    expect(urls).toContain('https://juricaf.org/arret/FRANCE-TRIBUNALJUDICIAIREDEPARIS-20240605-2100726');
    expect(urls).toContain(
      'https://www.legifrance.gouv.fr/jorf/id/JORFTEXT000049563368',
    );
    expect(urls).toContain('https://howtheyvote.eu/votes/146649');
    expect(urls).toContain('https://x.com/ZemmourEric/status/2076997030849683893');
    expect(urls).toContain('http://bbc.com/news/articles/cp39kngz008o');
    const raw = dsaQuiDecide.sources_groups.find((group) => group.title.startsWith('Raw hub'));
    expect(raw?.items.every((item) => item.links.length === 0 && item.label.endsWith('.md'))).toBe(true);
    expect(renderAnalysisInline('le DSA (*Digital Services Act*)')).toBe(
      'le DSA (<em>Digital Services Act</em>)',
    );
    expect(renderAnalysisInline('un contenu **illicite**')).toBe('un contenu <strong>illicite</strong>');
    expect(renderAnalysisInline('*Note de méthode : EUR-Lex*')).toBe('<em>Note de méthode : EUR-Lex</em>');
    expect(renderAnalysisInline('[EUR-Lex](https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32022R2065)')).toBe(
      '<a href="https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32022R2065" rel="noopener noreferrer">EUR-Lex</a>',
    );
    expect(renderAnalysisInline('<script>')).toBe('&lt;script&gt;');
  });

  it('enquête Lisnard du 4 octobre, sans cote ni lien Polymarket', () => {
    expect(lisnardAbonnes.slug).toBe('lisnard-abonnes-electeurs');
    expect(lisnardAbonnes.date).toBe('2026-10-04');
    expect(lisnardAbonnes.updated).toBe('2026-10-04');
    expect(lisnardAbonnes.title).toBe(
      "Lisnard gagne 100 000 abonnés, mais combien d'électeurs ?",
    );
    expect(lisnardAbonnes.x_hook).toBe(lisnardAbonnes.title);
    expect(lisnardAbonnes.title.length).toBeLessThanOrEqual(SOCIAL_TITLE_MAX);
    expect(socialTitleFrom(lisnardAbonnes.title)).toBe(lisnardAbonnes.title);
    const entry = getAnalysis('lisnard-abonnes-electeurs');
    expect(entry?.title).toBe(lisnardAbonnes.title);
    expect(entry?.href).toBe('/analyses/lisnard-abonnes-electeurs');
    expect(entry?.date).toBe('2026-10-04');
    expect(entry?.published).toBe('2026-10-04');
    expect(entry?.updated).toBe('2026-10-04');
    expect(entry?.description).toBe(lisnardAbonnes.description);
    expect(entry?.description.startsWith('Cent mille abonnés de plus en sept jours')).toBe(true);
    expect(entry?.description).toMatch(/100 700 abonnés/);
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/lisnard-abonnes-electeurs.jpg');
    expect(entry?.cover?.alt.startsWith('Illustration à l’encre et à l’aquarelle :')).toBe(true);
    expect(getAnalysis('dsa-qui-decide')?.date).toBe('2026-10-03');
    const encadre = lisnardAbonnes.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.title).toBe('Encadré · Ce que disent les candidats');
      expect(encadre.table.rows).toHaveLength(11);
      expect(encadre.intro).toMatch(/ne classe personne/);
      expect(encadre.conclusion).toMatch(/Ce que montre l'encadré/);
    }
    const raw = JSON.stringify(lisnardAbonnes);
    expect(raw).not.toMatch(/polymarket\.com/i);
    expect(raw).not.toMatch(/https?:[^"]*mileistesfr/i);
    expect(raw).not.toMatch(/gate_publish|DecisionTag|relecture/);
    expect(raw).toMatch(/@Mileistesfr/);
  });

  it('tribune Manusk du 5 octobre est la une, sans enquête DOE ni encadré candidats', () => {
    expect(revolutionRevolte.slug).toBe('on-a-vole-la-revolution-puis-la-revolte');
    expect(revolutionRevolte.date).toBe('2026-10-05');
    expect(revolutionRevolte.updated).toBe('2026-10-06');
    expect(revolutionRevolte.title).toBe('On a volé la révolution, puis la révolte');
    expect(revolutionRevolte.eyebrow).toBe('Tribune · Manusk');
    expect(revolutionRevolte.title.length).toBeLessThanOrEqual(SOCIAL_TITLE_MAX);
    expect(socialTitleFrom(revolutionRevolte.title)).toBe(revolutionRevolte.title);
    const entry = getAnalysis('on-a-vole-la-revolution-puis-la-revolte');
    expect(entry?.href).toBe('/analyses/on-a-vole-la-revolution-puis-la-revolte');
    expect(entry?.description).toBe(revolutionRevolte.chapo);
    expect(entry?.cover?.src).toBe('/illustrations/unes/placeholder-manquante.svg');
    expect(getUneDuJour()?.slug).toBe('on-a-vole-la-revolution-puis-la-revolte');
    expect(getUneDuJour()?.href).toBe('/analyses/on-a-vole-la-revolution-puis-la-revolte');
    expect(getUneDuJour()?.date).toBe('2026-10-05');
    expect(revolutionRevolte.sections.every((section) => section.kind === 'prose')).toBe(true);
    const published = JSON.stringify(revolutionRevolte).replace(/\u00a0/g, ' ');
    expect(published).toMatch(/n’engage pas la rédaction comme enquête DOE/);
    expect(published).toMatch(/6 059 interpellations et 715 policiers et gendarmes blessés/);
    expect(published).toMatch(/arrêté au 5 octobre au soir et compté depuis le 28 septembre/);
    expect(published).toMatch(/chiffres de mi-journée, provisoires/);
    expect(published).toMatch(/891 lycées/);
    expect(published).toMatch(/en compte 589/);
    expect(published).toMatch(/dix enquêtes ouvertes/);
    expect(published).not.toMatch(/plus de 5 000 interpellations sur la semaine/);
    expect(published).not.toMatch(/\bLens\b/);
    expect(published).not.toMatch(/Saint-Ouen-l’Aumône|Sevran|parquet de Tours|Béthune|Pas-de-Calais|Val-d’Oise|Indre-et-Loire/);
    expect(published).not.toMatch(/lycée de Lens|école de Lens/i);
    expect(published).not.toMatch(/gate_publish|DecisionTag|relecture|GO ELS|GO-L1/);
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
    expect(ecolesJournalisme.sapin_reponse).toMatch(/n’est pas la couleur de la personne/);
    expect(ecolesJournalisme.sapin_chrono.map((row) => row.date)).toEqual([
      '2024-01-16',
      '2026-06-10',
      '2026-09-04',
      '2026-09-04',
      '2026-09-19',
    ]);
    expect(ecolesJournalisme.sapin_chrono[0]?.fait).toMatch(/Charles Sapin n’est pas dans cette procédure/);
    expect(ecolesJournalisme.sapin_chrono[4]?.fait).toMatch(/pas Charles Sapin/);
    expect(ecolesJournalisme.sapin_lectures[2]?.lecture_b).toMatch(/Pas de pastille/);
    expect(ecolesJournalisme.sapin_lectures[2]?.lecture_b).toMatch(/Aucun siège à son nom/);
    expect(urls).toContain(
      'https://www.arcom.fr/presse/temps-de-parole-politique-mise-en-demeure-de-radio-france',
    );
    expect(urls).toContain(
      'https://www.france24.com/fr/info-en-continu/20260919-charles-sapin-ne-sera-plus-sur-france-inter-pour-son-%C3%A9dito-contest%C3%A9',
    );
    expect(getAnalysis('ecoles-journalisme-pluralite')?.description).toMatch(/affaire Sapin/);
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
