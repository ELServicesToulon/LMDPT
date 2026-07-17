import { describe, expect, it } from 'vitest';
import {
  colorFromSpectrumAxis,
  programProximityColor,
  realAssemblyColor,
  spectrumSortKey,
} from './program-proximity';

describe('program-proximity', () => {
  it('orders spectrum left to right', () => {
    expect(spectrumSortKey('nfp')).toBeLessThan(spectrumSortKey('ensemble'));
    expect(spectrumSortKey('ensemble')).toBeLessThan(spectrumSortKey('lr'));
    expect(spectrumSortKey('lr')).toBeLessThan(spectrumSortKey('rn'));
  });

  it('gives distinct hex colors along the spectrum', () => {
    const left = colorFromSpectrumAxis(0.1);
    const mid = colorFromSpectrumAxis(0.5);
    const right = colorFromSpectrumAxis(0.9);
    expect(left).toMatch(/^#[0-9a-f]{6}$/i);
    expect(mid).toMatch(/^#[0-9a-f]{6}$/i);
    expect(right).toMatch(/^#[0-9a-f]{6}$/i);
    expect(left).not.toBe(right);
  });

  it('maps bloc ids to program-proximity colors', () => {
    expect(programProximityColor('nfp')).toMatch(/^#/);
    expect(programProximityColor('rn')).toMatch(/^#/);
    expect(programProximityColor('nfp')).not.toBe(programProximityColor('rn'));
  });

  it('uses institutional colors for real assembly', () => {
    expect(realAssemblyColor('rn')).toBe('#0d378a');
    expect(realAssemblyColor('ensemble')).toBe('#ffeb00');
  });
});
