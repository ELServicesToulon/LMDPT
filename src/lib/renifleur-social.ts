import type { RenifleurItem, RenifleurSnapshot } from './renifleur';
import { ensureItemPoliticalHue } from './renifleur';
import { applyQualiteToDraftMarkdown, reviewQualiteRedaction } from './qualite-redaction';
import { hueBadgesForText, type HueBadge } from './comment-politics';

const SITE_DOSSIER =
  'https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic&utm_campaign=renifleur';

const MAX_TWEET = 280;

export interface RenifleurSocialDraftOptions {
  /** Nombre d'articles à proposer (1 post principal + alternatives). */
  maxItems?: number;
  /** Slug UTM campaign (défaut : renifleur_YYYYMMDD). */
  utmCampaign?: string;
  siteLink?: string;
}

export function truncateForX(text: string, max = MAX_TWEET): string {
  const normalized = text.replace(/\s+/g, ' ').trim();
  if (normalized.length <= max) return normalized;
  return `${normalized.slice(0, max - 1).trimEnd()}…`;
}

/** Sélectionne les articles les plus récents (déjà triés par date desc). */
export function pickDraftItems(items: RenifleurItem[], maxItems = 3): RenifleurItem[] {
  return items.slice(0, Math.max(1, maxItems));
}

function formatSourceLine(item: RenifleurItem): string {
  return `${item.source_label} · ${item.published}`;
}

/** Badges couleurs d’idées obligatoires pour toute publication (site + draft social). */
export function ideaColorBadgesForItem(item: RenifleurItem): HueBadge[] {
  const withHue = ensureItemPoliticalHue(item);
  const multi = hueBadgesForText(`${withHue.title}\n${withHue.summary ?? ''}`, 3);
  if (multi.length > 0) return multi;
  if (withHue.politicalHue) {
    return [
      {
        slug: withHue.politicalHue.slug,
        label: withHue.politicalHue.label,
        color: withHue.politicalHue.color,
        rationale: withHue.politicalHue.rationale,
        confidence: withHue.politicalHue.confidence,
      },
    ];
  }
  return [{ slug: 'pluraliste', label: 'Pluraliste / transversal 1er tour', color: '#5a6570' }];
}

function formatHueLine(badges: HueBadge[]): string {
  return badges.map((b) => `● ${b.label} (${b.color})`).join(' · ');
}

/** Copy X factuelle — presse secondaire, pas de prédiction. */
export function buildPostCopy(item: RenifleurItem, siteLink: string): string {
  const badges = ideaColorBadgesForItem(item);
  const hueTag =
    badges.length === 1
      ? `[${badges[0]!.label}]`
      : `[${badges.map((b) => b.label.split(' / ')[0] ?? b.label).join(' · ')}]`;
  const prefix = `Veille presse ${hueTag} — `;
  const suffix = `\n\n${siteLink}#renifleur-presse`;
  const maxTitleLen = Math.max(40, MAX_TWEET - prefix.length - suffix.length);
  const rawHeadline = item.title.replace(/\s+/g, ' ').trim();
  // Gate qualité : mots accolés / typos avant troncature X
  const cleaned = reviewQualiteRedaction(rawHeadline).corrected;
  const headline = truncateForX(cleaned, maxTitleLen);
  return `${prefix}${headline}${suffix}`;
}

export function buildRenifleurSocialDraft(
  snapshot: RenifleurSnapshot,
  options: RenifleurSocialDraftOptions = {},
): string {
  const date = snapshot.fetched_at.slice(0, 10);
  const campaign = options.utmCampaign ?? `renifleur_${date.replace(/-/g, '')}`;
  const siteLink =
    options.siteLink ??
    `https://lmdpt.iarbre.org/analyses/presidentielle-2027-preparation?utm_source=x&utm_medium=organic&utm_campaign=${campaign}`;

  const items = pickDraftItems(snapshot.items, options.maxItems ?? 3);
  const fetchedLabel = new Date(snapshot.fetched_at).toLocaleString('fr-FR', {
    dateStyle: 'short',
    timeStyle: 'short',
  });

  let md = `# Brouillon X auto — renifleur (${date})\n\n`;
  md += `**Statut** : draft — revue humaine obligatoire (\`docs/REVIEW.md\`)\n`;
  md += `**Généré** : ${fetchedLabel} · ${snapshot.items.length} articles · ${snapshot.feeds_ok} flux OK\n`;
  md += `**Compte** : @LMDuPremierTour\n\n`;
  md += `> ${snapshot.disclaimer}\n\n`;
  md += `---\n\n`;

  if (items.length === 0) {
    md += `## Aucun article\n\nRenifleur vide — relancer \`npm run renifleur\`.\n`;
    return md;
  }

  const mainBadges = ideaColorBadgesForItem(items[0]!);

  md += `## Post recommandé (principal)\n\n`;
  md += `**Source** : [${items[0]!.title}](${items[0]!.url}) — ${formatSourceLine(items[0]!)}\n`;
  md += `**Couleurs d’idées** : ${formatHueLine(mainBadges)}\n`;
  md += `**Type** : single · ne pas extrapoler au-delà du titre/summary\n\n`;
  md += '### Copy\n\n';
  md += '```\n';
  md += buildPostCopy(items[0]!, siteLink);
  md += '\n```\n\n';
  md += `### Risques\n\n`;
  md += `- Presse = source secondaire · pas de favori / sondage / prédiction\n`;
  md += `- Vérifier le titre avant publication\n\n`;

  if (items.length > 1) {
    md += `## Alternatives\n\n`;
    for (let i = 1; i < items.length; i += 1) {
      const item = items[i]!;
      const badges = ideaColorBadgesForItem(item);
      md += `### Alt ${i} — ${item.source_label}\n\n`;
      md += `**Source** : [${item.title}](${item.url}) — ${item.published}\n`;
      md += `**Couleurs d’idées** : ${formatHueLine(badges)}\n\n`;
      md += '```\n';
      md += buildPostCopy(item, siteLink);
      md += '\n```\n\n';
    }
  }

  md += `## Gate REVIEW\n\n`;
  md += `- [ ] Aucun sondage / tier list\n`;
  md += `- [ ] Lien site avec UTM OK\n`;
  md += `- [ ] Badge(s) couleurs d’idées (copy et/ou visuel)\n`;
  md += `- [ ] Revue humaine Président\n`;
  md += `- [ ] Cocher \`publication-log.md\` après publish\n`;

  // Gate qualité rédaction (mots accolés, typos) — agent /lmdpt-qualite-redaction
  const { markdown: withQualite } = applyQualiteToDraftMarkdown(md);
  return withQualite;
}

export { SITE_DOSSIER, MAX_TWEET };
