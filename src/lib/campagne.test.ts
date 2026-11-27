import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import campagneJson from '../data/campagne.json';
import candidaturesDeclarees from '../data/elections/2027-candidatures-declarees.json';
import {
  cartesClinDoeil,
  datesAVenir,
  datesMasquage,
  formatCampagneDate,
  formatPeriodeEnquete,
  formatScore,
  getUneLienApercu,
  getUneLienApercuSuivante,
  groupPersonnalites,
  isMasqueAt,
  ligneDeclaresSousCondition,
  mentionDecretConvocation,
  parisWallClock,
  personnaliteChipTitle,
  prochaineDateCle,
  rankResultats,
  scrutinsMasquage,
  shouldHideSondage,
  statutPastille,
  type CampagneData,
} from './campagne';
import type { EditorialPost } from './editorial';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const CAMPAGNE_PATH = join(ROOT, 'src/data/campagne.json');

const FORBIDDEN = [
  /Lagarde/i,
  /Bardella/i,
  /Zemmour/i,
  /Ruffin/i,
  /Louison/i,
  /Arnault/i,
  /mise en examen/i,
  /témoin assisté/i,
];

function asCampagne(data: unknown): CampagneData {
  return data as CampagneData;
}

describe('campagne.json', () => {
  it('se parse et décrit chaque personnalité et chaque date clé', () => {
    const raw = readFileSync(CAMPAGNE_PATH, 'utf8');
    const data = asCampagne(JSON.parse(raw));
    expect(data.title).toBe("La campagne en un clin d'œil");
    expect(data.updated).toBe('2026-11-14');
    expect(data.personnalites.length).toBeGreaterThan(0);
    expect(data.dates.length).toBe(4);

    for (const personne of data.personnalites) {
      expect(personne.nom.trim().length, personne.slug).toBeGreaterThan(0);
      expect(personne.courant.trim().length, personne.slug).toBeGreaterThan(0);
      expect(personne.statut.trim().length, personne.slug).toBeGreaterThan(0);
      expect(personne.statut_label.trim().length, personne.slug).toBeGreaterThan(0);
      expect(personne.source_label.trim().length, personne.slug).toBeGreaterThan(0);
      expect(personne.source_url).toMatch(/^https:\/\//);
      expect(personne.source_date).toMatch(/^\d{4}-\d{2}(-\d{2})?$/);
    }

    for (const item of data.dates) {
      expect(item.label.trim().length, item.id).toBeGreaterThan(0);
      expect(item.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(item.source_label.trim().length, item.id).toBeGreaterThan(0);
      expect(item.source_url).toMatch(/^https:\/\//);
    }
  });

  it('ne contient ni Lagarde, ni Bardella, ni Zemmour, ni Ruffin, ni Louison, ni Arnault / mise en examen / témoin assisté hors classements de sondage', () => {
    const data = asCampagne(JSON.parse(readFileSync(CAMPAGNE_PATH, 'utf8')));
    const horsSondage = JSON.stringify({
      title: data.title,
      disclaimer: data.disclaimer,
      personnalites: data.personnalites,
      dates: data.dates,
    });
    for (const pattern of FORBIDDEN) {
      expect(horsSondage, String(pattern)).not.toMatch(pattern);
    }
  });

  it('garde les groupes dans l’ordre du JSON', () => {
    const groupes = groupPersonnalites(asCampagne(campagneJson).personnalites);
    expect(groupes.map((g) => g.groupe)).toEqual([
      'Gauche et écologie',
      'Centre',
      'Droite',
      'Rassemblement national et souverainistes',
    ]);
  });
});

describe('statutPastille', () => {
  it('abrège déclaré en D et désigné en Dé', () => {
    expect(statutPastille('declaree')).toBe('D');
    expect(statutPastille('designe')).toBe('Dé');
  });
});

describe('personnaliteChipTitle', () => {
  it('met le courant, la source et la date dans le title, pas un score', () => {
    const data = asCampagne(campagneJson);
    const glucksmann = data.personnalites.find((p) => p.slug === 'glucksmann');
    expect(glucksmann).toBeTruthy();
    const title = personnaliteChipTitle(glucksmann!);
    expect(title).toMatch(/Place publique/);
    expect(title).toMatch(/20 Minutes \/ Europe 1/);
    expect(title).toMatch(/11 octobre 2026/);
    expect(title).not.toMatch(/\d+\s*%/);
  });
});

describe('rankResultats', () => {
  it('trie par score décroissant, ex æquo même rang, rang suivant sauté, null en dernier sans rang', () => {
    const ranked = rankResultats([
      { nom: 'A', score: 4 },
      { nom: 'B', score: 31 },
      { nom: 'C', score: 4 },
      { nom: 'D', score: null, score_label: 'moins de 1 %' },
      { nom: 'E', score: 16 },
    ]);
    expect(ranked.map((r) => r.nom)).toEqual(['B', 'E', 'A', 'C', 'D']);
    expect(ranked.map((r) => r.rang)).toEqual([1, 2, 3, 3, null]);
  });

  it('sur OpinionWay, Marine Le Pen est 1re (31) et Retailleau / Riner sont 6es', () => {
    const ow = asCampagne(campagneJson).sondage.classements.find(
      (c) => c.id === 'opinionway-cnews-2026-11-12',
    );
    expect(ow).toBeTruthy();
    const ranked = rankResultats(ow!.resultats);
    expect(ranked[0]?.nom).toBe('Marine Le Pen');
    expect(ranked[0]?.rang).toBe(1);
    expect(ranked[0]?.score).toBe(31);
    expect(ranked.find((r) => r.nom === 'Bruno Retailleau')?.rang).toBe(6);
    expect(ranked.find((r) => r.nom === 'Teddy Riner')?.rang).toBe(6);
    expect(ranked.at(-1)?.nom).toBe('Karim Bouamrane');
    expect(ranked.at(-1)?.rang).toBeNull();
    expect(ranked.at(-1)?.score).toBeNull();
  });
});

describe('formatScore', () => {
  it('formate 2,5 % avec virgule et espace insécable, et score_label si null', () => {
    expect(formatScore({ nom: 'x', score: 2.5 })).toBe('2,5\u00a0%');
    expect(formatScore({ nom: 'x', score: 31 })).toBe('31\u00a0%');
    expect(formatScore({ nom: 'x', score: 0.5 })).toBe('0,5\u00a0%');
    expect(formatScore({ nom: 'x', score: null, score_label: 'moins de 1 %' })).toBe(
      'moins de 1 %',
    );
  });
});

describe('classements campagne.json', () => {
  const data = asCampagne(campagneJson);

  it('a institut, commanditaire, terrain, échantillon, marge, méthode, hypothèse, notice et au moins un résultat', () => {
    expect(data.sondage.classements.length).toBeGreaterThan(0);
    expect(data.sondage.fin_masquage_heure).toBe('20:00');
    expect(data.sondage.mise_au_point).toBeNull();
    for (const classement of data.sondage.classements) {
      expect(classement.institut.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.commanditaire.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.terrain.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.terrain_debut, classement.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(classement.terrain_fin, classement.id).toMatch(/^\d{4}-\d{2}-\d{2}$/);
      expect(classement.echantillon.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.marge_erreur.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.methode.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.hypothese.trim().length, classement.id).toBeGreaterThan(0);
      expect(classement.hypothese, classement.id).toMatch(/choix de la rédaction/);
      expect(classement.notice_numero, classement.id).toMatch(/^\d+$/);
      expect(classement).not.toHaveProperty('notice_label');
      expect(classement.notice_url).toMatch(
        /^https:\/\/www\.commission-des-sondages\.fr\/notices\//,
      );
      expect(classement.resultats.length, classement.id).toBeGreaterThan(0);
    }
  });

  it("contient « Un sondage n'est pas une prédiction »", () => {
    expect(data.sondage.note).toMatch(/Un sondage n'est pas une prédiction/);
  });
});

describe('datesMasquage', () => {
  it('contient la veille et le jour de chaque scrutin', () => {
    const dates = datesMasquage(asCampagne(campagneJson));
    expect(dates).toEqual(['2027-04-17', '2027-04-18', '2027-05-01', '2027-05-02']);
  });
});

describe('scrutinsMasquage', () => {
  it('renvoie les dimanches de scrutin triés, avec le statut décret', () => {
    const data = asCampagne(campagneJson);
    expect(scrutinsMasquage(data)).toEqual(['2027-04-18', '2027-05-02']);
    expect(data.sondage.scrutins_a_masquer).toHaveLength(2);
    for (const scrutin of data.sondage.scrutins_a_masquer) {
      expect(scrutin.statut).toBe('à confirmer par décret de convocation');
    }
  });
});

describe('formatPeriodeEnquete', () => {
  it('formule la période selon le mois et l’année', () => {
    expect(formatPeriodeEnquete('2026-11-10', '2026-11-12')).toBe(
      'Enquête réalisée du 10 au 12 novembre 2026',
    );
    expect(formatPeriodeEnquete('2026-11-09', '2026-11-10')).toBe(
      'Enquête réalisée du 9 au 10 novembre 2026',
    );
    expect(formatPeriodeEnquete('2026-10-30', '2026-11-02')).toBe(
      'Enquête réalisée du 30 octobre au 2 novembre 2026',
    );
    expect(formatPeriodeEnquete('2026-12-30', '2027-01-02')).toBe(
      'Enquête réalisée du 30 décembre 2026 au 2 janvier 2027',
    );
    expect(formatPeriodeEnquete('2026-11-01', '2026-11-03')).toBe(
      'Enquête réalisée du 1er au 3 novembre 2026',
    );
  });
});

describe('formatCampagneDate', () => {
  it('affiche un mois sans jour documenté, sans inventer un quantième', () => {
    expect(formatCampagneDate('2026-05')).toBe('mai 2026');
    expect(formatCampagneDate('2026-03')).toBe('mars 2026');
  });

  it('formule les dates clés en français avec le jour de la semaine', () => {
    expect(formatCampagneDate('2026-11-17')).toBe('mardi 17 novembre 2026');
    expect(formatCampagneDate('2027-03-12')).toBe('vendredi 12 mars 2027');
    expect(formatCampagneDate('2026-11-12', { weekday: false })).toBe('12 novembre 2026');
  });
});

describe('shouldHideSondage', () => {
  const data = asCampagne(campagneJson);
  const scrutins = scrutinsMasquage(data);
  const finMinutes = 20 * 60;

  it('cache le sous-bloc si masquer est vrai', () => {
    const hidden: CampagneData = {
      ...data,
      sondage: { ...data.sondage, masquer: true },
    };
    expect(shouldHideSondage(new Date('2026-11-12T12:00:00+01:00'), hidden)).toBe(true);
  });

  it('premier tour : vendredi 23:59 visible, samedi 00:00 masqué, dimanche 19:59 masqué, 20:00 visible', () => {
    expect(shouldHideSondage(new Date('2027-04-16T23:59:00+02:00'), data)).toBe(false);
    expect(shouldHideSondage(new Date('2027-04-17T00:00:00+02:00'), data)).toBe(true);
    expect(shouldHideSondage(new Date('2027-04-18T19:59:00+02:00'), data)).toBe(true);
    expect(shouldHideSondage(new Date('2027-04-18T20:00:00+02:00'), data)).toBe(false);
  });

  it('second tour : 30/04 23:59 visible, 01/05 00:00 masqué, 02/05 19:59 masqué, 02/05 20:00 visible', () => {
    expect(shouldHideSondage(new Date('2027-04-30T23:59:00+02:00'), data)).toBe(false);
    expect(shouldHideSondage(new Date('2027-05-01T00:00:00+02:00'), data)).toBe(true);
    expect(shouldHideSondage(new Date('2027-05-02T19:59:00+02:00'), data)).toBe(true);
    expect(shouldHideSondage(new Date('2027-05-02T20:00:00+02:00'), data)).toBe(false);
  });

  it('utilise l’horloge de Paris quand UTC et Paris tombent sur des jours différents', () => {
    const utc = new Date('2027-04-16T22:30:00Z');
    expect(parisWallClock(utc)).toEqual({ date: '2027-04-17', minutes: 30 });
    expect(shouldHideSondage(utc, data)).toBe(true);
    expect(isMasqueAt(parisWallClock(utc), scrutins, finMinutes)).toBe(true);
  });

  it('isMasqueAt reprend la règle du script navigateur', () => {
    expect(
      isMasqueAt(parisWallClock(new Date('2027-04-16T23:59:00+02:00')), scrutins, finMinutes),
    ).toBe(false);
    expect(
      isMasqueAt(parisWallClock(new Date('2027-04-17T00:00:00+02:00')), scrutins, finMinutes),
    ).toBe(true);
    expect(
      isMasqueAt(parisWallClock(new Date('2027-04-18T19:59:00+02:00')), scrutins, finMinutes),
    ).toBe(true);
    expect(
      isMasqueAt(parisWallClock(new Date('2027-04-18T20:00:00+02:00')), scrutins, finMinutes),
    ).toBe(false);
  });

  it('laisse visible le 12 novembre 2026 à 12:00 Europe/Paris, drapeau masquer faux', () => {
    expect(data.sondage.masquer).toBe(false);
    expect(shouldHideSondage(new Date('2026-11-12T12:00:00+01:00'), data)).toBe(false);
  });
});

describe('aperçu campagne — accueil', () => {
  it('importe le composant et le place après la une (id="top") et les dernières analyses', () => {
    const src = readFileSync(join(ROOT, 'src/pages/index.astro'), 'utf8');
    expect(src).toMatch(/import ApercuCampagne from ['"]\.\.\/components\/ApercuCampagne\.astro['"]/);
    expect(src).not.toMatch(/<UnesCarousel/);
    const une = src.indexOf('<UneDuJour');
    const top = src.indexOf('id="top"');
    const analyses = src.indexOf('id="dernieres-analyses"');
    const apercu = src.indexOf('<ApercuCampagne');
    expect(une).toBeGreaterThan(-1);
    expect(top).toBeGreaterThan(-1);
    expect(analyses).toBeGreaterThan(-1);
    expect(apercu).toBeGreaterThan(-1);
    expect(top).toBeLessThan(une);
    expect(une).toBeLessThan(analyses);
    expect(analyses).toBeLessThan(apercu);
  });

  it('relie la dernière Une via le catalogue éditorial, sans URL hardcodée dans le JSON', () => {
    const raw = readFileSync(CAMPAGNE_PATH, 'utf8');
    expect(raw).not.toMatch(/\/analyses\//);
    const une = getUneLienApercu();
    expect(une).not.toBeNull();
    expect(une?.title.length).toBeGreaterThan(0);
    expect(une?.href.startsWith('/')).toBe(true);
    expect(une?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
    expect(une?.description.length).toBeGreaterThan(0);
  });

  it('compacte les chips (nom + pastille) et replie sources, dates et sondage dans des details', () => {
    const src = readFileSync(join(ROOT, 'src/components/ApercuCampagne.astro'), 'utf8');
    expect(src).toMatch(/statutPastille/);
    expect(src).toMatch(/personne\.nom/);
    expect(src).not.toMatch(/apercu-chip-courant/);
    expect(src).toMatch(/Détail des sources par courant/);
    expect(src).toMatch(/Détail des dates/);
    expect(src).toMatch(/<details/);
    expect(src).toMatch(/!hideSondage/);
    expect(src).not.toMatch(/personne\.courant<\/span>/);
    const template = src.slice(0, src.indexOf('<style>'));
    expect(template).not.toMatch(/\d+\s*%/);
    const sondageBlock = src.slice(src.indexOf('!hideSondage'));
    expect(sondageBlock).toMatch(/<table/);
    expect(sondageBlock).toMatch(/<caption/);
    expect(sondageBlock).toMatch(/apercu-sondage-hypothese/);
    expect(sondageBlock).toMatch(/scope="col"/);
    expect(sondageBlock).toMatch(/notice_url/);
    expect(sondageBlock).toMatch(/Voir la notice/);
    expect(sondageBlock).toMatch(/Notice consultable sur le site de la Commission des sondages/);
    expect(sondageBlock).toMatch(/apercu-sondage-bar/);
    expect(sondageBlock).toMatch(/aria-hidden="true"/);
    expect(sondageBlock).toMatch(/formatScore\(ligne\)/);
    expect(sondageBlock).toMatch(/SONDAGES_LIGNE/);
    expect(sondageBlock).toMatch(/data-scrutins/);
    expect(sondageBlock).toMatch(/data-fin-masquage/);
    expect(sondageBlock).toMatch(/Europe\/Paris/);
    expect(sondageBlock).toMatch(/sondages-interrupteur\.json/);
    expect(sondageBlock).toMatch(/isMasqueAt/);
    expect(sondageBlock).not.toMatch(/innerHTML/);
    expect(sondageBlock).not.toMatch(/getHours\(/);
    expect(sondageBlock).not.toMatch(/notice_label/);
    expect(sondageBlock).toMatch(/D’autres hypothèses ont été testées, voir la notice\./);
  });

  it('place trois cartes sous le titre, sans chiffre de score hors sondage', () => {
    const src = readFileSync(join(ROOT, 'src/components/ApercuCampagne.astro'), 'utf8');
    expect(src).toMatch(/cartesClinDoeil/);
    expect(src).toMatch(/getUneLienApercu/);
    expect(src).toMatch(/Qui est candidat/);
    expect(src).toMatch(/Ce qui a bougé cette semaine/);
    expect(src).toMatch(/Prochaine date clé/);
    expect(src).toMatch(/liste_complete_href|cartes\.candidats/);
    const template = src.slice(0, src.indexOf('<style>'));
    const cartesMarkup = template.slice(
      template.indexOf('apercu-cartes'),
      template.indexOf('apercu-disclaimer'),
    );
    expect(cartesMarkup.length).toBeGreaterThan(0);
    expect(cartesMarkup).not.toMatch(/\d+\s*%/);
    expect(cartesMarkup).not.toMatch(/formatScore/);
    expect(cartesMarkup).not.toMatch(/rankResultats/);
  });
});

describe('prochaineDateCle et mentionDecretConvocation', () => {
  const data = asCampagne(campagneJson);
  const scrutins = data.sondage.scrutins_a_masquer;

  it('le 15 novembre 2026, prochaine date = réunion des directeurs, sans mention décret', () => {
    const next = prochaineDateCle(data.dates, new Date('2026-11-15T12:00:00+01:00'));
    expect(next?.id).toBe('reunion-directeurs-primaire-droite-centre');
    expect(next?.date).toBe('2026-11-17');
    expect(mentionDecretConvocation(next!, scrutins)).toBeNull();
  });

  it('le 17 novembre 2026, la date du jour reste la prochaine', () => {
    const next = prochaineDateCle(data.dates, new Date('2026-11-17T12:00:00+01:00'));
    expect(next?.id).toBe('reunion-directeurs-primaire-droite-centre');
    expect(mentionDecretConvocation(next!, scrutins)).toBeNull();
  });

  it('le 18 novembre 2026, prochaine = clôture des parrainages, sans mention décret', () => {
    const next = prochaineDateCle(data.dates, new Date('2026-11-18T12:00:00+01:00'));
    expect(next?.id).toBe('cloture-parrainages');
    expect(next?.date).toBe('2027-03-12');
    expect(mentionDecretConvocation(next!, scrutins)).toBeNull();
  });

  it('le 18 avril 2027, prochaine = premier tour, à confirmer par décret', () => {
    const next = prochaineDateCle(data.dates, new Date('2027-04-18T12:00:00+02:00'));
    expect(next?.id).toBe('premier-tour');
    expect(mentionDecretConvocation(next!, scrutins)).toBe(
      'à confirmer par décret de convocation',
    );
  });

  it('le 2 mai 2027, prochaine = second tour, même mention décret', () => {
    const next = prochaineDateCle(data.dates, new Date('2027-05-02T12:00:00+02:00'));
    expect(next?.id).toBe('second-tour');
    expect(mentionDecretConvocation(next!, scrutins)).toBe(
      'à confirmer par décret de convocation',
    );
  });

  it('le 3 mai 2027, plus aucune date à venir', () => {
    expect(prochaineDateCle(data.dates, new Date('2027-05-03T12:00:00+02:00'))).toBeNull();
  });

  it('reprend le statut du scrutin s’il est renseigné, sinon la formule par défaut', () => {
    expect(
      mentionDecretConvocation(
        { date: '2027-04-18' },
        [{ date: '2027-04-18', label: 'Premier tour', statut: '' }],
      ),
    ).toBe('à confirmer par décret de convocation');
    expect(mentionDecretConvocation({ date: '2026-11-17' }, scrutins)).toBeNull();
  });
});

describe('cartesClinDoeil', () => {
  const data = asCampagne(campagneJson);

  it('le 15 novembre 2026, trois cartes : liste, Une du catalogue, réunion du 17', () => {
    const une = getUneLienApercu();
    expect(une).not.toBeNull();
    expect(une?.title.length).toBeGreaterThan(0);
    expect(une?.href.startsWith('/')).toBe(true);

    const cartes = cartesClinDoeil({
      data,
      une,
      now: new Date('2026-11-15T12:00:00+01:00'),
    });
    expect(cartes.candidats.title).toBe('Qui est candidat');
    expect(cartes.candidats.href).toBe(data.liste_complete_href);
    expect(cartes.candidats.count).toBe(data.personnalites.length);
    expect(cartes.candidats.ligne).toBe(
      `${data.personnalites.length} personnalités sourcées`,
    );
    expect(cartes.candidats.listeLabel).toBe('Voir la liste');

    const suivante = getUneLienApercuSuivante();
    expect(suivante).not.toBeNull();
    expect(suivante!.slug).not.toBe(une!.slug);
    expect(suivante!.href).not.toBe(une!.href);

    expect(cartes.semaine).not.toBeNull();
    expect(cartes.semaine?.title).toBe('Ce qui a bougé cette semaine');
    expect(cartes.semaine?.uneTitle).toBe(suivante!.cardTitle ?? suivante!.title);
    expect(cartes.semaine?.uneTitle).toBe(
      'Second tour le 2 mai : le 1er-Mai tomberait en plein silence électoral',
    );
    expect(cartes.semaine?.uneTitle).not.toMatch(/\d+\s*%/);
    expect(cartes.semaine?.href).toBe(suivante!.href);
    expect(cartes.semaine?.dateLabel).toBe(suivante!.dateLabel);
    expect(cartes.semaine?.description).toBe(suivante!.description);

    expect(cartes.dateCle).not.toBeNull();
    expect(cartes.dateCle?.title).toBe('Prochaine date clé');
    expect(cartes.dateCle?.date).toBe('2026-11-17');
    expect(cartes.dateCle?.dateLabel).toBe('mardi 17 novembre 2026');
    expect(cartes.dateCle?.label).toBe(
      data.dates.find((item) => item.id === 'reunion-directeurs-primaire-droite-centre')!
        .label,
    );
    expect(cartes.dateCle?.mentionDecret).toBeNull();
    expect(
      JSON.stringify({
        ...cartes,
        semaine: cartes.semaine
          ? { ...cartes.semaine, description: '' }
          : cartes.semaine,
      }),
    ).not.toMatch(/\d+\s*%/);
  });

  it('masque la carte Une si le catalogue n’a rien, et la date clé après le 2 mai 2027', () => {
    const sansUne = cartesClinDoeil({
      data,
      une: null,
      now: new Date('2026-11-15T12:00:00+01:00'),
    });
    expect(sansUne.semaine).toBeNull();
    expect(sansUne.dateCle?.date).toBe('2026-11-17');

    const apresScrutin = cartesClinDoeil({
      data,
      une: getUneLienApercu(),
      now: new Date('2027-05-03T12:00:00+02:00'),
    });
    expect(apresScrutin.dateCle).toBeNull();
    expect(apresScrutin.semaine).not.toBeNull();
  });

  it('le 18 avril 2027, la carte date clé porte la mention décret', () => {
    const cartes = cartesClinDoeil({
      data,
      une: getUneLienApercu(),
      now: new Date('2027-04-18T12:00:00+02:00'),
    });
    expect(cartes.dateCle?.date).toBe('2027-04-18');
    expect(cartes.dateCle?.mentionDecret).toBe('à confirmer par décret de convocation');
  });
});

describe('ligneDeclaresSousCondition', () => {
  const data = asCampagne(campagneJson);
  const attenduEditorial =
    '+ 3 déclarés sous condition : Éric Zemmour, Jordan Bardella, Philippe Brun';

  it('dérive le libellé, le href et laisse le compteur des 18 personnalités', () => {
    const ligne = ligneDeclaresSousCondition(
      candidaturesDeclarees.entries,
      data.liste_complete_href,
    );
    expect(ligne).not.toBeNull();
    expect(ligne!.libelle).toBe(attenduEditorial);

    expect(ligne!.href).toBe('#candidatures-declarees-2027');
    expect(data.liste_complete_href).toBe('#candidatures-declarees-2027');

    const indexSrc = readFileSync(join(ROOT, 'src/pages/index.astro'), 'utf8');
    expect(indexSrc).toMatch(/id="candidatures-declarees-2027"/);

    const cartes = cartesClinDoeil({
      data,
      une: getUneLienApercu(),
      now: new Date('2026-11-15T12:00:00+01:00'),
    });
    expect(cartes.candidats.ligne).toBe(
      `${data.personnalites.length} personnalités sourcées`,
    );
    expect(data.personnalites.length).toBe(18);
  });

  it('affiche la ligne liée dans la carte, sans pastille SC', () => {
    const src = readFileSync(join(ROOT, 'src/components/ApercuCampagne.astro'), 'utf8');
    const template = src.slice(0, src.indexOf('<style>'));
    const cartesMarkup = template.slice(
      template.indexOf('apercu-cartes'),
      template.indexOf('apercu-disclaimer'),
    );
    expect(src).toMatch(/ligneDeclaresSousCondition/);
    expect(src).toMatch(/candidaturesDeclarees\.entries/);
    expect(cartesMarkup).toMatch(/declaresSousCondition\.libelle/);
    expect(cartesMarkup).toMatch(/declaresSousCondition\.href/);
    expect(cartesMarkup).toMatch(/apercu-carte-sous-condition/);
    expect(src).toMatch(/statutPastille/);
    expect(src).toMatch(/D déclaré·e · Dé désigné·e/);
    expect(src).not.toMatch(/SC sous condition/);
    expect(src).not.toMatch(/pastille[^.\n]*SC|\bSC\b/);
    expect(template).not.toMatch(/statutPastille\([^)]*condition/);
  });
});

describe('datesAVenir', () => {
  const data = asCampagne(campagneJson);

  it('garde le 17 novembre dans les données, et le masque à partir du 18', () => {
    expect(data.dates.some((item) => item.date === '2026-11-17')).toBe(true);
    expect(data.dates.some((item) => item.id === 'reunion-directeurs-primaire-droite-centre')).toBe(
      true,
    );

    const avant = datesAVenir(data.dates, new Date('2026-11-17T12:00:00+01:00')).map(
      (item) => item.date,
    );
    expect(avant).toContain('2026-11-17');

    const le22 = datesAVenir(data.dates, new Date('2026-11-22T12:00:00+01:00'));
    expect(le22.map((item) => item.date)).not.toContain('2026-11-17');
    expect(le22.map((item) => item.id)).toEqual([
      'cloture-parrainages',
      'premier-tour',
      'second-tour',
    ]);

    const src = readFileSync(join(ROOT, 'src/components/ApercuCampagne.astro'), 'utf8');
    expect(src).toMatch(/datesAVenir/);
    expect(src).toMatch(/datesVisibles/);
  });
});

describe('getUneLienApercuSuivante', () => {
  const fixture = (over: Partial<EditorialPost> & Pick<EditorialPost, 'slug' | 'date'>): EditorialPost => ({
    kind: 'analyse',
    title: over.title ?? over.slug,
    description: over.description ?? `chapo ${over.slug}`,
    published: over.date,
    updated: over.date,
    href: over.href ?? `/analyses/${over.slug}`,
    cover: null,
    ...over,
  });

  it('prend l’élément suivant par récence, sans figer le slug de la une courante', () => {
    const posts: EditorialPost[] = [
      fixture({ slug: 'une-du-jour', date: '2026-11-23', title: 'Une du jour' }),
      fixture({ slug: 'une-precedente', date: '2026-11-22', title: 'Une précédente' }),
      fixture({ slug: 'une-plus-ancienne', date: '2026-11-21', title: 'Plus ancienne' }),
    ];
    const courante = getUneLienApercu(posts);
    expect(courante?.slug).toBe('une-du-jour');
    const suivante = getUneLienApercuSuivante(posts, courante);
    expect(suivante?.slug).toBe('une-precedente');
    expect(suivante?.title).toBe('Une précédente');
    expect(suivante?.slug).not.toBe(courante?.slug);
    expect(JSON.stringify(posts.map((post) => post.slug))).not.toMatch(
      /voter-a-16-ans-une-loi-suffirait-elle/,
    );
  });

  it('renvoie null s’il n’y a pas d’élément suivant, ou pas de une courante', () => {
    const seule: EditorialPost[] = [
      fixture({ slug: 'unique', date: '2026-11-22', title: 'Seule' }),
    ];
    expect(getUneLienApercuSuivante(seule, getUneLienApercu(seule))).toBeNull();
    expect(getUneLienApercuSuivante(seule, null)).toBeNull();
  });
});
