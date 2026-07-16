/**
 * Veille sondages présidentielle 2027 — scan agrégateurs + RSS médias,
 * détection de mouvements, commentaires brefs pédagogiques.
 * Aucune prédiction ; synthèse documentaire uniquement.
 */
import { readFile, writeFile, mkdir, appendFile } from 'node:fs/promises';
import { existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import providersConfig from '../data/sondages/providers.json';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '../..');
const DATA_DIR = join(ROOT, 'src/data/sondages');
const LATEST_PATH = join(DATA_DIR, 'latest.json');
const MOVEMENTS_PATH = join(DATA_DIR, 'movements.jsonl');
const WAVES_PATH = join(DATA_DIR, 'waves-registry.json');

export interface ProviderRegistry {
  institutes: Array<{
    id: string;
    label: string;
    region?: string;
    keywords?: string[];
    active?: boolean;
    tier?: string;
  }>;
  aggregators: Array<{
    id: string;
    label: string;
    url: string;
    region?: string;
    priority?: number;
    parse?: string;
    active?: boolean;
  }>;
  media_partners: Array<{
    id: string;
    label: string;
    region?: string;
    rss?: string[];
    keywords?: string[];
    active?: boolean;
  }>;
  scan?: { user_agent?: string };
}

export interface DetectedWave {
  id: string;
  firm: string;
  firm_id: string | null;
  fieldwork: string | null;
  published_hint: string | null;
  source_url: string;
  source_id: string;
  scores: Record<string, number>;
  raw_snippet: string;
  metric: 'intentions_vote' | 'souhait_victoire' | 'unknown';
}

export interface Movement {
  at: string;
  kind: 'new_wave' | 'score_shift' | 'head_change' | 'source_up' | 'source_down';
  firm?: string;
  candidate?: string;
  from?: number | null;
  to?: number | null;
  delta?: number | null;
  comment: string;
  wave_id?: string;
  source_url?: string;
}

export interface SondageVeilleSnapshot {
  fetched_at: string;
  disclaimer: string;
  providers_indexed: number;
  sources_ok: number;
  sources_error: number;
  waves: DetectedWave[];
  head_by_wave: Array<{ wave_id: string; firm: string; head: string; pct: number }>;
  movements: Movement[];
  brief: string[];
  errors: Array<{ source_id: string; error: string }>;
}

const CANDIDATE_ALIASES: Array<{ slug: string; patterns: RegExp }> = [
  { slug: 'le-pen', patterns: [/\ble\s*pen\b/i, /\bmlp\b/i] },
  { slug: 'bardella', patterns: [/\bbardella\b/i] },
  { slug: 'philippe', patterns: [/\bphilippe\b/i, /\bédouard\b/i, /\bedouard\b/i] },
  { slug: 'attal', patterns: [/\battal\b/i] },
  { slug: 'melenchon', patterns: [/\bmélenchon\b/i, /\bmelenchon\b/i, /\bjlm\b/i] },
  { slug: 'glucksmann', patterns: [/\bglucksmann\b/i] },
  { slug: 'retailleau', patterns: [/\bretailleau\b/i] },
  { slug: 'zemmour', patterns: [/\bzemmour\b/i] },
  { slug: 'tondelier', patterns: [/\btondelier\b/i] },
  { slug: 'roussel', patterns: [/\broussel\b/i] },
  { slug: 'hollande', patterns: [/\bhollande\b/i] },
  { slug: 'ruffin', patterns: [/\bruffin\b/i] },
  { slug: 'villepin', patterns: [/\bvillepin\b/i] },
  { slug: 'dupont-aignan', patterns: [/\bdupont[-\s]?aignan\b/i, /\bnda\b/i] },
  { slug: 'arthaud', patterns: [/\barthaud\b/i] },
  { slug: 'darmanin', patterns: [/\bdarmanin\b/i] },
  { slug: 'wauquiez', patterns: [/\bwauquiez\b/i] },
];

const FIRM_PATTERNS: Array<{ id: string; re: RegExp }> = [
  { id: 'elabe', re: /\belabe\b/i },
  { id: 'ifop', re: /\bifop(?:-fiducial)?\b/i },
  { id: 'harris', re: /\bharris(?:\s+interactive)?\b|\btoluna(?:\s+harris)?\b/i },
  { id: 'ipsos', re: /\bipsos(?:-bva|-mori)?\b|\bbva\b|\bipsos\s+mori\b/i },
  { id: 'opinionway', re: /\bopinion[\s-]*way\b|\bopinionway\b/i },
  { id: 'verian', re: /\bverian\b|\bkantar(?:\s+public)?\b/i },
  { id: 'cluster17', re: /\bcluster\s*17\b|\bcluster17\b/i },
  { id: 'odoxa', re: /\bodoxa\b/i },
  { id: 'yougov', re: /\byougov\b/i },
  { id: 'csa', re: /\bcsa(?:\s+research)?\b/i },
  { id: 'viavoice', re: /\bviavoice\b|\bvia\s*voice\b/i },
  { id: 'pew-research', re: /\bpew(?:\s+research)?\b/i },
  { id: 'gallup', re: /\bgallup\b/i },
  { id: 'morning-consult', re: /\bmorning\s+consult\b/i },
  { id: 'europe-elects', re: /\beurope\s+elects\b/i },
  { id: 'eurobarometer', re: /\beurobarom[eè]tre\b|\beurobarometer\b/i },
  { id: 'cevipof', re: /\bcevipof\b/i },
  { id: 'tns-sofres', re: /\btns\s*sofres\b|\bsofres\b/i },
  { id: 'lh2', re: /\blh2\b/i },
];

export function getProviders(): ProviderRegistry {
  return providersConfig as unknown as ProviderRegistry;
}

export function stripHtml(html: string): string {
  return html
    .replace(/<script[\s\S]*?<\/script>/gi, ' ')
    .replace(/<style[\s\S]*?<\/style>/gi, ' ')
    .replace(/<[^>]+>/g, ' ')
    .replace(/&nbsp;/g, ' ')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim();
}

export function matchFirm(text: string): { id: string; label: string } | null {
  for (const f of FIRM_PATTERNS) {
    if (f.re.test(text)) {
      const inst = getProviders().institutes.find((i) => i.id === f.id);
      return { id: f.id, label: inst?.label ?? f.id };
    }
  }
  return null;
}

/** Extrait paires candidat → % depuis un fragment de texte. */
export function extractScores(text: string): Record<string, number> {
  const scores: Record<string, number> = {};
  const normalized = text.normalize('NFKC');

  // Patterns: "LE PEN 35%" / "Le Pen : 35 %" / "en tête avec 36%" / "35% LE PEN" / "(19%)"
  for (const { slug, patterns } of CANDIDATE_ALIASES) {
    for (const pat of patterns) {
      const variants = [
        // Le Pen 36% / Le Pen : 36 %
        new RegExp(`${pat.source}\\s*[:\\-–]?\\s*(\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%`, 'i'),
        // Le Pen ... avec 36% / en tête avec 36% des intentions
        new RegExp(
          `${pat.source}[^0-9%]{0,48}?\\b(?:avec|à|a|de|crédité[e]?\\s+de|obtiendrait|recueillerait)?\\s*(\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%`,
          'i',
        ),
        // 36% ... Le Pen
        new RegExp(
          `(\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%\\s*(?:des intentions(?:\\s+de\\s+vote)?)?\\s*(?:pour\\s+)?${pat.source}`,
          'i',
        ),
        // Le Pen (36%)
        new RegExp(`${pat.source}[^%]{0,40}?\\((\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%\\)`, 'i'),
        // Édouard Philippe (19%) already covered; bare (19%) after name within 30 chars
        new RegExp(`${pat.source}[^0-9]{0,30}?\\((\\d{1,2}(?:[.,]\\d{1,2})?)\\s*%?\\)`, 'i'),
      ];
      for (const re of variants) {
        const m = normalized.match(re);
        if (m?.[1]) {
          const n = Number.parseFloat(m[1].replace(',', '.'));
          if (n >= 0.5 && n <= 60) {
            scores[slug] = n;
            break;
          }
        }
      }
      if (scores[slug] != null) break;
    }
  }
  return scores;
}

export function extractFieldwork(text: string): string | null {
  const m =
    text.match(
      /(\d{1,2})\s*[–\-\/]\s*(\d{1,2})\s+(janv|févr|mars|avr|mai|juin|juil|août|sept|oct|nov|déc)[a-z.]*\s+(\d{4})/i,
    ) ||
    text.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/) ||
    text.match(/(\d{2})\/(\d{2})\/(\d{4})/);
  if (!m) return null;
  return m[0];
}

/** Parse EPOC page : dernier sondage + lignes type 12/07/2026 ELABE. */
export function parseEpocHtml(html: string, sourceUrl: string): DetectedWave[] {
  const text = stripHtml(html);
  const waves: DetectedWave[] = [];

  // "Dernier sondage ELABE 12/07/2026"
  const last = text.match(
    /Dernier sondage\s+([A-Z0-9][A-Z0-9\s-]{1,20}?)\s+(\d{2}\/\d{2}\/\d{4})/i,
  );
  if (last) {
    const firmLabel = last[1].trim();
    const firm = matchFirm(firmLabel);
    // Hypothèse N°1 block after date
    const after = text.slice(text.indexOf(last[0]), text.indexOf(last[0]) + 800);
    const scores = extractScores(after);
    // EPOC layout: "35% LE PEN 16.5% PHILIPPE"
    const scorePairs = [...after.matchAll(/(\d{1,2}(?:[.,]\d{1,2})?)%\s+([A-ZÉÈÊÀÂÙÛÔÏÇ][A-ZÉÈÊÀÂÙÛÔÏÇ\s-]{2,20})/g)];
    for (const [, pct, name] of scorePairs) {
      const f = matchFirm(name) ? null : extractScores(`${name} ${pct}%`);
      Object.assign(scores, f);
      const slugScores = extractScores(`${name.trim()} ${pct}%`);
      Object.assign(scores, slugScores);
    }
    // direct map uppercase names
    for (const [, pct, name] of scorePairs) {
      const slug = nameToSlug(name);
      if (slug) scores[slug] = Number.parseFloat(pct.replace(',', '.'));
    }
    const id = `epoc-${(firm?.id ?? firmLabel).toLowerCase().replace(/\s+/g, '-')}-${last[2].replace(/\//g, '')}`;
    waves.push({
      id,
      firm: firm?.label ?? firmLabel,
      firm_id: firm?.id ?? null,
      fieldwork: last[2],
      published_hint: last[2],
      source_url: sourceUrl,
      source_id: 'epoc',
      scores,
      raw_snippet: after.slice(0, 280),
      metric: 'intentions_vote',
    });
  }

  // Table rows: "12/07/2026 ELABE"
  const rowRe = /(\d{2}\/\d{2}\/\d{4})\s+([A-Z][A-Z0-9\s-]{2,18}?)\s+(\d)\s+/g;
  let rm: RegExpExecArray | null;
  const seen = new Set(waves.map((w) => w.id));
  while ((rm = rowRe.exec(text)) !== null && waves.length < 12) {
    const date = rm[1];
    const firmLabel = rm[2].trim();
    const firm = matchFirm(firmLabel);
    const id = `epoc-row-${(firm?.id ?? firmLabel).toLowerCase().replace(/\s+/g, '-')}-${date.replace(/\//g, '')}-h${rm[3]}`;
    if (seen.has(id)) continue;
    seen.add(id);
    const chunk = text.slice(rm.index, rm.index + 200);
    waves.push({
      id,
      firm: firm?.label ?? firmLabel,
      firm_id: firm?.id ?? null,
      fieldwork: date,
      published_hint: date,
      source_url: sourceUrl,
      source_id: 'epoc',
      scores: {},
      raw_snippet: chunk,
      metric: 'intentions_vote',
    });
  }

  return waves;
}

function nameToSlug(name: string): string | null {
  const n = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .trim();
  const map: Record<string, string> = {
    'le pen': 'le-pen',
    lepen: 'le-pen',
    philippe: 'philippe',
    melenchon: 'melenchon',
    'mélenchon': 'melenchon',
    glucksmann: 'glucksmann',
    retailleau: 'retailleau',
    attal: 'attal',
    bardella: 'bardella',
    tondelier: 'tondelier',
    zemmour: 'zemmour',
    roussel: 'roussel',
    villepin: 'villepin',
    hollande: 'hollande',
    ruffin: 'ruffin',
    arthaud: 'arthaud',
    'dupont-aignan': 'dupont-aignan',
    'dupont aignan': 'dupont-aignan',
  };
  return map[n] ?? null;
}

export function parseGenericHtml(
  html: string,
  sourceUrl: string,
  sourceId: string,
): DetectedWave[] {
  const text = stripHtml(html);
  const firm = matchFirm(text.slice(0, 2000)) ?? matchFirm(text);
  const scores = extractScores(text.slice(0, 4000));
  const fieldwork = extractFieldwork(text.slice(0, 4000));
  if (!firm && Object.keys(scores).length === 0) return [];

  const id = `${sourceId}-${(firm?.id ?? 'unknown')}-${fieldwork?.replace(/\W/g, '') ?? 'na'}-${hashSnippet(text.slice(0, 120))}`;
  return [
    {
      id,
      firm: firm?.label ?? 'Inconnu',
      firm_id: firm?.id ?? null,
      fieldwork,
      published_hint: fieldwork,
      source_url: sourceUrl,
      source_id: sourceId,
      scores,
      raw_snippet: text.slice(0, 280),
      metric: /souhait/i.test(text) ? 'souhait_victoire' : 'intentions_vote',
    },
  ];
}

function hashSnippet(s: string): string {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (Math.imul(31, h) + s.charCodeAt(i)) | 0;
  return Math.abs(h).toString(36).slice(0, 6);
}

/** Parse RSS item titles/descriptions for poll mentions. */
export function parseRssForPolls(xml: string, sourceId: string): DetectedWave[] {
  const waves: DetectedWave[] = [];
  const itemRe = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let m: RegExpExecArray | null;
  while ((m = itemRe.exec(xml)) !== null) {
    const block = m[1];
    const title = stripHtml((block.match(/<title[^>]*>([\s\S]*?)<\/title>/i)?.[1] ?? ''));
    const link = (block.match(/<link[^>]*>([\s\S]*?)<\/link>/i)?.[1] ?? '').trim();
    const desc = stripHtml((block.match(/<description[^>]*>([\s\S]*?)<\/description>/i)?.[1] ?? ''));
    const blob = `${title} ${desc}`;
    if (!/sondage|intentions?\s+de\s+vote|baromètre|barometre/i.test(blob)) continue;
    if (!/présidentielle|presidentielle|2027/i.test(blob)) continue;
    const firm = matchFirm(blob);
    const scores = extractScores(blob);
    waves.push({
      id: `rss-${sourceId}-${hashSnippet(link || title)}`,
      firm: firm?.label ?? 'Media',
      firm_id: firm?.id ?? null,
      fieldwork: extractFieldwork(blob),
      published_hint: null,
      source_url: link || '',
      source_id: sourceId,
      scores,
      raw_snippet: title.slice(0, 200),
      metric: /souhait/i.test(blob) ? 'souhait_victoire' : 'intentions_vote',
    });
  }
  return waves;
}

export function headOfWave(wave: DetectedWave): { head: string; pct: number } | null {
  const entries = Object.entries(wave.scores);
  if (!entries.length) return null;
  entries.sort((a, b) => b[1] - a[1]);
  return { head: entries[0][0], pct: entries[0][1] };
}

export function commentForNewWave(wave: DetectedWave): string {
  const head = headOfWave(wave);
  const metric =
    wave.metric === 'souhait_victoire' ? 'souhait de victoire' : 'intentions de vote';
  if (!head) {
    if (wave.metric === 'souhait_victoire' && /le\s*point|cluster17/i.test(`${wave.firm} ${wave.source_url} ${wave.raw_snippet}`)) {
      return `Cluster17 / Le Point (${wave.fieldwork ?? 'juil. 2026'}) : Le Pen en tête des souhaits de victoire, Mélenchon en embuscade devant Philippe — 56 % jugent la candidature « injustifiée » (paywall ; pas d’intentions de vote isolées auto).`;
    }
    return `${wave.firm} signalé (${wave.fieldwork ?? 'date n/d'}) — scores non extraits automatiquement ; vérifier la source.`;
  }
  const label = head.head.replace(/-/g, ' ');
  return `${wave.firm}${wave.fieldwork ? ` (${wave.fieldwork})` : ''} : ${label} en tête à ${formatPct(head.pct)} (${metric}).`;
}

export function commentForShift(
  firm: string,
  candidate: string,
  from: number,
  to: number,
): string {
  const delta = Math.round((to - from) * 10) / 10;
  const sign = delta > 0 ? '+' : '';
  const label = candidate.replace(/-/g, ' ');
  if (Math.abs(delta) < 0.5) {
    return `${firm} — ${label} stable (~${formatPct(to)}).`;
  }
  if (delta > 0) {
    return `${firm} — ${label} en hausse (${formatPct(from)} → ${formatPct(to)}, ${sign}${delta} pt).`;
  }
  return `${firm} — ${label} en repli (${formatPct(from)} → ${formatPct(to)}, ${delta} pt).`;
}

function formatPct(n: number): string {
  return `${n.toLocaleString('fr-FR', { maximumFractionDigits: 1 })} %`;
}

export function diffWaves(prev: DetectedWave[], next: DetectedWave[], at: string): Movement[] {
  const movements: Movement[] = [];
  const prevByFirm = new Map<string, DetectedWave>();
  for (const w of prev) {
    const key = `${w.firm_id ?? w.firm}|${w.fieldwork ?? ''}`;
    prevByFirm.set(key, w);
    // also index by firm only for latest
    if (!prevByFirm.has(w.firm_id ?? w.firm)) prevByFirm.set(w.firm_id ?? w.firm, w);
  }

  const seenIds = new Set(prev.map((w) => w.id));

  for (const w of next) {
    if (!seenIds.has(w.id) && Object.keys(w.scores).length > 0) {
      // check if same firm+fieldwork already known
      const key = `${w.firm_id ?? w.firm}|${w.fieldwork ?? ''}`;
      const old = prevByFirm.get(key) ?? prevByFirm.get(w.firm_id ?? w.firm);
      if (!old || old.id === w.id) {
        if (!old || JSON.stringify(old.scores) !== JSON.stringify(w.scores)) {
          if (!old) {
            movements.push({
              at,
              kind: 'new_wave',
              firm: w.firm,
              comment: commentForNewWave(w),
              wave_id: w.id,
              source_url: w.source_url,
            });
          }
        }
      }

      if (old && Object.keys(old.scores).length && Object.keys(w.scores).length) {
        const oldHead = headOfWave(old);
        const newHead = headOfWave(w);
        if (oldHead && newHead && oldHead.head !== newHead.head) {
          movements.push({
            at,
            kind: 'head_change',
            firm: w.firm,
            comment: `${w.firm} — bascule en tête : ${oldHead.head.replace(/-/g, ' ')} (${formatPct(oldHead.pct)}) → ${newHead.head.replace(/-/g, ' ')} (${formatPct(newHead.pct)}).`,
            wave_id: w.id,
            source_url: w.source_url,
          });
        }
        for (const [slug, pct] of Object.entries(w.scores)) {
          const prevPct = old.scores[slug];
          if (prevPct != null && Math.abs(prevPct - pct) >= 0.5) {
            movements.push({
              at,
              kind: 'score_shift',
              firm: w.firm,
              candidate: slug,
              from: prevPct,
              to: pct,
              delta: Math.round((pct - prevPct) * 10) / 10,
              comment: commentForShift(w.firm, slug, prevPct, pct),
              wave_id: w.id,
              source_url: w.source_url,
            });
          }
        }
      } else if (!old && Object.keys(w.scores).length > 0) {
        // already pushed new_wave
      }
    } else if (!seenIds.has(w.id) && Object.keys(w.scores).length === 0 && w.raw_snippet) {
      // mention only
      if (/sondage|baromètre/i.test(w.raw_snippet)) {
        movements.push({
          at,
          kind: 'new_wave',
          firm: w.firm,
          comment: commentForNewWave(w),
          wave_id: w.id,
          source_url: w.source_url,
        });
      }
    }
  }

  // dedupe comments
  const uniq = new Map<string, Movement>();
  for (const m of movements) {
    uniq.set(`${m.kind}|${m.comment}`, m);
  }
  return [...uniq.values()];
}

async function fetchText(
  url: string,
  ua: string,
  fetchImpl: typeof fetch,
): Promise<{ ok: boolean; text: string; error?: string }> {
  try {
    const res = await fetchImpl(url, {
      headers: {
        'User-Agent': ua,
        Accept: 'text/html,application/xhtml+xml,application/xml,application/rss+xml,*/*',
        'Accept-Language': 'fr-FR,fr;q=0.9,en;q=0.8',
      },
      signal: AbortSignal.timeout(20_000),
      redirect: 'follow',
    });
    if (!res.ok) return { ok: false, text: '', error: `HTTP ${res.status}` };
    return { ok: true, text: await res.text() };
  } catch (e) {
    return { ok: false, text: '', error: e instanceof Error ? e.message : String(e) };
  }
}

export async function runSondageVeille(
  options: {
    fetchImpl?: typeof fetch;
    previous?: SondageVeilleSnapshot | null;
    seedWaves?: DetectedWave[];
  } = {},
): Promise<SondageVeilleSnapshot> {
  const fetchImpl = options.fetchImpl ?? fetch;
  const providers = getProviders();
  const ua = providers.scan?.user_agent ?? 'LMDPT-SondageVeille/1.0';
  const at = new Date().toISOString();
  const waves: DetectedWave[] = [...(options.seedWaves ?? [])];
  const errors: Array<{ source_id: string; error: string }> = [];
  let sourcesOk = 0;
  let sourcesError = 0;

  const aggregators = (providers.aggregators ?? [])
    .filter((a) => a.active !== false)
    .sort((a, b) => (a.priority ?? 99) - (b.priority ?? 99));

  for (const agg of aggregators) {
    const res = await fetchText(agg.url, ua, fetchImpl);
    if (!res.ok) {
      sourcesError += 1;
      errors.push({ source_id: agg.id, error: res.error ?? 'fail' });
      continue;
    }
    sourcesOk += 1;
    let parsed: DetectedWave[] = [];
    if (agg.parse === 'epoc_html' || agg.id === 'epoc') {
      parsed = parseEpocHtml(res.text, agg.url);
    } else {
      parsed = parseGenericHtml(res.text, agg.url, agg.id);
    }
    for (const w of parsed) {
      if (!waves.some((x) => x.id === w.id)) waves.push(w);
    }
  }

  for (const media of providers.media_partners ?? []) {
    if (media.active === false) continue;
    for (const rss of media.rss ?? []) {
      const res = await fetchText(rss, ua, fetchImpl);
      if (!res.ok) {
        sourcesError += 1;
        errors.push({ source_id: `${media.id}-rss`, error: res.error ?? 'fail' });
        continue;
      }
      sourcesOk += 1;
      for (const w of parseRssForPolls(res.text, media.id)) {
        if (!waves.some((x) => x.id === w.id)) waves.push(w);
      }
    }
  }

  const prev = options.previous ?? null;
  const movements = diffWaves(prev?.waves ?? [], waves, at);

  // First run / empty prev : comment every seeded + scored wave (incl. Le Point sans %)
  if (!prev && waves.length) {
    const already = new Set(movements.map((m) => m.wave_id));
    for (const w of waves) {
      if (already.has(w.id)) continue;
      const hasScores = Object.keys(w.scores).length > 0;
      const isManualSeed = w.source_id === 'manual' || w.source_id === 'le-point' || w.id.startsWith('manual-');
      if (!hasScores && !isManualSeed) continue;
      movements.push({
        at,
        kind: 'new_wave',
        firm: w.firm,
        comment: commentForNewWave(w),
        wave_id: w.id,
        source_url: w.source_url,
      });
      already.add(w.id);
    }
  }

  const head_by_wave = waves
    .map((w) => {
      const h = headOfWave(w);
      if (!h) return null;
      return { wave_id: w.id, firm: w.firm, head: h.head, pct: h.pct };
    })
    .filter(Boolean) as Array<{ wave_id: string; firm: string; head: string; pct: number }>;

  const brief = movements.map((m) => m.comment);
  if (!brief.length) {
    brief.push(
      `Scan ${at.slice(0, 16)} — aucun mouvement détecté (${waves.length} vague(s) en mémoire, ${sourcesOk} source(s) OK).`,
    );
  }

  const institutes = providers.institutes?.length ?? 0;
  const media = providers.media_partners?.length ?? 0;
  const aggs = providers.aggregators?.length ?? 0;

  return {
    fetched_at: at,
    disclaimer:
      'Veille pédagogique LMDPT — intentions de vote agrégées automatiquement. Pas de prédiction, pas de tier list. Croiser avec les notices Commission des sondages.',
    providers_indexed: institutes + media + aggs,
    sources_ok: sourcesOk,
    sources_error: sourcesError,
    waves,
    head_by_wave,
    movements,
    brief,
    errors,
  };
}

export async function loadPreviousSnapshot(): Promise<SondageVeilleSnapshot | null> {
  if (!existsSync(LATEST_PATH)) return null;
  try {
    const raw = await readFile(LATEST_PATH, 'utf8');
    return JSON.parse(raw) as SondageVeilleSnapshot;
  } catch {
    return null;
  }
}

export async function persistSnapshot(snapshot: SondageVeilleSnapshot): Promise<void> {
  await mkdir(DATA_DIR, { recursive: true });
  await writeFile(LATEST_PATH, `${JSON.stringify(snapshot, null, 2)}\n`, 'utf8');
  for (const m of snapshot.movements) {
    await appendFile(MOVEMENTS_PATH, `${JSON.stringify(m)}\n`, 'utf8');
  }

  // merge waves registry
  let registry: { updated: string; waves: DetectedWave[] } = {
    updated: snapshot.fetched_at,
    waves: [],
  };
  if (existsSync(WAVES_PATH)) {
    try {
      registry = JSON.parse(await readFile(WAVES_PATH, 'utf8'));
    } catch {
      /* keep empty */
    }
  }
  const byId = new Map(registry.waves.map((w) => [w.id, w]));
  for (const w of snapshot.waves) byId.set(w.id, w);
  registry.updated = snapshot.fetched_at;
  registry.waves = [...byId.values()].sort((a, b) =>
    (b.fieldwork ?? '').localeCompare(a.fieldwork ?? ''),
  );
  await writeFile(WAVES_PATH, `${JSON.stringify(registry, null, 2)}\n`, 'utf8');
}

/** Seed known waves (manual / paywalled) — Cluster17 Le Point + post-Le Pen pack. */
export function seedKnownWaves(): DetectedWave[] {
  return [
    {
      id: 'manual-cluster17-lepoint-20260710',
      firm: 'Cluster17',
      firm_id: 'cluster17',
      fieldwork: '2026-07-10',
      published_hint: '2026-07-11',
      source_url:
        'https://www.lepoint.fr/politique/le-pen-aux-avant-postes-melenchon-en-embuscade-notre-sondage-exclusif-sur-la-presidentielle-BG2OJRSOURAELJ5VYKDLTEFBVE/',
      source_id: 'le-point',
      scores: {},
      raw_snippet:
        'Sondage exclusif Cluster17 pour Le Point : Le Pen en tête des souhaits de victoire 2027, Mélenchon en embuscade devant Philippe. 56 % jugent « injustifié » son choix de candidature malgré la condamnation en appel. Paywall — scores d’intentions non extraits auto.',
      metric: 'souhait_victoire',
    },
    {
      id: 'manual-elabe-20260712-h1',
      firm: 'Elabe',
      firm_id: 'elabe',
      fieldwork: '2026-07-09/12',
      published_hint: '2026-07-12',
      source_url:
        'https://www.latribune.fr/article/la-tribune-dimanche/politique/45944749344411/sondage-presidentielle-le-pen-en-tete-melenchon-progresse',
      source_id: 'manual',
      scores: {
        'le-pen': 35,
        philippe: 16.5,
        melenchon: 16,
        glucksmann: 10.5,
        retailleau: 8,
        tondelier: 3.5,
        zemmour: 3,
        roussel: 2.5,
        villepin: 2.5,
        'dupont-aignan': 1.5,
        arthaud: 1,
      },
      raw_snippet: 'Elabe hyp.1 post-candidature Le Pen — intentions de vote 1er tour.',
      metric: 'intentions_vote',
    },
    {
      id: 'manual-ifop-20260708-h1',
      firm: 'Ifop',
      firm_id: 'ifop',
      fieldwork: '2026-07-07/08',
      published_hint: '2026-07-08',
      source_url:
        'https://www.ifop.com/article/les-intentions-de-vote-a-lelection-presidentielle-2027-et-lopinion-des-francais-apres-la-declaration-de-candidature-de-marine-le-pen',
      source_id: 'manual',
      scores: {
        'le-pen': 36,
        philippe: 19,
        melenchon: 15,
        glucksmann: 9,
        retailleau: 8,
        zemmour: 4,
        tondelier: 3.5,
        roussel: 3,
        'dupont-aignan': 2,
        arthaud: 0.5,
      },
      raw_snippet: 'Ifop LCI/Figaro post-annonce Le Pen — hyp. Philippe.',
      metric: 'intentions_vote',
    },
    {
      id: 'manual-verian-20260710',
      firm: 'Verian',
      firm_id: 'verian',
      fieldwork: '2026-07-08/10',
      published_hint: '2026-07-10',
      source_url:
        'https://lhemicycle.com/2026/07/10/jordan-bardella-toujours-le-favori-pour-representer-le-rn/',
      source_id: 'manual',
      scores: {
        'le-pen': 37,
        philippe: 17,
        melenchon: 15,
        glucksmann: 11,
        attal: 8,
        retailleau: 7,
        zemmour: 3,
        roussel: 2,
      },
      raw_snippet: 'Verian 8–10 juil. 2026.',
      metric: 'intentions_vote',
    },
    {
      id: 'manual-harris-20260708',
      firm: 'Harris Interactive',
      firm_id: 'harris',
      fieldwork: '2026-07-07/08',
      published_hint: '2026-07-08',
      source_url:
        'https://www.rtl.fr/actu/politique/sondage-rtl-presidentielle-2027-marine-le-pen-progresse-dans-les-intentions-de-vote-apres-l-annonce-de-sa-candidature-7900653723',
      source_id: 'manual',
      scores: {
        'le-pen': 35,
        melenchon: 16,
        philippe: 14,
        glucksmann: 10,
        attal: 8,
        retailleau: 7,
        zemmour: 4,
        tondelier: 2,
        roussel: 2,
        arthaud: 1,
        'dupont-aignan': 1,
      },
      raw_snippet: 'Harris/RTL post-candidature Le Pen.',
      metric: 'intentions_vote',
    },
    {
      id: 'manual-opinionway-20260709',
      firm: 'OpinionWay',
      firm_id: 'opinionway',
      fieldwork: '2026-07-08/09',
      published_hint: '2026-07-09',
      source_url:
        'https://www.lesechos.fr/elections/presidentielle/sondage-exclusif-presidentielle-2027-marine-le-pen-largement-en-tete-avantage-edouard-philippe-a-droite-et-au-centre-2241680',
      source_id: 'manual',
      scores: {
        'le-pen': 35,
        philippe: 18,
        melenchon: 13,
        glucksmann: 9,
        retailleau: 8,
        attal: 7,
        tondelier: 5,
        zemmour: 3,
        roussel: 2,
      },
      raw_snippet: 'OpinionWay / Les Échos.',
      metric: 'intentions_vote',
    },
  ];
}
