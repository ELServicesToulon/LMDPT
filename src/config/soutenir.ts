/**
 * Soutien citoyen LMDPT — dons (phase B monétisation).
 *
 * Par défaut : Payment Link Stripe (don ponctuel, montant libre côté Stripe).
 * Surcharge possible au build (jamais de secret dans le dépôt) :
 *   PUBLIC_LMDPT_DONATE_URL=https://donate.stripe.com/…
 */

/** Lien public Stripe (don) — valeur par défaut si `PUBLIC_LMDPT_DONATE_URL` est vide. */
export const DEFAULT_DONATE_URL =
  'https://donate.stripe.com/5kQ00c6Iw6M33Jb5EdaMU00';

export type SupportTier = {
  id: string;
  label: string;
  amountEur: number;
  /** Suggestions indicatives (même lien ; le montant est choisi sur Stripe). */
  period: 'once';
  blurb: string;
};

export const SUPPORT_TIERS: SupportTier[] = [
  {
    id: 'cafe',
    label: 'Un café pour les données',
    amountEur: 3,
    period: 'once',
    blurb: 'Hébergement & synchronisation des données ouvertes.',
  },
  {
    id: 'doe',
    label: 'Soutien au fonctionnement éditorial',
    amountEur: 5,
    period: 'once',
    blurb: 'Atlas + analyses + maintenance site.',
  },
  {
    id: 'pluralite',
    label: 'Pluralité',
    amountEur: 10,
    period: 'once',
    blurb: 'Simulateurs, exports et notes de synthèse.',
  },
];

/** URL de paiement externe (Stripe Payment Link). Env vide → défaut ci-dessus. */
export function getDonateUrl(): string {
  const raw = import.meta.env.PUBLIC_LMDPT_DONATE_URL;
  const trimmed = typeof raw === 'string' ? raw.trim() : '';
  return trimmed || DEFAULT_DONATE_URL;
}

export function donateReady(): boolean {
  try {
    const u = getDonateUrl();
    if (!u) return false;
    const parsed = new URL(u);
    return parsed.protocol === 'https:';
  } catch {
    return false;
  }
}

/** Lot de données AN1T — offre monétisation pro (phase C). */
export const PACK_DATA = {
  id: 'pack-data-an1t',
  name: 'Lot de données AN1T',
  priceEurYear: 49,
  currency: 'EUR',
  status: 'preorder_interest' as const, // pas encore de checkout live
  path: '/pack-data-an1t',
  tagline: 'Données et exports pédagogiques autour de l’Assemblée du Premier Tour',
  includes: [
    'Exports CSV / JSON / PNG des simulations Sainte-Laguë (seuils documentés)',
    'Accès au guide de méthode AN1T (blocs, seuil, Sainte-Laguë) + liens atlas en données ouvertes',
    '2 dossiers PDF / an (pluralité du 1er tour, hors promesse électorale)',
    'Licence d’usage non commercial / pédagogique (attribution LMDPT)',
  ],
  notIncluded: [
    'Données nominatives d’électeurs',
    'Prédictions ou classements éliminatoires',
    'Droit de republication presse sans accord écrit',
    'Assistance prioritaire 24 h/24 ou API à très fort volume',
  ],
  interestIssueUrl:
    'https://github.com/ELServicesToulon/LMDPT/issues/new?title=Lot%20de%20donn%C3%A9es%20AN1T%20%E2%80%94%20int%C3%A9r%C3%AAt%2049%E2%82%AC&body=Bonjour%2C%0A%0AJe%20suis%20int%C3%A9ress%C3%A9%C2%B7e%20par%20le%20lot%20de%20donn%C3%A9es%20AN1T%20(49%20%E2%82%AC%2Fan).%0A%0AProfil%20%3A%20%0AUsage%20pr%C3%A9vu%20%3A%20%0A',
};

/** Payment Link Stripe pack (optionnel, build-time). */
export function getPackCheckoutUrl(): string {
  const raw = import.meta.env.PUBLIC_LMDPT_PACK_CHECKOUT_URL;
  return typeof raw === 'string' ? raw.trim() : '';
}

export function packCheckoutReady(): boolean {
  try {
    const u = getPackCheckoutUrl();
    if (!u) return false;
    return new URL(u).protocol === 'https:';
  } catch {
    return false;
  }
}
