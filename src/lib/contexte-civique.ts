/**
 * Contexte civique 2027 — militantisme + convictions (cadre laïque).
 * Garde-fous : RGPD art. 9 · revendiqué vs supposé · pas d'inférence.
 */

export type MilitantismeStatus =
  | 'engagement_partisan_public'
  | 'association_documentee'
  | 'non_renseigne';

export type ConvictionStatus =
  | 'revendique'
  | 'suppose_par_sources'
  | 'non_renseigne'
  | 'refuse_de_dire';

export type ConvictionKind =
  | 'religion'
  | 'atheisme'
  | 'agnosticisme'
  | 'autre_philosophique'
  | null;

export interface CiviqueSource {
  label: string;
  url: string;
  as_of?: string;
}

export interface MilitantismeBlock {
  status: MilitantismeStatus;
  summary: string | null;
  sources: CiviqueSource[];
}

export interface ConvictionBlock {
  status: ConvictionStatus;
  kind: ConvictionKind;
  label: string | null;
  summary: string | null;
  sources: CiviqueSource[];
  editorial_note?: string | null;
}

export interface ContexteCiviqueEntry {
  slug: string;
  name: string;
  affiliation: string;
  militantisme: MilitantismeBlock;
  conviction: ConvictionBlock;
}

export interface LaiciteNote {
  title: string;
  paragraphs: string[];
}

export interface ContexteCiviqueFile {
  schema: string;
  title: string;
  updated: string;
  disclaimer: string;
  legal_note: string;
  laicite_note: LaiciteNote;
  status_labels: {
    militantisme: Record<string, string>;
    conviction: Record<string, string>;
  };
  kind_labels: Record<string, string>;
  sources: CiviqueSource[];
  entries: ContexteCiviqueEntry[];
}

const MILITANT_OK = new Set<MilitantismeStatus>([
  'engagement_partisan_public',
  'association_documentee',
  'non_renseigne',
]);

const CONVICTION_OK = new Set<ConvictionStatus>([
  'revendique',
  'suppose_par_sources',
  'non_renseigne',
  'refuse_de_dire',
]);

function httpOk(url: string): boolean {
  return url.startsWith('http://') || url.startsWith('https://') || url.startsWith('/');
}

/** Échec soft : liste de problèmes (tests / ops). */
export function validateContexteCivique(data: ContexteCiviqueFile): string[] {
  const problems: string[] = [];
  if (data.schema !== 'lmdpt-contexte-civique-v1') {
    problems.push(`schema inattendu: ${data.schema}`);
  }
  if (!data.laicite_note?.paragraphs?.length) {
    problems.push('laicite_note.paragraphs manquant');
  }
  if (!data.legal_note?.includes('RGPD') && !data.legal_note?.includes('art. 9')) {
    problems.push('legal_note doit mentionner RGPD / art. 9');
  }
  if (!Array.isArray(data.entries) || data.entries.length === 0) {
    problems.push('entries vide');
  }
  const slugs = new Set<string>();
  for (const e of data.entries ?? []) {
    if (!e.slug) problems.push('entrée sans slug');
    else if (slugs.has(e.slug)) problems.push(`slug dupliqué: ${e.slug}`);
    else slugs.add(e.slug);
    if (!e.name) problems.push(`${e.slug}: name manquant`);

    const m = e.militantisme;
    if (!m || !MILITANT_OK.has(m.status)) {
      problems.push(`${e.slug}: militantisme.status invalide`);
    } else if (m.status !== 'non_renseigne') {
      if (!m.summary) problems.push(`${e.slug}: militantisme.summary requis`);
      if (!m.sources?.length) problems.push(`${e.slug}: militantisme.sources requis`);
      for (const s of m.sources ?? []) {
        if (!httpOk(s.url)) problems.push(`${e.slug}: militantisme source URL invalide`);
      }
    }

    const c = e.conviction;
    if (!c || !CONVICTION_OK.has(c.status)) {
      problems.push(`${e.slug}: conviction.status invalide`);
      continue;
    }
    if (c.status === 'revendique') {
      if (!c.kind) problems.push(`${e.slug}: conviction.kind requis (revendique)`);
      if (!c.label) problems.push(`${e.slug}: conviction.label requis (revendique)`);
      if (!c.sources?.length) {
        problems.push(`${e.slug}: ≥1 source primaire requise (revendique)`);
      }
    }
    if (c.status === 'suppose_par_sources') {
      if ((c.sources?.length ?? 0) < 2) {
        problems.push(`${e.slug}: ≥2 sources secondaires requises (suppose)`);
      }
      if (!c.summary?.toLowerCase().includes('suppos')) {
        problems.push(`${e.slug}: summary doit étiqueter la supposition`);
      }
    }
    if (c.status === 'non_renseigne') {
      if (c.label || c.kind) {
        problems.push(`${e.slug}: non_renseigne ne doit pas porter label/kind`);
      }
    }
    for (const s of c.sources ?? []) {
      if (!httpOk(s.url)) problems.push(`${e.slug}: conviction source URL invalide`);
    }
  }
  return problems;
}

export function sortEntriesByName(entries: ContexteCiviqueEntry[]): ContexteCiviqueEntry[] {
  return [...entries].sort((a, b) => a.name.localeCompare(b.name, 'fr'));
}
