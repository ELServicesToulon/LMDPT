import { describe, expect, it } from 'vitest';
import { getElection } from './elections';
import { buildScrutinDual, firstRoundPresidentielleAsBlocs } from './scrutin-dual';
import {
  ATLAS_2027_PLACEHOLDER,
  ATLAS_2027_SLUG,
  ATLAS_2027_VISIBLE_DATE,
  SHOW_2027_SIMULATION,
  atlasVisibleDateLabel,
  isAtlas2027Slug,
  replaceAtlas2027LongDate,
  shouldRender2027Simulation,
  shouldShow2027Simulation,
} from './atlas-2027-simulation';

describe('atlas-2027-simulation — drapeau éditorial', () => {
  it('masque la simulation 2027 par défaut', () => {
    expect(SHOW_2027_SIMULATION).toBe(false);
    expect(shouldShow2027Simulation()).toBe(false);
  });

  it('ne masque que le scrutin 2027-presidentielle', () => {
    expect(isAtlas2027Slug(ATLAS_2027_SLUG)).toBe(true);
    expect(shouldRender2027Simulation('2027-presidentielle')).toBe(false);
    expect(shouldRender2027Simulation('2022-presidentielle')).toBe(true);
    expect(shouldRender2027Simulation('2017-presidentielle')).toBe(true);
    expect(shouldRender2027Simulation('2024-legislatives')).toBe(true);
  });

  it('affiche avril 2027 à la place de la date longue', () => {
    expect(atlasVisibleDateLabel('2027-presidentielle', '2027-04-18')).toBe(ATLAS_2027_VISIBLE_DATE);
    expect(atlasVisibleDateLabel('2022-presidentielle', '2022-04-10')).toMatch(/2022/);
    expect(replaceAtlas2027LongDate('1er tour présidentiel 18 avril 2027 (projection)')).toBe(
      '1er tour présidentiel avril 2027 (projection)',
    );
  });

  it('expose le texte de remplacement atlas', () => {
    expect(ATLAS_2027_PLACEHOLDER).toBe(
      "Présidentielle 2027 : l'hémicycle du 1er tour s'affichera avec les résultats officiels. LMDPT ne publie pas de projection.",
    );
  });

  it('laisse le calcul dual 2027 et les JSON disponibles', () => {
    const dual = buildScrutinDual('2027-presidentielle');
    expect(dual).not.toBeNull();
    expect(dual!.firstRound.reduce((s, r) => s + r.seats, 0)).toBe(577);
    const data = getElection('2027-presidentielle')!;
    expect(firstRoundPresidentielleAsBlocs(data).length).toBeGreaterThan(0);
  });
});
