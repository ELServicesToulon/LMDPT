/**
 * Rebuild 2027-sondages-candidats.json from scored veille waves.
 * DOE : agrégat pédagogique d'intentions de vote — pas une prédiction.
 */
import type { DetectedWave } from './sondage-veille';

export const CANDIDATS_RELATIVE_PATH = 'src/data/elections/2027-sondages-candidats.json';

const LATEST_WINDOW_DAYS = 21;
const MAX_WAVES_LATEST = 8;
const MIN_SCORES_FOR_HYPOTHESIS = 3;
const MIN_HYPOTHESIS_SUM = 70;
const MAX_HYPOTHESIS_SUM = 115;

const DOE_DISCLAIMER =
  "Agrégats pédagogiques d'intentions de vote issus d'instituts de sondage (Ifop, Harris Interactive, Elabe, Verian, OpinionWay, Ipsos-BVA…). Ce ne sont ni des résultats officiels ni des prédictions. Les hypothèses se croisent : Bardella et Le Pen ne sont pas testés simultanément (scénarios de substitution RN). Seule la liste du Conseil constitutionnel et les résultats du Ministère de l'Intérieur feront foi.";

const STATIC_NOTES = [
  "Les % « moyenne » combinent des hypothèses exclusives (candidat A ou B) : ne pas les additionner.",
  'RN : Marine Le Pen (candidature déclarée 7 juil. 2026) et Jordan Bardella (candidat de substitution désigné par le parti) — jamais dans la même hypothèse de 1er tour.',
  "Centre : Philippe et Attal se cannibalisent selon l’hypothèse (tête de ticket unique vs double présence).",
  'Veille auto 2×/jour (06:45 + 18:15 Europe/Paris) : npm run sondage:veille · données src/data/sondages/ · timer lmdpt-sondage-veille · rafraîchit aussi 2027-sondages-candidats.json.',
] as const;

const MONTHS: Record<string, number> = {
  janv: 1,
  janvier: 1,
  fevr: 2,
  févr: 2,
  fevrier: 2,
  février: 2,
  mars: 3,
  avr: 4,
  avril: 4,
  mai: 5,
  juin: 6,
  juil: 7,
  juillet: 7,
  aout: 8,
  août: 8,
  sept: 9,
  septembre: 9,
  oct: 10,
  octobre: 10,
  nov: 11,
  novembre: 11,
  dec: 12,
  déc: 12,
  decembre: 12,
  décembre: 12,
};

export interface CandidatsSource {
  label: string;
  url: string;
  as_of?: string;
  metric?: string;
  note?: string;
}

export interface CandidatsWave {
  firm: string;
  fieldwork?: string | null;
  n?: number | null;
  hypothesis?: string | null;
  scores: Record<string, number>;
}

export interface CandidatsCandidate {
  slug: string;
  name: string;
  affiliation?: string;
  bloc?: string;
  status?: string;
  avg_pct: number | null;
  latest_pct: number | null;
  latest_range?: string | null;
  latest_source?: string | null;
  note?: string | null;
}

export interface CandidatsFile {
  title: string;
  updated: string;
  disclaimer: string;
  method: string;
  sources: CandidatsSource[];
  notes: string[];
  waves_latest: CandidatsWave[];
  candidates: CandidatsCandidate[];
}

export function isIntentionsVoteMetric(metric: DetectedWave['metric']): boolean {
  switch (metric) {
    case 'intentions_vote':
      return true;
    case 'souhait_victoire':
    case 'unknown':
      return false;
    default: {
      const _exhaustive: never = metric;
      return _exhaustive;
    }
  }
}

export function waveScoreSum(scores: Record<string, number>): number {
  return Object.values(scores).reduce((acc, n) => acc + (Number.isFinite(n) ? n : 0), 0);
}

export function isPlausibleIntentionsWave(wave: DetectedWave): boolean {
  if (!isIntentionsVoteMetric(wave.metric)) return false;
  const keys = Object.keys(wave.scores);
  if (keys.length < MIN_SCORES_FOR_HYPOTHESIS) return false;
  const sum = waveScoreSum(wave.scores);
  return sum >= MIN_HYPOTHESIS_SUM && sum <= MAX_HYPOTHESIS_SUM;
}

function pad2(n: number): string {
  return String(n).padStart(2, '0');
}

function isoDate(year: number, month: number, day: number): string | null {
  if (month < 1 || month > 12 || day < 1 || day > 31) return null;
  const dt = new Date(Date.UTC(year, month - 1, day));
  if (dt.getUTCFullYear() !== year || dt.getUTCMonth() !== month - 1 || dt.getUTCDate() !== day) {
    return null;
  }
  return `${year}-${pad2(month)}-${pad2(day)}`;
}

/** Best-effort YYYY-MM-DD from fieldwork / published_hint (end of range if any). */
export function parseWaveSortDate(text: string | null | undefined): string | null {
  if (!text) return null;
  const raw = text.trim();

  const isoRange = raw.match(/^(\d{4})-(\d{2})-(\d{2})\/(\d{2})$/);
  if (isoRange) {
    return isoDate(
      Number(isoRange[1]),
      Number(isoRange[2]),
      Number(isoRange[4]),
    );
  }

  const iso = raw.match(/^(\d{4})-(\d{2})-(\d{2})/);
  if (iso) {
    return isoDate(Number(iso[1]), Number(iso[2]), Number(iso[3]));
  }

  const dmy = raw.match(/\b(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{4})\b/);
  if (dmy) {
    return isoDate(Number(dmy[3]), Number(dmy[2]), Number(dmy[1]));
  }

  const frRange = raw.match(
    /(\d{1,2})\s*[–\-\/]\s*(\d{1,2})\s+([A-Za-zÀ-ÿ]{3,12})(?:\s+(\d{4}))?/i,
  );
  if (frRange) {
    const month = monthFromLabel(frRange[3]);
    if (month) {
      const year = frRange[4] ? Number(frRange[4]) : 2026;
      return isoDate(year, month, Number(frRange[2]));
    }
  }

  const frSingle = raw.match(/\b(\d{1,2})\s+([A-Za-zÀ-ÿ]{3,12})(?:\s+(\d{4}))?/i);
  if (frSingle) {
    const month = monthFromLabel(frSingle[2]);
    if (month) {
      const year = frSingle[3] ? Number(frSingle[3]) : 2026;
      return isoDate(year, month, Number(frSingle[1]));
    }
  }

  return null;
}

function monthFromLabel(label: string): number | null {
  const key = label
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/\./g, '');
  for (const [name, n] of Object.entries(MONTHS)) {
    const compact = name.normalize('NFD').replace(/\p{M}/gu, '');
    if (key === compact || key.startsWith(compact.slice(0, 4))) return n;
  }
  return null;
}

export function waveAsOf(wave: DetectedWave): string | null {
  return (
    parseWaveSortDate(wave.published_hint) ??
    parseWaveSortDate(wave.fieldwork) ??
    null
  );
}

function firmKey(wave: DetectedWave): string {
  return (wave.firm_id ?? wave.firm).toLowerCase().replace(/\s+/g, '-');
}

function qualityRank(wave: DetectedWave): number {
  let rank = Object.keys(wave.scores).length;
  if (wave.source_id === 'manual') rank += 100;
  return rank;
}

/** One plausible IV wave per firm+day, preferring manual seeds over noisy extracts. */
export function uniquePlausibleIntentionsWaves(waves: DetectedWave[]): DetectedWave[] {
  const byKey = new Map<string, DetectedWave>();
  for (const wave of waves) {
    if (!isPlausibleIntentionsWave(wave)) continue;
    const day = waveAsOf(wave) ?? 'undated';
    const key = `${firmKey(wave)}|${day}`;
    const prev = byKey.get(key);
    if (!prev || qualityRank(wave) > qualityRank(prev)) {
      byKey.set(key, wave);
    }
  }
  return [...byKey.values()].sort((a, b) => {
    const da = waveAsOf(a) ?? '';
    const db = waveAsOf(b) ?? '';
    return db.localeCompare(da) || a.id.localeCompare(b.id);
  });
}

export function selectWavesLatest(waves: DetectedWave[]): DetectedWave[] {
  const unique = uniquePlausibleIntentionsWaves(waves);
  if (!unique.length) return [];
  const newest = waveAsOf(unique[0]);
  const newestMs = newest ? Date.parse(`${newest}T00:00:00Z`) : NaN;
  const inWindow: DetectedWave[] = [];
  const seenFirm = new Set<string>();
  for (const wave of unique) {
    const key = firmKey(wave);
    if (seenFirm.has(key)) continue;
    const asOf = waveAsOf(wave);
    if (Number.isFinite(newestMs) && asOf) {
      const ageDays = (newestMs - Date.parse(`${asOf}T00:00:00Z`)) / 86_400_000;
      if (ageDays > LATEST_WINDOW_DAYS) continue;
    }
    seenFirm.add(key);
    inWindow.push(wave);
    if (inWindow.length >= MAX_WAVES_LATEST) break;
  }
  return inWindow;
}

function round1(n: number): number {
  return Math.round(n * 10) / 10;
}

function mean(values: number[]): number {
  return values.reduce((acc, n) => acc + n, 0) / values.length;
}

function formatPctFr(n: number): string {
  return n.toLocaleString('fr-FR', { maximumFractionDigits: 1, minimumFractionDigits: 0 });
}

function formatRange(values: number[]): string {
  const min = round1(Math.min(...values));
  const max = round1(Math.max(...values));
  if (min === max) return `${formatPctFr(min)} %`;
  return `${formatPctFr(min)}–${formatPctFr(max)} %`;
}

function shortDateLabel(wave: DetectedWave): string {
  const iso = waveAsOf(wave);
  if (!iso) return wave.fieldwork ?? '';
  const [, month, day] = iso.split('-');
  return `${day}/${month}`;
}

function hypothesisFromScores(scores: Record<string, number>): string {
  const parts: string[] = [];
  if (scores['le-pen'] != null) parts.push('Le Pen');
  else if (scores.bardella != null) parts.push('Bardella');
  if (scores.philippe != null) parts.push('Philippe');
  if (scores.attal != null) parts.push('Attal');
  return parts.length ? parts.join(' + ') : 'intentions de vote 1er tour';
}

function normalizeFirmToken(s: string): string {
  return s.toLowerCase().replace(/[^a-z0-9]/g, '');
}

function matchExistingWaveMeta(
  existing: CandidatsWave[] | undefined,
  wave: DetectedWave,
): CandidatsWave | undefined {
  const want = normalizeFirmToken(wave.firm_id ?? wave.firm);
  const waveDay = waveAsOf(wave);
  return (existing ?? []).find((w) => {
    const have = normalizeFirmToken(w.firm);
    const sameFirm = have.includes(want) || want.includes(have);
    if (!sameFirm) return false;
    if (!w.fieldwork || !wave.fieldwork) return true;
    const prevDay = parseWaveSortDate(w.fieldwork);
    return prevDay === waveDay || w.fieldwork === wave.fieldwork;
  });
}

function toCandidatsWave(wave: DetectedWave, existing: CandidatsWave[] | undefined): CandidatsWave {
  const prev = matchExistingWaveMeta(existing, wave);
  return {
    firm: wave.firm,
    fieldwork: wave.fieldwork,
    n: prev?.n ?? null,
    hypothesis: hypothesisFromScores(wave.scores),
    scores: { ...wave.scores },
  };
}

function scoresForSlug(waves: DetectedWave[], slug: string): number[] {
  const out: number[] = [];
  for (const wave of waves) {
    const n = wave.scores[slug];
    if (n != null && Number.isFinite(n) && n > 0) out.push(n);
  }
  return out;
}

function latestSourceLine(waves: DetectedWave[], slug: string): string {
  const bits: string[] = [];
  for (const wave of waves) {
    const n = wave.scores[slug];
    if (n == null) continue;
    bits.push(`${wave.firm} ${shortDateLabel(wave)} ${formatPctFr(n)} %`);
  }
  return bits.length ? bits.join(' · ') : '—';
}

function dateFromFetchedAt(fetchedAt: string): string {
  const d = fetchedAt.slice(0, 10);
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? d : new Date().toISOString().slice(0, 10);
}

function buildMethod(wavesLatest: DetectedWave[], updated: string): string {
  if (!wavesLatest.length) {
    return `Scan veille ${updated} : aucune vague d'intentions de vote scorable (somme 70–115 %, ≥3 candidats). Scores candidats inchangés. Les souhaits de victoire ne sont pas fusionnés. Ce n'est pas une prédiction.`;
  }
  const firms = wavesLatest
    .map((w) => `${w.firm} ${w.fieldwork ?? shortDateLabel(w)}`)
    .join(', ');
  return `Veille auto ${updated} : moyenne pédagogique « latest_pct » = vagues d'intentions de vote scorées (${firms}). « avg_pct » = moyenne des mêmes vagues uniques institut×jour. Souhait de victoire (Cluster17 / Le Point, etc.) documenté en sources, non fusionné. Hypothèses exclusives : ne pas additionner les %. Ce n'est pas une prédiction.`;
}

function buildSources(
  wavesLatest: DetectedWave[],
  allWaves: DetectedWave[],
  existing: CandidatsSource[] | undefined,
): CandidatsSource[] {
  const sources: CandidatsSource[] = [];
  const seen = new Set<string>();

  for (const wave of wavesLatest) {
    const key = wave.source_url || wave.id;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      label: `${wave.firm} — ${wave.fieldwork ?? shortDateLabel(wave)}`,
      url: wave.source_url,
      as_of: waveAsOf(wave) ?? undefined,
    });
  }

  for (const wave of allWaves) {
    if (wave.metric !== 'souhait_victoire') continue;
    const key = wave.source_url || wave.id;
    if (seen.has(key)) continue;
    seen.add(key);
    sources.push({
      label: `${wave.firm} — souhait de victoire`,
      url: wave.source_url,
      as_of: waveAsOf(wave) ?? undefined,
      metric: 'souhait_victoire',
      note: 'Paywall / métrique distincte — pas fusionné dans latest_pct intentions.',
    });
  }

  for (const prev of existing ?? []) {
    if (prev.metric === 'souhait_victoire') continue;
    if (seen.has(prev.url)) continue;
    if (/wikipedia|epoc/i.test(`${prev.label} ${prev.url}`)) {
      seen.add(prev.url);
      sources.push(prev);
    }
  }

  return sources;
}

function refreshCandidate(
  candidate: CandidatsCandidate,
  wavesLatest: DetectedWave[],
  allIv: DetectedWave[],
): CandidatsCandidate {
  const latestVals = scoresForSlug(wavesLatest, candidate.slug);
  const allVals = scoresForSlug(allIv, candidate.slug);
  if (!allVals.length) {
    return { ...candidate };
  }
  const next: CandidatsCandidate = {
    ...candidate,
    avg_pct: round1(mean(allVals)),
  };
  if (!latestVals.length) {
    next.latest_pct = null;
    return next;
  }
  next.latest_pct = round1(mean(latestVals));
  next.latest_range = formatRange(latestVals);
  next.latest_source = latestSourceLine(wavesLatest, candidate.slug);
  return next;
}

/**
 * Recompute avg_pct / latest_pct / waves_latest / updated from scored IV waves.
 * Idempotent for a given (file, waves, fetchedAt). Preserves identity fields
 * and historical scores when a slug is absent from IV waves.
 */
export function rebuildCandidatsFromWaves(
  existing: CandidatsFile,
  waves: DetectedWave[],
  fetchedAt: string,
): CandidatsFile {
  const allIv = uniquePlausibleIntentionsWaves(waves);
  const wavesLatest = selectWavesLatest(waves);
  const updated = dateFromFetchedAt(fetchedAt);

  const notes = [
    ...STATIC_NOTES,
    `Mise à jour LMDPT : ${updated} (recompute veille sondage:veille — IV scorées ; souhait de victoire non fusionné).`,
  ];

  return {
    title: existing.title,
    updated,
    disclaimer: existing.disclaimer?.trim() ? existing.disclaimer : DOE_DISCLAIMER,
    method: buildMethod(wavesLatest, updated),
    sources: buildSources(wavesLatest, waves, existing.sources),
    notes,
    waves_latest: wavesLatest.map((w) => toCandidatsWave(w, existing.waves_latest)),
    candidates: existing.candidates.map((c) => refreshCandidate(c, wavesLatest, allIv)),
  };
}

const PREDICTION_CLAIM =
  /\b(va gagner|l['’]emportera|pronostic|tier list|favori pour (gagner|l['’]élection)|classement éliminatoire)\b/i;

export function generatedTextHasPredictionClaim(text: string): boolean {
  return PREDICTION_CLAIM.test(text);
}
