import type { WideDeptRow } from './department-build';
import { normalizeDeptCode } from './department-build';
import { parseFrenchNumber } from './department-parse';

type SheetRow = Array<string | number>;

/** Parse la feuille « Départements Tour 1 » du XLS 2017 (format large). */
export function parse2017DepartmentSheet(rows: SheetRow[]): WideDeptRow[] {
  const headerIdx = rows.findIndex(
    (r) => String(r[0] ?? '').includes('Code du département') || String(r[0] ?? '') === 'Code du département',
  );
  if (headerIdx < 0) return [];

  const result: WideDeptRow[] = [];
  for (let i = headerIdx + 1; i < rows.length; i += 1) {
    const row = rows[i]!;
    const codeRaw = row[0];
    if (codeRaw === '' || codeRaw === undefined) continue;

    const code = normalizeDeptCode(codeRaw);
    const libelle = String(row[1] ?? '');
    const inscrits = parseFrenchNumber(row[2] ?? 0);
    const exprimes = parseFrenchNumber(row[13] ?? 0);

    const candidates: WideDeptRow['candidates'] = [];
    for (let col = 16; col + 5 < row.length; col += 6) {
      const nom = String(row[col + 1] ?? '').trim();
      const prenom = String(row[col + 2] ?? '').trim();
      const voix = parseFrenchNumber(row[col + 3] ?? 0);
      if (!nom || !prenom || voix <= 0) continue;
      candidates.push({
        nom,
        prenom,
        voix,
        pctExprimes: parseFrenchNumber(row[col + 5] ?? 0),
      });
    }

    if (candidates.length > 0) {
      result.push({ code, libelle, inscrits, exprimes, candidates });
    }
  }

  return result;
}
