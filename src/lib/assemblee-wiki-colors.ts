/**
 * Couleurs officielles des groupes de l’Assemblée nationale
 * Modèle Wikimedia — XVIIe législature (réf. 14-10-2025)
 * https://fr.wikipedia.org/wiki/Fichier:XVII%C3%A8me_l%C3%A9gislature_de_l%27Assembl%C3%A9e_nationale_en_France_au_14-10-2025.svg
 *
 * Effectifs de référence (577 sièges) — à croiser avec le JSON des positions.
 */
export const WIKI_GROUP_COLORS = {
  /** Groupe GDR — 17 */
  gdr: '#dd0000',
  /** Groupe La France Insoumise — 71 */
  lfi: '#cc2443',
  /** Groupe Écologiste et Social — 38 */
  eco: '#00c000',
  /** Groupe Socialiste — 69 */
  ps: '#ff8080',
  /** Groupe LIOT — 22 */
  liot: '#e1a5e1',
  /** Groupe Les Démocrates — 36 */
  democrates: '#ff9900',
  /** Groupe Ensemble pour la République — 91 */
  ensemble: '#ffeb00',
  /** Groupe Horizons — 34 */
  horizons: '#0001b8',
  /** Groupe Droite Républicaine — 49 */
  droite_republicaine: '#0066cc',
  /** Groupe Union des droites pour la République — 16 */
  udr: '#162561',
  /** Groupe Rassemblement national — 122 */
  rn: '#0d378a',
  /** Indépendants — 10 */
  independants: '#dddddd',
} as const;

/** Titre JSON / Wikimedia → couleur officielle */
export const WIKI_GROUP_COLOR_BY_TITLE: Record<string, string> = {
  'Groupe GDR': WIKI_GROUP_COLORS.gdr,
  'Groupe La France Insoumise': WIKI_GROUP_COLORS.lfi,
  'Groupe Écologiste et Social': WIKI_GROUP_COLORS.eco,
  'Groupe Socialiste': WIKI_GROUP_COLORS.ps,
  'Groupe LIOT': WIKI_GROUP_COLORS.liot,
  'Groupe Les Démocrates': WIKI_GROUP_COLORS.democrates,
  'Groupe Ensemble pour la République': WIKI_GROUP_COLORS.ensemble,
  'Groupe Horizons': WIKI_GROUP_COLORS.horizons,
  'Groupe Droite Républicaine': WIKI_GROUP_COLORS.droite_republicaine,
  'Groupe Union des droites pour la République': WIKI_GROUP_COLORS.udr,
  'Groupe Rassemblement national': WIKI_GROUP_COLORS.rn,
  Indépendants: WIKI_GROUP_COLORS.independants,
};

/**
 * Couleurs des 5 blocs majeurs pour les **projections** AN1T.
 * = couleur du groupe dominant / emblématique du bloc dans le modèle Wiki.
 */
export const MAJOR_BLOC_COLORS = {
  /** NFP — teinte LFI (groupe le plus large du bloc à gauche) */
  nfp: WIKI_GROUP_COLORS.lfi,
  /** Ensemble / centre — jaune EPR officiel */
  ensemble: WIKI_GROUP_COLORS.ensemble,
  /** Droite républicaine — bleu DR */
  lr: WIKI_GROUP_COLORS.droite_republicaine,
  /** RN — bleu RN officiel */
  rn: WIKI_GROUP_COLORS.rn,
  /** Autres / divers — gris indépendants Wiki */
  autres: WIKI_GROUP_COLORS.independants,
} as const;

/** Alias id projection → couleur Wiki */
export const PROJECTION_COLOR_BY_ID: Record<string, string> = {
  nfp: MAJOR_BLOC_COLORS.nfp,
  'nfp-union': WIKI_GROUP_COLORS.ps,
  lfi: WIKI_GROUP_COLORS.lfi,
  eco: WIKI_GROUP_COLORS.eco,
  ps: WIKI_GROUP_COLORS.ps,
  ensemble: MAJOR_BLOC_COLORS.ensemble,
  horizons: WIKI_GROUP_COLORS.horizons,
  democrates: WIKI_GROUP_COLORS.democrates,
  lr: MAJOR_BLOC_COLORS.lr,
  udr: WIKI_GROUP_COLORS.udr,
  rn: MAJOR_BLOC_COLORS.rn,
  autres: MAJOR_BLOC_COLORS.autres,
  liot: WIKI_GROUP_COLORS.liot,
  gdr: WIKI_GROUP_COLORS.gdr,
};

export function colorForProjectionId(id?: string, fallback = MAJOR_BLOC_COLORS.autres): string {
  if (!id) return fallback;
  return PROJECTION_COLOR_BY_ID[id] ?? fallback;
}
