/** Parsing des fichiers officiels Ministère de l'Intérieur (data.gouv.fr). */

export const PRESIDENTIELLE_2022_DEPT_SOURCE_URL =
  'https://static.data.gouv.fr/resources/election-presidentielle-des-10-et-24-avril-2022-resultats-definitifs-du-1er-tour/20220414-152356/resultats-par-niveau-dpt-t1-france-entiere.txt';

export const CANDIDATE_SLUGS = [
  'macron',
  'le-pen',
  'melenchon',
  'zemmour',
  'pecresse',
  'jadot',
  'lassalle',
  'roussel',
  'dupont-aignan',
  'hidalgo',
  'poutou',
  'arthaud',
] as const;

export type CandidateSlug = (typeof CANDIDATE_SLUGS)[number];

export const CANDIDATE_COLORS: Record<CandidateSlug, string> = {
  macron: '#1e4d6b',
  'le-pen': '#5c4a72',
  melenchon: '#c0392b',
  zemmour: '#8b6914',
  pecresse: '#0066cc',
  jadot: '#2d8a4e',
  lassalle: '#6b8e23',
  roussel: '#cc3333',
  'dupont-aignan': '#336699',
  hidalgo: '#e91e8c',
  poutou: '#555555',
  arthaud: '#990000',
};

export const CANDIDATE_LABELS: Record<CandidateSlug, string> = {
  macron: 'Macron',
  'le-pen': 'Le Pen',
  melenchon: 'Mélenchon',
  zemmour: 'Zemmour',
  pecresse: 'Pécresse',
  jadot: 'Jadot',
  lassalle: 'Lassalle',
  roussel: 'Roussel',
  'dupont-aignan': 'Dupont-Aignan',
  hidalgo: 'Hidalgo',
  poutou: 'Poutou',
  arthaud: 'Arthaud',
};

export function candidateSlug(nom: string, prenom: string): CandidateSlug {
  const key = `${prenom} ${nom}`.normalize('NFD').replace(/\p{M}/gu, '').toUpperCase();
  if (key.includes('MACRON')) return 'macron';
  if (key.includes('LE PEN')) return 'le-pen';
  if (key.includes('MELENCHON')) return 'melenchon';
  if (key.includes('ZEMMOUR')) return 'zemmour';
  if (key.includes('PECRESSE')) return 'pecresse';
  if (key.includes('JADOT')) return 'jadot';
  if (key.includes('LASSALLE')) return 'lassalle';
  if (key.includes('ROUSSEL')) return 'roussel';
  if (key.includes('DUPONT')) return 'dupont-aignan';
  if (key.includes('HIDALGO')) return 'hidalgo';
  if (key.includes('POUTOU')) return 'poutou';
  return 'arthaud';
}

export function parseFrenchNumber(value: string): number {
  return Number(value.replace(/\s/g, '').replace(',', '.'));
}

export interface RawDeptRow {
  code: string;
  libelle: string;
  inscrits: number;
  exprimes: number;
  nom: string;
  prenom: string;
  voix: number;
  pctExprimes: number;
}

export function parseDepartmentTxt(content: string): RawDeptRow[] {
  const lines = content.split(/\r?\n/).filter(Boolean);
  if (lines.length < 2) return [];

  const rows: RawDeptRow[] = [];
  for (let i = 1; i < lines.length; i += 1) {
    const cols = lines[i]!.split(';');
    if (cols.length < 23) continue;
    rows.push({
      code: cols[0]!,
      libelle: cols[1]!,
      inscrits: parseFrenchNumber(cols[3]!),
      exprimes: parseFrenchNumber(cols[14]!),
      nom: cols[18]!,
      prenom: cols[19]!,
      voix: parseFrenchNumber(cols[20]!),
      pctExprimes: parseFrenchNumber(cols[22]!),
    });
  }
  return rows;
}
