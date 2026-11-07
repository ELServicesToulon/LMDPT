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
import iaChangerCampagne from '../data/analyses/ia-changer-campagne.json';
import selEtPoivre from '../data/analyses/sel-et-poivre.json';
import troisPourUnContre from '../data/analyses/trois-pour-un-contre.json';
import lyceesBloques from '../data/analyses/48-ou-500-lycees-bloques.json';
import vieCherePorscheTrabant from '../data/analyses/vie-chere-porsche-trabant.json';
import retirezHalloween from '../data/analyses/779-retirez-halloween.json';
import primaireSansLaGauche from '../data/analyses/primaire-sans-la-gauche.json';
import guerreCivileLeMotDeLAutre from '../data/analyses/guerre-civile-le-mot-de-l-autre.json';
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
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('ia-changer-campagne');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('sel-et-poivre');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('trois-pour-un-contre');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('48-ou-500-lycees-bloques');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('vie-chere-porsche-trabant');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('779-retirez-halloween');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('primaire-sans-la-gauche');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('guerre-civile-le-mot-de-l-autre');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('bataille-du-2-mai');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('corse-senat-non');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('le-pen-union-nationale');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('secu-115-contre-1');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain('debord-watts-frigo-sans-courant');
    expect(ANALYSIS_CATALOG.map((a) => a.slug)).toContain(
      'chronique-manusk-fiction-demission-macron',
    );
    expect(ANALYSIS_CATALOG[0]?.slug).toBe('ia-changer-campagne');
    expect(ANALYSIS_CATALOG[1]?.slug).toBe('sel-et-poivre');
    expect(ANALYSIS_CATALOG[2]?.slug).toBe('trois-pour-un-contre');
    expect(ANALYSIS_CATALOG[3]?.slug).toBe('48-ou-500-lycees-bloques');
    expect(ANALYSIS_CATALOG[4]?.slug).toBe('vie-chere-porsche-trabant');
    expect(ANALYSIS_CATALOG[5]?.slug).toBe('779-retirez-halloween');
    expect(ANALYSIS_CATALOG[6]?.slug).toBe('primaire-sans-la-gauche');
    expect(ANALYSIS_CATALOG[7]?.slug).toBe('guerre-civile-le-mot-de-l-autre');
    expect(ANALYSIS_CATALOG[8]?.slug).toBe('bataille-du-2-mai');
    expect(ANALYSIS_CATALOG[9]?.slug).toBe('corse-senat-non');
    expect(ANALYSIS_CATALOG[10]?.slug).toBe('chronique-manusk-fiction-demission-macron');
    expect(ANALYSIS_CATALOG[11]?.slug).toBe('le-pen-union-nationale');
    expect(ANALYSIS_CATALOG[12]?.slug).toBe('secu-115-contre-1');
    expect(ANALYSIS_CATALOG[13]?.slug).toBe('debord-watts-frigo-sans-courant');
    expect(ANALYSIS_CATALOG[14]?.slug).toBe('breve-ifop-post-primaire');
    expect(ANALYSIS_CATALOG[15]?.slug).toBe('feuilleton-salle-attente-episode-1');
    expect(ANALYSIS_CATALOG[16]?.slug).toBe('primaire-droite-qui-la-veut');
    expect(ANALYSIS_CATALOG[17]?.slug).toBe('chronique-manusk-primaire-vent-arriere');
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

  it('enquête IA et campagne du 7 novembre en une, sources, boîte DOE', () => {
    expect(iaChangerCampagne.slug).toBe('ia-changer-campagne');
    expect(iaChangerCampagne.date).toBe('2026-11-07');
    expect(iaChangerCampagne.title).toBe('L’IA peut-elle changer la campagne ?');
    expect(iaChangerCampagne.author).toBe('La rédaction');
    expect(iaChangerCampagne.tags).toContain('doe');
    expect(iaChangerCampagne.description.length).toBeLessThanOrEqual(200);
    expect(iaChangerCampagne.hues).toHaveLength(3);
    expect(iaChangerCampagne.sources_groups[0]?.items).toHaveLength(9);
    const doe = iaChangerCampagne.sections.find((section) => section.id === 'doe');
    expect(doe?.kind).toBe('candidats');
    expect(getAnalysis('ia-changer-campagne')?.href).toBe('/analyses/ia-changer-campagne');
  });

  it('analyse sel et poivre du 6 novembre, sources, boîte DOE', () => {
    expect(selEtPoivre.slug).toBe('sel-et-poivre');
    expect(selEtPoivre.date).toBe('2026-11-06');
    expect(selEtPoivre.updated).toBe('2026-11-06');
    expect(selEtPoivre.title).toBe(
      "« Sel et poivre » : l'Élysée parle coalition, Retailleau répond ticket",
    );
    expect(selEtPoivre.author).toBe('La rédaction');
    expect(selEtPoivre.author_role).toBe('Rédaction LMDPT');
    expect(selEtPoivre.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(selEtPoivre.type_label).toBe('Analyse');
    expect(selEtPoivre.kicker).toBe('Analyse · La rédaction · 6 novembre 2026');
    expect(selEtPoivre.tags).toContain('doe');
    expect(selEtPoivre.x_hook).toBe(
      "Selon l'AFP, un proche interlocuteur du chef de l'État parle de « coalition » de Lisnard à Glucksmann. Retailleau répond « sel et poivre » et « ticket » Mélenchon-Le Pen. Philippe et Glucksmann, chacun à sa façon, disent non.",
    );
    expect(selEtPoivre.description.length).toBeLessThanOrEqual(200);
    expect(selEtPoivre.description).toBe(
      "Selon l'AFP, un proche interlocuteur du chef de l'État parle de coalition Lisnard–Glucksmann. Retailleau répond « sel et poivre ».",
    );
    expect(selEtPoivre.disclaimer).toMatch(/opinion de la rédaction/);
    expect(selEtPoivre.disclaimer).not.toMatch(/^\*/);
    expect(selEtPoivre.sources_intro).toMatch(/Consultées le 5 novembre 2026/);
    expect(selEtPoivre.sources_closing).toMatch(/consultés le 5 novembre 2026/);
    expect(selEtPoivre.hues).toHaveLength(3);
    expect(selEtPoivre.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'pluraliste',
    ]);
    expect(selEtPoivre.hues.map((hue) => hue.label)).toEqual([
      'Clarté des alliances',
      'Arbitrage transparent',
      'Pluralisme loyal',
    ]);
    const elysee = selEtPoivre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'elysee',
    );
    expect(elysee?.kind).toBe('prose');
    if (elysee?.kind === 'prose') {
      expect(elysee.title).toBe("Ce que dit l'interlocuteur de l'Élysée, et ce qu'il ne dit pas");
    }
    const retailleau = selEtPoivre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'retailleau',
    );
    expect(retailleau?.kind).toBe('prose');
    if (retailleau?.kind === 'prose') {
      expect(retailleau.title).toBe("Ce qu'a répondu Bruno Retailleau au salon Euronaval");
    }
    const philippe = selEtPoivre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'philippe',
    );
    expect(philippe?.kind).toBe('prose');
    if (philippe?.kind === 'prose') {
      expect(philippe.title).toBe(
        'Édouard Philippe : deux phrases, et une réunion sans Glucksmann',
      );
    }
    const gauche = selEtPoivre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'gauche',
    );
    expect(gauche?.kind).toBe('prose');
    if (gauche?.kind === 'prose') {
      expect(gauche.title).toBe('À gauche : Pierre Jouvet écarte Glucksmann');
    }
    const calendriers = selEtPoivre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'calendriers',
    );
    expect(calendriers?.kind).toBe('prose');
    if (calendriers?.kind === 'prose') {
      expect(calendriers.title).toBe('Deux calendriers, toujours pas de départage');
    }
    const courants = selEtPoivre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('sel-et-poivre');
    expect(entry?.href).toBe('/analyses/sel-et-poivre');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/sel-et-poivre.jpg');
    expect(entry?.cover?.alt).toMatch(/un salière et une poivrière/);
    expect(getUneDuJour()?.slug).not.toBe('sel-et-poivre');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = selEtPoivre.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(17);
    const sourceBlob = JSON.stringify(selEtPoivre.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.france24.com/fr/info-en-continu/20261105-macron-pour-une-coalition-de-lisnard-%C3%A0-glucksmann-avant-la-pr%C3%A9sidentielle',
    );
    expect(sourceBlob).toMatch(
      /bfmtv\.com\/politique\/elections\/presidentielle\/il-ne-se-resout-pas-a-un-duel-lfi-rn/,
    );
    expect(sourceBlob).toMatch(
      /rtl\.fr\/actu\/politique\/de-lisnard-a-glucksmann-macron-appelle-a-une-logique-de-coalition/,
    );
    expect(sourceBlob).toMatch(
      /france24\.com\/fr\/info-en-continu\/20261105-primaire-de-la-droite-et-du-centre-les-h%C3%A9ritiers-du-macronisme/,
    );
    expect(sourceBlob).toMatch(
      /bfmtv\.com\/politique\/elections\/presidentielle\/presidentielle-2027-pour-bruno-retailleau-les-heritiers-du-macronisme/,
    );
    expect(sourceBlob).toMatch(
      /actu\.orange\.fr\/politique\/macron-pour-une-quot-coalition-quot-de-lisnard-a-glucksmann/,
    );
    expect(sourceBlob).toMatch(
      /cnews\.fr\/france\/2026-11-05\/presidentielle-2027-emmanuel-macron-en-faveur-dune-coalition-de-raphael/,
    );
    expect(sourceBlob).toMatch(
      /europe1\.fr\/politique\/emmanuel-macron-pour-une-coalition-de-david-lisnard-a-raphael-glucksmann/,
    );
    expect(sourceBlob).toMatch(
      /franceinfo\.fr\/politique\/bruno-retailleau\/bruno-retailleau-appelle-la-droite-a-se-reveiller/,
    );
    expect(sourceBlob).toMatch(
      /lematin\.ch\/story\/france-en-coulisses-macron-ne-se-resout-pas-a-un-duel-lfirn/,
    );
    expect(sourceBlob).toMatch(
      /actu\.fr\/politique\/de-david-lisnard-a-raphael-glucksmann-l-improbable-coalition/,
    );
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/vosdroits\/F1939/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/fondements-textuels\/loi-n-62-1292/);
    expect(sourceBlob).toMatch(
      /touteleurope\.eu\/vie-politique-des-etats-membres\/presidentielle-2027-calendrier/,
    );
    expect(sourceBlob).toMatch(
      /lindependant\.fr\/2026\/11\/05\/presidentielle-2027-il-ne-se-resout-pas-a-un-duel-lfirn/,
    );
    expect(sourceBlob).toMatch(/lmdpt\.iarbre\.org\/analyses\/trois-pour-un-contre/);
    expect(sourceBlob).toMatch(/lmdpt\.iarbre\.org\/analyses\/primaire-sans-la-gauche/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = selEtPoivre.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Position sur la « coalition » Élysée / la primaire',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(9);
      expect(encadre.note).toMatch(/Non trouvé/);
      expect(encadre.note).toMatch(/notice Ifop\/LCI/);
      const interlocuteur = encadre.table.rows.find((row) => row[0]?.includes('Interlocuteur'));
      expect(interlocuteur?.[1]).toMatch(/logique de coalition/);
      expect(interlocuteur?.[2]).toBe('[1][2][3]');
      const retailleauRow = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleauRow?.[1]).toMatch(/sel et poivre/);
      expect(retailleauRow?.[2]).toBe('[3][4][5]');
      const philippeRow = encadre.table.rows.find((row) => row[0]?.includes('Philippe'));
      expect(philippeRow?.[1]).toMatch(/créer du commun/);
      expect(philippeRow?.[2]).toBe('[3][4][5][16]');
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/rassemblement le plus large possible/);
      expect(attal?.[2]).toBe('[3][4][5][17]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[1]).toMatch(/dix années de macronisme/);
      expect(lisnard?.[2]).toBe('[1][4][6][16]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/tentatives désespérées/);
      expect(glucksmann?.[2]).toBe('[1][3][4]');
      const fesneau = encadre.table.rows.find((row) => row[0]?.includes('Fesneau'));
      expect(fesneau?.[1]).toMatch(/coalition de projet/);
      expect(fesneau?.[2]).toBe('[3]');
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/Non trouvée dans les sources consultées/);
      expect(lePen?.[2]).toBe('Aucune');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/ticket/);
      expect(melenchon?.[2]).toBe('[3]');
    }
    expect(selEtPoivre.liens_internes.map((lien) => lien.href)).toEqual([
      '/analyses/trois-pour-un-contre',
      '/analyses/primaire-sans-la-gauche',
      '/analyses/48-ou-500-lycees-bloques',
    ]);
    const analyseTexts = [
      selEtPoivre.chapo,
      selEtPoivre.description,
      selEtPoivre.disclaimer,
      selEtPoivre.sources_closing,
      ...selEtPoivre.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[17\]/);
    expect(analyseTexts).toMatch(/Bruno Retailleau/);
    expect(analyseTexts).toMatch(/Édouard Philippe/);
    expect(analyseTexts).toMatch(/Raphaël Glucksmann/);
    expect(analyseTexts).toMatch(/sel et poivre/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(selEtPoivre)).not.toMatch(/<!--/);
  });

  it('analyse trois pour un contre du 5 novembre en une, sources, boîte DOE', () => {
    expect(troisPourUnContre.slug).toBe('trois-pour-un-contre');
    expect(troisPourUnContre.date).toBe('2026-11-05');
    expect(troisPourUnContre.updated).toBe('2026-11-05');
    expect(troisPourUnContre.title).toBe(
      'Trois pour, un contre : la primaire se joue maintenant sur la date',
    );
    expect(troisPourUnContre.author).toBe('La rédaction');
    expect(troisPourUnContre.author_role).toBe('Rédaction LMDPT');
    expect(troisPourUnContre.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(troisPourUnContre.type_label).toBe('Analyse');
    expect(troisPourUnContre.kicker).toBe('Analyse · La rédaction · 5 novembre 2026');
    expect(troisPourUnContre.tags).toContain('doe');
    expect(troisPourUnContre.x_hook).toBe(
      "Retailleau se rallie à une primaire « sans doute en début d'année ». Trois des quatre principaux candidats de la droite et du centre sont pour. Philippe dit non et renvoie le départage à février. Ce que l'attente coûte à chacun.",
    );
    expect(troisPourUnContre.description.length).toBeLessThanOrEqual(200);
    expect(troisPourUnContre.description).toBe(
      "Retailleau se rallie à une primaire « en début d'année » : trois candidats sur quatre sont pour. Philippe dit non et renvoie le départage à février. Ce que l'attente coûte à chacun.",
    );
    expect(troisPourUnContre.disclaimer).toMatch(/opinion de la rédaction/);
    expect(troisPourUnContre.sources_intro).toMatch(/Consultées le 4 novembre 2026/);
    expect(troisPourUnContre.sources_closing).toMatch(/consultés le 4 novembre 2026/);
    expect(troisPourUnContre.hues).toHaveLength(3);
    expect(troisPourUnContre.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'pluraliste',
    ]);
    expect(troisPourUnContre.hues.map((hue) => hue.label)).toEqual([
      'Démocratie de règles claires',
      'Arbitrage par le vote',
      'Pluralisme loyal',
    ]);
    const retailleau = troisPourUnContre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'retailleau',
    );
    expect(retailleau?.kind).toBe('prose');
    if (retailleau?.kind === 'prose') {
      expect(retailleau.title).toBe("Ce qu'a dit Bruno Retailleau, et ce qu'il disait avant");
    }
    const sondage = troisPourUnContre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'sondage',
    );
    expect(sondage?.kind).toBe('prose');
    if (sondage?.kind === 'prose') {
      expect(sondage.title).toBe('Pourquoi maintenant : ce que dit le sondage, et ce qu\'il ne dit pas');
    }
    const attente = troisPourUnContre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'attente',
    );
    expect(attente?.kind).toBe('prose');
    if (attente?.kind === 'prose') {
      expect(attente.title).toBe("Que coûte l'attente à chacun ?");
    }
    const horloge = troisPourUnContre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'horloge',
    );
    expect(horloge?.kind).toBe('prose');
    if (horloge?.kind === 'prose') {
      expect(horloge.title).toBe(
        "L'horloge officielle : pourquoi février n'est pas un mois comme un autre",
      );
    }
    const courants = troisPourUnContre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('trois-pour-un-contre');
    expect(entry?.href).toBe('/analyses/trois-pour-un-contre');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/trois-pour-un-contre.jpg');
    expect(entry?.cover?.alt).toMatch(/quatre chaises en bois vides/);
    expect(getUneDuJour()?.slug).not.toBe('trois-pour-un-contre');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = troisPourUnContre.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(21);
    const sourceBlob = JSON.stringify(troisPourUnContre.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.france24.com/fr/info-en-continu/20261104-primaire-%C3%A0-droite-et-au-centre-retailleau-remet-la-pression-sur-philippe',
    );
    expect(sourceBlob).toMatch(/leparisien\.fr\/elections\/presidentielle\/sinon-jirai-jusquau-bout-bruno-retailleau/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/elections\/presidentielle\/pouvoir-d-achat-ecologie-et-etat-regalien/);
    expect(sourceBlob).toMatch(/lopinion\.fr\/politique\/il-faudra-une-primaire-bruno-retailleau/);
    expect(sourceBlob).toMatch(/france24\.com\/fr\/info-en-continu\/20261101-primaire-ou-pas-primaire-philippe/);
    expect(sourceBlob).toMatch(/rtl\.fr\/actu\/politique\/presidentielle-2027-attal-philippe-lisnard-glucksmann/);
    expect(sourceBlob).toMatch(/leparisien\.fr\/elections\/presidentielle\/presidentielle-2027-attal-philippe-glucksmann-lisnard/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/elections\/presidentielle\/video-2027-je-ne-soutiendrai-pas-edouard-philippe/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/elections\/presidentielle\/presidentielle-2027-un-duel-entre-jean-luc-melenchon/);
    expect(sourceBlob).toMatch(/fr\.news\.yahoo\.com\/ne-force-dappoint-droite/);
    expect(sourceBlob).toMatch(/rtl\.fr\/actu\/politique\/presidentielle-2027-bruno-retailleau-n-ecarte-pas/);
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/vosdroits\/F1939/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/fondements-textuels\/loi-n-62-1292/);
    expect(sourceBlob).toMatch(/touteleurope\.eu\/vie-politique-des-etats-membres\/presidentielle-2027-calendrier/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/elections\/presidentielle\/pour-departager-les-quatre-principaux-candidats/);
    expect(sourceBlob).toMatch(/lmdpt\.iarbre\.org\/analyses\/primaire-sans-la-gauche/);
    expect(sourceBlob).toMatch(/linternaute\.com\/actualite\/politique\/11312271-attal-et-philippe-s-affrontent/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/elections\/presidentielle\/video-bruno-retailleau-c-est-celui/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/reconquete\/une-proposition-intelligente-eric-zemmour/);
    expect(sourceBlob).toMatch(/europe1\.fr\/politique\/presidentielle-2027-gabriel-attal-franchit-le-pas/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/elections\/presidentielle\/direct-presidentielle-2027-bruno-retailleau-va-detailler/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = troisPourUnContre.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Position sur une primaire de la droite et du centre',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(10);
      expect(encadre.note).toMatch(/Non trouvé/);
      expect(encadre.note).toMatch(/sondage Ifop pour LCI/);
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/inéluctable/);
      expect(attal?.[2]).toBe('[1][11][20]');
      const retailleauRow = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleauRow?.[1]).toMatch(/début d'année/);
      expect(retailleauRow?.[2]).toBe('[1][3][4][6]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[1]).toMatch(/depuis presque deux ans/);
      expect(lisnard?.[2]).toBe('[6][7][8]');
      const philippe = encadre.table.rows.find((row) => row[0]?.includes('Philippe'));
      expect(philippe?.[1]).toMatch(/Cette primaire n'aura pas lieu/);
      expect(philippe?.[2]).toBe('[5][6][7]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/ce n'est pas mon histoire/);
      expect(glucksmann?.[2]).toBe('[1][6]');
      const villepin = encadre.table.rows.find((row) => row[0]?.includes('Villepin'));
      expect(villepin?.[1]).toMatch(/héritiers du macronisme/);
      expect(villepin?.[2]).toBe('[6][17]');
      const bertrand = encadre.table.rows.find((row) => row[0]?.includes('Bertrand'));
      expect(bertrand?.[1]).toMatch(/Rejette le principe/);
      expect(bertrand?.[2]).toBe('[6]');
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/Non trouvé dans les sources consultées/);
      expect(lePen?.[2]).toBe('Aucune');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/Non trouvé dans les sources consultées/);
      expect(melenchon?.[2]).toBe('Aucune');
      const zemmour = encadre.table.rows.find((row) => row[0]?.includes('Zemmour'));
      expect(zemmour?.[1]).toMatch(/Retailleau à Attal/);
      expect(zemmour?.[2]).toBe('[19]');
    }
    const analyseTexts = [
      troisPourUnContre.chapo,
      troisPourUnContre.description,
      troisPourUnContre.disclaimer,
      troisPourUnContre.sources_closing,
      ...troisPourUnContre.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[21\]/);
    expect(analyseTexts).toMatch(/Bruno Retailleau/);
    expect(analyseTexts).toMatch(/Édouard Philippe/);
    expect(analyseTexts).toMatch(/début d'année/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(troisPourUnContre)).not.toMatch(/<!--/);
  });

  it('analyse 48 ou 500 lycées bloqués du 4 novembre, sources, boîte DOE', () => {
    expect(lyceesBloques.slug).toBe('48-ou-500-lycees-bloques');
    expect(lyceesBloques.date).toBe('2026-11-04');
    expect(lyceesBloques.updated).toBe('2026-11-04');
    expect(lyceesBloques.title).toBe(
      '48 ou 500 lycées bloqués ? Chacun son thermomètre, personne ne montre sa liste',
    );
    expect(lyceesBloques.author).toBe('La rédaction');
    expect(lyceesBloques.author_role).toBe('Rédaction LMDPT');
    expect(lyceesBloques.eyebrow).toBe('Analyse · Mouvement lycéen');
    expect(lyceesBloques.type_label).toBe('Analyse');
    expect(lyceesBloques.kicker).toBe('Analyse · La rédaction · 4 novembre 2026');
    expect(lyceesBloques.tags).toContain('doe');
    expect(lyceesBloques.x_hook).toBe(
      "48 lycées bloqués mardi pour le ministère, 500 pour l'Union syndicale lycéenne. Dix fois plus. Les deux camps ne comptent pas la même chose, et aucun, à notre connaissance, ne publie sa liste. On a démonté les deux thermomètres.",
    );
    expect(lyceesBloques.description.length).toBeLessThanOrEqual(200);
    expect(lyceesBloques.description).toMatch(/48 lycées étaient bloqués/);
    expect(lyceesBloques.disclaimer).toMatch(/opinion de la rédaction/);
    expect(lyceesBloques.sources_intro).toMatch(/Consultées le 3 novembre 2026/);
    expect(lyceesBloques.sources_closing).toMatch(/consultés le 3 novembre 2026/);
    expect(lyceesBloques.hues).toHaveLength(3);
    expect(lyceesBloques.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'pluraliste',
    ]);
    expect(lyceesBloques.hues.map((hue) => hue.label)).toEqual([
      'Transparence des chiffres publics',
      'Méfiance égale envers tous les décomptes',
      'Deux droits à tenir ensemble',
    ]);
    const deuxChiffres = lyceesBloques.sections.find(
      (section) => section.kind === 'prose' && section.id === 'deux-chiffres',
    );
    expect(deuxChiffres?.kind).toBe('prose');
    if (deuxChiffres?.kind === 'prose') {
      expect(deuxChiffres.title).toBe('Deux chiffres pour un même mardi');
    }
    const encadreMots = lyceesBloques.sections.find(
      (section) => section.kind === 'prose' && section.id === 'encadre',
    );
    expect(encadreMots?.kind).toBe('prose');
    if (encadreMots?.kind === 'prose') {
      expect(encadreMots.title).toBe(
        'Encadré · Bloqué, filtrant, perturbé : trois mots, trois réalités',
      );
    }
    const octobre = lyceesBloques.sections.find(
      (section) => section.kind === 'prose' && section.id === 'octobre',
    );
    expect(octobre?.kind).toBe('prose');
    if (octobre?.kind === 'prose') {
      expect(octobre.title).toBe('Ce qui a changé depuis octobre');
      const table = octobre.blocks.find((block) => block.type === 'table');
      expect(table?.type).toBe('table');
      if (table?.type === 'table') {
        expect(table.headers).toEqual([
          'Date',
          'Ministère',
          'Organisations de jeunesse',
          'Ce qui est compté',
          'Sources',
        ]);
        expect(table.rows).toHaveLength(4);
        expect(table.rows[0]?.[0]).toBe('6 octobre');
        expect(table.rows[0]?.[1]).toBe('891 établissements');
        expect(table.rows[2]?.[1]).toMatch(/48 à 9 h 30/);
        expect(table.rows[2]?.[2]).toMatch(/plus de 500/);
      }
    }
    const courants = lyceesBloques.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('48-ou-500-lycees-bloques');
    expect(entry?.href).toBe('/analyses/48-ou-500-lycees-bloques');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/48-ou-500-lycees-bloques.jpg');
    expect(entry?.cover?.alt).toMatch(/portail de lycée en fer forgé/);
    expect(getUneDuJour()?.slug).not.toBe('48-ou-500-lycees-bloques');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = lyceesBloques.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(25);
    const sourceBlob = JSON.stringify(lyceesBloques.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.europe1.fr/societe/48-lycees-bloques-mardi-selon-le-ministere-dix-fois-plus-selon-un-syndicat-lyceen-1205147',
    );
    expect(sourceBlob).toMatch(/franceinfo\.fr\/societe\/education\/blocage-des-lycees\/direct-les-organisations-de-jeunesse/);
    expect(sourceBlob).toMatch(/leparisien\.fr\/societe\/direct-colere-des-lyceens/);
    expect(sourceBlob).toMatch(/france24\.com\/fr\/info-en-continu\/20261103-nouvel-appel/);
    expect(sourceBlob).toMatch(/union-etudiante\.fr\/communique-de-presse\/la-mobilisation-reprend/);
    expect(sourceBlob).toMatch(/europe1\.fr\/societe\/51-etablissements-sur-184/);
    expect(sourceBlob).toMatch(/lemonde\.fr\/politique\/article\/2026\/11\/02\/sebastien-lecornu/);
    expect(sourceBlob).toMatch(/radiofrance\.fr\/franceinter\/podcasts\/l-info-de-france-inter\/seul-1-des-lycees/);
    expect(sourceBlob).toMatch(/linternaute\.com\/actualite\/societe\/11310945-blocage-des-lyceesen-direct/);
    expect(sourceBlob).toMatch(/euronews\.com\/2026\/10\/06\/mobilisation-lyceenne-acte-iii-891/);
    expect(sourceBlob).toMatch(/enseignementsup-recherche\.gouv\.fr\/fr\/remplacement-de-la-plateforme-parcoursup/);
    expect(sourceBlob).toMatch(/17octobregiletjaune\.net\//);
    expect(sourceBlob).toMatch(/mesinfos\.fr\/que-proposent-les-candidats-a-la-presidentielle-aux-lyceens/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/direct-rentree-sous-tension-et-crainte-de-nouveaux-blocages/);
    expect(sourceBlob).not.toMatch(/on-va-leur-montrer-l-union-syndicale-lyceenne/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = lyceesBloques.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Position sur le mouvement lycéen et ses chiffres',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(12);
      expect(encadre.note).toMatch(/Pas de position publique trouvée/);
      expect(encadre.note).toMatch(/Éric Zemmour y figure/);
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/aberration/);
      expect(lePen?.[2]).toBe('[17][18]');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/Nous abolirons Parcoursup/);
      expect(melenchon?.[2]).toBe('[17]');
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/boîte noire/);
      expect(retailleau?.[2]).toBe('[17][24]');
      const philippe = encadre.table.rows.find((row) => row[0]?.includes('Philippe'));
      expect(philippe?.[1]).toMatch(/bien des égards fondées/);
      expect(philippe?.[2]).toBe('[19]');
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/outil qui accompagne davantage/);
      expect(attal?.[2]).toBe('[17][20]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/Abrogation de Parcoursup/);
      expect(glucksmann?.[2]).toBe('[21]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[1]).toMatch(/attise l'incendie/);
      expect(lisnard?.[2]).toBe('[17][22]');
      const villepin = encadre.table.rows.find((row) => row[0]?.includes('Villepin'));
      expect(villepin?.[1]).toMatch(/interdiction des LBD/);
      expect(villepin?.[2]).toBe('[23]');
      const tondelier = encadre.table.rows.find((row) => row[0]?.includes('Tondelier'));
      expect(tondelier?.[1]).toMatch(/supprimer Parcoursup/);
      expect(tondelier?.[2]).toBe('[17]');
      const ruffin = encadre.table.rows.find((row) => row[0]?.includes('Ruffin'));
      expect(ruffin?.[1]).toMatch(/suppression de Parcoursup/);
      expect(ruffin?.[2]).toBe('[17]');
      const roussel = encadre.table.rows.find((row) => row[0]?.includes('Roussel'));
      expect(roussel?.[1]).toMatch(/moyens qu'ils réclament/);
      expect(roussel?.[2]).toBe('[17]');
      const zemmour = encadre.table.rows.find((row) => row[0]?.includes('Zemmour'));
      expect(zemmour?.[1]).toMatch(/Pas de position publique trouvée/);
      expect(zemmour?.[2]).toBe('');
    }
    const analyseTexts = [
      lyceesBloques.chapo,
      lyceesBloques.description,
      lyceesBloques.disclaimer,
      lyceesBloques.sources_closing,
      ...lyceesBloques.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[25\]/);
    expect(analyseTexts).toMatch(/48 lycées/);
    expect(analyseTexts).toMatch(/thermomètre/);
    expect(analyseTexts).toMatch(/barrage filtrant/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(lyceesBloques)).not.toMatch(/<!--/);
  });

  it('analyse vie chère Porsche Trabant du 3 novembre, sources, boîte DOE', () => {
    expect(vieCherePorscheTrabant.slug).toBe('vie-chere-porsche-trabant');
    expect(vieCherePorscheTrabant.date).toBe('2026-11-03');
    expect(vieCherePorscheTrabant.updated).toBe('2026-11-03');
    expect(vieCherePorscheTrabant.title).toBe(
      "Vie chère : la Porsche au prix d'une Trabant ? On a fait l'addition",
    );
    expect(vieCherePorscheTrabant.author).toBe('La rédaction');
    expect(vieCherePorscheTrabant.author_role).toBe('Rédaction LMDPT');
    expect(vieCherePorscheTrabant.eyebrow).toBe('Analyse · Vie chère');
    expect(vieCherePorscheTrabant.type_label).toBe('Analyse');
    expect(vieCherePorscheTrabant.kicker).toBe('Analyse · La rédaction · 3 novembre 2026');
    expect(vieCherePorscheTrabant.tags).toContain('doe');
    expect(vieCherePorscheTrabant.x_hook).toBe(
      "Manifester contre la vie chère, c'est vouloir une Porsche au prix d'une Trabant ? On a fait l'addition, mesure par mesure. Sur l'essence, la formule tient. Sur les bourses, la taxe Zucman ou le Smic, beaucoup moins.",
    );
    expect(vieCherePorscheTrabant.description.length).toBeLessThanOrEqual(200);
    expect(vieCherePorscheTrabant.description).toMatch(/Porsche au prix d'une Trabant/);
    expect(vieCherePorscheTrabant.disclaimer).toMatch(/opinion de la rédaction/);
    expect(vieCherePorscheTrabant.sources_intro).toMatch(/Consultées le 2 novembre 2026/);
    expect(vieCherePorscheTrabant.sources_closing).toMatch(/consultés le 2 novembre 2026/);
    expect(vieCherePorscheTrabant.hues).toHaveLength(3);
    expect(vieCherePorscheTrabant.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'parti-socialiste',
    ]);
    expect(vieCherePorscheTrabant.hues.map((hue) => hue.label)).toEqual([
      'Réalisme budgétaire',
      'Aide ciblée plutôt que générale',
      'Justice fiscale chiffrée',
    ]);
    const revendications = vieCherePorscheTrabant.sections.find(
      (section) => section.kind === 'prose' && section.id === 'revendications',
    );
    expect(revendications?.kind).toBe('prose');
    if (revendications?.kind === 'prose') {
      expect(revendications.title).toBe('Ce que demandent les cortèges');
    }
    const listeSansPrix = vieCherePorscheTrabant.sections.find(
      (section) => section.kind === 'prose' && section.id === 'liste-sans-prix',
    );
    expect(listeSansPrix?.kind).toBe('prose');
    if (listeSansPrix?.kind === 'prose') {
      expect(listeSansPrix.title).toBe('Encadré · Une liste sans prix');
    }
    const precedents = vieCherePorscheTrabant.sections.find(
      (section) => section.kind === 'prose' && section.id === 'precedents',
    );
    expect(precedents?.kind).toBe('prose');
    if (precedents?.kind === 'prose') {
      expect(precedents.title).toBe('Ce que coûtaient les fois précédentes');
      const table = precedents.blocks.find((block) => block.type === 'table');
      expect(table?.type).toBe('table');
      if (table?.type === 'table') {
        expect(table.headers).toEqual(['Précédent', 'Coût', 'Source']);
        expect(table.rows).toHaveLength(4);
        expect(table.rows[0]?.[0]).toBe('Mesures gilets jaunes 2018-2019');
        expect(table.rows[2]?.[1]).toMatch(/72 Md€ bruts, 36 Md€ nets/);
      }
    }
    const courants = vieCherePorscheTrabant.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('vie-chere-porsche-trabant');
    expect(entry?.href).toBe('/analyses/vie-chere-porsche-trabant');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/vie-chere-porsche-trabant.jpg');
    expect(entry?.cover?.alt).toMatch(/petite voiture ancienne bleu pâle/);
    expect(getUneDuJour()?.slug).not.toBe('vie-chere-porsche-trabant');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = vieCherePorscheTrabant.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(41);
    const sourceBlob = JSON.stringify(vieCherePorscheTrabant.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.franceinfo.fr/societe/education/blocage-des-lycees/mobilisation-de-la-jeunesse-retour-des-gilets-jaunes-appel-de-l-intersyndicale-on-vous-resume-les-revendications-et-la-reponse-du-gouvernement_8248597.html',
    );
    expect(sourceBlob).toMatch(/17octobregiletjaune\.net\/macron-doit-partir\//);
    expect(sourceBlob).toMatch(/17octobregiletjaune\.net\/pour-nos-libertes\//);
    expect(sourceBlob).toMatch(/insee\.fr\/fr\/statistiques\/9107965/);
    expect(sourceBlob).toMatch(/insee\.fr\/fr\/statistiques\/fichier\/9050757\/ndc-sept-2026\.pdf/);
    expect(sourceBlob).toMatch(/banque-france\.fr\/fr\/publications-et-statistiques\/publications\/pourquoi-le-prix-des-carburants/);
    expect(sourceBlob).toMatch(/ccomptes\.fr\/sites\/default\/files\/2024-03\/20240315_synthese-Mesures-exceptionnelles/);
    expect(sourceBlob).toMatch(/labanque\.org\/actualites\/salaire-minimum-coup-de-pouce-branches/);
    expect(sourceBlob).toMatch(/cae-eco\.fr\/static\/pdf\/Focus_118_emigration_fiscale/);
    expect(sourceBlob).toMatch(/melenchon\.fr\/2026\/10\/25\/le-pouvoir-naura-quun-seul-choix/);
    expect(sourceBlob).toMatch(/insee\.fr\/fr\/statistiques\/serie\/000442588/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = vieCherePorscheTrabant.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Position sur les revendications vie chère',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(9);
      expect(encadre.note).toMatch(/Non trouvé/);
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/5,5 %/);
      expect(lePen?.[2]).toBe('[16][30][31][32]');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/1,70 €/);
      expect(melenchon?.[2]).toBe('[16][33]');
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/certificats d'économie d'énergie/);
      expect(retailleau?.[2]).toBe('[16]');
      const philippe = encadre.table.rows.find((row) => row[0]?.includes('Philippe'));
      expect(philippe?.[1]).toMatch(/solution illusoire/);
      expect(philippe?.[2]).toBe('[34][16]');
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/droit au brut/);
      expect(attal?.[2]).toBe('[35][36]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/1 700 € net/);
      expect(glucksmann?.[2]).toBe('[37]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[1]).toMatch(/non trouvé dans les sources consultées/);
      expect(lisnard?.[2]).toBe('[38]');
      const villepin = encadre.table.rows.find((row) => row[0]?.includes('Villepin'));
      expect(villepin?.[1]).toMatch(/interdiction des LBD/);
      expect(villepin?.[2]).toBe('[39][40]');
      const zemmour = encadre.table.rows.find((row) => row[0]?.includes('Zemmour'));
      expect(zemmour?.[1]).toMatch(/à peu près 12 milliards/);
      expect(zemmour?.[2]).toBe('[16]');
    }
    const analyseTexts = [
      vieCherePorscheTrabant.chapo,
      vieCherePorscheTrabant.description,
      vieCherePorscheTrabant.disclaimer,
      vieCherePorscheTrabant.sources_closing,
      ...vieCherePorscheTrabant.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[41\]/);
    expect(analyseTexts).toMatch(/Porsche au prix d'une Trabant/);
    expect(analyseTexts).toMatch(/marge de raffinage/);
    expect(analyseTexts).toMatch(/taxe Zucman/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(vieCherePorscheTrabant)).not.toMatch(/<!--/);
  });

  it('analyse 779 retirez Halloween du 2 novembre, sources, boîte DOE', () => {
    expect(retirezHalloween.slug).toBe('779-retirez-halloween');
    expect(retirezHalloween.date).toBe('2026-11-02');
    expect(retirezHalloween.updated).toBe('2026-11-02');
    expect(retirezHalloween.title).toBe(
      "779 interpellations ? Retirez Halloween : l'acte III en compte quatre fois moins que le 17 octobre",
    );
    expect(retirezHalloween.author).toBe('La rédaction');
    expect(retirezHalloween.author_role).toBe('Rédaction LMDPT');
    expect(retirezHalloween.eyebrow).toBe('Analyse · Mobilisation sociale');
    expect(retirezHalloween.type_label).toBe('Analyse');
    expect(retirezHalloween.kicker).toBe('Analyse · La rédaction · 2 novembre 2026');
    expect(retirezHalloween.tags).toContain('doe');
    expect(retirezHalloween.x_hook).toBe(
      "779 interpellations samedi, dit le bilan qui tourne depuis dimanche. Mais 214 datent de la soirée d'Halloween. Avant 21 h, l'Intérieur en compte 565 : plus de quatre fois moins que le 17 octobre. Et les 116 blessés qu'on lit à côté ne comptent, eux, que la journée.",
    );
    expect(retirezHalloween.description.length).toBeLessThanOrEqual(200);
    expect(retirezHalloween.description).toMatch(/779 interpellations/);
    expect(retirezHalloween.disclaimer).toMatch(/opinion de la rédaction/);
    expect(retirezHalloween.sources_intro).toMatch(/Consultées le 1er novembre 2026/);
    expect(retirezHalloween.sources_closing).toMatch(/consultés le 1er novembre 2026/);
    expect(retirezHalloween.hues).toHaveLength(3);
    expect(retirezHalloween.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'lisnard',
    ]);
    expect(retirezHalloween.hues.map((hue) => hue.label)).toEqual([
      'Statistique publique loyale',
      'Redevabilité de la force publique',
      'Liberté de manifester et sûreté',
    ]);
    const bilan = retirezHalloween.sections.find(
      (section) => section.kind === 'prose' && section.id === 'bilan',
    );
    expect(bilan?.kind).toBe('prose');
    if (bilan?.kind === 'prose') {
      expect(bilan.title).toBe('Un bilan, deux soirées');
    }
    const troisSamedis = retirezHalloween.sections.find(
      (section) => section.kind === 'prose' && section.id === 'trois-samedis',
    );
    expect(troisSamedis?.kind).toBe('prose');
    if (troisSamedis?.kind === 'prose') {
      expect(troisSamedis.title).toBe('Trois samedis, une seule colonne');
      const table = troisSamedis.blocks.find((block) => block.type === 'table');
      expect(table?.type).toBe('table');
      if (table?.type === 'table') {
        expect(table.headers).toEqual([
          'Samedi',
          'Manifestants (Intérieur)',
          'Interpellations',
          "Forces de l'ordre blessées",
        ]);
        expect(table.rows).toHaveLength(3);
        expect(table.rows[0]).toEqual(['17 octobre', '550 000', '2 628', '1 144']);
        expect(table.rows[2]).toEqual(['31 octobre (à 21 h)', '320 000', '565', '116']);
      }
    }
    const paris = retirezHalloween.sections.find(
      (section) => section.kind === 'prose' && section.id === 'paris',
    );
    expect(paris?.kind).toBe('prose');
    if (paris?.kind === 'prose') {
      expect(paris.title).toBe('À Paris, même chiffre, autre compteur');
    }
    const courants = retirezHalloween.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('779-retirez-halloween');
    expect(entry?.href).toBe('/analyses/779-retirez-halloween');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/779-retirez-halloween.jpg');
    expect(entry?.cover?.alt).toMatch(/carnet de comptage ouvert/);
    expect(getUneDuJour()?.slug).not.toBe('779-retirez-halloween');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = retirezHalloween.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(10);
    const sourceBlob = JSON.stringify(retirezHalloween.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.bfmtv.com/police-justice/manifestations-du-31-octobre-779-interpellations-en-france-sans-incident-majeur-en-seconde-partie-de-soiree_AD-202611010262.html',
    );
    expect(sourceBlob).toMatch(/lanouvellerepublique\.fr\/a-la-une\/acte-iii-contre-la-vie-chere/);
    expect(sourceBlob).toMatch(/lefigaro\.fr\/actualite-france\/manifestations-du-31-octobre-779/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/economie\/greve\/direct-mobilisation-sociale/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/societe\/manifestations\/direct-colere-sociale/);
    expect(sourceBlob).toMatch(/france3-regions\.franceinfo\.fr\/paris-ile-de-france\/paris\/mobilisation-du-31-octobre/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/societe\/manifestations\/une-enquete-ouverte-pour-tentative-d-homicide/);
    expect(sourceBlob).toMatch(/france24\.com\/fr\/info-en-continu\/20261031-jet-de-molotov/);
    expect(sourceBlob).toMatch(/leparisien\.fr\/politique\/manifestations-du-31-octobre-jean-luc-melenchon/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/societe\/manifestations\/video-mobilisation-du-31-octobre-les-corteges/);
    expect(sourceBlob).toMatch(/tf1info\.fr\/politique\/direct-interview-presidentielle-edouard-philippe/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = retirezHalloween.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        "Ce qu'il ou elle a dit du 31 octobre",
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(9);
      expect(encadre.note).toMatch(/Non trouvé/);
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/insupportable/);
      expect(lePen?.[2]).toBe('[7]');
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/tentative de meurtre/);
      expect(retailleau?.[2]).toBe('[7]');
      const melenchon = encadre.table.rows.find((row) => row[0]?.includes('Mélenchon'));
      expect(melenchon?.[1]).toMatch(/aussi disciplinée/);
      expect(melenchon?.[2]).toBe('[8]');
      const philippe = encadre.table.rows.find((row) => row[0]?.includes('Philippe'));
      expect(philippe?.[1]).toMatch(/Invité du 20 h de TF1/);
      expect(philippe?.[2]).toBe('[10]');
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/Non trouvé dans les sources consultées/);
      expect(attal?.[2]).toBe('Aucune');
      const polony = encadre.table.rows.find((row) => row[0]?.includes('Polony'));
      expect(polony?.[1]).toMatch(/174 parrainages/);
      expect(polony?.[2]).toBe('[4]');
    }
    const analyseTexts = [
      retirezHalloween.chapo,
      retirezHalloween.description,
      retirezHalloween.disclaimer,
      retirezHalloween.sources_closing,
      ...retirezHalloween.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[10\]/);
    expect(analyseTexts).toMatch(/779 interpellations/);
    expect(analyseTexts).toMatch(/tableau à périmètre fixe/);
    expect(analyseTexts).toMatch(/quatre fois moins/);
    expect(analyseTexts).toMatch(/Laurent Nuñez/);
    expect(analyseTexts).toMatch(/assignations à résidence/);
    expect(analyseTexts).toMatch(/tentative d'homicide/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(retirezHalloween)).not.toMatch(/<!--/);
  });

  it('analyse primaire sans la gauche du 1er novembre, sources, boîte DOE', () => {
    expect(primaireSansLaGauche.slug).toBe('primaire-sans-la-gauche');
    expect(primaireSansLaGauche.date).toBe('2026-11-01');
    expect(primaireSansLaGauche.updated).toBe('2026-11-01');
    expect(primaireSansLaGauche.title).toBe(
      "Primaire d'Attal : la gauche est déjà sortie, et le seul candidat qui applaudit en veut une autre",
    );
    expect(primaireSansLaGauche.author).toBe('La rédaction');
    expect(primaireSansLaGauche.author_role).toBe('Rédaction LMDPT');
    expect(primaireSansLaGauche.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(primaireSansLaGauche.type_label).toBe('Analyse');
    expect(primaireSansLaGauche.kicker).toBe('Analyse · La rédaction · 1er novembre 2026');
    expect(primaireSansLaGauche.tags).toContain('doe');
    expect(primaireSansLaGauche.x_hook).toBe(
      "La « primaire des démocrates » de Gabriel Attal devait aller de Glucksmann à Lisnard. Trois jours plus tard, c'est une primaire « du centre et de la droite ». Et le seul candidat qui applaudit en veut une autre, ouverte jusqu'à Reconquête, sans promesse de faire campagne pour un gagnant dont il ne partage pas les idées.",
    );
    expect(primaireSansLaGauche.description.length).toBeLessThanOrEqual(200);
    expect(primaireSansLaGauche.description).toMatch(/grande primaire/);
    expect(primaireSansLaGauche.disclaimer).toMatch(/opinion de la rédaction/);
    expect(primaireSansLaGauche.sources_intro).toMatch(/Consultées du 29 au 31 octobre 2026/);
    expect(primaireSansLaGauche.sources_closing).toMatch(/consultés du 29 au 31 octobre 2026/);
    expect(primaireSansLaGauche.hues).toHaveLength(3);
    expect(primaireSansLaGauche.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'lisnard',
    ]);
    expect(primaireSansLaGauche.hues.map((hue) => hue.label)).toEqual([
      'Démocratie de règles claires',
      'Pluralisme loyal',
      "Transparence de l'action publique",
    ]);
    const attal = primaireSansLaGauche.sections.find(
      (section) => section.kind === 'prose' && section.id === 'attal',
    );
    expect(attal?.kind).toBe('prose');
    if (attal?.kind === 'prose') {
      expect(attal.title).toBe('Ce que propose Gabriel Attal');
    }
    const troisJours = primaireSansLaGauche.sections.find(
      (section) => section.kind === 'prose' && section.id === 'trois-jours',
    );
    expect(troisJours?.kind).toBe('prose');
    if (troisJours?.kind === 'prose') {
      expect(troisJours.title).toBe('Trois jours plus tard : sans la gauche, et avec une échéance');
    }
    const horloge = primaireSansLaGauche.sections.find(
      (section) => section.kind === 'prose' && section.id === 'horloge',
    );
    expect(horloge?.kind).toBe('prose');
    if (horloge?.kind === 'prose') {
      expect(horloge.title).toBe("L'horloge, elle, ne négocie pas");
    }
    const courants = primaireSansLaGauche.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('primaire-sans-la-gauche');
    expect(entry?.href).toBe('/analyses/primaire-sans-la-gauche');
    expect(entry?.cover?.src).toBe('/illustrations/unes/analyses/primaire-sans-la-gauche.jpg');
    expect(entry?.cover?.alt).toMatch(/longue table de réunion vide/);
    expect(getUneDuJour()?.slug).not.toBe('primaire-sans-la-gauche');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = primaireSansLaGauche.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(15);
    const sourceBlob = JSON.stringify(primaireSansLaGauche.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.20minutes.fr/politique/4258468-20261029-presidentielle-2027-attal-veut-primaire-democrates-philippe-retailleau-reticents',
    );
    expect(sourceBlob).toMatch(/europe1\.fr\/politique\/presidentielle-2027-gabriel-attal-franchit-le-pas/);
    expect(sourceBlob).toMatch(/lcp\.fr\/actualites\/grande-primaire-des-democrates/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/elections\/presidentielle\/ce-serait-du-suicide/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/elections\/presidentielle\/le-candidat-lr-a-la-presidentielle-bruno-retailleau-juge-fantaisiste/);
    expect(sourceBlob).toMatch(/laprovence\.com\/article\/politique\/49845068298277/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/elections\/presidentielle\/un-projet-cafouilleux/);
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/vosdroits\/F1939/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/fondements-textuels\/loi-n-62-1292/);
    expect(sourceBlob).toMatch(/touteleurope\.eu\/vie-politique-des-etats-membres\/presidentielle-2027-calendrier/);
    expect(sourceBlob).toMatch(/franceinfo\.fr\/elections\/presidentielle\/pour-la-presidentielle-de-2027-francois-bayrou/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/les-republicains\/presidentielle-2027-david-lisnard-appelle/);
    expect(sourceBlob).toMatch(/bfmtv\.com\/politique\/reconquete\/une-proposition-intelligente-eric-zemmour/);
    expect(sourceBlob).toMatch(/midilibre\.fr\/2026\/10\/31\/presidentielle-2027-avec-son-projet-de-primaire/);
    expect(sourceBlob).toMatch(/leparisien\.fr\/politique\/aurore-berge-sur-la-presidentielle-2027/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = primaireSansLaGauche.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual([
        'Candidat',
        'Position sur une primaire commune',
        'Sources',
      ]);
      expect(encadre.table.rows).toHaveLength(9);
      expect(encadre.note).toMatch(/Non trouvé/);
      const attalRow = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attalRow?.[1]).toMatch(/grande primaire des démocrates/);
      expect(attalRow?.[1]).toMatch(/centre et de la droite/);
      expect(attalRow?.[2]).toBe('[2][14]');
      const philippe = encadre.table.rows.find((row) => row[0]?.includes('Philippe'));
      expect(philippe?.[1]).toMatch(/rancœurs que d'unité/);
      expect(philippe?.[2]).toBe('[2][4]');
      const retailleau = encadre.table.rows.find((row) => row[0]?.includes('Retailleau'));
      expect(retailleau?.[1]).toMatch(/Edouard Philippe y participe/);
      expect(retailleau?.[2]).toBe('[4][5]');
      const lisnard = encadre.table.rows.find((row) => row[0]?.includes('Lisnard'));
      expect(lisnard?.[1]).toMatch(/pas une alliance/);
      expect(lisnard?.[2]).toBe('[1][4][12]');
      const glucksmann = encadre.table.rows.find((row) => row[0]?.includes('Glucksmann'));
      expect(glucksmann?.[1]).toMatch(/non trouvée dans les sources consultées/);
      expect(glucksmann?.[1]).toMatch(/sort d'une primaire/);
      expect(glucksmann?.[2]).toBe('[2][14]');
      const villepin = encadre.table.rows.find((row) => row[0]?.includes('Villepin'));
      expect(villepin?.[1]).toMatch(/gentiment éconduits|Refus de participer/);
      expect(villepin?.[2]).toBe('[6]');
      const lePen = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(lePen?.[1]).toMatch(/Hors du périmètre/);
      expect(lePen?.[2]).toBe('Aucune');
      const zemmour = encadre.table.rows.find((row) => row[0]?.includes('Zemmour'));
      expect(zemmour?.[1]).toMatch(/Retailleau à Attal/);
      expect(zemmour?.[2]).toBe('[13]');
    }
    const analyseTexts = [
      primaireSansLaGauche.chapo,
      primaireSansLaGauche.description,
      primaireSansLaGauche.disclaimer,
      primaireSansLaGauche.sources_closing,
      ...primaireSansLaGauche.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[15\]/);
    expect(analyseTexts).toMatch(/tend\(re\) la main/);
    expect(analyseTexts).toMatch(/concours de beauté à deux euros/);
    expect(analyseTexts).toMatch(/vendredi 12 mars 2027/);
    expect(analyseTexts).toMatch(/onze semaines de campagne/);
    expect(analyseTexts).toMatch(/Je ne veux pas faire campagne pour Edouard Philippe/);
    expect(analyseTexts).toMatch(/primaire du centre et de la droite/);
    expect(analyseTexts).toMatch(/Aurore Bergé/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(primaireSansLaGauche)).not.toMatch(/<!--/);
  });

  it('analyse guerre civile du 30 octobre, sources, boîte DOE', () => {
    expect(guerreCivileLeMotDeLAutre.slug).toBe('guerre-civile-le-mot-de-l-autre');
    expect(guerreCivileLeMotDeLAutre.date).toBe('2026-10-30');
    expect(guerreCivileLeMotDeLAutre.updated).toBe('2026-10-30');
    expect(guerreCivileLeMotDeLAutre.title).toBe(
      "« Guerre civile » : chacun la voit venir de l'autre camp",
    );
    expect(guerreCivileLeMotDeLAutre.author).toBe('La rédaction');
    expect(guerreCivileLeMotDeLAutre.author_role).toBe('Rédaction LMDPT');
    expect(guerreCivileLeMotDeLAutre.eyebrow).toBe('Analyse · Présidentielle 2027');
    expect(guerreCivileLeMotDeLAutre.type_label).toBe('Analyse');
    expect(guerreCivileLeMotDeLAutre.kicker).toBe('Analyse · La rédaction · 30 octobre 2026');
    expect(guerreCivileLeMotDeLAutre.tags).toContain('doe');
    expect(guerreCivileLeMotDeLAutre.x_hook).toBe(
      "« Guerre civile » : Bardella la voit venir de LFI, la gauche de Zemmour, Villepin de partout. Pendant ce temps, la justice instruit des dossiers bien réels : Nice, Rouen, Riposte Frontières, Trappes. Qui en parle, qui y pousse, qui la combat.",
    );
    expect(guerreCivileLeMotDeLAutre.description.length).toBeLessThanOrEqual(200);
    expect(guerreCivileLeMotDeLAutre.description).toMatch(/17 octobre/);
    expect(guerreCivileLeMotDeLAutre.disclaimer).toMatch(/opinion de la rédaction/);
    expect(guerreCivileLeMotDeLAutre.sources_intro).toMatch(/Consultées le 29 et le 30 octobre 2026/);
    expect(guerreCivileLeMotDeLAutre.sources_closing).toMatch(/consultés le 29 et le 30 octobre 2026/);
    expect(guerreCivileLeMotDeLAutre.hues).toHaveLength(3);
    expect(guerreCivileLeMotDeLAutre.hues.map((hue) => hue.slug)).toEqual([
      'droite',
      'pluraliste',
      'gauche',
    ]);
    expect(guerreCivileLeMotDeLAutre.hues.map((hue) => hue.label)).toEqual([
      'État de droit et règles stables',
      'Républicanisme civique',
      'Gauche',
    ]);
    expect(guerreCivileLeMotDeLAutre.hues.map((hue) => hue.rationale)).toEqual([
      "C'est au juge de dire qui a provoqué à la violence, sur la base d'un acte précis, pas d'une étiquette.",
      'Les mots du débat public ont des effets, et un responsable politique répond de ceux qu\'il choisit.',
      "La fermeté face aux violences et la défense de l'État de droit vont ensemble, comme le soutient Raphaël Glucksmann.",
    ]);
    const quiEnParle = guerreCivileLeMotDeLAutre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'qui-en-parle',
    );
    expect(quiEnParle?.kind).toBe('prose');
    if (quiEnParle?.kind === 'prose') {
      expect(quiEnParle.title).toBe('Qui en parle');
    }
    const justice = guerreCivileLeMotDeLAutre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'justice',
    );
    expect(justice?.kind).toBe('prose');
    if (justice?.kind === 'prose') {
      expect(justice.title).toBe('Ce que la justice a sur la table');
      const nice = justice.blocks.find(
        (block) => block.type === 'p' && block.text.startsWith('**À Nice**'),
      );
      expect(nice?.type).toBe('p');
    }
    const courants = guerreCivileLeMotDeLAutre.sections.find(
      (section) => section.kind === 'prose' && section.id === 'courants',
    );
    expect(courants?.kind).toBe('prose');
    if (courants?.kind === 'prose') {
      expect(courants.title).toBe('Courants que cette analyse rejoint');
    }
    const entry = getAnalysis('guerre-civile-le-mot-de-l-autre');
    expect(entry?.href).toBe('/analyses/guerre-civile-le-mot-de-l-autre');
    expect(entry?.cover?.src).toBe(
      '/illustrations/unes/analyses/guerre-civile-le-mot-de-l-autre.jpg',
    );
    expect(entry?.cover?.alt).toMatch(/place de village au petit matin/);
    expect(getUneDuJour()?.slug).not.toBe('guerre-civile-le-mot-de-l-autre');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = guerreCivileLeMotDeLAutre.sources_groups.reduce(
      (n, g) => n + g.items.length,
      0,
    );
    expect(nSources).toBe(26);
    const sourceBlob = JSON.stringify(guerreCivileLeMotDeLAutre.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.europe1.fr/politique/apres-les-pillages-jordan-bardella-affirme-que-lfi-pousse-a-la-guerre-civile-1162437',
    );
    expect(sourceBlob).toMatch(/franc-tireur\.fr\/la-guerre-des-morts/);
    expect(sourceBlob).toMatch(/elabe\.fr\/fichier-pdf\/13334/);
    expect(sourceBlob).toMatch(/la-croix\.com\/a-vif\/a-force-d-annoncer-la-guerre-civile/);
    expect(sourceBlob).toMatch(/lejdd\.fr\/politique\/horde-de-barbares/);
    expect(sourceBlob).toMatch(/sudouest\.fr\/societe\/greves-et-manifestations/);
    expect(sourceBlob).toMatch(/tf1info\.fr\/politique\/une-menace-sur-la-democratie/);
    expect(sourceBlob).not.toMatch(/Note de vérification/);
    const encadre = guerreCivileLeMotDeLAutre.sections.find((section) => section.kind === 'candidats');
    expect(encadre?.kind).toBe('candidats');
    if (encadre?.kind === 'candidats') {
      expect(encadre.table.headers).toEqual(['Candidat', 'Position', 'Sources']);
      expect(encadre.table.rows).toHaveLength(9);
      expect(encadre.note).toMatch(/Non trouvée/);
      const bardella = encadre.table.rows.find((row) => row[0]?.includes('Le Pen'));
      expect(bardella?.[1]).toMatch(/pousse à la guerre civile/);
      expect(bardella?.[2]).toBe('[25][8]');
      const attal = encadre.table.rows.find((row) => row[0]?.includes('Attal'));
      expect(attal?.[1]).toMatch(/État d'urgence/);
      expect(attal?.[2]).toBe('[22][23][17]');
      const zemmour = encadre.table.rows.find((row) => row[0]?.includes('Zemmour'));
      expect(zemmour?.[1]).toMatch(/non trouvée dans les sources consultées/);
      expect(zemmour?.[2]).toBe('[12]');
    }
    const analyseTexts = [
      guerreCivileLeMotDeLAutre.chapo,
      guerreCivileLeMotDeLAutre.description,
      guerreCivileLeMotDeLAutre.disclaimer,
      guerreCivileLeMotDeLAutre.sources_closing,
      ...guerreCivileLeMotDeLAutre.sections.flatMap((section) => {
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
    expect(analyseTexts).toMatch(/\[25\]/);
    expect(analyseTexts).toMatch(/1,4 pour 100 000/);
    expect(analyseTexts).toMatch(/Riposte Frontières/);
    expect(analyseTexts).toMatch(/En tension avec/);
    expect(JSON.stringify(guerreCivileLeMotDeLAutre)).not.toMatch(/<!--/);
  });

  it('analyse bataille du 2 mai du 29 octobre, sources, boîte DOE, tableau vacances', () => {
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
    expect(getUneDuJour()?.slug).not.toBe('bataille-du-2-mai');
    expect(getUneDuJour()?.date).toBe('2026-11-07');
    const nSources = batailleDu2Mai.sources_groups.reduce((n, g) => n + g.items.length, 0);
    expect(nSources).toBe(14);
    const sourceBlob = JSON.stringify(batailleDu2Mai.sources_groups);
    expect(sourceBlob).toContain(
      'https://www.franceinfo.fr/elections/presidentielle/le-gouvernement-oppose-une-fin-de-non-recevoir-a-la-demande-de-bruno-retailleau-de-changer-les-dates-de-la-presidentielle_8257021.html',
    );
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/actualites\/A15053/);
    expect(sourceBlob).toMatch(/service-public\.gouv\.fr\/particuliers\/actualites\/A18563/);
    expect(sourceBlob).toMatch(/blogdudroitelectoral\.fr\/\?p=23599/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/le-bloc-de-constitutionnalite/);
    expect(sourceBlob).toMatch(/legifrance\.gouv\.fr\/jorf\/id\/JORFTEXT000052416058/);
    expect(sourceBlob).toMatch(/legifrance\.gouv\.fr\/loda\/id\/JORFTEXT000000684037/);
    expect(sourceBlob).toMatch(/conseil-constitutionnel\.fr\/decision\/2022\/2022184_188PDR/);
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
    expect(getUneDuJour()?.date).toBe('2026-11-07');
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
