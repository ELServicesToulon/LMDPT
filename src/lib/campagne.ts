import { getUneDuJour, type EditorialPost } from './editorial';

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
};

export type CampagneSondage = {
  masquer: boolean;
  scrutins_a_masquer: CampagneScrutinMasque[];
  institut: string;
  commanditaire: string;
  vague: string;
  publication: string;
  terrain: string;
  echantillon: string;
  marge_erreur: string;
  methode: string;
  source_label: string;
  source_url: string;
  notice_label: string;
  notice_url: string;
  note: string;
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

/** Clé calendaire YYYY-MM-DD en fuseau Europe/Paris. */
export function parisCalendarDate(now: Date): string {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: PARIS_TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(now);
}

function calendarDayBefore(isoDate: string): string | null {
  const m = ISO_DAY.exec(isoDate);
  if (!m) return null;
  const utc = Date.UTC(Number(m[1]), Number(m[2]) - 1, Number(m[3]) - 1);
  return new Date(utc).toISOString().slice(0, 10);
}

/**
 * Masque le sous-bloc sondage le jour d’un scrutin listé, la veille
 * (calendrier Europe/Paris), ou si le drapeau manuel `masquer` est vrai.
 */
export function shouldHideSondage(now: Date, data: CampagneData): boolean {
  if (data.sondage.masquer === true) return true;
  const today = parisCalendarDate(now);
  for (const scrutin of data.sondage.scrutins_a_masquer) {
    if (today === scrutin.date) return true;
    const veille = calendarDayBefore(scrutin.date);
    if (veille && today === veille) return true;
  }
  return false;
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

export function getUneLienApercu(posts?: EditorialPost[]) {
  const une = getUneDuJour(posts);
  if (!une) return null;
  return {
    title: une.title,
    href: une.href,
    date: une.date,
    dateLabel: formatCampagneDate(une.date, { weekday: false }),
  };
}
