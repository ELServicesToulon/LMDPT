/** Taxonomie thématique stable pour comparaison inter-scrutins. */
export type ProgramThemeId =
  | 'fiscalite'
  | 'retraites'
  | 'europe'
  | 'climat'
  | 'sante'
  | 'education'
  | 'securite'
  | 'immigration'
  | 'institutions'
  | 'pouvoir_achat'
  | 'entreprises'
  | 'logement'
  | 'defense'
  | 'justice'
  | 'numerique';

export type MeasureEvolutionStatus = 'nouveau' | 'maintenu' | 'modifie' | 'retire' | 'inconnu';

export type ChiffrageType = 'recettes' | 'depenses' | 'solde';

export type ChiffrageAuteur = 'institut_montaigne' | 'ofce' | 'candidat' | 'lmdpt';

export type ChiffrageConfidence = 'elevee' | 'moyenne' | 'faible';

export interface ProgramTheme {
  id: ProgramThemeId;
  label: string;
}

export interface ProgramCandidateMeta {
  name: string;
  slug: string;
  affiliation: string;
}

export interface ProgramDocument {
  published_at?: string;
  document_url?: string;
  document_label?: string;
  status?: 'published' | 'awaiting_program' | 'partial';
}

export interface ProgramMeasure {
  id: string;
  theme: ProgramThemeId;
  label: string;
  detail?: string;
  status: MeasureEvolutionStatus;
  source_url?: string;
  source_label?: string;
  as_of?: string;
  /** Md€/an — estimation mesure si disponible */
  chiffrage_mdeur?: number;
  chiffrage_auteur?: ChiffrageAuteur;
}

export interface ProgramChiffrage {
  id: string;
  type: ChiffrageType;
  /** Md€/an à l'horizon indiqué */
  montant_mdeur: number;
  montant_min_mdeur?: number;
  montant_max_mdeur?: number;
  horizon: string;
  auteur: ChiffrageAuteur;
  source_url?: string;
  source_label?: string;
  method_note?: string;
  confidence: ChiffrageConfidence;
  theme?: ProgramThemeId;
}

export interface ProgramCandidateFile {
  scrutin: string;
  candidate: ProgramCandidateMeta;
  program: ProgramDocument;
  measures: ProgramMeasure[];
  chiffrages: ProgramChiffrage[];
  evolution_from?: string;
  updated?: string;
}

export interface ProgramScrutinMeta {
  id: string;
  label: string;
  date?: string;
  status: 'complete' | 'partial' | 'veille';
}

export interface ProgramEvolutionEntry {
  theme: ProgramThemeId;
  family_slug: string;
  family_label: string;
  entries: Array<{
    scrutin: string;
    measure_id: string;
    label: string;
    status: MeasureEvolutionStatus;
    delta_summary?: string;
  }>;
}

export interface ProgramEvolutionMatrix {
  updated: string;
  links: ProgramEvolutionEntry[];
}

export interface ProgramVeilleIndex {
  scrutin: string;
  updated: string;
  disclaimer: string;
  veille_scan_at?: string;
  program_press_hits?: number;
  candidates: Array<{
    slug: string;
    name: string;
    affiliation: string;
    program_status: 'awaiting_program' | 'partial' | 'published';
    last_measure_at?: string;
    chiffrage_available: boolean;
    source_url?: string;
    press_signals?: Array<{
      title: string;
      url: string;
      published?: string;
      detected_at: string;
    }>;
  }>;
}
