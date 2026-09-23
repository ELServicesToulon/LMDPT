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

function foldAccents(value: string): string {
  return value.normalize('NFD').replace(/\p{M}/gu, '');
}

function escapeRegExp(value: string): string {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function nameParts(name: string): string[] {
  return foldAccents(name).toLowerCase().split(/\s+/).filter(Boolean);
}

/** Every hit is "{FamilyName} {OtherName}" — the family name is used as a given name. */
function lastNameOnlyAsGivenName(text: string, last: string): boolean {
  const re = new RegExp(`\\b${escapeRegExp(last)}\\b`, 'gi');
  let saw = false;
  for (let match = re.exec(text); match; match = re.exec(text)) {
    saw = true;
    const after = text.slice(match.index + match[0].length);
    if (!/^\s+\p{Lu}\p{Ll}/u.test(after)) return false;
  }
  return saw;
}

export function articleMentionsCandidate(
  item: Pick<RenifleurItem, 'title' | 'summary'>,
  candidate: VeilleCandidateInput,
): boolean {
  const text = foldAccents(`${item.title} ${item.summary ?? ''}`);
  const parts = nameParts(candidate.name);
  const last = parts[parts.length - 1];
  if (!last) return false;
  if (!new RegExp(`\\b${escapeRegExp(last)}\\b`, 'i').test(text)) return false;
  if (parts.length < 2) return true;
  const fullName = new RegExp(`\\b${parts.map(escapeRegExp).join('\\s+')}\\b`, 'i');
  if (fullName.test(text)) return true;
  return !lastNameOnlyAsGivenName(text, last);
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
