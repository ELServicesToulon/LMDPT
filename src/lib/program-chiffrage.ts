import type { ProgramCandidateFile, ProgramChiffrage } from './program-types';

const ROUND_TOLERANCE = 2; // Md€

export interface ChiffrageLintIssue {
  file: string;
  chiffrageId: string;
  message: string;
}

export function lintChiffrage(c: ProgramChiffrage): string[] {
  const issues: string[] = [];
  if (!c.source_url && !c.source_label && !c.method_note) {
    issues.push('source_url, source_label ou method_note requis');
  }
  if (c.auteur === 'lmdpt' && !c.method_note) {
    issues.push('chiffrage lmdpt sans method_note');
  }
  if (
    c.montant_min_mdeur != null &&
    c.montant_max_mdeur != null &&
    c.montant_min_mdeur > c.montant_max_mdeur
  ) {
    issues.push('montant_min > montant_max');
  }
  return issues;
}

export function lintCandidateFile(file: ProgramCandidateFile): ChiffrageLintIssue[] {
  const issues: ChiffrageLintIssue[] = [];
  const label = `${file.scrutin}/${file.candidate.slug}`;

  for (const m of file.measures) {
    if (!m.label?.trim()) {
      issues.push({ file: label, chiffrageId: m.id, message: 'mesure sans label' });
    }
  }

  for (const c of file.chiffrages) {
    for (const msg of lintChiffrage(c)) {
      issues.push({ file: label, chiffrageId: c.id, message: msg });
    }
  }

  const recettesC = file.chiffrages.find((x) => x.type === 'recettes' && x.auteur === 'candidat');
  const depensesC = file.chiffrages.find((x) => x.type === 'depenses' && x.auteur === 'candidat');
  const soldeC = file.chiffrages.find((x) => x.type === 'solde' && x.auteur === 'candidat');

  if (recettesC && depensesC && soldeC) {
    const implied = recettesC.montant_mdeur - depensesC.montant_mdeur;
    if (Math.abs(implied - soldeC.montant_mdeur) > ROUND_TOLERANCE) {
      issues.push({
        file: label,
        chiffrageId: soldeC.id,
        message: `solde candidat incohérent: recettes-dépenses=${implied}, déclaré=${soldeC.montant_mdeur}`,
      });
    }
  }

  return issues;
}

export function lintAllProgramFiles(files: ProgramCandidateFile[]): ChiffrageLintIssue[] {
  return files.flatMap(lintCandidateFile);
}
