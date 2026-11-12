import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { describe, expect, it } from 'vitest';
import campagneJson from '../data/campagne.json';
import {
  formatCampagneDate,
  getUneLienApercu,
  groupPersonnalites,
  shouldHideSondage,
  type CampagneData,
} from './campagne';

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
    expect(data.updated).toBe('2026-11-12');
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

  it('ne contient ni Lagarde, ni Bardella, ni Zemmour, ni Ruffin, ni Louison, ni Arnault / mise en examen / témoin assisté', () => {
    const raw = readFileSync(CAMPAGNE_PATH, 'utf8');
    for (const pattern of FORBIDDEN) {
      expect(raw, String(pattern)).not.toMatch(pattern);
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

  it('cache le sous-bloc si masquer est vrai', () => {
    const hidden: CampagneData = {
      ...data,
      sondage: { ...data.sondage, masquer: true },
    };
    expect(shouldHideSondage(new Date('2026-11-12T12:00:00+01:00'), hidden)).toBe(true);
  });

  it('cache le 17 avril 2027 et le 18 avril 2027 (1er tour)', () => {
    expect(shouldHideSondage(new Date('2027-04-17T12:00:00+02:00'), data)).toBe(true);
    expect(shouldHideSondage(new Date('2027-04-18T12:00:00+02:00'), data)).toBe(true);
  });

  it('cache le 1er mai et le 2 mai 2027 (second tour et veille)', () => {
    expect(shouldHideSondage(new Date('2027-05-01T12:00:00+02:00'), data)).toBe(true);
    expect(shouldHideSondage(new Date('2027-05-02T12:00:00+02:00'), data)).toBe(true);
  });

  it('laisse visible le 12 novembre 2026 à 12:00 Europe/Paris, drapeau masquer faux', () => {
    expect(data.sondage.masquer).toBe(false);
    expect(shouldHideSondage(new Date('2026-11-12T12:00:00+01:00'), data)).toBe(false);
  });
});

describe('aperçu campagne — accueil', () => {
  it('importe le composant et le place avant UnesCarousel / id="top"', () => {
    const src = readFileSync(join(ROOT, 'src/pages/index.astro'), 'utf8');
    expect(src).toMatch(/import ApercuCampagne from ['"]\.\.\/components\/ApercuCampagne\.astro['"]/);
    const daily = src.indexOf('<DailyVisuals');
    const apercu = src.indexOf('<ApercuCampagne');
    const top = src.indexOf('id="top"');
    const carousel = src.indexOf('<UnesCarousel');
    expect(apercu).toBeGreaterThan(-1);
    expect(daily).toBeGreaterThan(-1);
    expect(daily).toBeLessThan(apercu);
    expect(apercu).toBeLessThan(top);
    expect(top).toBeLessThan(carousel);
  });

  it('relie la dernière Une via le catalogue éditorial, sans URL hardcodée dans le JSON', () => {
    const raw = readFileSync(CAMPAGNE_PATH, 'utf8');
    expect(raw).not.toMatch(/\/analyses\//);
    const une = getUneLienApercu();
    expect(une).not.toBeNull();
    expect(une?.title.length).toBeGreaterThan(0);
    expect(une?.href.startsWith('/')).toBe(true);
    expect(une?.date).toMatch(/^\d{4}-\d{2}-\d{2}$/);
  });
});
