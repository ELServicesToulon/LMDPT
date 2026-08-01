import { describe, it, expect } from 'vitest';
import { discussionConfig, getDiscussionUrl, getGiscusEmbed } from './discussion';

describe('discussion config — compte LMDPT centralisé', () => {
  it('désactive l’embed Giscus par défaut (pas de double identité GitHub)', () => {
    expect(discussionConfig.enabled).toBe(false);
  });

  it('conserve les URLs archive GitHub Discussions', () => {
    expect(getDiscussionUrl('assemblee-premier-tour')).toMatch(
      /github\.com\/ELServicesToulon\/LMDPT\/discussions\/1/,
    );
  });

  it('mappe le fil assemblee sur number pour opt-in Giscus', () => {
    const emb = getGiscusEmbed('assemblee-premier-tour');
    expect(emb.mapping).toBe('number');
    expect(emb.term).toBe('1');
  });
});
