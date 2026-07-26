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

/**
 * Couleurs **consensus** (média FR + modèle Wikimedia AN) — à utiliser en priorité
 * dès qu’un parti / nuance / candidat est identifiable.
 * Ex. écologie = vert `#00c000`, RN = bleu nuit, Ensemble = jaune, LR = bleu…
 */
export const CONSENSUS_PARTY_COLORS = {
  /** Écologistes / EELV / LES ÉCOLOGISTES */
  eco: WIKI_GROUP_COLORS.eco,
  eelv: WIKI_GROUP_COLORS.eco,
  ecologiste: WIKI_GROUP_COLORS.eco,
  /** La France Insoumise */
  lfi: WIKI_GROUP_COLORS.lfi,
  fi: WIKI_GROUP_COLORS.lfi,
  insoumis: WIKI_GROUP_COLORS.lfi,
  /** Communistes / GDR */
  pcf: WIKI_GROUP_COLORS.gdr,
  gdr: WIKI_GROUP_COLORS.gdr,
  communiste: WIKI_GROUP_COLORS.gdr,
  /** Parti socialiste / social-démocrate */
  ps: WIKI_GROUP_COLORS.ps,
  socialiste: WIKI_GROUP_COLORS.ps,
  /** NFP / union de la gauche (teinte LFI dominante Wiki) */
  nfp: MAJOR_BLOC_COLORS.nfp,
  nupes: MAJOR_BLOC_COLORS.nfp,
  ug: MAJOR_BLOC_COLORS.nfp,
  /** Centre / Renaissance / Ensemble */
  ensemble: WIKI_GROUP_COLORS.ensemble,
  renaissance: WIKI_GROUP_COLORS.ensemble,
  epr: WIKI_GROUP_COLORS.ensemble,
  ens: WIKI_GROUP_COLORS.ensemble,
  /** Modem / Les Démocrates */
  modem: WIKI_GROUP_COLORS.democrates,
  democrates: WIKI_GROUP_COLORS.democrates,
  udi: WIKI_GROUP_COLORS.democrates,
  /** Horizons */
  horizons: WIKI_GROUP_COLORS.horizons,
  hor: WIKI_GROUP_COLORS.horizons,
  /** Droite républicaine / LR */
  lr: WIKI_GROUP_COLORS.droite_republicaine,
  droite_republicaine: WIKI_GROUP_COLORS.droite_republicaine,
  republicains: WIKI_GROUP_COLORS.droite_republicaine,
  /** UDR / droite dure institutionnelle */
  udr: WIKI_GROUP_COLORS.udr,
  /** Rassemblement national */
  rn: WIKI_GROUP_COLORS.rn,
  /** Reconquête — brun consensus médias (pas Wiki AN) */
  reconquete: '#8b6914',
  rec: '#8b6914',
  /** Extrême gauche LO/NPA — rouge foncé consensus */
  exg: '#990000',
  lo: '#990000',
  npa: '#990000',
  /** LIOT */
  liot: WIKI_GROUP_COLORS.liot,
  /** Divers / indépendants */
  autres: WIKI_GROUP_COLORS.independants,
  divers: WIKI_GROUP_COLORS.independants,
  independants: WIKI_GROUP_COLORS.independants,
} as const;

/** Candidats / figures → couleur consensus du courant */
export const CONSENSUS_CANDIDATE_COLORS: Record<string, string> = {
  // Écologie = vert
  jadot: CONSENSUS_PARTY_COLORS.eco,
  tondelier: CONSENSUS_PARTY_COLORS.eco,
  batho: CONSENSUS_PARTY_COLORS.eco,
  // LFI / gauche radicale
  melenchon: CONSENSUS_PARTY_COLORS.lfi,
  ruffin: CONSENSUS_PARTY_COLORS.lfi,
  // PCF
  roussel: CONSENSUS_PARTY_COLORS.pcf,
  // PS / social-démocrate
  hamon: CONSENSUS_PARTY_COLORS.ps,
  hidalgo: CONSENSUS_PARTY_COLORS.ps,
  glucksmann: CONSENSUS_PARTY_COLORS.ps,
  hollande: CONSENSUS_PARTY_COLORS.ps,
  'philippe-brun': CONSENSUS_PARTY_COLORS.ps,
  brun: CONSENSUS_PARTY_COLORS.ps,
  'parti-socialiste': CONSENSUS_PARTY_COLORS.ps,
  // Extrême gauche
  poutou: CONSENSUS_PARTY_COLORS.exg,
  arthaud: CONSENSUS_PARTY_COLORS.exg,
  // Centre / Ensemble
  macron: CONSENSUS_PARTY_COLORS.ensemble,
  attal: CONSENSUS_PARTY_COLORS.ensemble,
  // Horizons
  philippe: CONSENSUS_PARTY_COLORS.horizons,
  // Modem
  barrot: CONSENSUS_PARTY_COLORS.modem,
  bayrou: CONSENSUS_PARTY_COLORS.modem,
  // LR / droite
  fillon: CONSENSUS_PARTY_COLORS.lr,
  pecresse: CONSENSUS_PARTY_COLORS.lr,
  retailleau: CONSENSUS_PARTY_COLORS.lr,
  // UDR / droite dure
  lisnard: CONSENSUS_PARTY_COLORS.udr,
  // RN
  'le-pen': CONSENSUS_PARTY_COLORS.rn,
  bardella: CONSENSUS_PARTY_COLORS.rn,
  // Reconquête
  zemmour: CONSENSUS_PARTY_COLORS.reconquete,
  // Divers
  lassalle: CONSENSUS_PARTY_COLORS.liot,
  'dupont-aignan': CONSENSUS_PARTY_COLORS.autres,
  asselineau: CONSENSUS_PARTY_COLORS.autres,
  cheminade: CONSENSUS_PARTY_COLORS.autres,
  villepin: CONSENSUS_PARTY_COLORS.lr,
};

/**
 * Résout une couleur consensus à partir d’un id (bloc, nuance, slug candidat, libellé).
 * Retourne `null` si aucun consensus clair → laisser le spectre de proximité.
 */
export function consensusPartyColor(raw?: string | null): string | null {
  if (!raw) return null;
  const id = raw
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '');

  if (CONSENSUS_PARTY_COLORS[id as keyof typeof CONSENSUS_PARTY_COLORS]) {
    return CONSENSUS_PARTY_COLORS[id as keyof typeof CONSENSUS_PARTY_COLORS];
  }
  if (CONSENSUS_CANDIDATE_COLORS[id]) return CONSENSUS_CANDIDATE_COLORS[id];
  if (PROJECTION_COLOR_BY_ID[id]) return PROJECTION_COLOR_BY_ID[id];

  // Mots-clés (ordre : plus spécifique d’abord)
  if (/ecolo|eelv|vert|climat|biodiversit|jadot|tondelier/.test(id)) return CONSENSUS_PARTY_COLORS.eco;
  if (/insoumis|lfi|^fi$|melenchon|nfp|nupes/.test(id)) return CONSENSUS_PARTY_COLORS.lfi;
  if (/communiste|pcf|gdr|roussel/.test(id)) return CONSENSUS_PARTY_COLORS.pcf;
  if (/socialiste|^ps$|glucksmann|hidalgo|hollande/.test(id)) return CONSENSUS_PARTY_COLORS.ps;
  if (/rassemblement|national|^rn$|le-pen|bardella/.test(id)) return CONSENSUS_PARTY_COLORS.rn;
  if (/reconqu|zemmour/.test(id)) return CONSENSUS_PARTY_COLORS.reconquete;
  if (/horizon/.test(id)) return CONSENSUS_PARTY_COLORS.horizons;
  if (/modem|democrate|barrot|bayrou/.test(id)) return CONSENSUS_PARTY_COLORS.modem;
  if (/ensemble|renaissance|macron|attal|^ens$/.test(id)) return CONSENSUS_PARTY_COLORS.ensemble;
  if (/\blr\b|republicain|retailleau|pecresse|fillon|droite-republicaine/.test(id)) {
    return CONSENSUS_PARTY_COLORS.lr;
  }
  if (/udr|ciotti/.test(id)) return CONSENSUS_PARTY_COLORS.udr;
  if (/exg|lutte-ouvriere|\blo\b|npa|poutou|arthaud/.test(id)) return CONSENSUS_PARTY_COLORS.exg;

  return null;
}
