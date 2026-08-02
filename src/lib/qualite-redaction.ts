/**
 * Qualité rédaction FR — priorité mots accolés (fusions d'espaces).
 * Aligné agent `/lmdpt-qualite-redaction` + lightReformulate comments-api.
 */

export type AnomalyType = 'glue' | 'space' | 'punct' | 'ortho' | 'apostrophe';

export interface QualiteAnomaly {
  type: AnomalyType;
  before: string;
  after: string;
  confidence: 'high' | 'medium' | 'low';
  index?: number;
}

export interface QualiteReport {
  original: string;
  corrected: string;
  anomalies: QualiteAnomaly[];
  stats: {
    total: number;
    glue: number;
    ortho: number;
    punct: number;
    space: number;
    apostrophe: number;
  };
  /** SHIP si 0 glue high ; FIX-FIRST si anomalies restantes */
  decision: 'SHIP' | 'FIX-FIRST';
  changed: boolean;
}

const PHRASE_FIXES: Array<[RegExp, string | ((m: string) => string)]> = [
  [/\bdenprison\b/gi, "d'emprisonnement"],
  [/\bde\s*nprison\b/gi, "d'emprisonnement"],
  [/\bplacesdenprison\b/gi, "places d'emprisonnement"],
  [/\bplaces\s+denprison\b/gi, "places d'emprisonnement"],
  [/\bemprisonement\b/gi, 'emprisonnement'],
  [/\bemprisonemment\b/gi, 'emprisonnement'],
  [/\bpresidentielle\b/gi, 'présidentielle'],
  [/\belections?\b/gi, (m) => (m.toLowerCase().endsWith('s') ? 'élections' : 'élection')],
  [/\bdemocratie\b/gi, 'démocratie'],
  [/\bsecurite\b/gi, 'sécurité'],
  [/\bliberte\b/gi, 'liberté'],
  [/\begalite\b/gi, 'égalité'],
];

const WORD_MAP: Record<string, string> = {
  meme: 'même',
  memes: 'mêmes',
  etre: 'être',
  ete: 'été',
  tres: 'très',
  deja: 'déjà',
  plutot: 'plutôt',
  apres: 'après',
  grace: 'grâce',
  voila: 'voilà',
  ca: 'ça',
  detenus: 'détenus',
  detenu: 'détenu',
  detention: 'détention',
  denprison: "d'emprisonnement",
  cout: 'coût',
  couts: 'coûts',
  metier: 'métier',
  metiers: 'métiers',
  republicain: 'républicain',
  republicaine: 'républicaine',
  election: 'élection',
  elections: 'élections',
  presidentielle: 'présidentielle',
  democratie: 'démocratie',
  securite: 'sécurité',
  liberte: 'liberté',
  egalite: 'égalité',
};

/**
 * Heuristique conservative : uniquement prépositions « pleines » (pas en/d)
 * et segments assez longs pour limiter les faux positifs (calendrier, présidentielle…).
 */
const GLUE_PREP =
  /([a-zàâäéèêëïîôùûüç]{4,})(des|du|de|les|la|le|une|un|aux|au)([a-zàâäéèêëïîôùûüç]{4,})/gi;

/** Mots FR courants à ne jamais découper. */
const GLUE_DENYLIST = new Set(
  [
    'presidentielle',
    'calendrier',
    'democratie',
    'securite',
    'liberalisme',
    'federalisme',
    'nationalisme',
    'parlementaire',
    'constitutionnelle',
    'independance',
    'referendum',
    'assemblee',
    'legislatives',
    'presidentielles',
    // faux positifs fréquents (préposition interne)
    'manuellement',
    'naturellement',
    'reellement',
    'actuellement',
    'personnellement',
    'officiellement',
    'probablement',
    'simplement',
    'completement',
    'totalement',
    'finalement',
    'generalement',
    'particulierement',
    'certainement',
    'evidemment',
    'assembleedupremiertour',
    'findesbaudruches',
    'democracyoverelimination',
    'premiertour',
  ].map((w) => w.normalize('NFD').replace(/\p{M}/gu, '')),
);

function applyPhraseFixes(text: string, anomalies: QualiteAnomaly[]): string {
  let s = text;
  for (const [re, rep] of PHRASE_FIXES) {
    s = s.replace(re, (match) => {
      const after = typeof rep === 'function' ? (rep as (m: string) => string)(match) : rep;
      if (match !== after) {
        anomalies.push({
          type: /prison|emprison|denprison/i.test(match) ? 'glue' : 'ortho',
          before: match,
          after,
          confidence: 'high',
        });
      }
      return after;
    });
  }
  return s;
}

function applyWordMap(text: string, anomalies: QualiteAnomaly[]): string {
  return text.replace(/\b([A-Za-zÀ-ÿ']+)\b/g, (word) => {
    const lower = word.toLowerCase();
    // Skip ALLCAPS tokens (sigles)
    if (word === word.toUpperCase() && word.length <= 5) return word;
    const mapped = WORD_MAP[lower];
    if (!mapped || mapped === lower) return word;
    let after = mapped;
    if (word[0] === word[0]!.toUpperCase()) {
      after = after.charAt(0).toUpperCase() + after.slice(1);
    }
    if (after !== word) {
      anomalies.push({
        type: 'ortho',
        before: word,
        after,
        confidence: lower === 'ou' || lower === 'a' ? 'low' : 'high',
      });
    }
    return after;
  });
}

function applyGlueHeuristic(text: string, anomalies: QualiteAnomaly[]): string {
  return text.replace(GLUE_PREP, (match, a: string, prep: string, b: string) => {
    if (match.length < 14) return match;
    // Hashtags / CamelCase / sigles mixtes → ne jamais découper
    if (/[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]/.test(match.slice(1))) return match;
    // Adverbes -ment : « manuellement » = manuel+le+ment (faux positif)
    if (/ment$/i.test(match)) return match;
    const key = match
      .toLowerCase()
      .normalize('NFD')
      .replace(/\p{M}/gu, '');
    if (GLUE_DENYLIST.has(key)) return match;
    // Prépositions au milieu d'un mot déjà corrigé par dico → skip
    if (WORD_MAP[key] || WORD_MAP[match.toLowerCase()]) return match;
    // Prépositions trop courtes en milieu de mot courant → skip (le/la/un)
    if (prep.length <= 2 && match.length < 18) return match;
    const after = `${a} ${prep} ${b}`;
    anomalies.push({
      type: 'glue',
      before: match,
      after,
      confidence: 'medium',
    });
    return after;
  });
}

/**
 * Annule les faux positifs glue historiques (hashtags, adverbes).
 * Idempotent — L0 recovery drafts.
 */
export function repairFalsePositiveGlue(text: string): string {
  let s = text;
  const fixes: Array<[RegExp, string]> = [
    [/\bmanuel le ment\b/gi, 'manuellement'],
    [/\bnaturel le ment\b/gi, 'naturellement'],
    [/\br[eé]el le ment\b/gi, 'réellement'],
    [/\bactuel le ment\b/gi, 'actuellement'],
    [/\bpersonnel le ment\b/gi, 'personnellement'],
    [/\bofficiel le ment\b/gi, 'officiellement'],
    [/\bprobable ment\b/gi, 'probablement'], // unlikely path
    [/#Assembl[eé]e Du PremierTour\b/g, '#AssembléeDuPremierTour'],
    [/\bAssembl[eé]e Du PremierTour\b/g, 'AssembléeDuPremierTour'],
    [/#FinDesB au druches\b/g, '#FinDesBaudruches'],
    [/\bFinDesB au druches\b/g, 'FinDesBaudruches'],
    // slug URL accentué par ancienne passe ortho
    [/(\/analyses\/)pr[eé]sidentielle(-2027-preparation)/gi, '$1presidentielle$2'],
  ];
  for (const [re, rep] of fixes) s = s.replace(re, rep);
  return s;
}

/**
 * Répare les URLs déjà cassées par une ancienne passe ponctuation
 * (`https: //…`, `? utm_`, `& utm_`) avant toute autre transform.
 * Les espaces après `?` / `&` ne sont collés que s'ils ressemblent à un param (`key=`).
 */
function repairBrokenUrls(text: string, anomalies: QualiteAnomaly[]): string {
  let s = text;
  const before = s;
  // https: //host → https://host
  s = s.replace(/https?:\s*\/\//gi, (m) => m.replace(/\s+/g, ''));
  // ? utm_source=… / & medium=… (évite « quoi ? » en prose FR)
  s = s.replace(/\?\s+(?=[A-Za-z0-9_~.-]+=)/g, '?');
  s = s.replace(/&\s+(?=[A-Za-z0-9_~.-]+=)/g, '&');
  s = s.replace(/#\s+(?=[A-Za-z0-9_~.-]+)/g, '#');
  if (s !== before) {
    anomalies.push({
      type: 'punct',
      before: 'URL espacée',
      after: 'URL compacte',
      confidence: 'high',
    });
  }
  return s;
}

/** Tokens privés — hors alphabet FR / WORD_MAP. */
const URL_PH = (i: number) => `\uE000U${i}\uE001`;

/**
 * Protège les URLs http(s) pour que ponctuation / ortho / glue
 * ne les altèrent jamais (slugs non accentués, query strings).
 */
function protectUrls(text: string): { text: string; urls: string[] } {
  const urls: string[] = [];
  const next = text.replace(/https?:\/\/[^\s<>\]\)'"]+/gi, (m) => {
    const i = urls.length;
    urls.push(m);
    return URL_PH(i);
  });
  return { text: next, urls };
}

function restoreUrls(text: string, urls: string[]): string {
  return text.replace(/\uE000U(\d+)\uE001/g, (_m, idx) => urls[Number(idx)] ?? _m);
}

/**
 * Corrige et rapporte les anomalies (sens politique non modifié volontairement).
 */
export function reviewQualiteRedaction(input: string): QualiteReport {
  const original = String(input ?? '');
  const anomalies: QualiteAnomaly[] = [];
  let s = original.replace(/\r\n/g, '\n');

  // Recovery faux positifs glue (hashtags / adverbes) avant scan
  s = repairFalsePositiveGlue(s);

  // URLs d'abord : réparer puis masquer (évite https: // et accents dans slugs)
  s = repairBrokenUrls(s, anomalies);
  const protected_ = protectUrls(s);
  s = protected_.text;
  const urls = protected_.urls;
  // Normaliser slugs LMDPT connus (sans accent) une fois l'URL capturée
  for (let i = 0; i < urls.length; i++) {
    const fixed = urls[i]!.replace(
      /\/analyses\/pr[eé]sidentielle-2027-preparation/gi,
      '/analyses/presidentielle-2027-preparation',
    );
    if (fixed !== urls[i]) {
      anomalies.push({
        type: 'ortho',
        before: 'slug URL accentué',
        after: 'slug ASCII',
        confidence: 'high',
      });
      urls[i] = fixed;
    }
  }

  // Espaces (hors URL protégées)
  const multi = s.replace(/[ \t]{2,}/g, ' ');
  if (multi !== s) {
    anomalies.push({ type: 'space', before: 'espaces multiples', after: 'espace unique', confidence: 'high' });
    s = multi;
  }

  // Apostrophes typographiques
  const apo = s.replace(/[’‘‛′]/g, "'");
  if (apo !== s) {
    anomalies.push({ type: 'apostrophe', before: '’', after: "'", confidence: 'high' });
    s = apo;
  }

  // Ponctuation FR — ne touche plus les URLs (placeholders)
  let punct = s.replace(/\s+([,;:!?…])/g, '$1');
  punct = punct.replace(/([,;:!?])(?=[^\s\n])/g, '$1 ');
  punct = punct.replace(/\s+\./g, '.');
  if (punct !== s) {
    anomalies.push({ type: 'punct', before: 'ponctuation collée', after: 'espaces normalisés', confidence: 'high' });
    s = punct;
  }

  s = applyPhraseFixes(s, anomalies);
  s = applyGlueHeuristic(s, anomalies);
  s = applyWordMap(s, anomalies);

  // Restaurer URLs intactes
  s = restoreUrls(s, urls);

  // Trim lignes
  s = s
    .split('\n')
    .map((line) => line.replace(/[ \t]+$/g, ''))
    .join('\n')
    .replace(/\n{3,}/g, '\n\n')
    .trim();

  const stats = {
    total: anomalies.length,
    glue: anomalies.filter((a) => a.type === 'glue').length,
    ortho: anomalies.filter((a) => a.type === 'ortho').length,
    punct: anomalies.filter((a) => a.type === 'punct').length,
    space: anomalies.filter((a) => a.type === 'space').length,
    apostrophe: anomalies.filter((a) => a.type === 'apostrophe').length,
  };

  const highGlue = anomalies.some((a) => a.type === 'glue' && a.confidence === 'high');
  const decision: QualiteReport['decision'] =
    stats.total === 0 || (!highGlue && stats.glue === 0 && stats.ortho <= 2) ? 'SHIP' : 'FIX-FIRST';

  // After auto-fix, if corrected is clean of high glue → SHIP
  const residualGlue = anomalies.filter((a) => a.type === 'glue' && a.confidence !== 'high');
  const finalDecision: QualiteReport['decision'] =
    residualGlue.length > 0 && s.includes(residualGlue[0]!.before) ? 'FIX-FIRST' : stats.glue + stats.ortho > 0 && s === original ? 'FIX-FIRST' : 'SHIP';

  return {
    original,
    corrected: s,
    anomalies,
    stats,
    decision: finalDecision === 'SHIP' && !highGlue ? 'SHIP' : anomalies.length === 0 ? 'SHIP' : decision,
    changed: s !== original.trim(),
  };
}

/** Format section markdown pour brouillons X / logs agent. */
export function formatQualiteGateSection(report: QualiteReport): string {
  let md = `## Gate qualité rédaction\n\n`;
  md += `**DecisionTag** : ${report.decision}\n`;
  md += `**Anomalies** : ${report.stats.total} (glue ${report.stats.glue} · ortho ${report.stats.ortho} · punct ${report.stats.punct})\n\n`;
  if (report.anomalies.length === 0) {
    md += `Aucune anomalie détectée (scan auto).\n\n`;
    return md;
  }
  md += `| # | Type | Avant | Après | Confiance |\n`;
  md += `|---|------|-------|-------|----------|\n`;
  report.anomalies.slice(0, 20).forEach((a, i) => {
    md += `| ${i + 1} | ${a.type} | \`${a.before.replace(/\|/g, '\\|')}\` | \`${a.after.replace(/\|/g, '\\|')}\` | ${a.confidence} |\n`;
  });
  if (report.anomalies.length > 20) {
    md += `\n_… ${report.anomalies.length - 20} autres_\n`;
  }
  md += `\n`;
  if (report.changed) {
    md += `> Texte des copies **corrigé automatiquement** pour les fusions / typos connues. Revue humaine obligatoire.\n\n`;
  }
  return md;
}

/** Applique la correction aux blocs copy entre \`\`\` … \`\`\`. */
export function applyQualiteToDraftMarkdown(markdown: string): {
  markdown: string;
  reports: QualiteReport[];
} {
  const reports: QualiteReport[] = [];
  const next = markdown.replace(/```\n([\s\S]*?)\n```/g, (_full, body: string) => {
    const report = reviewQualiteRedaction(body);
    reports.push(report);
    return `\`\`\`\n${report.corrected}\n\`\`\``;
  });

  // Agrégat pour gate section
  const aggregate: QualiteReport = {
    original: markdown,
    corrected: next,
    anomalies: reports.flatMap((r) => r.anomalies),
    stats: {
      total: reports.reduce((s, r) => s + r.stats.total, 0),
      glue: reports.reduce((s, r) => s + r.stats.glue, 0),
      ortho: reports.reduce((s, r) => s + r.stats.ortho, 0),
      punct: reports.reduce((s, r) => s + r.stats.punct, 0),
      space: reports.reduce((s, r) => s + r.stats.space, 0),
      apostrophe: reports.reduce((s, r) => s + r.stats.apostrophe, 0),
    },
    decision: reports.some((r) => r.decision === 'FIX-FIRST') ? 'FIX-FIRST' : 'SHIP',
    changed: reports.some((r) => r.changed),
  };

  let out = next;
  if (!out.includes('## Gate qualité rédaction')) {
    // Insert before Gate REVIEW if present
    if (out.includes('## Gate REVIEW')) {
      out = out.replace('## Gate REVIEW', `${formatQualiteGateSection(aggregate)}## Gate REVIEW`);
    } else {
      out += `\n${formatQualiteGateSection(aggregate)}`;
    }
  }

  // Checklist item
  if (out.includes('## Gate REVIEW') && !out.includes('Qualité rédaction')) {
    out = out.replace(
      '## Gate REVIEW\n\n',
      `## Gate REVIEW\n\n- [ ] Qualité rédaction (${aggregate.decision}) — mots accolés / typos\n`,
    );
  }

  return { markdown: out, reports: [aggregate, ...reports] };
}
