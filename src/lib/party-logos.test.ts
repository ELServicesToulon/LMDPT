import { describe, expect, it } from 'vitest';
import {
  partyLogoForAffiliation,
  partyLogoSrc,
  partyLogoTextColor,
} from './party-logos';
import candidatures from '../data/elections/2027-candidatures-declarees.json';

describe('partyLogoForAffiliation', () => {
  it('maps major parties', () => {
    expect(partyLogoForAffiliation('Renaissance').id).toBe('renaissance');
    expect(partyLogoForAffiliation('Rassemblement national').id).toBe('rn');
    expect(partyLogoForAffiliation('La France insoumise').id).toBe('lfi');
    expect(partyLogoForAffiliation('Les Républicains').id).toBe('lr');
    expect(partyLogoForAffiliation('Parti socialiste').id).toBe('ps');
    expect(partyLogoForAffiliation('Les Écologistes (EELV)').id).toBe('eelv');
  });

  it('covers every declared affiliation', () => {
    for (const e of candidatures.entries) {
      const logo = partyLogoForAffiliation(e.affiliation);
      expect(logo.id).toBeTruthy();
      expect(partyLogoSrc(logo)).toMatch(/^\/logos\/partis\/[\w-]+\.svg$/);
    }
  });

  it('falls back for unknown labels', () => {
    expect(partyLogoForAffiliation('Mouvement inventé XYZ').id).toBe('independant');
  });

  it('picks dark text on yellow', () => {
    expect(partyLogoTextColor('#ffeb00')).toBe('#0a0a0a');
    expect(partyLogoTextColor('#0d378a')).toBe('#ffffff');
  });
});
