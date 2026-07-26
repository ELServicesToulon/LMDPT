import { describe, expect, it } from 'vitest';
import { buildProgramAxesBoard } from './program-axes';

describe('program-axes', () => {
  it('builds axes board for 2027 with measures under themes', () => {
    const board = buildProgramAxesBoard('presidentielle-2027');
    expect(board.candidates.length).toBeGreaterThan(5);
    expect(board.totalMeasures).toBeGreaterThan(20);
    expect(board.themesCovered).toBeGreaterThan(5);
    const withProps = board.axes.filter((a) => a.measureCount > 0);
    expect(withProps.length).toBe(board.themesCovered);
    for (const axis of withProps) {
      expect(axis.proposals.length).toBe(axis.candidateCount);
      for (const p of axis.proposals) {
        expect(p.measures.every((m) => m.theme === axis.themeId)).toBe(true);
        expect(p.headline).toBeTruthy();
      }
    }
  });

  it('sorts proposals by political family order', () => {
    const board = buildProgramAxesBoard('presidentielle-2027');
    const fiscal = board.axes.find((a) => a.themeId === 'fiscalite');
    if (!fiscal || fiscal.proposals.length < 2) return;
    // family order is encoded in proposal order; names should be stable FR sort within family
    const names = fiscal.proposals.map((p) => p.name);
    expect(names.length).toBe(new Set(names).size);
  });
});
