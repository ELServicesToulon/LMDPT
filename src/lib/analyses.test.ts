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
import batailleDu2Mai from '../data/analyses/bataille-du-2-mai.json';
import corseSenatNon from '../data/analyses/corse-senat-non.json';
import lePenUnionNationale from '../data/analyses/le-pen-union-nationale.json';
import secu115Contre1 from '../data/analyses/secu-115-contre-1.json';
import debordWatts from '../data/analyses/debord-watts-frigo-sans-courant.json';
import chroniqueFictionDemission from '../data/analyses/chronique-manusk-fiction-demission-macron.json';
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
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).not.toContain('on-a-vole-la-revolution-puis-la-revolte');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('lisnard-abonnes-electeurs');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('bataille-du-2-mai');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('corse-senat-non');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('le-pen-union-nationale');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('secu-115-contre-1');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('debord-watts-frigo-sans-courant');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain(
      'chronique-manusk-fiction-demission-macron',
    );
    expect(ANALYSIS_CATALOG[0]?.slug).toBe('bataille-du-2-mai');
    expect(ANALYSIS_CATALOG[1]?.slug).toBe('corse-senat-non');
    expect(ANALYSIS_CATALOG[2]?.slug).toBe('chronique-manusk-fiction-demission-macron');
    expect(ANALYSIS_CATALOG[3]?.slug).toBe('le-pen-union-nationale');
    expect(ANALYSIS_CATALOG[4]?.slug).toBe('secu-115-contre-1');
    expect(ANALYSIS_CATALOG[5]?.slug).toBe('debord-watts-frigo-sans-courant');
    expect(ANALYSIS_CATALOG[6]?.slug).toBe('breve-ifop-post-primaire');
    expect(ANALYSIS_CATALOG[7]?.slug).toBe('feuilleton-salle-attente-episode-1');
    expect(ANALYSIS_CATALOG[8]?.slug).toBe('primaire-droite-qui-la-veut');
    expect(ANALYSIS_CATALOG[9]?.slug).toBe('chronique-manusk-primaire-vent-arriere');
    expect(getAnalysis('freres-musulmans-strasbourg-a-vote')?.href).toBe(
      '/analyses/freres-musulmans-strasbourg-a-vote',
    );
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('ecoles-journalisme-pluralite');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain(
      'mouvement-lyceen-revendications-saucissonne',
    );
    expect(getAnalysis('mouvement-lyceen-revendications-saucissonne')?.href).toBe(
      '/analyses/mouvement-lyceen-revendications-saucissonne',
    );
  });

  it('analyse bataille du 2 mai du 29 octobre en une, sources, boîte DOE, tableau vacances', () => {
    expect(batailleDu2Mai.slug).toBe('bataille-du-2-mai');
    expect(batailleDu2Mai.date).toBe('2026-10-29');
    expect(batailleDu2Mai.updated).toBe('2026-10-29');
    expect(batailleDu2Mai.title).toBe(
      'Présidentielle : on se bat pour le 2 mai, mais le premier tour tombe en pleines vacances scolaires',
    );
    expect(batailleDu2Mai.author).toBe('La rédaction');
    expect(batailleDu2Mai.author_role).toBe('Rédaction LMDPT');
    expect(batailleDu2Mai.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(batailleDu2Mai.type_label).toBe('Analyse');
    expect(batailleDu2Mai.kicker).toBe('Analyse · La rédaction · 29 octobre 2026');
    expect(batailleDu2Mai.tags).toContain('doe');
    expect(batailleDu2Mai.x_hook).toBe(
      "Présidentielle : Retailleau veut changer les dates, pour ne pas voter le 2 mai, au lendemain du 1er-Mai. L'exécutif refuse et met en avant les vacances scolaires. Nous avons vérifié : le 2 mai, une seule zone scolaire reste en congés. Mais le 18 avril, au premier tour, les trois zones le seront.",
    );
    expect(batailleDu2Mai.description.length).toBeLessThanOrEqual(200);
    expect(batailleDu2Mai.description).toMatch(/18 avril et 2 mai 2027/);
    expect(batailleDu2Mai.disclaimer).toMatch(/opinion de la rédaction/);
    expect(batailleDu2Mai.sources_intro).toMatch(/Consultées le 28 octobre 2026/);
    expect(batailleDu2Mai.sources_closing).toMatch(/consultés le 28 octobre 2026/);
    expect(batailleDu2Mai.hues).toHaveLength(3);
    expect(batailleDu2Mai.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'lisnard',
    ]);
    expect(batailleDu2Mai.hues.map((hue) => hue.label)).toEqual([
      'État de droit et règles stables',
      'Républicanisme civique',
      "Transparence de l'action publique",
    ]);
    const retailleau = batailleDu2Mai.sections.find(
      (section) => section.kind === 'prose' && section.id === 'retailleau',
    );
    expect(retailleau?.kind).toBe('prose');
    if (retailleau?.kind === 'prose') {
      expect(retailleau.title).toBe('Ce que demande Retailleau');
    }
    const vacances = batailleDu2Mai.sections.find(
      (section) => section.kind === 'prose' && section.id === 'vacances',
    );
    expect(vacances?.kind).toBe('prose');
    if (vacances?.kind === 'prose') {
      expect(vacances.title).toBe('Nous avons compté les dimanches de vacances');
      const table = vacances.blocks.find((block) => block.type === 'table');
      expect(table?.type).toBe('table');
      if (table?.type === 'table') {
        expect(table.headers).toEqual([
          'Dimanche de vote',
          'Zones en vacances ce jour-là',
          'Nombre de zones',
        ]);
        expect(table.rows).toHaveLength(4);
        expect(table.rows[0]).toEqual([
          '**Calendrier retenu** : 1er tour 18 avril',
          'A, B et C',
          '3',
        ]);
        expect(table.rows[1]).toEqual([
          '**Calendrier retenu** : 2nd tour 2 mai',
          'B',
          '1',
        ]);
        expect(table.rows[2]).toEqual([
          '**Alternative** : 1er tour 11 avril',
          'A et C',
          '2',
        ]);
        expect(table.rows[3]).toEqual([
          '**Alternative** : 2nd tour 25 avril',
          'A et B',
          '2',
        ]);
      }
    }
    const courants = batailleDu2Mai.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('bataille-du-2-mai');
    expect(entry?.href).toBe('/analyses/bataille-du-2-mai');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/bataille-du-2-mai.jpg');
    expect(entry?.cover?.alt).toMatch(/urne transparente vide/);
    expect(getUneDuJour()?.slug).toBe('bataille-du-2-mai');
    const nSources = batailleDu2Mai.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(13);
    const sourceBlob = JSON.stringify(batailleDu2Mai.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.franceinfo.fr/elections/presidentielle/le-gouvernement-oppose-une-fin-de-non-recevoir-a-la-demande-de-bruno-retailleau-de-changer-les-dates-de-la-presidentielle_8257021.html',
    );
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/actualites\/A15053/);
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/actualites\/A18563/);
    expect(sourceBlob).toMatch(/blogdudroitelectoral\.fr\/\?p=23599/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/le-bloc-de-constitutionnalite/);
    expect(sourceBlob).toMatch(/legifrance\.gouv\.fr\/jorf\/id\/JORFTEXT000052416058/);
    expect(sourceBlob).toMatch(/unenouvelleenergie\.fr\/quand-macron-a-parle/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = batailleDu2Mai.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Position sur les dates de la présidentielle',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(7);
      expect(encadre.note).toMatch(/Non trouvé/);
      const retailleauRow = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleauRow?.[1]).toMatch(/solennellement/);
      expect(retailleauRow?.[2]).toBe('[1][2][8][9]');
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/nécessairement rompue/);
      expect(lePen?.[2]).toBe('[1][4][8]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[1]).toMatch(/C'est une question qui peut se poser/);
      expect(lisnard?.[2]).toBe('[11]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/non trouvée dans les sources consultées/);
      expect(glucksmann?.[2]).toBe('Aucune');
    }
    const analyseTexts = [
      batailleDu2Mai.chapo,
      batailleDu2Mai.description,
      batailleDu2Mai.disclaimer,
      batailleDu2Mai.sources_closing,
      ...batailleDu2Mai.sections.flatMap((section) => {
        if (section.kind === 'prose') {
          return section.blocks.flatMap((block) =>
            block.type === 'p'
              ? [block.text]
              : block.type === 'ul' || block.type === 'ol'
                ? block.items
                : block.type === 'table'
                  ? [...block.headers, ...block.rows.flat()]
                  : [],
          );
        }
        if (section.kind === 'candidats') {
          return [
            section.intro,
            section.note,
            section.conclusion,
            ...section.table.headers,
            ...section.table.rows.flat(),
          ];
        }
        return [];
      }),
    ].join('\n');
    expect(analyseTexts).not.toMatch(/—/);
    expect(analyseTexts).toMatch(/\[1\]/);
    expect(analyseTexts).toMatch(/\[13\]/);
    expect(analyseTexts).toMatch(/4 de chaque côté/);
    expect(analyseTexts).toMatch(/trois zones scolaires de métropole/);
    expect(analyseTexts).toMatch(/article L\. 49/);
    expect(analyseTexts).toMatch(/13 mai 2027 à minuit/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(batailleDu2Mai)).not.toMatch(/<!--/);
  });

  it('analyse Corse Sénat non du 28 octobre en une, sources, boîte DOE', () => {
    expect(corseSenatNon.slug).toBe('corse-senat-non');
    expect(corseSenatNon.date).toBe('2026-10-28');
    expect(corseSenatNon.updated).toBe('2026-10-28');
    expect(corseSenatNon.title).toBe(
      'Corse : le Sénat rejette par 181 voix contre 134 le texte modifié, pourtant voté par 122 LR sur 124',
    );
    expect(corseSenatNon.author).toBe('La rédaction');
    expect(corseSenatNon.author_role).toBe('Rédaction LMDPT');
    expect(corseSenatNon.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(corseSenatNon.type_label).toBe('Analyse');
    expect(corseSenatNon.kicker).toBe('Analyse · La rédaction · 28 octobre 2026');
    expect(corseSenatNon.tags).toContain('doe');
    expect(corseSenatNon.x_hook).toBe(
      "Corse : le Sénat a rejeté la réforme constitutionnelle par 181 voix contre 134. 122 des 124 LR ont pourtant voté pour, sur un texte « largement réécrit » « à l'initiative de la droite », selon franceinfo. Aucun socialiste ni écologiste n'a voté pour.",
    );
    expect(corseSenatNon.description.length).toBeLessThanOrEqual(200);
    expect(corseSenatNon.description).toMatch(/181 voix contre 134/);
    expect(corseSenatNon.disclaimer).toMatch(/opinion de la rédaction/);
    expect(corseSenatNon.sources_intro).toMatch(/Consultées le 27 octobre 2026/);
    expect(corseSenatNon.sources_closing).toMatch(/consultés le 27 octobre 2026/);
    expect(corseSenatNon.hues).toHaveLength(3);
    expect(corseSenatNon.hues.map((hue) => hue.slug)).toEqual([
      'lisnard',
      'pluraliste',
      'droite',
    ]);
    expect(corseSenatNon.hues.map((hue) => hue.label)).toEqual([
      'Décentralisation et subsidiarité',
      'Parlementarisme',
      'Constitutionnalisme',
    ]);
    const non = corseSenatNon.sections.find(
      (section) => section.kind === 'prose' && section.id === 'non',
    );
    expect(non?.kind).toBe('prose');
    if (non?.kind === 'prose') {
      expect(non.title).toBe('181 « non » : ce que dit le scrutin, et ce qu\'il ne dit pas');
      const scrutin = non.blocks.find((block) => block.type === 'table');
      expect(scrutin?.type).toBe('table');
      if (scrutin?.type === 'table') {
        expect(scrutin.headers).toEqual([
          'Groupe',
          'Pour',
          'Contre',
          'Abstention',
          'Ne prend pas part',
        ]);
        expect(scrutin.rows).toHaveLength(11);
        expect(scrutin.rows[0]).toEqual([
          'Les Républicains (124)',
          '122',
          '1',
          '0',
          '1 (Gérard Larcher, président du Sénat)',
        ]);
        expect(scrutin.rows[10]?.[0]).toBe('**Total**');
        expect(scrutin.rows[10]?.[2]).toBe('**181**');
      }
    }
    const procedure = corseSenatNon.sections.find(
      (section) => section.kind === 'prose' && section.id === 'procedure',
    );
    expect(procedure?.kind).toBe('prose');
    if (procedure?.kind === 'prose') {
      expect(procedure.title).toBe(
        'La procédure de 1991 : 13 « évolutions normatives » sur « au moins 73 » demandes',
      );
    }
    const courants = corseSenatNon.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('corse-senat-non');
    expect(entry?.href).toBe('/analyses/corse-senat-non');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/corse-senat-non.jpg');
    expect(entry?.cover?.alt).toMatch(/pile d'enveloppes vierges ficelées/);
    expect(getUneDuJour()?.slug).not.toBe('corse-senat-non');
    expect(getUneDuJour()?.date).toBe('2026-10-29');
    const nSources = corseSenatNon.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(15);
    const sourceBlob = JSON.stringify(corseSenatNon.sources_groups);
    expect(sourceBlob).toContain('https://www.senat.fr/scrutin-public/2026/scr2026-34.html');
    expect(sourceBlob).toMatch(/scrutins\/7454/);
    expect(sourceBlob).toMatch(/senat\.fr\/rap\/l26-085/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/le-bloc-de-constitutionnalite/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/france\/corse\/le-senat-rejette/);
    expect(sourceBlob).toMatch(/corsematin\.com\/article\/politique/);
    expect(sourceBlob).toMatch(/ecologie\.gouv\.fr\/presse\/autonomie-corse/);
    expect(sourceBlob).toMatch(/europe1\.fr\/politique\/presidentielle-le-statut-dautonomie/);
    expect(sourceBlob).toMatch(/senat\.fr\/cra\/s20261026\/s20261026_mono\.html/);
    expect(sourceBlob).toMatch(/déroulé de la séance/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = corseSenatNon.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        "Position sur l'autonomie de la Corse",
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(10);
      expect(encadre.note).toMatch(/déclarations publiques/);
      expect(encadre.note).toMatch(/\[1\], \[11\] à \[15\]/);
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/Si cette autonomie s'imagine contre la France/);
      expect(lePen?.[2]).toBe('[12][13]');
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/indivisibilité/);
      expect(retailleau?.[1]).toMatch(/voté pour le texte modifié par le Sénat/);
      expect(retailleau?.[2]).toBe('[1][12][15]');
      const bertrand = encadre.table.rows.find((row) => row[0]?.includes('Bertrand'));
      expect(bertrand?.[1]).toMatch(/référendum comme préalable incontournable/);
      expect(bertrand?.[2]).toBe('[13]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/non trouvée dans les sources consultées/);
      expect(glucksmann?.[2]).toBe('Aucune');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/autonomie étendue que demande ce peuple/);
      expect(melenchon?.[2]).toBe('[13]');
    }
    const analyseTexts = [
      corseSenatNon.chapo,
      corseSenatNon.description,
      corseSenatNon.disclaimer,
      corseSenatNon.sources_closing,
      ...corseSenatNon.sections.flatMap((section) => {
        if (section.kind === 'prose') {
          return section.blocks.flatMap((block) =>
            block.type === 'p'
              ? [block.text]
              : block.type === 'ul' || block.type === 'ol'
                ? block.items
                : block.type === 'table'
                  ? [...block.headers, ...block.rows.flat()]
                  : [],
          );
        }
        if (section.kind === 'candidats') {
          return [
            section.intro,
            section.note,
            section.conclusion,
            ...section.table.headers,
            ...section.table.rows.flat(),
          ];
        }
        return [];
      }),
    ].join('\n');
    expect(analyseTexts).not.toMatch(/—/);
    expect(analyseTexts).toMatch(/\[1\]/);
    expect(analyseTexts).toMatch(/\[2\]/);
    expect(analyseTexts).toMatch(/\[14\]/);
    expect(analyseTexts).toMatch(/\[15\]/);
    expect(analyseTexts).toMatch(/au moins 73/);
    expect(analyseTexts).toMatch(/seules 13 des 73 demandes d'adaptation/);
    expect(analyseTexts).toMatch(/très improbable/);
    expect(analyseTexts).toMatch(/122 sur 124/);
    expect(analyseTexts).toMatch(
      /de retirer du projet de révision l'inscription d'un « principe de non-régression »/,
    );
    expect(analyseTexts).toMatch(/s'agissant d'un projet de loi constitutionnelle/);
    expect(analyseTexts).toMatch(
      /Notre calcul : le rapport compte ces demandes « sans prétendre à l'exhaustivité » ; sur les 73 qu'il recense, 60 n'ont pas débouché sur une « évolution normative »/,
    );
    expect(analyseTexts).toMatch(/scrutin public n° 34/);
    expect(analyseTexts).toMatch(/Trois questions simples/);
    expect(analyseTexts).toMatch(/Gérard Larcher/);
    expect(JSON.stringify(corseSenatNon)).not.toMatch(/<!--/);
  });

  it('chronique Manusk fiction démission Macron du 28 octobre, bandeau, DOE, sources', () => {
    expect(chroniqueFictionDemission.slug).toBe('chronique-manusk-fiction-demission-macron');
    expect(chroniqueFictionDemission.date).toBe('2026-10-28');
    expect(chroniqueFictionDemission.updated).toBe('2026-10-28');
    expect(chroniqueFictionDemission.title.startsWith('Fiction :')).toBe(true);
    expect(chroniqueFictionDemission.title).toBe(
      "Fiction : Macron s'en va, premier tour dans 35 jours au plus. Le Pen, aidée ou bloquée",
    );
    expect(chroniqueFictionDemission.x_hook.startsWith('Fiction :')).toBe(true);
    expect(chroniqueFictionDemission.x_hook).toBe(chroniqueFictionDemission.title);
    expect(chroniqueFictionDemission.author).toBe('Manusk');
    expect(chroniqueFictionDemission.author_role).toBe('Chroniqueur invité');
    expect(chroniqueFictionDemission.eyebrow).toBe('Chronique · Manusk');
    expect(chroniqueFictionDemission.type_label).toBe("Chronique d'opinion");
    expect(chroniqueFictionDemission.kicker).toBe('Chronique · Manusk · 28 octobre 2026');
    expect(chroniqueFictionDemission.kicker).not.toMatch(/DRAFT/);
    expect(chroniqueFictionDemission.fiction_banner).toBe(
      "FICTION / PROSPECTIVE. Rien de ce qui suit n'est arrivé. Emmanuel Macron n'a pas démissionné, et rien ne l'annonce.",
    );
    expect(chroniqueFictionDemission.disclaimer).toMatch(/Chronique d'opinion et fiction prospective signée Manusk/);
    expect(chroniqueFictionDemission.disclaimer).toMatch(/n'engage pas la rédaction/);
    expect(chroniqueFictionDemission.description.length).toBeLessThanOrEqual(200);
    expect(chroniqueFictionDemission.tags).toContain('manusk');
    expect(chroniqueFictionDemission.hues).toHaveLength(3);
    expect(chroniqueFictionDemission.hues.map((hue) => hue.slug)).toEqual([
      'philippe',
      'parti-socialiste',
      'le-pen',
    ]);
    expect(chroniqueFictionDemission.hues.map((hue) => hue.label)).toEqual([
      'Droite et centre (Horizons)',
      'Social-démocrate',
      'Rassemblement national',
    ]);
    expect(chroniqueFictionDemission.hues[2]?.rationale).toMatch(/en tension/i);
    const chronique = chroniqueFictionDemission.sections.find(
      (section) => section.kind === 'prose' && section.id === 'chronique',
    );
    expect(chronique?.kind).toBe('prose');
    if (chronique?.kind === 'prose') {
      const paras = chronique.blocks.filter((block) => block.type === 'p');
      expect(paras).toHaveLength(12);
      expect(chroniqueFictionDemission.chapo).toMatch(/Et si le président partait un lundi matin/);
    }
    const courants = chroniqueFictionDemission.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Badges des courants en phase');
    }
    const entry = getAnalysis('chronique-manusk-fiction-demission-macron');
    expect(entry?.href).toBe('/analyses/chronique-manusk-fiction-demission-macron');
    expect(entry?.cover?.src).toBe(
      '/illustrations/unes/analyses/chronique-manusk-fiction-demission-macron.jpg',
    );
    expect(entry?.cover?.alt).toMatch(/fauteuil présidentiel vide/);
    expect(getUneDuJour()?.slug).not.toBe('chronique-manusk-fiction-demission-macron');
    const nSources = chroniqueFictionDemission.sources_groups.reduce(
      (n, g) => n + g.items.length,
      0,
    );
    expect(nSources).toBe(11);
    const sourceBlob = JSON.stringify(chroniqueFictionDemission.sources_groups);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/le-bloc-de-constitutionnalite/);
    expect(sourceBlob).toMatch(/legifrance\.gouv\.fr\/loda\/id\/JORFTEXT000000684037/);
    expect(sourceBlob).toMatch(/courdecassation\.fr/);
    expect(sourceBlob).toMatch(/commission-des-sondages\.fr\/notices/);
    expect(sourceBlob).toMatch(/31mars 2025/);
    expect(JSON.stringify(chroniqueFictionDemission)).not.toMatch(/DRAFT, pas de X/);
    expect(JSON.stringify(chroniqueFictionDemission)).not.toMatch(/Test rédaction/);
    expect(JSON.stringify(chroniqueFictionDemission)).not.toMatch(/Note pour la future PR/);
    const encadre = chroniqueFictionDemission.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual(['Candidat', 'Situation réelle', 'Dans la fiction']);
      expect(encadre.table.rows).toHaveLength(4);
      expect(encadre.note).toMatch(/hypothèse de la rédaction/);
    }
    const chroniqueTexts = [
      chroniqueFictionDemission.chapo,
      chroniqueFictionDemission.description,
      chroniqueFictionDemission.disclaimer,
      chroniqueFictionDemission.fiction_banner,
      chroniqueFictionDemission.sources_closing,
      ...(chronique?.kind === 'prose'
        ? chronique.blocks.flatMap((block) =>
            block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : [],
          )
        : []),
      ...(courants?.kind === 'prose'
        ? courants.blocks.flatMap((block) =>
            block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : [],
          )
        : []),
      ...(encadre?.kind === 'candidats'
        ? [
            encadre.intro,
            encadre.note,
            encadre.conclusion,
            ...encadre.table.headers,
            ...encadre.table.rows.flat(),
          ]
        : []),
    ].join('\n');
    expect(chroniqueTexts).not.toMatch(/—/);
    expect(socialTitleFrom(chroniqueFictionDemission.title).startsWith('Fiction :')).toBe(true);
  });

  it('analyse Union nationale du 26 octobre, sources, boîte DOE', () => {
    expect(lePenUnionNationale.slug).toBe('le-pen-union-nationale');
    expect(lePenUnionNationale.date).toBe('2026-10-26');
    expect(lePenUnionNationale.updated).toBe('2026-10-26');
    expect(lePenUnionNationale.title).toBe(
      "« Union nationale » : le chef d'orchestre est choisi, les musiciens manquent",
    );
    expect(lePenUnionNationale.author).toBe('La rédaction');
    expect(lePenUnionNationale.author_role).toBe('Rédaction LMDPT');
    expect(lePenUnionNationale.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(lePenUnionNationale.type_label).toBe('Analyse');
    expect(lePenUnionNationale.kicker).toBe('Analyse · La rédaction · 26 octobre 2026');
    expect(lePenUnionNationale.tags).toContain('doe');
    expect(lePenUnionNationale.x_hook).toBe(
      "Le Pen promet l'« union nationale » et a déjà choisi son Premier ministre. Pour atteindre 289 députés dans l'Assemblée d'aujourd'hui, il en manque 151 au RN et à son allié",
    );
    expect(lePenUnionNationale.description.length).toBeLessThanOrEqual(200);
    expect(lePenUnionNationale.description).toMatch(/il en manque 151/);
    expect(lePenUnionNationale.disclaimer).toMatch(/opinion de la rédaction/);
    expect(lePenUnionNationale.sources_intro).toMatch(/Consultées le 25 octobre 2026/);
    expect(lePenUnionNationale.sources_closing).toMatch(/consultés le 25 octobre 2026/);
    expect(lePenUnionNationale.hues).toHaveLength(3);
    expect(lePenUnionNationale.hues.map((hue) => hue.slug)).toEqual([
      'pluraliste',
      'parti-socialiste',
      'droite',
    ]);
    expect(lePenUnionNationale.hues.map((hue) => hue.label)).toEqual([
      'Parlementarisme',
      'Culture de coalition',
      'Constitutionnalisme',
    ]);
    const orleans = lePenUnionNationale.sections.find(
      (section) => section.kind === 'prose' && section.id === 'orleans',
    );
    expect(orleans?.kind).toBe('prose');
    if (orleans?.kind === 'prose') {
      expect(orleans.title).toBe('Ce qui a été promis à Orléans');
    }
    const addition = lePenUnionNationale.sections.find(
      (section) => section.kind === 'prose' && section.id === 'addition',
    );
    expect(addition?.kind).toBe('prose');
    if (addition?.kind === 'prose') {
      expect(addition.title).toBe("L'union, c'est d'abord une addition");
    }
    const courants = lePenUnionNationale.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('le-pen-union-nationale');
    expect(entry?.href).toBe('/analyses/le-pen-union-nationale');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/le-pen-union-nationale.jpg');
    expect(entry?.cover?.alt).toMatch(/estrade de chef d'orchestre vide/);
    expect(getUneDuJour()?.slug).not.toBe('le-pen-union-nationale');
    const nSources = lePenUnionNationale.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(17);
    const sourceBlob = JSON.stringify(lePenUnionNationale.sources_groups);
    expect(sourceBlob).toMatch(/scrutins\/9097/);
    expect(sourceBlob).toContain(
      'https://www2.assemblee-nationale.fr/instances/liste/groupes_politiques/effectif',
    );
    expect(sourceBlob).toMatch(/franceinfo\.fr\/politique\/front-national\/congres-du-rn/);
    expect(sourceBlob).toMatch(/lesechos\.fr\/elections\/presidentielle\/a-orleans-marine-le-pen/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/le-bloc-de-constitutionnalite/);
    expect(sourceBlob).toMatch(/delorscentre\.eu/);
    expect(sourceBlob).toMatch(/senat\.fr\/senateurs\/grp\.html/);
    expect(sourceBlob).toMatch(/publicsenat\.fr/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = lePenUnionNationale.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        "Ce qu'il ou elle dit des alliances",
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(8);
      expect(encadre.note).toMatch(/déclarations publiques citées par les sources/);
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/union nationale/);
      expect(lePen?.[2]).toBe('[1][3]');
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/seront mes adversaires/);
      expect(retailleau?.[2]).toBe('[8][14][10]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/C'est tranché, c'est fini/);
      expect(glucksmann?.[2]).toBe('[15]');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/non trouvée dans les sources consultées/);
      expect(melenchon?.[2]).toBe('Aucune');
    }
    const analyseTexts = [
      lePenUnionNationale.chapo,
      lePenUnionNationale.description,
      lePenUnionNationale.disclaimer,
      lePenUnionNationale.sources_closing,
      ...lePenUnionNationale.sections.flatMap((section) => {
        if (section.kind === 'prose') {
          return section.blocks.flatMap((block) =>
            block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : [],
          );
        }
        if (section.kind === 'candidats') {
          return [
            section.intro,
            section.note,
            section.conclusion,
            ...section.table.headers,
            ...section.table.rows.flat(),
          ];
        }
        return [];
      }),
    ].join('\n');
    expect(analyseTexts).not.toMatch(/—/);
    expect(analyseTexts).toMatch(/\[1\]/);
    expect(analyseTexts).toMatch(/\[16\]/);
    expect(analyseTexts).toMatch(/\[17\]/);
    expect(analyseTexts).toMatch(/98,98 %/);
    expect(analyseTexts).toMatch(/il en manque 151/);
    expect(analyseTexts).toMatch(/chef de l'orchestre gouvernemental/);
    expect(analyseTexts).toMatch(/Union nationale pour les Territoires/);
    expect(analyseTexts).toMatch(/un recrutement, pas une union/);
    expect(analyseTexts).toContain(
      "Selon Mediapart, des messages antisémites envoyés en 2013 sur Facebook Messenger seraient de Jordan Bardella.",
    );
    expect(analyseTexts).toContain("visé par des accusations qu'il conteste");
    expect(analyseTexts).not.toContain('Mediapart affirme que Jordan Bardella a écrit');
    expect(analyseTexts).not.toContain("au centre d'une affaire");
    expect(JSON.stringify(lePenUnionNationale)).not.toMatch(/<!--/);
  });

  it('analyse Sécu 115 contre 1 du 25 octobre, sources, boîte DOE', () => {
    expect(secu115Contre1.slug).toBe('secu-115-contre-1');
    expect(secu115Contre1.date).toBe('2026-10-25');
    expect(secu115Contre1.updated).toBe('2026-10-25');
    expect(secu115Contre1.title).toBe("115 contre 1 : l'Assemblée efface quatre jours de votes");
    expect(secu115Contre1.author).toBe('La rédaction');
    expect(secu115Contre1.author_role).toBe('Rédaction LMDPT');
    expect(secu115Contre1.eyebrow).toBe('Analyse · Budget de la Sécu');
    expect(secu115Contre1.type_label).toBe('Analyse');
    expect(secu115Contre1.kicker).toBe('Analyse · La rédaction · 25 octobre 2026');
    expect(secu115Contre1.tags).toContain('doe');
    expect(secu115Contre1.x_hook).toBe('115 contre 1, mais 138 votants : quatre jours de votes effacés');
    expect(secu115Contre1.description.length).toBeLessThanOrEqual(200);
    expect(secu115Contre1.description).toMatch(/quatre jours de votes effacés/);
    expect(secu115Contre1.disclaimer).toMatch(/opinion de la rédaction/);
    expect(secu115Contre1.sources_intro).toMatch(/Consultées du 23 au 25 octobre 2026/);
    expect(secu115Contre1.sources_closing).toMatch(/consultés du 23 au 25 octobre 2026/);
    expect(secu115Contre1.hues).toHaveLength(3);
    expect(secu115Contre1.hues.map((hue) => hue.slug)).toEqual([
      'pluraliste',
      'droite',
      'parti-socialiste',
    ]);
    const raz = secu115Contre1.sections.find(
      (section) => section.kind === 'prose' && section.id === 'raz-de-maree',
    );
    expect(raz?.kind).toBe('prose');
    const troisJours = secu115Contre1.sections.find(
      (section) => section.kind === 'prose' && section.id === 'trois-jours',
    );
    expect(troisJours?.kind).toBe('prose');
    if (troisJours?.kind === 'prose') {
      expect(troisJours.title).toBe('Quatre jours de votes, puis la gomme');
      const bullets = troisJours.blocks.find((block) => block.type === 'ul');
      expect(bullets?.type).toBe('ul');
      if (bullets?.type === 'ul') {
        expect(bullets.items).toHaveLength(7);
        expect(bullets.items.filter((item) => item.includes('sans scrutin public retrouvé'))).toHaveLength(4);
      }
    }
    const courants = secu115Contre1.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('secu-115-contre-1');
    expect(entry?.href).toBe('/analyses/secu-115-contre-1');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/secu-115-contre-1.jpg');
    expect(entry?.cover?.alt).toMatch(/hémicycle presque vide/);
    expect(getUneDuJour()?.slug).not.toBe('secu-115-contre-1');
    const nSources = secu115Contre1.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(16);
    const sourceBlob = JSON.stringify(secu115Contre1.sources_groups);
    expect(sourceBlob).toMatch(/scrutins\/9097/);
    expect(sourceBlob).toMatch(/article_lc\/LEGIARTI000045358069/);
    expect(sourceBlob).toMatch(/vie-publique\.fr\/loi\/305082/);
    expect(sourceBlob).toMatch(/france24\.com\/fr\/info-en-continu\/20261023/);
    expect(sourceBlob).toMatch(/midilibre\.fr\/2026\/10\/23/);
    expect(sourceBlob).toMatch(/Vie publique/);
    expect(sourceBlob).toMatch(/France 24 avec AFP/);
    expect(sourceBlob).toMatch(/actualites-accueil-hub\/rejet-en-premiere-lecture-du-projet-de-loi-de-financement-de-la-securite-sociale-pour-2027/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = secu115Contre1.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Programme retraites et Sécu (avant le vote)',
        'Vote du groupe proche le 23 octobre, pas du candidat [1]',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(8);
      expect(encadre.note).toMatch(/groupes parlementaires proches/);
      expect(encadre.note).toMatch(/l'âge, la durée et le financement/);
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/dose de capitalisation/);
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/25 à 30 %/);
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/pas encore détaillée/);
      expect(glucksmann?.[2]).toMatch(/Place publique n'a pas de groupe/);
      expect(glucksmann?.[2]).toMatch(/Groupe le plus proche : Socialistes, 8 contre, sur 68 membres/);
      expect(glucksmann?.[3]).toBe('[8][1]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[2]).toMatch(/Sans objet/);
      expect(lisnard?.[3]).toBe('Aucune');
    }
    const analyseTexts = [
      secu115Contre1.chapo,
      secu115Contre1.description,
      secu115Contre1.disclaimer,
      secu115Contre1.sources_closing,
      ...secu115Contre1.sections.flatMap((section) => {
        if (section.kind === 'prose') {
          return section.blocks.flatMap((block) =>
            block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : [],
          );
        }
        if (section.kind === 'candidats') {
          return [
            section.intro,
            section.note,
            section.conclusion,
            ...section.table.headers,
            ...section.table.rows.flat(),
          ];
        }
        return [];
      }),
    ].join('\n');
    expect(analyseTexts).not.toMatch(/—/);
    expect(analyseTexts).toMatch(/\[1\]/);
    expect(analyseTexts).toMatch(/\[13\]/);
    expect(analyseTexts).toMatch(/\[14\]/);
    expect(analyseTexts).toMatch(/\[15\]/);
    expect(analyseTexts).toMatch(/le Sénat examinera bien le texte à partir du 9 novembre/);
    expect(analyseTexts).toMatch(/selon Vie publique et Capital \[14\]\[5\]/);
    expect(analyseTexts).toMatch(/Vendredi, 138 ont voté/);
    expect(analyseTexts).toMatch(/les plus précaires/);
    expect(analyseTexts).toMatch(/samedi 24 octobre à 19 h 45/);
    expect(analyseTexts).toMatch(/en application de l'article L\.O\. 111-7-1/);
    expect(analyseTexts).toMatch(/sans scrutin public retrouvé/);
    expect(analyseTexts).toMatch(/ministre de l'Action et des Comptes publics/);
    expect(analyseTexts).toMatch(/Du mardi 20 au vendredi 23 octobre, quatre jours de séance/);
    expect(analyseTexts).toMatch(/rapportent Les Échos et l'AFP \[3\]\[15\]\[16\]/);
    expect(analyseTexts).toMatch(/dans le contre-budget 2027, sans dire s'il s'agit d'une seule année ou d'un cumul/);
    expect(analyseTexts).toMatch(/Trois jours plus tôt, le mardi 20 octobre/);
    expect(analyseTexts.replace('Trois jours plus tôt, le mardi 20 octobre', '')).not.toMatch(/trois jours/i);
  });

  it('chronique Manusk Debord du 23 octobre en une, 17 sources, boîte DOE', () => {
    expect(debordWatts.slug).toBe('debord-watts-frigo-sans-courant');
    expect(debordWatts.date).toBe('2026-10-23');
    expect(debordWatts.updated).toBe('2026-10-23');
    expect(debordWatts.title).toBe('Le frigo sans courant');
    expect(debordWatts.author).toBe('Manusk');
    expect(debordWatts.author_role).toBe('Chroniqueur invité');
    expect(debordWatts.eyebrow).toBe('Chronique · Manusk');
    expect(debordWatts.type_label).toBe("Chronique d'opinion");
    expect(debordWatts.kicker).toBe('Chronique · Manusk · 23 octobre 2026');
    expect(debordWatts.tags).toContain('manusk');
    expect(debordWatts.x_hook).toBe(debordWatts.title);
    expect(debordWatts.description.length).toBeLessThanOrEqual(200);
    expect(debordWatts.disclaimer).toMatch(/^Chronique d'opinion signée Manusk/);
    expect(debordWatts.sources_closing).toMatch(/^Chronique d'opinion signée Manusk/);
    expect(debordWatts.hues).toHaveLength(3);
    const chronique = debordWatts.sections.find(
      (section) => section.kind === 'prose' && section.id === 'chronique',
    );
    expect(chronique?.kind).toBe('prose');
    if (chronique?.kind === 'prose') {
      const paras = chronique.blocks.filter((block) => block.type === 'p');
      expect(paras).toHaveLength(7);
      const chroniqueBody = paras.map((block) => (block.type === 'p' ? block.text : '')).join('\n');
      expect(debordWatts.chapo).toMatch(/Les 17 et 18 octobre, des magasins ont été pillés/);
      expect(chroniqueBody).toMatch(/Sephora de Lille/);
      expect(chroniqueBody).toMatch(/boulevard Magenta/);
      expect(chroniqueBody).toMatch(/Son meilleur argument mérite quand même qu'on s'y arrête\./);
    }
    const courants = debordWatts.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette chronique rejoint');
    }
    const entry = getAnalysis('debord-watts-frigo-sans-courant');
    expect(entry?.href).toBe('/analyses/debord-watts-frigo-sans-courant');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/debord-watts-frigo-sans-courant.jpg');
    expect(entry?.cover?.alt).toMatch(/vitrine brisée/);
    expect(getUneDuJour()?.slug).not.toBe('debord-watts-frigo-sans-courant');
    const nSources = debordWatts.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(17);
    const sourceBlob = JSON.stringify(debordWatts.sources_groups);
    expect(sourceBlob).not.toMatch(/tension maximale/);
    expect(sourceBlob).not.toMatch(/programme de travaux publics/);
    expect(sourceBlob).toMatch(/la désolation à Lille au lendemain du 17 octobre/);
    expect(sourceBlob).toMatch(
      /https:\/\/actu.fr\/hauts-de-france\/lille_59350\/en-images-commerces-eventres-vides-odeur-de-brule-persistante-la-desolation-a-lille-au-lendemain-du-17-octobre_64940855.html/,
    );
    expect(sourceBlob).toMatch(
      /https:\/\/actu.fr\/nouvelle-aquitaine\/bordeaux_33063\/mobilisation-du-17-octobre-les-images-de-l-apple-store-devalise-en-marge-de-la-manifestation-a-bordeaux_64941387.html/,
    );
    expect(sourceBlob).not.toMatch(
      /https:\/\/www.france24.com\/fr\/france\/20261017-france-les-grandes-villes-en-proie-aux-pillages-en-marge-des-manifestations/,
    );
    const encadre = debordWatts.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual(['Candidat ou responsable', 'Position publique', 'Source']);
      expect(encadre.table.rows).toHaveLength(8);
      expect(encadre.intro).toMatch(/ne classe pas/);
      expect(encadre.note).toMatch(/Ce que la chronique ne tranche pas/);
      expect(encadre.note).toMatch(/assurance contre les émeutes/);
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/force implacable de l'État » \(LCP, 17\/10\)/);
      expect(retailleau?.[1]).toMatch(/troupes de Jean-Luc Mélenchon » dans les violences \(RFI, 20\/10\)/);
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[2]).toBe('—');
    }
    const chroniqueTexts = [
      debordWatts.chapo,
      debordWatts.description,
      debordWatts.disclaimer,
      debordWatts.sources_closing,
      ...(chronique?.kind === 'prose'
        ? chronique.blocks.flatMap((block) =>
            block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : [],
          )
        : []),
      ...(courants?.kind === 'prose'
        ? courants.blocks.flatMap((block) =>
            block.type === 'p' ? [block.text] : block.type === 'ul' || block.type === 'ol' ? block.items : [],
          )
        : []),
      ...(encadre?.kind === 'candidats'
        ? [
            encadre.intro,
            encadre.note,
            encadre.conclusion,
            ...encadre.table.rows.flatMap((row) =>
              row[0]?.includes('Lisnard') ? row.slice(0, 2) : row,
            ),
          ]
        : []),
    ].join('\n');
    expect(chroniqueTexts).not.toMatch(/—/);
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
    expect(ukraineEnergie.oracle_citation).not.toMatch(/arbre oracle|définition HI/);
    expect(ukraineEnergie.disclaimer).not.toMatch(/arbre oracle|définition HI/);
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

  it('tribune Manusk du 5 octobre est retirée du catalogue public (masquée ELS 19:12)', () => {
    expect(getAnalysis('on-a-vole-la-revolution-puis-la-revolte')).toBeUndefined();
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).not.toContain('on-a-vole-la-revolution-puis-la-revolte');
    expect(getUneDuJour()?.slug).not.toBe('on-a-vole-la-revolution-puis-la-revolte');
    // Données conservées hors catalogue (brouillon / archive repo), non servies.
    expect(revolutionRevolte.slug).toBe('on-a-vole-la-revolution-puis-la-revolte');
    expect(revolutionRevolte.title).toBe('On a volé la révolution, puis la révolte');
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
