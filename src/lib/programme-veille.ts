import type { RenifleurItem } from './renifleur';

export const PROGRAM_VEILLE_KEYWORDS = [
  'programme',
  'projet',
  'propositions',
  'primaire',
  'chiffrage',
  'mesures',
  'financement',
  'jugement',
  'éligib',
  'présidentielle 2027',
] as const;

export interface ProgramPressSignal {
  title: string;
  url: string;
  published?: string;
  detected_at: string;
}

export interface VeilleCandidateInput {
  slug: string;
  name: string;
}

export function matchesProgramNews(text: string, keywords: readonly string[] = PROGRAM_VEILLE_KEYWORDS): boolean {
  const lower = text.toLowerCase();
  return keywords.some((k) => lower.includes(k.toLowerCase()));
}

function candidateNameTokens(name: string): string[] {
  const parts = name
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .split(/\s+/)
    .filter(Boolean);
  const last = parts[parts.length - 1];
  return last ? [last] : [];
}

export function articleMentionsCandidate(
  item: Pick<RenifleurItem, 'title' | 'summary'>,
  candidate: VeilleCandidateInput,
): boolean {
  const blob = `${item.title} ${item.summary ?? ''}`.toLowerCase();
  const tokens = candidateNameTokens(candidate.name);
  if (tokens.length === 0) return false;
  return tokens.some((token) => {
    const re = new RegExp(`\\b${token.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`, 'i');
    return re.test(blob);
  });
}

/** Articles renifleur liés aux programmes (mots-clés), triés par date desc. */
export function filterProgramNewsItems(items: RenifleurItem[]): RenifleurItem[] {
  return items.filter((item) => matchesProgramNews(`${item.title} ${item.summary ?? ''}`));
}

/** Signaux presse par candidat (max N par personne). */
export function findPressSignalsForCandidates(
  items: RenifleurItem[],
  candidates: VeilleCandidateInput[],
  options: { maxPerCandidate?: number; detectedAt?: string } = {},
): Map<string, ProgramPressSignal[]> {
  const max = options.maxPerCandidate ?? 2;
  const detectedAt = options.detectedAt ?? new Date().toISOString().slice(0, 10);
  const programItems = filterProgramNewsItems(items);
  const out = new Map<string, ProgramPressSignal[]>();

  for (const candidate of candidates) {
    const related = programItems.filter((item) => articleMentionsCandidate(item, candidate));
    if (related.length === 0) continue;
    out.set(
      candidate.slug,
      related.slice(0, max).map((item) => ({
        title: item.title,
        url: item.url,
        published: item.published,
        detected_at: detectedAt,
      })),
    );
  }

  return out;
}
