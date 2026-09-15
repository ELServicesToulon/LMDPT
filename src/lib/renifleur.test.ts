import { describe, expect, it } from 'vitest';
import {
  capItemsByHostShare,
  decodeXmlText,
  ensureItemPoliticalHue,
  filterFeedItems,
  getRenifleurConfig,
  hostFromUrl,
  matchesTopic,
  parseRssItems,
  politicalHueForArticle,
  shouldExclude,
  type RenifleurItem,
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

function item(url: string, sourceId = 'src', published = '2026-09-15'): RenifleurItem {
  return {
    title: 'Article',
    url,
    published,
    summary: '',
    source_id: sourceId,
    source_label: sourceId,
    source_type: 'traditional',
  };
}

describe('renifleur', () => {
  it('config enables traditional media', () => {
    const cfg = getRenifleurConfig();
    expect(cfg.enabled).toBe(true);
    expect(cfg.traditional_media).toBe(true);
    expect(cfg.feeds.some((f) => f.type === 'traditional')).toBe(true);
  });

  it('config keeps poll excludes, 2027 keywords, and multi-source feeds', () => {
    const cfg = getRenifleurConfig();
    expect(cfg.exclude_patterns).toEqual(
      expect.arrayContaining(['sondage', 'baromètre', 'intentions de vote']),
    );
    expect(cfg.topic_keywords).toEqual(expect.arrayContaining(['présidentielle', '2027']));
    expect(cfg.max_share_per_host).toBeLessThanOrEqual(0.4);
    expect(cfg.feeds.filter((f) => f.filter === 'keywords').length).toBeGreaterThanOrEqual(6);
    const ids = cfg.feeds.map((f) => f.id);
    expect(ids).toEqual(
      expect.arrayContaining([
        'lemonde-presidentielle-2027',
        'france24-france',
        'lefigaro-politique',
        'liberation-politique',
        'lacroix-politique',
        'publicsenat',
        'assemblee-communiques',
        'franceinfo-politique',
      ]),
    );
    const hosts = new Set(
      cfg.feeds.map((f) => hostFromUrl(f.url)).filter((h) => h.length > 0),
    );
    expect(hosts.size).toBeGreaterThanOrEqual(6);
  });

  it('hostFromUrl strips www', () => {
    expect(hostFromUrl('https://www.lemonde.fr/politique/article.html')).toBe('lemonde.fr');
    expect(hostFromUrl('not-a-url')).toBe('');
  });

  it('caps per-host share while keeping recency order', () => {
    const items = [
      item('https://www.lemonde.fr/a', 'lemonde', '2026-09-15'),
      item('https://www.lemonde.fr/b', 'lemonde', '2026-09-14'),
      item('https://www.lefigaro.fr/c', 'figaro', '2026-09-13'),
      item('https://www.lemonde.fr/d', 'lemonde', '2026-09-12'),
      item('https://www.liberation.fr/e', 'libe', '2026-09-11'),
    ];
    const out = capItemsByHostShare(items, 0.4, 5);
    expect(out.map((i) => i.url)).toEqual([
      'https://www.lemonde.fr/a',
      'https://www.lemonde.fr/b',
      'https://www.lefigaro.fr/c',
      'https://www.liberation.fr/e',
    ]);
    expect(out.filter((i) => hostFromUrl(i.url) === 'lemonde.fr')).toHaveLength(2);
  });

  it('still includes a slightly older host instead of filling with same-day majority', () => {
    const items = [
      item('https://www.lemonde.fr/1', 'lemonde', '2026-09-15'),
      item('https://www.lemonde.fr/2', 'lemonde', '2026-09-15'),
      item('https://www.lemonde.fr/3', 'lemonde', '2026-09-15'),
      item('https://www.liberation.fr/1', 'libe', '2026-09-15'),
      item('https://www.liberation.fr/2', 'libe', '2026-09-15'),
      item('https://www.liberation.fr/3', 'libe', '2026-09-15'),
      item('https://www.lefigaro.fr/1', 'figaro', '2026-09-15'),
      item('https://www.lefigaro.fr/2', 'figaro', '2026-09-15'),
      item('https://www.lefigaro.fr/3', 'figaro', '2026-09-15'),
      item('https://www.la-croix.com/1', 'croix', '2026-09-14'),
    ];
    const out = capItemsByHostShare(items, 0.4, 8);
    const hosts = out.map((i) => hostFromUrl(i.url));
    expect(hosts).toContain('la-croix.com');
    expect(hosts.filter((h) => h === 'lemonde.fr').length).toBeLessThanOrEqual(3);
  });

  it('parses RSS items', () => {
    const items = parseRssItems(SAMPLE_RSS);
    expect(items).toHaveLength(3);
    expect(items[0]?.title).toContain('Présidentielle 2027');
  });

  it('decodes CDATA', () => {
    expect(decodeXmlText('<![CDATA[Présidentielle &amp; 2027]]>')).toBe('Présidentielle & 2027');
  });

  it('decodes numeric XML entities used by franceinfo / Public Sénat', () => {
    expect(decodeXmlText('S&#xE9;bastien Lecornu')).toBe('Sébastien Lecornu');
    expect(decodeXmlText('l&#8217;impôt')).toBe('l’impôt');
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
    expect(out[0]?.politicalHue?.slug).toBeTruthy();
    expect(out[0]?.politicalHue?.color).toMatch(/^#/);
  });

  it('teinte Attal / Renaissance pour un article centré sur Attal', () => {
    const hue = politicalHueForArticle(
      'Gabriel Attal officialise sa candidature à la présidentielle 2027',
      'Le leader Renaissance annonce sa course à l’Élysée.',
    );
    expect(hue.slug).toBe('attal');
    expect(hue.color).toBe('#ffeb00');
  });

  it('teinte Le Pen / RN pour un article centré sur Marine Le Pen', () => {
    const hue = politicalHueForArticle(
      'Marine Le Pen se déclare candidate après le jugement d’appel',
      'La présidente du RN confirme sa candidature.',
    );
    expect(hue.slug).toBe('le-pen');
    expect(hue.color).toBe('#0d378a');
  });

  it('teinte pluraliste quand deux camps sont cités à force comparable', () => {
    const hue = politicalHueForArticle(
      'Présidentielle 2027 : face-à-face Attal, Mélenchon et Le Pen sur le premier tour',
      'Les camps Renaissance, LFI et RN s’affrontent sur la pluralité du scrutin.',
    );
    expect(hue.slug).toBe('pluraliste');
  });

  it('signale pluraliste quand deux camps co-dominent le titre (Attal vs Le Pen)', () => {
    const hue = politicalHueForArticle(
      'Gabriel Attal assigne Marine Le Pen pour contrefaçon sur le terme renaissance',
      'Le leader Renaissance conteste une affiche RN.',
    );
    expect(hue.slug).toBe('pluraliste');
    expect(hue.rationale.toLowerCase()).toMatch(/plusieurs camps|attal|le pen|rn/);
  });

  it('teinte Mélenchon quand LFI est le sujet unique', () => {
    const hue = politicalHueForArticle(
      'Jean-Luc Mélenchon en meeting en Bretagne',
      'Le leader de la France insoumise s’adresse aux militants LFI.',
    );
    expect(hue.slug).toBe('melenchon');
    expect(hue.color).toBe('#cc2443');
  });

  it('ensureItemPoliticalHue complète un item historique sans teinte', () => {
    const item = ensureItemPoliticalHue({
      title: 'Bernard Cazeneuve se déclare candidat et décline la primaire socialiste',
      url: 'https://example.com/caze',
      published: '2026-07-16',
      summary: 'Le social-démocrate esquisse ses propositions.',
      source_id: 'lemonde',
      source_label: 'Le Monde',
      source_type: 'traditional',
    });
    expect(item.politicalHue?.slug).toBe('parti-socialiste');
    expect(item.politicalHue?.label).toContain('Socialiste');
  });
});
