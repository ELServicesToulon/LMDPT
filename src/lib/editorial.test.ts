import { readFileSync } from 'node:fs';
import path from 'node:path';
import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import { DEBATE_CATALOG } from './debates';
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
    const hero = src.indexOf('<UnesCarousel');
    const intro = src.indexOf('home-intro--after-une');
    const gallery = src.indexOf('id="visuels-2027"');
    expect(hero).toBeGreaterThan(-1);
    expect(hero).toBeLessThan(intro);
    expect(intro).toBeLessThan(gallery);
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
  it('analyse guerre civile du 30/10 en une, puis bataille du 2 mai du 29/10, Corse Sénat non du 28/10, Union nationale, Sécu, Debord, Ifop et feuilleton', () => {
    const sorted = [...listEditorialPosts()].sort(compareEditorialRecency);
    expect(getUneDuJour()?.slug).toBe('guerre-civile-le-mot-de-l-autre');
    expect(getUneDuJour()?.title).toBe(
      "« Guerre civile » : chacun la voit venir de l'autre camp",
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
    expect(sorted[1]?.slug).toBe('antifa-terroriste-deux-pays-l-ont-ecrit');
    expect(sorted[1]?.date).toBe('2026-10-30');
    expect(sorted[2]?.slug).toBe('terrorisme-chacun-son-ratio');
    expect(sorted[2]?.date).toBe('2026-10-30');
    expect(sorted[3]?.slug).toBe('bataille-du-2-mai');
    expect(sorted[3]?.date).toBe('2026-10-29');
    expect(sorted[4]?.slug).toBe('corse-senat-non');
    expect(sorted[4]?.date).toBe('2026-10-28');
    expect(sorted[5]?.slug).toBe('chronique-manusk-fiction-demission-macron');
    expect(sorted[6]?.slug).toBe('le-pen-union-nationale');
    expect(sorted[7]?.slug).toBe('secu-115-contre-1');
    expect(sorted[8]?.slug).toBe('debord-watts-frigo-sans-courant');
    expect(sorted[9]?.slug).toBe('breve-ifop-post-primaire');
    expect(sorted[10]?.slug).toBe('feuilleton-salle-attente-episode-1');
    expect(sorted[11]?.slug).toBe('primaire-droite-qui-la-veut');
    expect(sorted[12]?.slug).toBe('chronique-manusk-primaire-vent-arriere');
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

