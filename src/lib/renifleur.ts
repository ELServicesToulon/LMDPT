import config from '../data/renifleur/config.json';

export interface RenifleurFeed {
  id: string;
  label: string;
  url: string;
  type: 'traditional' | 'official';
  filter: 'none' | 'keywords';
}

export interface RenifleurConfig {
  enabled: boolean;
  traditional_media: boolean;
  user_agent: string;
  max_items_per_feed: number;
  max_total_items: number;
  exclude_patterns: string[];
  topic_keywords: string[];
  feeds: RenifleurFeed[];
  disclaimer: string;
}

export interface RenifleurItem {
  title: string;
  url: string;
  published: string;
  summary: string;
  source_id: string;
  source_label: string;
  source_type: 'traditional';
}

export interface RenifleurSnapshot {
  fetched_at: string;
  enabled: boolean;
  traditional_media: boolean;
  disclaimer: string;
  feeds_ok: number;
  feeds_error: number;
  items: RenifleurItem[];
}

export function getRenifleurConfig(): RenifleurConfig {
  return config as RenifleurConfig;
}

/** Décode les entités XML/HTML courantes dans les flux RSS. */
export function decodeXmlText(value: string): string {
  return value
    .replace(/<!\[CDATA\[([\s\S]*?)\]\]>/g, '$1')
    .replace(/&amp;/g, '&')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/<[^>]+>/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Parse minimaliste RSS 2.0 — suffisant pour France 24 / Le Monde. */
export function parseRssItems(xml: string): Array<{ title: string; url: string; published: string; summary: string }> {
  const items: Array<{ title: string; url: string; published: string; summary: string }> = [];
  const itemRegex = /<item\b[^>]*>([\s\S]*?)<\/item>/gi;
  let match: RegExpExecArray | null;

  while ((match = itemRegex.exec(xml)) !== null) {
    const block = match[1] ?? '';
    const title = decodeXmlText(extractTag(block, 'title') ?? '');
    const url = (extractTag(block, 'link') ?? extractGuidLink(block) ?? '').trim();
    const published = (extractTag(block, 'pubDate') ?? '').trim();
    const summary = decodeXmlText(extractTag(block, 'description') ?? '');
    if (title && url) {
      items.push({ title, url, published, summary });
    }
  }

  return items;
}

function extractTag(block: string, tag: string): string | undefined {
  const re = new RegExp(`<${tag}[^>]*>([\\s\\S]*?)<\\/${tag}>`, 'i');
  const m = block.match(re);
  return m?.[1];
}

function extractGuidLink(block: string): string | undefined {
  const m = block.match(/<guid[^>]*isPermaLink="true"[^>]*>([^<]+)<\/guid>/i);
  return m?.[1];
}

export function normalizeForMatch(text: string): string {
  return text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase();
}

export function matchesTopic(text: string, keywords: string[]): boolean {
  const hay = normalizeForMatch(text);
  return keywords.some((kw) => hay.includes(normalizeForMatch(kw)));
}

export function shouldExclude(text: string, patterns: string[]): boolean {
  const hay = normalizeForMatch(text);
  return patterns.some((p) => hay.includes(normalizeForMatch(p)));
}

export function toIsoDate(pubDate: string): string {
  const parsed = Date.parse(pubDate);
  if (Number.isNaN(parsed)) return pubDate.slice(0, 10) || new Date().toISOString().slice(0, 10);
  return new Date(parsed).toISOString().slice(0, 10);
}

export function filterFeedItems(
  rawItems: Array<{ title: string; url: string; published: string; summary: string }>,
  feed: RenifleurFeed,
  cfg: RenifleurConfig,
): RenifleurItem[] {
  const selected = rawItems
    .filter((item) => {
      const blob = `${item.title} ${item.summary}`;
      if (shouldExclude(blob, cfg.exclude_patterns)) return false;
      if (feed.filter === 'keywords') {
        return matchesTopic(blob, cfg.topic_keywords);
      }
      return true;
    })
    .slice(0, cfg.max_items_per_feed)
    .map((item) => ({
      title: item.title,
      url: item.url,
      published: toIsoDate(item.published),
      summary: item.summary.slice(0, 280),
      source_id: feed.id,
      source_label: feed.label,
      source_type: 'traditional' as const,
    }));

  return selected;
}

export async function fetchRenifleurSnapshot(
  fetchImpl: typeof fetch = fetch,
): Promise<RenifleurSnapshot> {
  const cfg = getRenifleurConfig();
  const fetchedAt = new Date().toISOString();

  if (!cfg.enabled) {
    return {
      fetched_at: fetchedAt,
      enabled: false,
      traditional_media: cfg.traditional_media,
      disclaimer: cfg.disclaimer,
      feeds_ok: 0,
      feeds_error: 0,
      items: [],
    };
  }

  const feeds = cfg.traditional_media
    ? cfg.feeds.filter((f) => f.type === 'traditional')
    : cfg.feeds;

  const collected: RenifleurItem[] = [];
  let feedsOk = 0;
  let feedsError = 0;
  const seen = new Set<string>();

  for (const feed of feeds) {
    try {
      const res = await fetchImpl(feed.url, {
        headers: { 'User-Agent': cfg.user_agent, Accept: 'application/rss+xml, application/xml, text/xml' },
        signal: AbortSignal.timeout(15_000),
      });
      if (!res.ok) {
        feedsError += 1;
        continue;
      }
      const xml = await res.text();
      const parsed = parseRssItems(xml);
      const filtered = filterFeedItems(parsed, feed, cfg);
      for (const item of filtered) {
        if (seen.has(item.url)) continue;
        seen.add(item.url);
        collected.push(item);
      }
      feedsOk += 1;
    } catch {
      feedsError += 1;
    }
  }

  collected.sort((a, b) => b.published.localeCompare(a.published));

  return {
    fetched_at: fetchedAt,
    enabled: true,
    traditional_media: cfg.traditional_media,
    disclaimer: cfg.disclaimer,
    feeds_ok: feedsOk,
    feeds_error: feedsError,
    items: collected.slice(0, cfg.max_total_items),
  };
}
