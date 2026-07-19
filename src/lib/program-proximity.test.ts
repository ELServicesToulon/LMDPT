import { describe, expect, it } from 'vitest';
import {
  colorFromSpectrumAxis,
  programProximityColor,
  realAssemblyColor,
  sortHemicycleLeftToRight,
  spectrumSortKey,
} from './program-proximity';

describe('program-proximity', () => {
  it('orders spectrum left to right (convention AN)', () => {
    expect(spectrumSortKey('nfp')).toBeLessThan(spectrumSortKey('ensemble'));
    expect(spectrumSortKey('ensemble')).toBeLessThan(spectrumSortKey('lr'));
    expect(spectrumSortKey('lr')).toBeLessThan(spectrumSortKey('rn'));
  });

  it('sorts hemicycle seats left (low x) to right (high x)', () => {
    const positions = [
      { x: 300, y: 100 },
      { x: 50, y: 100 },
      { x: 180, y: 40 },
    ];
    const sorted = sortHemicycleLeftToRight(positions);
    expect(sorted[0].x).toBeLessThan(sorted[sorted.length - 1].x);
    // first seat should be the leftmost-ish
    expect(sorted[0].x).toBe(50);
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

  it('uses consensus party colors (écologie = vert, etc.)', () => {
    expect(programProximityColor('eco').toLowerCase()).toBe('#00c000');
    expect(programProximityColor('eelv').toLowerCase()).toBe('#00c000');
    expect(programProximityColor('jadot').toLowerCase()).toBe('#00c000');
    expect(programProximityColor('tondelier').toLowerCase()).toBe('#00c000');
    expect(programProximityColor('rn').toLowerCase()).toBe('#0d378a');
    expect(programProximityColor('ensemble').toLowerCase()).toBe('#ffeb00');
    expect(programProximityColor('lr').toLowerCase()).toBe('#0066cc');
    expect(programProximityColor('lfi').toLowerCase()).toBe('#cc2443');
    expect(programProximityColor('ps').toLowerCase()).toBe('#ff8080');
  });

  it('uses institutional colors for real assembly', () => {
    expect(realAssemblyColor('rn')).toBe('#0d378a');
    expect(realAssemblyColor('ensemble')).toBe('#ffeb00');
    expect(realAssemblyColor('eco').toLowerCase()).toBe('#00c000');
  });
});
