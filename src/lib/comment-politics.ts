/**
 * Palette « idées 1er tour » pour commentaires citoyens LMDPT.
 * Couleurs alignées familles politiques / modèle Wiki AN (XVIIe) quand pertinent.
 * Classification = affinité d’idées, PAS une étiquette d’appartenance partisane.
 */

export type CommentRole =
  | 'lecteur'
  | 'contributeur'
  | 'modo'
  | 'modo-senior'
  | 'redaction';

export const ROLE_LEVEL: Record<CommentRole, number> = {
  lecteur: 0,
  contributeur: 1,
  modo: 2,
  'modo-senior': 3,
  redaction: 4,
};

export interface PoliticalHue {
  slug: string;
  label: string;
  color: string;
  /** Mots-clés / thèmes pour fallback heuristique (français, neutre) */
  themes: string[];
}

/** Candidats / listes 1er tour — couleur d’idée pour le fil de commentaires */
export const FIRST_ROUND_HUES: PoliticalHue[] = [
  {
    slug: 'melenchon',
    label: 'Mélenchon / LFI',
    color: '#cc2443',
    themes: ['insoumis', 'lfi', 'retraite 60', 'smic', 'planification', 'écorégion', 'sixième république', 'nupes', 'nfp gauche'],
  },
  {
    slug: 'ruffin',
    label: 'Ruffin',
    color: '#c0392b',
    themes: ['ruffin', 'picardie', 'ouvrier', 'pouvoir d’achat populaire', 'debout'],
  },
  {
    slug: 'parti-socialiste',
    label: 'Socialiste / social-démocrate',
    color: '#ff8080',
    themes: ['socialiste', 'ps', 'vivre libre', 'service public', 'égalité', 'hollande', 'glucksmann', 'brun'],
  },
  {
    slug: 'glucksmann',
    label: 'Glucksmann / Place publique',
    color: '#e85d75',
    themes: ['glucksmann', 'place publique', 'europe sociale', 'ukraine', 'social-démocrate'],
  },
  {
    slug: 'roussel',
    label: 'Roussel / PCF',
    color: '#dd0000',
    themes: ['communiste', 'pcf', 'roussel', 'nucléaire civil', 'industrie'],
  },
  {
    slug: 'ecolo',
    label: 'Écologiste',
    color: '#00c000',
    themes: ['écologie', 'climat', 'biodiversité', 'eelv', 'transition', 'pesticides'],
  },
  {
    slug: 'attal',
    label: 'Attal / Renaissance',
    color: '#ffeb00',
    themes: ['attal', 'renaissance', 'école', 'autorité', 'réarmement civique', 'fonction publique'],
  },
  {
    slug: 'philippe',
    label: 'Philippe / Horizons',
    color: '#0001b8',
    themes: ['philippe', 'horizons', 'le havre', 'centre droit', 'réforme'],
  },
  {
    slug: 'barrot',
    label: 'Barrot / centre',
    color: '#ff9900',
    themes: ['barrot', 'modem', 'démocrates', 'europe', 'centre'],
  },
  {
    slug: 'retailleau',
    label: 'Retailleau / LR',
    color: '#0066cc',
    themes: ['retailleau', 'républicains', 'lr', 'immigration', 'sécurité', 'autorité'],
  },
  {
    slug: 'lisnard',
    label: 'Lisnard / droite locale',
    color: '#162561',
    themes: ['lisnard', 'cannes', 'maire', 'collectivités', 'nouvelle énergie'],
  },
  {
    slug: 'le-pen',
    label: 'Le Pen / RN',
    color: '#0d378a',
    themes: ['le pen', 'rn', 'immigration', 'priorité nationale', 'référendum', 'patriot'],
  },
  {
    slug: 'bardella',
    label: 'Bardella / RN',
    color: '#0d378a',
    themes: ['bardella', 'rn', 'jeunesse', 'pouvoir d’achat', 'frontières'],
  },
  {
    slug: 'pluraliste',
    label: 'Pluraliste / transversal 1er tour',
    color: '#5a6570',
    themes: ['premier tour', 'pluralité', 'démocratie', 'proportionnelle', 'voix', 'représentation', 'neutre'],
  },
];

export function hueBySlug(slug: string): PoliticalHue {
  return FIRST_ROUND_HUES.find((h) => h.slug === slug) ?? FIRST_ROUND_HUES[FIRST_ROUND_HUES.length - 1];
}

/** Heuristique locale si Ollama indisponible */
export function classifyPoliticalHueHeuristic(text: string): { slug: string; confidence: number; rationale: string } {
  const t = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  let best = { slug: 'pluraliste', score: 0, hit: 'aucun thème dominant' };
  for (const h of FIRST_ROUND_HUES) {
    if (h.slug === 'pluraliste') continue;
    let score = 0;
    const hits: string[] = [];
    for (const theme of h.themes) {
      const th = theme
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
      if (t.includes(th)) {
        score += 2;
        hits.push(theme);
      }
    }
    if (score > best.score) {
      best = { slug: h.slug, score, hit: hits.slice(0, 3).join(', ') };
    }
  }
  if (best.score === 0) {
    return { slug: 'pluraliste', confidence: 0.35, rationale: 'Aucune proximité lexicale nette — teinte pluraliste (1er tour).' };
  }
  const confidence = Math.min(0.85, 0.4 + best.score * 0.1);
  return {
    slug: best.slug,
    confidence,
    rationale: `Proximité lexicale : ${best.hit}`,
  };
}

export function lightReformulate(text: string): string {
  let s = text.replace(/\s+/g, ' ').trim();
  if (!s) return s;
  s = s.charAt(0).toUpperCase() + s.slice(1);
  if (!/[.!?…]$/.test(s)) s += '.';
  // nettoyage basique
  s = s
    .replace(/\bi+\b/gi, 'je')
    .replace(/\b digne\b/gi, ' digne')
    .replace(/ ,/g, ',')
    .replace(/ \./g, '.');
  return s;
}
