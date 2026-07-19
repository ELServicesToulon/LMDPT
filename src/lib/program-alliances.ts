/**
 * Compatibilité programmes pour coalitions de vote des lois.
 * Méthodo agent `/lmdpt-alliances-lois` — scores indicatifs, pas de prédiction.
 */
import type { ProgramCandidateFile, ProgramMeasure, ProgramThemeId } from './program-types';
import { getThemeLabel, listCandidates } from './programs';
import themes from '../data/programmes/taxonomy-themes.json';

export type ThemeCompatLabel = 'aligned' | 'negotiable' | 'fracture' | 'unknown';

export interface ThemeCompat {
  theme: string;
  themeLabel: string;
  label: ThemeCompatLabel;
  /** Contribution au score : +1 aligned, 0 negotiable, -1 fracture, omit unknown */
  scorePart: number | null;
  aLabels: string[];
  bLabels: string[];
  reason: string;
}

export interface PairCompat {
  a: string;
  b: string;
  aName: string;
  bName: string;
  compat: number | null;
  themesCovered: number;
  aligned: string[];
  negotiable: string[];
  fracture: string[];
  unknown: string[];
  byTheme: ThemeCompat[];
  dataQuality: 'high' | 'medium' | 'low' | 'very_low';
  note: string;
}

export interface AlliancesMatrix {
  schema: 'lmdpt-alliances-matrix-v1';
  generated: string;
  agent: 'lmdpt-alliances-lois';
  disclaimer: string;
  method: {
    compat: string;
    labels: ThemeCompatLabel[];
  };
  scrutin: string;
  candidates: Array<{
    slug: string;
    name: string;
    affiliation: string;
    measureCount: number;
    themes: string[];
    programStatus?: string;
  }>;
  pairs: PairCompat[];
}

/** Mots-clés d’orientation par thème (−1 gauche / restrictif social… +1 droite / libéral / priorité nationale). */
const THEME_AXIS: Record<string, { left: RegExp; right: RegExp }> = {
  retraites: {
    left: /\b(60\s*ans|62\s*ans|40\s*annuit|abrog)/i,
    right: /\b(64\s*ans|65\s*ans|67\s*ans|capitalisation|travailler\s+plus\s+longtemps|effort\s+juste)/i,
  },
  europe: {
    left: /\b(plan\s*b|sortie|frexit|ren[eé]gociation|trait[eé]s\s+europ)/i,
    right: /\b(zone\s+euro|renforcement|europe\s+(de\s+la\s+)?d[eé]fense|souverainet[eé]\s+industri|europe\s+puissance)/i,
  },
  immigration: {
    left: /\b(asile|accueil|droit\s+du\s+sol(?!\s+suppr)|r[eé]fugi)/i,
    right: /\b(priorit[eé]\s+nationale|quotas?|moratoire|expulsion|regroupement\s+familial|suppression\s+du\s+droit\s+du\s+sol|r[eé]duire\s+drast)/i,
  },
  fiscalite: {
    left: /\b(14\s*tranches|zucman|isf|taxation\s+des\s+hauts|successions|redistrib)/i,
    right: /\b(baisse\s+.*(imp[oô]t|fiscalit|tva|production)|all[eè]gement|dette|impunit[eé]\s+budg[eé]taire|r[eè]gle\s+d['']or|d[eé]ficit)/i,
  },
  climat: {
    left: /\b(sortie\s+.*nucl[eé]aire|planification\s+[eé]colog|r[eè]gle\s+verte|[eé]olien(?!nes?\s+moratoire))/i,
    right: /\b(nucl[eé]aire|moratoire\s+.*[eé]olien|relance\s+du\s+nucl)/i,
  },
  institutions: {
    left: /\b(vie?\s*r[eé]publique|constituante|[eé]cor[eé]gions?|assembl[eé]e\s+constituante)/i,
    right: /\b(r[eé]f[eé]rendum|r[eè]gle\s+d['']or|ordonnances|dissolution|moralisation|pr[eé]sidentiel|d[eé]bureaucrat)/i,
  },
  securite: {
    left: /\b(pr[eé]vention|d[eé]sarm)/i,
    right: /\b(peines\s+planchers|excuse\s+de\s+minorit|places?\s+de\s+prison|ordre|s[uû]ret[eé])/i,
  },
  pouvoir_achat: {
    left: /\b(smic|1700|1\s*500|revenu\s+universel|blocage\s+des\s+prix)/i,
    right: /\b(bouclier\s+tarifaire|tva\s+sur\s+l['']?[eé]nergie|effort)/i,
  },
  entreprises: {
    left: /\b(32\s*heures|temps\s+de\s+travail|d[eé]mocratie\s+sociale)/i,
    right: /\b(assurance\s+ch[oô]mage|flexibil|lib[eé]ralisation|d[eé]parts?\s+volontaires|fonctionnaires)/i,
  },
  education: {
    left: /\b(embauche|doublement|gratuit[eé])/i,
    right: /\b(autonomie|m[eé]rite|certificat|carte\s+scolaire)/i,
  },
  sante: {
    left: /\b(gratuit[eé]|s[eé]curit[eé]\s+sociale\s+int[eé]grale|lits)/i,
    right: /\b([eé]tat-performance|d[eé]serts)/i,
  },
  logement: {
    left: /\b(gel\s+des\s+loyers|encadrement)/i,
    right: /\b(offre|construction|propri[eé]t)/i,
  },
  defense: {
    left: /\b(d[eé]sarm|paix)/i,
    right: /\b(otan|arm[eé]e|d[eé]fense\s+europ)/i,
  },
  justice: {
    left: /\b(r[eé]insertion|abolition)/i,
    right: /\b(peines|r[eé]cidive|prison)/i,
  },
  numerique: {
    left: /\b(commons|public)/i,
    right: /\b(start.?up|souverainet[eé]\s+num)/i,
  },
};

function normalizeText(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function tokenSet(s: string): Set<string> {
  return new Set(
    normalizeText(s)
      .split(' ')
      .filter((t) => t.length >= 3),
  );
}

/** Similarité Jaccard simple sur tokens des labels/détails. */
export function jaccardLabels(a: string[], b: string[]): number {
  const ta = tokenSet(a.join(' '));
  const tb = tokenSet(b.join(' '));
  if (ta.size === 0 || tb.size === 0) return 0;
  let inter = 0;
  for (const t of ta) if (tb.has(t)) inter += 1;
  return inter / (ta.size + tb.size - inter);
}

function measuresOnTheme(file: ProgramCandidateFile, theme: string): ProgramMeasure[] {
  return file.measures.filter((m) => m.theme === theme);
}

function axisScore(theme: string, measures: ProgramMeasure[]): number | null {
  const axis = THEME_AXIS[theme];
  if (!axis || measures.length === 0) return null;
  const blob = measures.map((m) => `${m.label} ${m.detail ?? ''}`).join(' ');
  const L = axis.left.test(blob) ? 1 : 0;
  const R = axis.right.test(blob) ? 1 : 0;
  if (L && !R) return -1;
  if (R && !L) return 1;
  if (L && R) return 0;
  return null;
}

export function compareTheme(
  a: ProgramCandidateFile,
  b: ProgramCandidateFile,
  theme: string,
): ThemeCompat {
  const ma = measuresOnTheme(a, theme);
  const mb = measuresOnTheme(b, theme);
  const themeLabel = getThemeLabel(theme);
  const aLabels = ma.map((m) => m.label);
  const bLabels = mb.map((m) => m.label);

  if (ma.length === 0 || mb.length === 0) {
    return {
      theme,
      themeLabel,
      label: 'unknown',
      scorePart: null,
      aLabels,
      bLabels,
      reason: 'Données manquantes sur au moins un des deux candidats',
    };
  }

  const axA = axisScore(theme, ma);
  const axB = axisScore(theme, mb);
  const jac = jaccardLabels(
    ma.map((m) => `${m.label} ${m.detail ?? ''}`),
    mb.map((m) => `${m.label} ${m.detail ?? ''}`),
  );

  if (axA != null && axB != null) {
    if (axA === axB && axA !== 0) {
      return {
        theme,
        themeLabel,
        label: 'aligned',
        scorePart: 1,
        aLabels,
        bLabels,
        reason: `Même orientation d’axe (${axA < 0 ? 'A' : 'B'}) · jaccard=${jac.toFixed(2)}`,
      };
    }
    if (axA === -axB && axA !== 0) {
      return {
        theme,
        themeLabel,
        label: 'fracture',
        scorePart: -1,
        aLabels,
        bLabels,
        reason: `Orientations opposées · jaccard=${jac.toFixed(2)}`,
      };
    }
    return {
      theme,
      themeLabel,
      label: 'negotiable',
      scorePart: 0,
      aLabels,
      bLabels,
      reason: `Orientation mixte ou neutre · jaccard=${jac.toFixed(2)}`,
    };
  }

  // Fallback lexical
  if (jac >= 0.28) {
    return {
      theme,
      themeLabel,
      label: 'aligned',
      scorePart: 1,
      aLabels,
      bLabels,
      reason: `Proximité lexicale élevée (jaccard=${jac.toFixed(2)})`,
    };
  }
  if (jac >= 0.12) {
    return {
      theme,
      themeLabel,
      label: 'negotiable',
      scorePart: 0,
      aLabels,
      bLabels,
      reason: `Proximité lexicale moyenne (jaccard=${jac.toFixed(2)})`,
    };
  }
  return {
    theme,
    themeLabel,
    label: 'negotiable',
    scorePart: 0,
    aLabels,
    bLabels,
    reason: `Thèmes couverts sans axe clair (jaccard=${jac.toFixed(2)}) — défaut négociable`,
  };
}

function dataQuality(a: ProgramCandidateFile, b: ProgramCandidateFile, covered: number): PairCompat['dataQuality'] {
  const n = Math.min(a.measures.length, b.measures.length);
  if (covered >= 6 && n >= 6) return 'high';
  if (covered >= 4 && n >= 4) return 'medium';
  if (covered >= 2 && n >= 2) return 'low';
  return 'very_low';
}

export function comparePair(a: ProgramCandidateFile, b: ProgramCandidateFile): PairCompat {
  const themeIds = (themes as Array<{ id: string }>).map((t) => t.id);
  const byTheme: ThemeCompat[] = [];
  for (const theme of themeIds) {
    // Ne scorer que si au moins un a une mesure (sinon ignorer le thème)
    if (measuresOnTheme(a, theme).length === 0 && measuresOnTheme(b, theme).length === 0) {
      continue;
    }
    byTheme.push(compareTheme(a, b, theme));
  }

  const scored = byTheme.filter((t) => t.scorePart != null);
  const themesCovered = scored.length;
  let compat: number | null = null;
  if (themesCovered > 0) {
    const sum = scored.reduce((s, t) => s + (t.scorePart as number), 0);
    compat = Math.round((sum / themesCovered) * 100) / 100;
  }

  const aligned = byTheme.filter((t) => t.label === 'aligned').map((t) => t.theme);
  const negotiable = byTheme.filter((t) => t.label === 'negotiable').map((t) => t.theme);
  const fracture = byTheme.filter((t) => t.label === 'fracture').map((t) => t.theme);
  const unknown = byTheme.filter((t) => t.label === 'unknown').map((t) => t.theme);

  const dq = dataQuality(a, b, themesCovered);
  let note = `${themesCovered} thèmes scorés`;
  if (dq === 'very_low' || dq === 'low') {
    note += ' — données programmes limitées (souvent partial 2027)';
  }

  return {
    a: a.candidate.slug,
    b: b.candidate.slug,
    aName: a.candidate.name,
    bName: b.candidate.name,
    compat,
    themesCovered,
    aligned,
    negotiable,
    fracture,
    unknown,
    byTheme,
    dataQuality: dq,
    note,
  };
}

/** Toutes les paires uniques d’un scrutin, triées par |compat| décroissant puis alpha. */
export function buildScrutinPairs(candidates: ProgramCandidateFile[]): PairCompat[] {
  const pairs: PairCompat[] = [];
  for (let i = 0; i < candidates.length; i += 1) {
    for (let j = i + 1; j < candidates.length; j += 1) {
      pairs.push(comparePair(candidates[i]!, candidates[j]!));
    }
  }
  return pairs.sort((x, y) => {
    const cx = x.compat ?? -999;
    const cy = y.compat ?? -999;
    if (cy !== cx) return cy - cx;
    return `${x.a}-${x.b}`.localeCompare(`${y.a}-${y.b}`);
  });
}

export function buildAlliancesMatrix(scrutinId: string, generated = new Date().toISOString()): AlliancesMatrix {
  const candidates = listCandidates(scrutinId);
  const pairs = buildScrutinPairs(candidates);

  return {
    schema: 'lmdpt-alliances-matrix-v1',
    generated,
    agent: 'lmdpt-alliances-lois',
    disclaimer:
      'Scores indicatifs LMDPT (programmes 1er tour). 2027 souvent partial / projection. Pas une prédiction de majorité ni de vainqueur.',
    method: {
      compat: '(n_aligned - n_fracture) / max(1, n_themes_scored) via axes thématiques + jaccard',
      labels: ['aligned', 'negotiable', 'fracture', 'unknown'],
    },
    scrutin: scrutinId,
    candidates: candidates.map((c) => ({
      slug: c.candidate.slug,
      name: c.candidate.name,
      affiliation: c.candidate.affiliation,
      measureCount: c.measures.length,
      themes: [...new Set(c.measures.map((m) => m.theme))],
      programStatus: c.program?.status,
    })),
    pairs,
  };
}

export function buildMultiScrutinMatrices(
  scrutinIds: string[] = [
    'presidentielle-2017',
    'presidentielle-2022',
    'presidentielle-2027',
  ],
): Record<string, AlliancesMatrix> {
  const out: Record<string, AlliancesMatrix> = {};
  const generated = new Date().toISOString();
  for (const id of scrutinIds) {
    out[id] = buildAlliancesMatrix(id, generated);
  }
  return out;
}

/** Top paires les plus compatibles (compat non null). */
export function topCompatiblePairs(pairs: PairCompat[], n = 5): PairCompat[] {
  return pairs.filter((p) => p.compat != null).slice(0, n);
}

/** Top fractures (compat le plus bas). */
export function topFracturePairs(pairs: PairCompat[], n = 5): PairCompat[] {
  return [...pairs]
    .filter((p) => p.compat != null)
    .sort((a, b) => (a.compat as number) - (b.compat as number))
    .slice(0, n);
}

export type { ProgramThemeId };
