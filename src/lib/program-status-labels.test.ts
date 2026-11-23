import { describe, expect, it } from 'vitest';
import { PROGRAM_STATUS_LABELS } from './programs';

describe('PROGRAM_STATUS_LABELS', () => {
  it('affiche awaiting_program avec le libellé public convenu', () => {
    expect(PROGRAM_STATUS_LABELS.awaiting_program).toBe('Programme pas encore publié');
  });

  it('garde des libellés publics pour les autres statuts', () => {
    expect(PROGRAM_STATUS_LABELS.partial).toBe('Partiel');
    expect(PROGRAM_STATUS_LABELS.published).toBe('Publié');
  });
});
