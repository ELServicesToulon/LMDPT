/**
 * Palette « idées 1er tour » pour commentaires citoyens LMDPT
 * et teintage des articles presse (renifleur).
 * Transparence des couleurs politiques (zéro biais éditorial) :
 * la teinte = proximité d’idées / acteurs cités, PAS une carte d’adhésion partisane
 * ni un jugement sur le média source.
 * Fourches caudines : src/lib/moderation-gate.ts (autorité religieuse / idéologique).
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
  /** Noms propres / partis — poids plus fort (articles presse) */
  names?: string[];
}

/** Teinte résolue (affichage UI + snapshot renifleur) */
export interface ResolvedPoliticalHue {
  slug: string;
  label: string;
  color: string;
  confidence: number;
  rationale: string;
}

/** Candidats / listes 1er tour — couleur d’idée pour le fil de commentaires + veille presse */
export const FIRST_ROUND_HUES: PoliticalHue[] = [
  {
    slug: 'melenchon',
    label: 'Mélenchon / LFI',
    color: '#cc2443',
    themes: ['insoumis', 'lfi', 'retraite 60', 'smic', 'planification', 'écorégion', 'sixième république', 'nupes', 'nouveau front populaire'],
    names: ['mélenchon', 'melenchon', 'france insoumise', 'autain', 'corbière', 'corbiere', 'panot'],
  },
  {
    slug: 'ruffin',
    label: 'Ruffin',
    color: '#c0392b',
    themes: ['picardie debout', 'ouvrier', 'pouvoir d’achat populaire'],
    names: ['ruffin', 'françois ruffin', 'francois ruffin'],
  },
  {
    slug: 'parti-socialiste',
    label: 'Socialiste / social-démocrate',
    color: '#ff8080',
    themes: ['socialiste', 'social-democrate', 'social-démocrate', 'gauche reformiste', 'gauche réformiste', 'service public', 'égalité', 'primaire socialiste', 'primaire ps'],
    names: [
      'parti socialiste',
      'hollande',
      'cazeneuve',
      'philippe brun',
      'ségolène royal',
      'segolene royal',
      'faure',
      'guedj',
      'bouamrane',
      'glucksmann',
    ],
  },
  {
    slug: 'glucksmann',
    label: 'Glucksmann / Place publique',
    color: '#e85d75',
    themes: ['place publique', 'europe sociale'],
    names: ['glucksmann'],
  },
  {
    slug: 'roussel',
    label: 'Roussel / PCF',
    color: '#dd0000',
    themes: ['communiste', 'nucléaire civil', 'industrie'],
    names: ['pcf', 'roussel', 'parti communiste'],
  },
  {
    slug: 'ecolo',
    label: 'Écologiste',
    color: '#00c000',
    themes: ['écologie', 'ecologie', 'climat', 'biodiversité', 'biodiversite', 'transition écologique', 'pesticides'],
    names: ['eelv', 'les écologistes', 'les ecologistes', 'tondelier', 'batho', 'génération écologie', 'generation ecologie'],
  },
  {
    slug: 'attal',
    label: 'Attal / Renaissance',
    color: '#ffeb00',
    themes: ['école', 'ecole', 'réarmement civique', 'fonction publique', 'macronie', 'bloc central'],
    names: ['attal', 'gabriel attal', 'renaissance', 'macron', 'emmanuel macron', 'borne', 'élisabeth borne', 'elisabeth borne'],
  },
  {
    slug: 'philippe',
    label: 'Philippe / Horizons',
    color: '#0001b8',
    themes: ['centre droit', 'réforme', 'reforme'],
    names: ['édouard philippe', 'edouard philippe', 'edouardphilippe', 'horizons'],
  },
  {
    slug: 'barrot',
    label: 'Barrot / centre',
    color: '#ff9900',
    themes: ['démocrates', 'democrates', 'europe'],
    names: ['barrot', 'modem', 'bayrou'],
  },
  {
    slug: 'retailleau',
    label: 'Retailleau / LR',
    color: '#0066cc',
    themes: ['républicains', 'republicains', 'immigration', 'sécurité', 'securite', 'autorité', 'autorite'],
    names: ['retailleau', 'les républicains', 'les republicains', 'ciotti', 'bertrand', 'wauquiez'],
  },
  {
    slug: 'lisnard',
    label: 'Lisnard / droite locale',
    color: '#162561',
    themes: ['collectivités', 'collectivites', 'nouvelle énergie', 'nouvelle energie'],
    names: ['lisnard', 'cannes'],
  },
  {
    slug: 'le-pen',
    label: 'Le Pen / RN',
    color: '#0d378a',
    themes: ['priorité nationale', 'priorite nationale', 'référendum', 'referendum', 'frontières', 'frontieres', 'rassemblement national'],
    names: ['le pen', 'marine le pen', 'rn', 'bardella', 'rassemblement national', 'front national'],
  },
  {
    slug: 'bardella',
    label: 'Bardella / RN',
    color: '#0d378a',
    themes: ['jeunesse', 'pouvoir d’achat', 'pouvoir d\'achat'],
    names: ['bardella'],
  },
  {
    slug: 'zemmour',
    label: 'Zemmour / Reconquête',
    color: '#000080',
    themes: ['reconquete', 'reconquête', 'remigration'],
    names: ['zemmour', 'knafo', 'sarah knafo'],
  },
  {
    slug: 'pluraliste',
    label: 'Pluraliste / transversal 1er tour',
    color: '#5a6570',
    themes: ['premier tour', 'pluralité', 'pluralite', 'démocratie', 'democratie', 'proportionnelle', 'voix', 'représentation', 'representation', 'neutre'],
    names: [],
  },
];

export function hueBySlug(slug: string): PoliticalHue {
  return FIRST_ROUND_HUES.find((h) => h.slug === slug) ?? FIRST_ROUND_HUES[FIRST_ROUND_HUES.length - 1];
}

/**
 * Alias slug candidat / parti historique → teinte 1er tour (publications, axes, X).
 * Toute publication liée à un acteur doit pouvoir porter le badge couleur d’idée.
 */
export const CANDIDATE_HUE_SLUG: Record<string, string> = {
  // 2027 / direct
  melenchon: 'melenchon',
  ruffin: 'ruffin',
  'parti-socialiste': 'parti-socialiste',
  'philippe-brun': 'parti-socialiste',
  glucksmann: 'glucksmann',
  roussel: 'roussel',
  ecolo: 'ecolo',
  eelv: 'ecolo',
  tondelier: 'ecolo',
  jadot: 'ecolo',
  attal: 'attal',
  macron: 'attal',
  renaissance: 'attal',
  philippe: 'philippe',
  horizons: 'philippe',
  barrot: 'barrot',
  modem: 'barrot',
  retailleau: 'retailleau',
  lr: 'retailleau',
  pecresse: 'retailleau',
  fillon: 'retailleau',
  lisnard: 'lisnard',
  'le-pen': 'le-pen',
  rn: 'le-pen',
  bardella: 'bardella',
  zemmour: 'zemmour',
  reconquete: 'zemmour',
  // 2017 / 2022 historiques
  hamon: 'parti-socialiste',
  hidalgo: 'parti-socialiste',
  lfi: 'melenchon',
  nfp: 'melenchon',
  ensemble: 'attal',
  eco: 'ecolo',
  ps: 'parti-socialiste',
  pcf: 'roussel',
};

/** Badge prêt pour l’UI (une ou plusieurs pastilles par publication). */
export interface HueBadge {
  slug: string;
  label: string;
  color: string;
  rationale?: string;
  confidence?: number;
}

export function toHueBadge(
  hue: Pick<PoliticalHue, 'slug' | 'label' | 'color'> & {
    rationale?: string;
    confidence?: number;
  },
): HueBadge {
  return {
    slug: hue.slug,
    label: hue.label,
    color: hue.color,
    rationale: hue.rationale,
    confidence: hue.confidence,
  };
}

/**
 * Teinte d’idée pour un slug candidat / bloc (publications programmes, X, axes).
 * Fallback : pluraliste si inconnu.
 */
export function hueFromCandidateSlug(slug: string | undefined | null): HueBadge {
  if (!slug?.trim()) {
    return toHueBadge(hueBySlug('pluraliste'));
  }
  const key = slug.trim().toLowerCase();
  const mapped = CANDIDATE_HUE_SLUG[key] ?? key;
  const hue = FIRST_ROUND_HUES.find((h) => h.slug === mapped);
  if (hue) return toHueBadge(hue);
  // Tentative directe sur FIRST_ROUND_HUES
  const direct = FIRST_ROUND_HUES.find((h) => h.slug === key);
  if (direct) return toHueBadge(direct);
  return toHueBadge({
    slug: key,
    label: slug,
    color: '#5a6570',
  });
}

function normalizeLex(text: string): string {
  return text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
}

/**
 * Correspondance lexicale sûre : les codes courts (rn, lr, ps, lfi…)
 * exigent une frontière de mot pour éviter « rn » dans « interne ».
 */
function lexIncludes(haystack: string, needle: string): boolean {
  if (!needle) return false;
  if (needle.length <= 3) {
    const escaped = needle.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:^|[^a-z0-9])${escaped}(?:[^a-z0-9]|$)`, 'i').test(haystack);
  }
  return haystack.includes(needle);
}

interface HueScore {
  slug: string;
  score: number;
  hits: string[];
}

/** Scores lexicaux par teinte (hors pluraliste). */
export function scorePoliticalHues(text: string): HueScore[] {
  const t = normalizeLex(text);
  const scores: HueScore[] = [];

  for (const h of FIRST_ROUND_HUES) {
    if (h.slug === 'pluraliste') continue;
    let score = 0;
    const hits: string[] = [];

    for (const name of h.names ?? []) {
      const n = normalizeLex(name);
      if (n.length >= 2 && lexIncludes(t, n)) {
        score += 5;
        hits.push(name);
      }
    }
    for (const theme of h.themes) {
      const th = normalizeLex(theme);
      if (th.length >= 3 && lexIncludes(t, th)) {
        score += 2;
        hits.push(theme);
      }
    }
    if (score > 0) {
      scores.push({ slug: h.slug, score, hits: hits.slice(0, 4) });
    }
  }

  scores.sort((a, b) => b.score - a.score);
  return scores;
}

function isMultiCamp(scores: HueScore[]): boolean {
  const best = scores[0];
  const second = scores[1];
  if (!best || !second) return false;
  return (
    second.score >= 5 &&
    second.score >= best.score * 0.6 &&
    second.score >= best.score - 5
  );
}

/** Heuristique locale (Ollama offline / articles presse) — teinte principale. */
export function classifyPoliticalHueHeuristic(text: string): {
  slug: string;
  confidence: number;
  rationale: string;
} {
  const scores = scorePoliticalHues(text);

  if (scores.length === 0) {
    return {
      slug: 'pluraliste',
      confidence: 0.35,
      rationale: 'Aucune proximité lexicale nette — teinte pluraliste (1er tour).',
    };
  }

  const best = scores[0]!;

  // Plusieurs camps cités à scores proches → pluraliste (compat snapshot renifleur)
  if (isMultiCamp(scores)) {
    const second = scores[1]!;
    const labels = [best, second]
      .map((s) => hueBySlug(s.slug).label)
      .join(' · ');
    return {
      slug: 'pluraliste',
      confidence: Math.min(0.75, 0.45 + Math.min(best.score, second.score) * 0.05),
      rationale: `Plusieurs camps cités (${labels}) — teinte pluraliste.`,
    };
  }

  // RN : bardella et le-pen partagent la même couleur ; fusionner le label le plus précis
  if (best.slug === 'bardella' || best.slug === 'le-pen') {
    const hasBardella = scores.some((s) => s.slug === 'bardella');
    const hasLePen = scores.some((s) => s.slug === 'le-pen');
    if (hasBardella && !hasLePen) {
      return {
        slug: 'bardella',
        confidence: Math.min(0.9, 0.45 + best.score * 0.08),
        rationale: `Proximité lexicale : ${best.hits.slice(0, 3).join(', ')}`,
      };
    }
  }

  const confidence = Math.min(0.9, 0.42 + best.score * 0.07);
  return {
    slug: best.slug,
    confidence,
    rationale: `Proximité lexicale : ${best.hits.slice(0, 3).join(', ')}`,
  };
}

function resolvedFromScore(s: HueScore): ResolvedPoliticalHue {
  const hue = hueBySlug(s.slug);
  return {
    slug: hue.slug,
    label: hue.label,
    color: hue.color,
    confidence: Math.min(0.9, 0.42 + s.score * 0.07),
    rationale: `Proximité lexicale : ${s.hits.slice(0, 3).join(', ')}`,
  };
}

/**
 * Une **ou plusieurs** teintes d’idées pour une publication.
 * Multi-camps → badges des camps cités (transparence), pas seulement le gris pluraliste.
 * DOE : pastille = proximité d’idées citées, pas adhésion partisane.
 */
export function resolvePoliticalHues(text: string, max = 3): ResolvedPoliticalHue[] {
  const scores = scorePoliticalHues(text);
  if (scores.length === 0) {
    return [
      {
        slug: 'pluraliste',
        label: hueBySlug('pluraliste').label,
        color: hueBySlug('pluraliste').color,
        confidence: 0.35,
        rationale: 'Aucune proximité lexicale nette — teinte pluraliste (1er tour).',
      },
    ];
  }

  if (isMultiCamp(scores)) {
    const selected = scores
      .filter((s) => s.score >= 5 && s.score >= scores[0]!.score * 0.55)
      .slice(0, Math.max(1, max));
    // Dédupliquer couleurs identiques (ex. le-pen / bardella → une pastille RN)
    const seenColor = new Set<string>();
    const out: ResolvedPoliticalHue[] = [];
    for (const s of selected) {
      const r = resolvedFromScore(s);
      const colorKey = r.color.toLowerCase();
      if (seenColor.has(colorKey)) continue;
      seenColor.add(colorKey);
      out.push(r);
    }
    return out.length > 0 ? out : [resolvedFromScore(scores[0]!)];
  }

  return [resolvedFromScore(scores[0]!)];
}

/** Résout slug + couleur + label pour l’UI (commentaires, veille presse) — teinte principale. */
export function resolvePoliticalHue(text: string): ResolvedPoliticalHue {
  const classified = classifyPoliticalHueHeuristic(text);
  const hue = hueBySlug(classified.slug);
  return {
    slug: hue.slug,
    label: hue.label,
    color: hue.color,
    confidence: classified.confidence,
    rationale: classified.rationale,
  };
}

/** Badges UI depuis un texte de publication (1+ pastilles obligatoires). */
export function hueBadgesForText(text: string, max = 3): HueBadge[] {
  return resolvePoliticalHues(text, max).map((h) =>
    toHueBadge({
      slug: h.slug,
      label: h.label,
      color: h.color,
      rationale: h.rationale,
      confidence: h.confidence,
    }),
  );
}

/**
 * Badges pour une publication : slug candidat prioritaire, sinon texte.
 * Garantit **au moins un** badge (règle éditoriale : toute publication porte la/les couleurs d’idées).
 */
export function hueBadgesForPublication(opts: {
  candidateSlug?: string | null;
  text?: string | null;
  max?: number;
}): HueBadge[] {
  const max = opts.max ?? 3;
  if (opts.candidateSlug?.trim()) {
    return [hueFromCandidateSlug(opts.candidateSlug)];
  }
  if (opts.text?.trim()) {
    return hueBadgesForText(opts.text, max);
  }
  return [toHueBadge(hueBySlug('pluraliste'))];
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
