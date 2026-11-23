import {
  compareEditorialRecency,
  getUneDuJour,
  listEditorialPosts,
  type EditorialPost,
} from './editorial';

const PARIS_TZ = 'Europe/Paris';

const WEEKDAYS_FR = [
  'dimanche',
  'lundi',
  'mardi',
  'mercredi',
  'jeudi',
  'vendredi',
  'samedi',
] as const;

const MONTHS_FR = [
  'janvier',
  'février',
  'mars',
  'avril',
  'mai',
  'juin',
  'juillet',
  'août',
  'septembre',
  'octobre',
  'novembre',
  'décembre',
] as const;

export type PersonnaliteStatut = 'declaree' | 'designe';

export type CampagnePersonnalite = {
  slug: string;
  nom: string;
  courant: string;
  groupe: string;
  statut: PersonnaliteStatut;
  statut_label: string;
  source_label: string;
  source_url: string;
  source_date: string;
};

export type CampagneDate = {
  id: string;
  date: string;
  label: string;
  source_label: string;
  source_url: string;
};

export type CampagneScrutinMasque = {
  date: string;
  label: string;
  statut: string;
};

export type CampagneMiseAuPoint = {
  texte: string;
  lien_label?: string;
  lien_url?: string;
};

export type ParisWallClock = {
  date: string;
  minutes: number;
};

export type CampagneResultat = {
  nom: string;
  score: number | null;
  score_label?: string;
};

export type CampagneResultatClasse = CampagneResultat & {
  rang: number | null;
};

export type CampagneClassement = {
  id: string;
  institut: string;
  commanditaire: string;
  publication: string;
  terrain: string;
  terrain_debut: string;
  terrain_fin: string;
  echantillon: string;
  methode: string;
  marge_erreur: string;
  hypothese: string;
  non_exprimes: string;
  resultats: CampagneResultat[];
  source_label: string;
  notice_numero: string;
  notice_url: string;
};

export type CampagneSondage = {
  masquer: boolean;
  fin_masquage_heure: string;
  mise_au_point: CampagneMiseAuPoint | null;
  scrutins_a_masquer: CampagneScrutinMasque[];
  titre: string;
  note: string;
  classements: CampagneClassement[];
};

export type CampagneData = {
  title: string;
  updated: string;
  disclaimer: string;
  liste_complete_href: string;
  personnalites: CampagnePersonnalite[];
  dates: CampagneDate[];
  sondage: CampagneSondage;
};

export type PersonnaliteGroupe = {
  groupe: string;
  membres: CampagnePersonnalite[];
};

const ISO_DAY = /^(\d{4})-(\d{2})-(\d{2})$/;
const ISO_MONTH = /^(\d{4})-(\d{2})$/;
const FIN_MASQUAGE_DEFAUT = '20:00';
const FIN_MASQUAGE_MINUTES_DEFAUT = 20 * 60;

function partValue(parts: Intl.DateTimeFormatPart[], type: Intl.DateTimeFormatPartTypes): string {
  return parts.find((part) => part.type === type)?.value ?? '';
}

/** Horloge murale Europe/Paris : date calendaire et minutes depuis minuit (hourCycle h23). */
export function parisWallClock(now: Date): ParisWallClock {
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hourCycle: 'h23',
  }).formatToParts(now);
  const hour = Number(partValue(parts, 'hour'));
  const minute = Number(partValue(parts, 'minute'));
  return {
    date: `${partValue(parts, 'year')}-${partValue(parts, 'month')}-${partValue(parts, 'day')}`,
    minutes: hour * 60 + minute,
  };
}

/** Clé calendaire YYYY-MM-DD en fuseau Europe/Paris. */
export function parisCalendarDate(now: Date): string {
  return parisWallClock(now).date;
}

function calendarDayBefore(isoDate: string): string | null {
  const m = ISO_DAY.exec(isoDate);
  if (!m) return null;
  const utc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) - 1);
  return new Date(utc).toISOString().slice(0, 10);
}

export function finMasquageMinutes(hhmm: string | undefined): number {
  const m = /^(\d{1,2}):(\d{2})$/.exec(hhmm ?? '');
  if (!m) return FIN_MASQUAGE_MINUTES_DEFAUT;
  return Number(m[1]) * 60 + Number(m[2]);
}

/** Dates des dimanches de scrutin, triées. Le calcul de la veille est ailleurs. */
export function scrutinsMasquage(data: CampagneData): string[] {
  return data.sondage.scrutins_a_masquer.map((scrutin) => scrutin.date).sort();
}

/**
 * Même règle que le script inline : masqué la veille (journée entière) et
 * le jour du scrutin tant que minutes < fin (20:00, soit 1200 minutes).
 */
export function isMasqueAt(
  parts: ParisWallClock,
  scrutins: string[],
  finMinutes: number,
): boolean {
  for (const scrutin of scrutins) {
    if (!scrutin) continue;
    if (parts.date === scrutin && parts.minutes < finMinutes) return true;
    const veille = calendarDayBefore(scrutin);
    if (veille && parts.date === veille) return true;
  }
  return false;
}

/**
 * Masque le sous-bloc sondage du samedi 00:00 au dimanche 20:00 exclus
 * (horloge Europe/Paris), ou si le drapeau manuel `masquer` est vrai.
 */
export function shouldHideSondage(now: Date, data: CampagneData): boolean {
  if (data.sondage.masquer === true) return true;
  const fin =
    data.sondage.fin_masquage_heure?.trim() || FIN_MASQUAGE_DEFAUT;
  return isMasqueAt(parisWallClock(now), scrutinsMasquage(data), finMasquageMinutes(fin));
}

/** Dates YYYY-MM-DD masquées (veille + jour de chaque scrutin), triées. */
export function datesMasquage(data: CampagneData): string[] {
  const dates = new Set<string>();
  for (const scrutin of data.sondage.scrutins_a_masquer) {
    dates.add(scrutin.date);
    const veille = calendarDayBefore(scrutin.date);
    if (veille) dates.add(veille);
  }
  return [...dates].sort();
}

/**
 * Date française à partir d’un ISO YYYY-MM-DD ou YYYY-MM.
 * Un mois sans jour documenté s’affiche « mai 2026 », sans inventer un quantième.
 */
export function formatCampagneDate(
  iso: string,
  opts: { weekday?: boolean } = {},
): string {
  const monthOnly = ISO_MONTH.exec(iso);
  if (monthOnly) {
    const month = Number(monthOnly[2]);
    const label = MONTHS_FR[month - 1];
    if (!label) return iso;
    return `${label} ${monthOnly[1]}`;
  }

  const day = ISO_DAY.exec(iso);
  if (!day) return iso;
  const year = Number(day[1]);
  const month = Number(day[2]);
  const quantieme = Number(day[3]);
  const monthLabel = MONTHS_FR[month - 1];
  if (!monthLabel) return iso;
  const dayLabel = quantieme === 1 ? '1er' : String(quantieme);
  const body = `${dayLabel} ${monthLabel} ${year}`;
  if (opts.weekday === false) return body;
  const weekday = WEEKDAYS_FR[new Date(Date.UTC(year, month - 1, quantieme, 12)).getUTCDay()];
  return `${weekday} ${body}`;
}

function isoDayParts(iso: string): { year: number; month: number; day: number } | null {
  const m = ISO_DAY.exec(iso);
  if (!m) return null;
  return { year: Number(m[1]), month: Number(m[2]), day: Number(m[3]) };
}

function quantiemeFr(day: number): string {
  return day === 1 ? '1er' : String(day);
}

/**
 * Période d’enquête : « Enquête réalisée du 10 au 12 novembre 2026 ».
 * Mois différents : « du 30 octobre au 2 novembre 2026 ».
 * Années différentes : années des deux côtés. « 1er » pour le premier du mois.
 */
export function formatPeriodeEnquete(debut: string, fin: string): string {
  const start = isoDayParts(debut);
  const end = isoDayParts(fin);
  if (!start || !end) return '';
  const monthStart = MONTHS_FR[start.month - 1];
  const monthEnd = MONTHS_FR[end.month - 1];
  if (!monthStart || !monthEnd) return '';
  const startDay = quantiemeFr(start.day);
  const endDay = quantiemeFr(end.day);
  if (start.year === end.year && start.month === end.month) {
    return `Enquête réalisée du ${startDay} au ${endDay} ${monthStart} ${start.year}`;
  }
  if (start.year === end.year) {
    return `Enquête réalisée du ${startDay} ${monthStart} au ${endDay} ${monthEnd} ${start.year}`;
  }
  return `Enquête réalisée du ${startDay} ${monthStart} ${start.year} au ${endDay} ${monthEnd} ${end.year}`;
}

/** Pastille compacte : déclaré·e → D, désigné·e → Dé. */
export function statutPastille(statut: PersonnaliteStatut): 'D' | 'Dé' {
  return statut === 'designe' ? 'Dé' : 'D';
}

/** Infobulle de chip : parti, source et date — le courant n’est plus répété dans le libellé visible. */
export function personnaliteChipTitle(personne: CampagnePersonnalite): string {
  const sourceDate = formatCampagneDate(personne.source_date, { weekday: false });
  return `${personne.courant} · ${personne.source_label} · ${sourceDate}`;
}

/**
 * Classement « compétition » : ex æquo = même rang, le suivant saute.
 * Score `null` en dernier, sans rang. Égalité : ordre du tableau d’entrée (tri stable).
 */
export function rankResultats(resultats: CampagneResultat[]): CampagneResultatClasse[] {
  const indexed = resultats.map((resultat, index) => ({ resultat, index }));
  indexed.sort((a, b) => {
    const scoreA = a.resultat.score;
    const scoreB = b.resultat.score;
    if (scoreA === null && scoreB === null) return a.index - b.index;
    if (scoreA === null) return 1;
    if (scoreB === null) return -1;
    if (scoreB !== scoreA) return scoreB - scoreA;
    return a.index - b.index;
  });

  let lastScore: number | null = null;
  let lastRang = 0;
  return indexed.map((item, position) => {
    if (item.resultat.score === null) {
      return { ...item.resultat, rang: null };
    }
    const rang = item.resultat.score === lastScore ? lastRang : position + 1;
    lastScore = item.resultat.score;
    lastRang = rang;
    return { ...item.resultat, rang };
  });
}

const NBSP = '\u00a0';

/** Score français avec virgule et « % » insécable ; `score_label` si score null. */
export function formatScore(resultat: CampagneResultat): string {
  if (resultat.score === null) return resultat.score_label ?? '';
  return `${resultat.score.toLocaleString('fr-FR')}${NBSP}%`;
}

/** Groupes dans l’ordre d’apparition du JSON (déjà alphabétique FR à l’intérieur). */
export function groupPersonnalites(
  personnalites: CampagnePersonnalite[],
): PersonnaliteGroupe[] {
  const groups: PersonnaliteGroupe[] = [];
  const indexByGroupe = new Map<string, number>();
  for (const personne of personnalites) {
    let index = indexByGroupe.get(personne.groupe);
    if (index === undefined) {
      index = groups.length;
      indexByGroupe.set(personne.groupe, index);
      groups.push({ groupe: personne.groupe, membres: [] });
    }
    groups[index]?.membres.push(personne);
  }
  return groups;
}

export type UneLienApercu = {
  slug: string;
  title: string;
  href: string;
  date: string;
  dateLabel: string;
  description: string;
};

export function toUneLienApercu(post: EditorialPost): UneLienApercu {
  return {
    slug: post.slug,
    title: post.title,
    href: post.href,
    date: post.date,
    dateLabel: formatCampagneDate(post.date, { weekday: false }),
    description: post.description,
  };
}

export function getUneLienApercu(posts?: EditorialPost[]): UneLienApercu | null {
  const une = getUneDuJour(posts);
  return une ? toUneLienApercu(une) : null;
}

/**
 * Une qui suit la une courante dans l’ordre de récence (slug, sinon href).
 * Rien n’est figé sur un slug de jour : la suivante se recalcule au build.
 */
export function getUneLienApercuSuivante(
  posts?: EditorialPost[],
  current: UneLienApercu | null = getUneLienApercu(posts),
): UneLienApercu | null {
  if (!current) return null;
  const list = [...(posts ?? listEditorialPosts())].sort(compareEditorialRecency);
  const suivante = list.find((post) => {
    if (current.slug) return post.slug !== current.slug;
    return post.href !== current.href;
  });
  return suivante ? toUneLienApercu(suivante) : null;
}

const MENTION_DECRET_DEFAUT = 'à confirmer par décret de convocation';

/** Dates dont le jour calendaire (AAAA-MM-JJ, Paris) est ≥ le jour du build. */
export function datesAVenir(dates: CampagneDate[], now: Date): CampagneDate[] {
  const today = parisCalendarDate(now);
  return dates.filter((item) => item.date >= today);
}

/** Première date du tableau dont le jour calendaire (AAAA-MM-JJ) est ≥ aujourd’hui à Paris. */
export function prochaineDateCle(dates: CampagneDate[], now: Date): CampagneDate | null {
  return datesAVenir(dates, now)[0] ?? null;
}

/**
 * Mention de décret si la date coïncide avec un scrutin à masquer.
 * Statut de l’entrée s’il est renseigné, sinon la formule par défaut.
 */
export function mentionDecretConvocation(
  date: Pick<CampagneDate, 'date'>,
  scrutins: CampagneScrutinMasque[],
): string | null {
  const scrutin = scrutins.find((entry) => entry.date === date.date);
  if (!scrutin) return null;
  const statut = scrutin.statut?.trim();
  return statut ? statut : MENTION_DECRET_DEFAUT;
}

export type CarteCandidatsClinDoeil = {
  title: 'Qui est candidat';
  href: string;
  count: number;
  ligne: string;
  listeLabel: 'Voir la liste';
};

export type LigneDeclaresSousCondition = {
  libelle: string;
  href: string;
};

/**
 * Ligne sous la carte « Qui est candidat ».
 * Filtre `category === 'conditionnelle'` (pas `status` : Brun = primaire,
 * Bardella = substitution_parti).
 */
export function ligneDeclaresSousCondition(
  entries: ReadonlyArray<{ name: string; category: string }>,
  href: string,
): LigneDeclaresSousCondition | null {
  const noms = entries
    .filter((entry) => entry.category === 'conditionnelle')
    .map((entry) => entry.name)
    .sort((a, b) => a.localeCompare(b, 'fr'));
  if (noms.length === 0) return null;
  return {
    libelle: `+ ${noms.length} déclarés sous condition : ${noms.join(', ')}`,
    href,
  };
}

export type CarteSemaineClinDoeil = {
  title: 'Ce qui a bougé cette semaine';
  date: string;
  dateLabel: string;
  uneTitle: string;
  href: string;
  description: string;
};

export type CarteDateCleClinDoeil = {
  title: 'Prochaine date clé';
  date: string;
  dateLabel: string;
  label: string;
  sourceUrl: string;
  sourceLabel: string;
  mentionDecret: string | null;
};

export type CartesClinDoeil = {
  candidats: CarteCandidatsClinDoeil;
  semaine: CarteSemaineClinDoeil | null;
  dateCle: CarteDateCleClinDoeil | null;
};

function lignePersonnalitesSourcees(count: number): string {
  if (count === 1) return '1 personnalité sourcée';
  return `${count} personnalités sourcées`;
}

/** Trois cartes du bandeau accueil — contenu dérivé du JSON et de la Une, rien d’inventé. */
export function cartesClinDoeil(opts: {
  data: CampagneData;
  une: UneLienApercu | null;
  now: Date;
}): CartesClinDoeil {
  const { data, une, now } = opts;
  const count = data.personnalites.length;
  const next = prochaineDateCle(data.dates, now);
  const mouvement = getUneLienApercuSuivante(undefined, une);

  return {
    candidats: {
      title: 'Qui est candidat',
      href: data.liste_complete_href,
      count,
      ligne: lignePersonnalitesSourcees(count),
      listeLabel: 'Voir la liste',
    },
    semaine: mouvement
      ? {
          title: 'Ce qui a bougé cette semaine',
          date: mouvement.date,
          dateLabel: mouvement.dateLabel,
          uneTitle: mouvement.title,
          href: mouvement.href,
          description: mouvement.description,
        }
      : null,
    dateCle: next
      ? {
          title: 'Prochaine date clé',
          date: next.date,
          dateLabel: formatCampagneDate(next.date),
          label: next.label,
          sourceUrl: next.source_url,
          sourceLabel: next.source_label,
          mentionDecret: mentionDecretConvocation(next, data.sondage.scrutins_a_masquer),
        }
      : null,
  };
}
