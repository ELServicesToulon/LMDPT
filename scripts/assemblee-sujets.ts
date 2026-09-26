#!/usr/bin/env tsx
/**
 * Assemblée des sujets — qui occupe quel thème dans la presse (7 jours).
 * Sortie : src/data/renifleur/assemblee-sujets.json
 *
 * Usage : npx tsx scripts/assemblee-sujets.ts
 * Branché en fin de renifleur-run.ts
 */
import { readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import {
  THEME_LEXICON,
  THEME_UNCLASSIFIED,
  matchTheme,
  type ThemeDef,
} from '../src/lib/assemblee-sujets-lexicon';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const IN = join(ROOT, 'src/data/renifleur/latest.json');
const OUT = join(ROOT, 'src/data/renifleur/assemblee-sujets.json');

const WINDOW_DAYS = 7;
const MIN_CONFIDENCE = 0.6;

interface RenifleurItem {
  title: string;
  url: string;
  published: string;
  summary?: string;
  source_label?: string;
  politicalHue?: {
    slug: string;
    label: string;
    color: string;
    confidence: number;
  };
}

interface Snapshot {
  fetched_at: string;
  items: RenifleurItem[];
}

interface Seat {
  candidate_slug: string | null;
  candidate_label: string | null;
  candidate_color: string | null;
  articles: number;
}

interface ThemeBanc {
  theme_id: string;
  theme_label: string;
  theme_color: string;
  articles: number;
  pct_of_window: number;
  seats: Seat[];
  unnamed_articles: number;
}

function parseDay(iso: string): string | null {
  const m = String(iso || '').match(/^(\d{4}-\d{2}-\d{2})/);
  return m ? m[1]! : null;
}

function daysAgoIso(n: number, from = new Date()): string {
  const d = new Date(from);
  d.setUTCDate(d.getUTCDate() - n);
  return d.toISOString().slice(0, 10);
}

async function main(): Promise<void> {
  const raw = await readFile(IN, 'utf8');
  const snapshot = JSON.parse(raw) as Snapshot;
  const today = (snapshot.fetched_at || new Date().toISOString()).slice(0, 10);
  const since = daysAgoIso(WINDOW_DAYS - 1, new Date(`${today}T12:00:00Z`));

  const windowItems = snapshot.items.filter((it) => {
    const day = parseDay(it.published);
    return day !== null && day >= since && day <= today;
  });

  type Acc = {
    theme: ThemeDef;
    articles: RenifleurItem[];
    byCandidate: Map<string, { label: string; color: string; count: number }>;
    unnamed: number;
  };

  const byTheme = new Map<string, Acc>();
  for (const theme of [...THEME_LEXICON, THEME_UNCLASSIFIED]) {
    byTheme.set(theme.id, {
      theme,
      articles: [],
      byCandidate: new Map(),
      unnamed: 0,
    });
  }

  for (const item of windowItems) {
    const theme = matchTheme(item.title, item.summary || '');
    const acc = byTheme.get(theme.id)!;
    acc.articles.push(item);
    const hue = item.politicalHue;
    if (
      hue &&
      hue.slug &&
      hue.slug !== 'pluraliste' &&
      typeof hue.confidence === 'number' &&
      hue.confidence >= MIN_CONFIDENCE
    ) {
      const prev = acc.byCandidate.get(hue.slug);
      if (prev) prev.count += 1;
      else
        acc.byCandidate.set(hue.slug, {
          label: hue.label,
          color: hue.color,
          count: 1,
        });
    } else {
      acc.unnamed += 1;
    }
  }

  const total = windowItems.length || 1;
  const bancs: ThemeBanc[] = [...byTheme.values()]
    .filter((a) => a.articles.length > 0)
    .map((a) => {
      const seats: Seat[] = [...a.byCandidate.entries()]
        .map(([slug, v]) => ({
          candidate_slug: slug,
          candidate_label: v.label,
          candidate_color: v.color,
          articles: v.count,
        }))
        .sort((x, y) => y.articles - x.articles || (x.candidate_slug || '').localeCompare(y.candidate_slug || ''));
      return {
        theme_id: a.theme.id,
        theme_label: a.theme.label,
        theme_color: a.theme.color,
        articles: a.articles.length,
        pct_of_window: Math.round((a.articles.length / total) * 1000) / 10,
        seats,
        unnamed_articles: a.unnamed,
      };
    })
    .sort((a, b) => b.articles - a.articles || a.theme_label.localeCompare(b.theme_label, 'fr'));

  const top = bancs[0];
  const lead =
    top && windowItems.length > 0
      ? `Sur ${windowItems.length} articles de presse du ${since} au ${today}, le sujet le plus cité est ${top.theme_label} (${top.articles} articles).`
      : `Aucun article dans la fenêtre ${since} → ${today}.`;

  const payload = {
    generated_at: new Date().toISOString(),
    source: 'src/data/renifleur/latest.json',
    window_days: WINDOW_DAYS,
    window_from: since,
    window_to: today,
    min_confidence: MIN_CONFIDENCE,
    articles_in_window: windowItems.length,
    lead,
    disclaimer:
      'Source secondaire (RSS presse). Part de la presse collectée, pas une intention de vote. Ce n’est pas un classement de candidats ni un sondage.',
    doe: 'La démocratie avant l’élimination — on montre qui occupe quel sujet dans la presse, pas qui gagne.',
    bancs,
  };

  await writeFile(OUT, `${JSON.stringify(payload, null, 2)}\n`, 'utf8');
  console.log(
    `Assemblée sujets — ${windowItems.length} articles (${since}→${today}) · ${bancs.length} thèmes → ${OUT}`,
  );
  if (top) console.log(`  top: ${top.theme_label} (${top.articles})`);
}

main().catch((err: unknown) => {
  console.error(err);
  process.exit(1);
});
