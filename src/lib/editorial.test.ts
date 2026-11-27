import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import { DEBATE_CATALOG } from './debates';
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
import {
  getDernieresUnes,
  MISSING_COVER_SRC,
  assertUniqueEditorialCovers,
  auditEditorialCovers,
  compareEditorialRecency,
  getUneDuJour,
  isForbiddenUneCover,
  listEditorialPosts,
  resolveCover,
  type EditorialPost,
} from './editorial';

describe('editorial covers', () => {
  it('every analysis and debate has a dedicated cover file', () => {
    expect(ANALYSIS_CATALOG.every((a) => a.cover?.src)).toBe(true);
    expect(DEBATE_CATALOG.every((d) => d.cover?.src)).toBe(true);
    expect(() => assertUniqueEditorialCovers()).not.toThrow();
    expect(auditEditorialCovers()).toEqual([]);
  });

  it('no two posts share the same une image', () => {
    const posts = listEditorialPosts();
    const srcs = posts.map((p) => p.cover?.src).filter(Boolean) as string[];
    expect(new Set(srcs).size).toBe(srcs.length);
    expect(srcs.length).toBe(posts.length);
  });

  it('rejects cairo / daily scoop paths as une covers', () => {
    expect(isForbiddenUneCover('/illustrations/2027/hero-daily-live.jpg')).toBe(true);
    expect(isForbiddenUneCover('/illustrations/2027/hero-daily-2026-07-26.jpg')).toBe(true);
    expect(isForbiddenUneCover('/illustrations/unes/analyses/temps-parole-equite.jpg')).toBe(false);
  });

  it('homepage une is the most recently published post', () => {
    const une = getUneDuJour();
    expect(une).not.toBeNull();
    const latest = [...listEditorialPosts()].sort(compareEditorialRecency)[0];
    expect(une?.kind).toBe(latest?.kind);
    expect(une?.slug).toBe(latest?.slug);
    expect(une?.href).toBe(latest?.href);
    expect(une?.date).toBe(latest?.date);
    expect(une?.cover?.src).toBe(latest?.cover?.src);
  });

  it('publishing a newer post changes the une automatically', () => {
    const current = listEditorialPosts();
    const fresh: EditorialPost = {
      kind: 'analyse',
      slug: 'nouvelle-analyse-test',
      title: 'Nouvelle analyse',
      description: 'Texte de test',
      date: '2099-01-01',
      published: '2099-01-01',
      updated: '2099-01-01',
      href: '/analyses/nouvelle-analyse-test',
      cover: {
        src: '/illustrations/unes/analyses/nouvelle-analyse-test.jpg',
        alt: 'Croquis de test',
      },
    };
    const une = getUneDuJour([...current, fresh]);
    expect(une?.slug).toBe('nouvelle-analyse-test');
    expect(une?.cover?.src).toBe(fresh.cover?.src);
    expect(une?.cover?.src).not.toBe(getUneDuJour(current)?.cover?.src);
  });

  it('missing cover uses the labeled placeholder, never another post art', () => {
    const other = listEditorialPosts().find(
      (post) => post.cover?.src && post.cover.src !== MISSING_COVER_SRC,
    );
    const resolved = resolveCover(null);
    expect(resolved.missing).toBe(true);
    expect(resolved.src).toBe(MISSING_COVER_SRC);
    expect(other?.cover?.src).toBeTruthy();
    expect(resolved.src).not.toBe(other?.cover?.src);
    expect(resolved.alt.toLowerCase()).toContain('manquante');

    const empty = resolveCover({ src: '  ', alt: '' });
    expect(empty.src).toBe(MISSING_COVER_SRC);
    expect(empty.missing).toBe(true);
  });

  it('homepage hero is the une, not the below-the-fold gallery', () => {
    const src = readFileSync(path.join(process.cwd(), 'src/pages/index.astro'), 'utf8');
    const hero = src.indexOf('<UneDuJour');
    const gallery = src.indexOf('id="visuels-2027"');
    expect(src).not.toMatch(/<UnesCarousel/);
    expect(hero).toBeGreaterThan(-1);
    expect(gallery).toBeGreaterThan(-1);
    expect(hero).toBeLessThan(gallery);
  });

  it('analyses index lists dossier cards with covers before the press feed', () => {
    const src = readFileSync(path.join(process.cwd(), 'src/pages/analyses/index.astro'), 'utf8');
    expect(src.indexOf('<EditorialCard')).toBeGreaterThan(-1);
    expect(src.indexOf('<EditorialCard')).toBeLessThan(src.indexOf('<NewsFeed'));
  });

  it('audit fails loudly on duplicate or missing field', () => {
    const posts = listEditorialPosts();
    const clone: EditorialPost = {
      ...posts[0],
      slug: 'clone-dupe',
      href: '/analyses/clone-dupe',
    };
    const dupes = auditEditorialCovers([...posts, clone]);
    expect(dupes.some((e) => e.code === 'duplicate')).toBe(true);

    const missing = auditEditorialCovers([
      { ...posts[0], slug: 'sans-cover', href: '/analyses/sans-cover', cover: null },
    ]);
    expect(missing.some((e) => e.code === 'missing-field')).toBe(true);
  });
});

describe('une du jour (égalité de date)', () => {
  it('enquête Zemmour promet sa dernière campagne, mais il lui manquerait encore au moins 150 parrainages du 28/11 en une, puis enquête Second tour le 2 mai : le 1er-Mai tomberait en plein silence électoral du 27/11, enquête Lisnard réélu à l’AMF avec 72 % : un vote des maires n’est pas une signature du 26/11, enquête Parrainages : l’AMF réclame le secret pour les maires, l’État dit non du 25/11, enquête Temps de parole en 2027 : quels influenceurs sont vraiment concernés ? du 24/11, enquête Ruffin parti, combien de gauches reste-t-il ? du 23/11, enquête Voter à 16 ans : une loi suffirait-elle ? du 22/11, enquête Toutes les niches en cinq ans, même la vôtre ? du 21/11, enquête 3,7 milliards : quelles associations ? du 20/11, enquête 10 ou 35 milliards : qui compte juste ? du 19/11, enquête Hausse de salaire exonérée : qui règle la note ? du 18/11, enquête « J’ai commis une erreur » : laquelle ? du 17/11, enquête La loi qui se vote à Bruxelles du 16/11, enquête Le serment du perdant du 15/11, enquête 1962, la porte de service du 14/11, enquête 800 000 en moins, 500 000 en plus du 13/11, enquête Union cherche arbitre du 12/11, enquête 1 502 contre 1 700 du 11/11, enquête Riner et parrainages du 10/11, enquête IA et campagne du 07/11, sel et poivre du 06/11, trois pour un contre du 05/11, 48 ou 500 lycées bloqués du 04/11, vie chère Porsche Trabant du 03/11, 779 retirez Halloween du 02/11, primaire sans la gauche du 01/11, guerre civile du 30/10, bataille du 2 mai du 29/10, Corse Sénat non du 28/10, Union nationale, Sécu, Debord, Ifop et feuilleton', () => {
    const sorted = [...listEditorialPosts()].sort(compareEditorialRecency);
    expect(getUneDuJour()?.slug).toBe('zemmour-derniere-campagne-il-lui-manquerait-150-parrainages');
    expect(sorted[1]?.slug).toBe('second-tour-2-mai-le-1er-mai-en-plein-silence-electoral');
    expect(sorted[1]?.date).toBe('2026-11-27');
    expect(sorted[2]?.slug).toBe('lisnard-reelu-les-maires-ont-vote-pas-encore-signe');
    expect(sorted[2]?.date).toBe('2026-11-26');
    expect(getUneDuJour()?.title).toBe(
      'Zemmour promet sa dernière campagne, mais il lui manquerait encore au moins 150 parrainages',
    );
    expect(selEtPoivre.x_hook).toBe(
      "Selon l'AFP, un proche interlocuteur du chef de l'État parle de « coalition » de Lisnard à Glucksmann. Retailleau répond « sel et poivre » et « ticket » Mélenchon-Le Pen. Philippe et Glucksmann, chacun à sa façon, disent non.",
    );
    expect(troisPourUnContre.x_hook).toBe(
      "Retailleau se rallie à une primaire « sans doute en début d'année ». Trois des quatre principaux candidats de la droite et du centre sont pour. Philippe dit non et renvoie le départage à février. Ce que l'attente coûte à chacun.",
    );
    expect(lyceesBloques.x_hook).toBe(
      "48 lycées bloqués mardi pour le ministère, 500 pour l'Union syndicale lycéenne. Dix fois plus. Les deux camps ne comptent pas la même chose, et aucun, à notre connaissance, ne publie sa liste. On a démonté les deux thermomètres.",
    );
    expect(vieCherePorscheTrabant.x_hook).toBe(
      "Manifester contre la vie chère, c'est vouloir une Porsche au prix d'une Trabant ? On a fait l'addition, mesure par mesure. Sur l'essence, la formule tient. Sur les bourses, la taxe Zucman ou le Smic, beaucoup moins.",
    );
    expect(retirezHalloween.x_hook).toBe(
      "779 interpellations samedi, dit le bilan qui tourne depuis dimanche. Mais 214 datent de la soirée d'Halloween. Avant 21 h, l'Intérieur en compte 565 : plus de quatre fois moins que le 17 octobre. Et les 116 blessés qu'on lit à côté ne comptent, eux, que la journée.",
    );
    expect(primaireSansLaGauche.x_hook).toBe(
      "La « primaire des démocrates » de Gabriel Attal devait aller de Glucksmann à Lisnard. Trois jours plus tard, c'est une primaire « du centre et de la droite ». Et le seul candidat qui applaudit en veut une autre, ouverte jusqu'à Reconquête, sans promesse de faire campagne pour un gagnant dont il ne partage pas les idées.",
    );
    expect(guerreCivileLeMotDeLAutre.x_hook).toBe(
      "« Guerre civile » : Bardella la voit venir de LFI, la gauche de Zemmour, Villepin de partout. Pendant ce temps, la justice instruit des dossiers bien réels : Nice, Rouen, Riposte Frontières, Trappes. Qui en parle, qui y pousse, qui la combat.",
    );
    expect(batailleDu2Mai.x_hook).toBe(
      "Présidentielle : Retailleau veut changer les dates, pour ne pas voter le 2 mai, au lendemain du 1er-Mai. L'exécutif refuse et met en avant les vacances scolaires. Nous avons vérifié : le 2 mai, une seule zone scolaire reste en congés. Mais le 18 avril, au premier tour, les trois zones le seront.",
    );
    expect(corseSenatNon.x_hook).toBe(
      "Corse : le Sénat a rejeté la réforme constitutionnelle par 181 voix contre 134. 122 des 124 LR ont pourtant voté pour, sur un texte « largement réécrit » « à l'initiative de la droite », selon franceinfo. Aucun socialiste ni écologiste n'a voté pour.",
    );
    expect(lePenUnionNationale.x_hook).toBe(
      "Le Pen promet l'« union nationale » et a déjà choisi son Premier ministre. Pour atteindre 289 députés dans l'Assemblée d'aujourd'hui, il en manque 151 au RN et à son allié",
    );
    expect(secu115Contre1.x_hook).toBe('115 contre 1, mais 138 votants : quatre jours de votes effacés');
    expect(sorted[3]?.slug).toBe('parrainages-les-maires-veulent-signer-en-secret');
    expect(sorted[3]?.date).toBe('2026-11-25');
    expect(sorted[4]?.slug).toBe(
      'temps-de-parole-2027-quels-influenceurs-sont-vraiment-concernes',
    );
    expect(sorted[4]?.date).toBe('2026-11-24');
    expect(sorted[5]?.slug).toBe('ruffin-parti-combien-de-gauches-reste-t-il');
    expect(sorted[5]?.date).toBe('2026-11-23');
    expect(sorted[6]?.slug).toBe('voter-a-16-ans-une-loi-suffirait-elle');
    expect(sorted[6]?.date).toBe('2026-11-22');
    expect(sorted[7]?.slug).toBe('toutes-les-niches-meme-la-votre');
    expect(sorted[7]?.date).toBe('2026-11-21');
    expect(sorted[8]?.slug).toBe('3-7-milliards-quelles-associations');
    expect(sorted[8]?.date).toBe('2026-11-20');
    expect(sorted[9]?.slug).toBe('10-ou-35-milliards-qui-compte-juste');
    expect(sorted[9]?.date).toBe('2026-11-19');
    expect(sorted[10]?.slug).toBe('hausse-de-salaire-exoneree-qui-regle-la-note');
    expect(sorted[10]?.date).toBe('2026-11-18');
    expect(sorted[11]?.slug).toBe('j-ai-commis-une-erreur-laquelle');
    expect(sorted[11]?.date).toBe('2026-11-17');
    expect(sorted[12]?.slug).toBe('la-loi-qui-se-vote-a-bruxelles');
    expect(sorted[12]?.date).toBe('2026-11-16');
    expect(sorted[13]?.slug).toBe('le-serment-du-perdant');
    expect(sorted[13]?.date).toBe('2026-11-15');
    expect(sorted[14]?.slug).toBe('1962-la-porte-de-service');
    expect(sorted[14]?.date).toBe('2026-11-14');
    expect(sorted[15]?.slug).toBe('800000-en-moins-500000-en-plus');
    expect(sorted[15]?.date).toBe('2026-11-13');
    expect(sorted[16]?.slug).toBe('union-cherche-arbitre');
    expect(sorted[16]?.date).toBe('2026-11-12');
    expect(sorted[17]?.slug).toBe('1502-contre-1700');
    expect(sorted[17]?.date).toBe('2026-11-11');
    expect(sorted[18]?.slug).toBe('riner-face-aux-500');
    expect(sorted[18]?.date).toBe('2026-11-10');
    expect(sorted[19]?.slug).toBe('ia-changer-campagne');
    expect(sorted[19]?.date).toBe('2026-11-07');
    expect(sorted[20]?.slug).toBe('sel-et-poivre');
    expect(sorted[20]?.date).toBe('2026-11-06');
    expect(sorted[21]?.slug).toBe('trois-pour-un-contre');
    expect(sorted[21]?.date).toBe('2026-11-05');
    expect(sorted[22]?.slug).toBe('48-ou-500-lycees-bloques');
    expect(sorted[22]?.date).toBe('2026-11-04');
    expect(sorted[23]?.slug).toBe('vie-chere-porsche-trabant');
    expect(sorted[23]?.date).toBe('2026-11-03');
    expect(sorted[24]?.slug).toBe('779-retirez-halloween');
    expect(sorted[24]?.date).toBe('2026-11-02');
    expect(sorted[25]?.slug).toBe('primaire-sans-la-gauche');
    expect(sorted[25]?.date).toBe('2026-11-01');
    expect(sorted[26]?.slug).toBe('guerre-civile-le-mot-de-l-autre');
    expect(sorted[26]?.date).toBe('2026-10-30');
    expect(sorted[27]?.slug).toBe('bataille-du-2-mai');
    expect(sorted[27]?.date).toBe('2026-10-29');
    expect(sorted[28]?.slug).toBe('corse-senat-non');
    expect(sorted[28]?.date).toBe('2026-10-28');
    expect(sorted[29]?.slug).toBe('chronique-manusk-fiction-demission-macron');
    expect(sorted[30]?.slug).toBe('le-pen-union-nationale');
    expect(sorted[31]?.slug).toBe('secu-115-contre-1');
    expect(sorted[32]?.slug).toBe('debord-watts-frigo-sans-courant');
    expect(sorted[33]?.slug).toBe('breve-ifop-post-primaire');
    expect(sorted[34]?.slug).toBe('feuilleton-salle-attente-episode-1');
    expect(sorted[35]?.slug).toBe('primaire-droite-qui-la-veut');
    expect(sorted[36]?.slug).toBe('chronique-manusk-primaire-vent-arriere');
  });
});

describe('carrousel des dernières unes', () => {
  it('renvoie 5 unes, la première étant la une du jour, sans doublon', () => {
    const unes = getDernieresUnes(5);
    expect(unes).toHaveLength(5);
    expect(unes[0]?.slug).toBe(getUneDuJour()?.slug);
    expect(new Set(unes.map((u) => u.slug)).size).toBe(5);
    for (let i = 1; i < unes.length; i++) {
      expect(unes[i - 1]!.date >= unes[i]!.date).toBe(true);
    }
  });
});

describe('editorial card cover frame', () => {
  const cardSrc = readFileSync(path.join(process.cwd(), 'src/components/EditorialCard.astro'), 'utf8');

  it('does not render an empty cover frame when the image is missing', () => {
    expect(cardSrc).toContain('coverFileExists');
    expect(cardSrc).toContain('showCover');
    expect(cardSrc).toMatch(/showCover && \(/);
    expect(cardSrc).not.toContain('editorial-card-missing');
  });
});

describe('liberte-d-expression hub cover', () => {
  const src = readFileSync(path.join(process.cwd(), 'src/pages/liberte-d-expression.astro'), 'utf8');

  it('branches Loulou’s watercolor with the validated alt', () => {
    expect(src).toContain("src: '/illustrations/unes/liberte-d-expression.jpg'");
    expect(src).toContain(
      'Aquarelle d’une table en bois éclairée par une fenêtre, avec un microphone vintage en métal, un encrier bleu, une bande de lin dénouée, un stylo-plume et deux feuilles de papier vierges.',
    );
    expect(src).toContain('<EditorialCoverImage');
  });
});
