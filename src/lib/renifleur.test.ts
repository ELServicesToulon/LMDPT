import { describe, expect, it } from 'vitest';
import {
  decodeXmlText,
  ensureItemPoliticalHue,
  filterFeedItems,
  getRenifleurConfig,
  matchesTopic,
  parseRssItems,
  politicalHueForArticle,
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
