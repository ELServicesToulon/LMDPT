import { describe, expect, it } from 'vitest';
import { gateModeratorChief } from './moderation-gate';

describe('gateModeratorChief', () => {
  it('allows ordinary political 1st-round ideas', () => {
    const v = gateModeratorChief(
      'Je préfère un débat sur la proportionnelle et la représentation du premier tour, sans ranking.',
    );
    expect(v.allowed).toBe(true);
  });

  it('blocks religious authority commands', () => {
    const v = gateModeratorChief('Au nom de Dieu, obéissez à l’Église et soumettez-vous à Allah.');
    expect(v.allowed).toBe(false);
    expect(v.code).toBe('RELIGIOUS_AUTHORITY');
  });

  it('blocks ideological monopoly', () => {
    const v = gateModeratorChief('Une seule pensée est autorisée : le chef a toujours raison.');
    expect(v.allowed).toBe(false);
    expect(v.code).toBe('IDEOLOGICAL_AUTHORITY');
  });

  it('blocks violence', () => {
    const v = gateModeratorChief('Il faut tuer les opposants.');
    expect(v.allowed).toBe(false);
    expect(v.code).toBe('HATE_OR_VIOLENCE');
  });
});
