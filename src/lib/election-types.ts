export interface ElectionCandidate {
  nom: string;
  nuance?: string;
  voix: number;
  pourcentage_exprimes: number;
  pourcentage_inscrits: number;
}

export interface ElectionNationalResults {
  inscrits: number;
  abstention_pct: number;
  votants: number;
  blancs: number;
  nuls: number;
  exprimes: number;
  candidats: ElectionCandidate[];
}

export interface ElectionDataset {
  election: string;
  date: string;
  tour: 1 | 2;
  source: string;
  source_label: string;
  national: ElectionNationalResults;
}

export interface DepartmentCandidateResult {
  slug: string;
  nom: string;
  voix: number;
  pourcentage_exprimes: number;
}

export interface DepartmentResults {
  code: string;
  nom: string;
  inscrits: number;
  exprimes: number;
  leader_slug: string;
  candidats: DepartmentCandidateResult[];
}

export interface DepartmentElectionDataset {
  election: string;
  date: string;
  source: string;
  source_label: string;
  departements: DepartmentResults[];
}
