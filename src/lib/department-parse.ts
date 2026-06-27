/** Parsing des fichiers officiels Ministère de l'Intérieur (data.gouv.fr). */

export const PRESIDENTIELLE_2022_DEPT_SOURCE_URL =
  'https://static.data.gouv.fr/resources/election-presidentielle-des-10-et-24-avril-2022-resultats-definitifs-du-1er-tour/20220414-152356/resultats-par-niveau-dpt-t1-france-entiere.txt';

export const PRESIDENTIELLE_2017_DEPT_SOURCE_URL =
  'https://static.data.gouv.fr/resources/election-presidentielle-des-23-avril-et-7-mai-2017-resultats-definitifs-du-1er-tour-1/20170427-100131/Presidentielle_2017_Resultats_Tour_1_c.xls';

export { candidateSlug } from './candidate-style';

export function parseFrenchNumber(value: string | number): number {
  if (typeof value === 'number') return value;
  return Number(String(value).replace(/\s/g, '').replace(',', '.'));
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
