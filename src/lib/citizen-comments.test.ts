import { describe, expect, it } from 'vitest';
import { ANALYSIS_CATALOG } from './analyses';
import { DEBATE_CATALOG } from './debates';
import {
  isAnalysisArticlePath,
  isAnalysisListingPath,
  isDebateThreadPath,
  shouldShowCitizenComments,
} from './citizen-comments';

describe('shouldShowCitizenComments', () => {
  it('reste visible sur chaque fil de débat du catalogue', () => {
    for (const debate of DEBATE_CATALOG) {
      expect(isDebateThreadPath(debate.href)).toBe(true);
      expect(shouldShowCitizenComments({ pathname: debate.href })).toBe(true);
      expect(shouldShowCitizenComments({ pathname: `${debate.href}/` })).toBe(true);
    }
  });

  it('reste visible sur chaque dossier d’analyse du catalogue, sauf les index', () => {
    const listings = ANALYSIS_CATALOG.filter((a) => isAnalysisListingPath(a.href));
    const articles = ANALYSIS_CATALOG.filter((a) => !isAnalysisListingPath(a.href));
    expect(listings.map((a) => a.href)).toEqual(['/analyses/programmes']);
    for (const analysis of articles) {
      expect(isAnalysisArticlePath(analysis.href)).toBe(true);
      expect(shouldShowCitizenComments({ pathname: analysis.href })).toBe(true);
    }
    for (const listing of listings) {
      expect(shouldShowCitizenComments({ pathname: listing.href })).toBe(false);
    }
  });

  it('reste visible sur une fiche programme, pas sur les index programmes', () => {
    expect(
      shouldShowCitizenComments({
        pathname: '/analyses/programmes/presidentielle-2027/attal',
      }),
    ).toBe(true);
    expect(isAnalysisListingPath('/analyses/programmes')).toBe(true);
    expect(isAnalysisListingPath('/analyses/programmes/axes')).toBe(true);
    expect(isAnalysisListingPath('/analyses/programmes/presidentielle-2027')).toBe(true);
    expect(shouldShowCitizenComments({ pathname: '/analyses/programmes/' })).toBe(false);
    expect(shouldShowCitizenComments({ pathname: '/analyses/programmes/axes' })).toBe(false);
    expect(
      shouldShowCitizenComments({ pathname: '/analyses/programmes/presidentielle-2027/' }),
    ).toBe(false);
  });

  it('disparaît des accueil de rubrique, listes et pages institutionnelles', () => {
    const hidden = [
      '/',
      '/debats',
      '/debats/',
      '/analyses',
      '/analyses/',
      '/liberte-d-expression',
      '/liberte-d-expression/',
      '/independance-medias',
      '/observatoire-censure',
      '/assemblee-influenceurs',
      '/atlas',
      '/atlas/2027-presidentielle',
      '/a-propos',
      '/sources',
      '/charte',
      '/soutenir',
      '/mentions-legales',
      '/confidentialite',
      '/connexion',
      '/compte',
      '/contribuer',
      '/pack-data-an1t',
      '/moderation',
      '/redaction',
    ];
    for (const pathname of hidden) {
      expect(shouldShowCitizenComments({ pathname }), pathname).toBe(false);
    }
  });

  it('honore le forçage comments', () => {
    expect(shouldShowCitizenComments({ pathname: '/debats/', comments: true })).toBe(true);
    expect(
      shouldShowCitizenComments({ pathname: '/debats/vote-utile-pluralite', comments: false }),
    ).toBe(false);
  });
});
