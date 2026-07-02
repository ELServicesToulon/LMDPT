import { describe, expect, it } from 'vitest';
import {
  decodeXmlText,
  filterFeedItems,
  getRenifleurConfig,
  matchesTopic,
  parseRssItems,
  shouldExclude,
} from './renifleur';

const SAMPLE_RSS = `<?xml version="1.0"?>
<rss><channel>
<item>
  <title><![CDATA[Présidentielle 2027 : calendrier officialisé]]></title>
  <link>https://example.com/a</link>
  <pubDate>Wed, 01 Jul 2026 12:00:00 GMT</pubDate>
  <description><![CDATA[Le premier tour aura lieu le 18 avril.]]></description>
</item>
<item>
  <title>Dernier sondage IFOP pour 2027</title>
  <link>https://example.com/b</link>
  <pubDate>Tue, 30 Jun 2026 12:00:00 GMT</pubDate>
  <description>Baromètre intentions de vote</description>
</item>
<item>
  <title>Canicule en France</title>
  <link>https://example.com/c</link>
  <pubDate>Mon, 29 Jun 2026 12:00:00 GMT</pubDate>
  <description>Vague de chaleur</description>
</item>
</channel></rss>`;

describe('renifleur', () => {
  it('config enables traditional media', () => {
    const cfg = getRenifleurConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.traditional_media).toBe(true);
    expect(cfg.feeds.some((f) => f.type === 'traditional')).toBe(true);
  });

  it('parses RSS items', () => {
    const items = parseRssItems(SAMPLE_RSS);
    expect(items).toHaveLength(3);
    expect(items[0]?.title).toContain('Présidentielle 2027');
  });

  it('decodes CDATA', () => {
    expect(decodeXmlText('<![CDATA[Présidentielle &amp; 2027]]>')).toBe('Présidentielle & 2027');
  });

  it('matches topic keywords with accents', () => {
    expect(matchesTopic('Élection présidentielle 2027', ['presidentielle', '2027'])).toBe(true);
  });

  it('excludes poll headlines', () => {
    expect(shouldExclude('Dernier sondage IFOP', ['sondage'])).toBe(true);
  });

  it('filters keyword feeds and drops polls', () => {
    const cfg = getRenifleurConfig();
    const parsed = parseRssItems(SAMPLE_RSS);
    const feed = { id: 'test', label: 'Test', url: '', type: 'traditional' as const, filter: 'keywords' as const };
    const out = filterFeedItems(parsed, feed, cfg);
    expect(out.map((i) => i.url)).toEqual(['https://example.com/a']);
    expect(out[0]?.published).toBe('2026-07-01');
  });
});
