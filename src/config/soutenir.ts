/**
 * Soutien citoyen LMDPT — dons (phase B monétisation).
 *
 * Configurer l’URL réelle via build env (jamais de secret) :
 *   PUBLIC_LMDPT_DONATE_URL=https://www.helloasso.com/associations/.../formulaires/...
 *
 * Ou Payment Link Stripe (don) si HelloAsso non prêt.
 */

export type SupportTier = {
  id: string;
  label: string;
  amountEur: number;
  period: 'once' | 'month';
  blurb: string;
};

export const SUPPORT_TIERS: SupportTier[] = [
  {
    id: 'cafe',
    label: 'Un café data',
    amountEur: 3,
    period: 'month',
    blurb: 'Hébergement & sync open data.',
  },
  {
    id: 'doe',
    label: 'Soutien DOE',
    amountEur: 5,
    period: 'month',
    blurb: 'Atlas + analyses + maintenance site.',
  },
  {
    id: 'pluralite',
    label: 'Pluralité',
    amountEur: 10,
    period: 'month',
    blurb: 'Simulateurs, exports & briefings.',
  },
];

/** URL de paiement externe (HelloAsso / Stripe Payment Link). Vide = CTA « bientôt ». */
export function getDonateUrl(): string {
  const raw = import.meta.env.PUBLIC_LMDPT_DONATE_URL;
  return typeof raw === 'string' ? raw.trim() : '';
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

/** Pack Data AN1T — SKU hero monétisation pro (phase C). */
export const PACK_DATA = {
  id: 'pack-data-an1t',
  name: 'Pack Data AN1T',
  priceEurYear: 49,
  currency: 'EUR',
  status: 'preorder_interest' as const, // pas encore de checkout live
  path: '/pack-data-an1t',
  tagline: 'Données & exports pédagogiques autour de l’Assemblée du Premier Tour',
  includes: [
    'Exports CSV / JSON / PNG des simulations Sainte-Laguë (seuils documentés)',
    'Accès guide méthode AN1T (blocs, seuil, Sainte-Laguë) + liens atlas open data',
    '2 briefings PDF / an (pluralité T1, hors promesse électorale)',
    'Licence usage non commercial / pédagogique (attribution LMDPT)',
  ],
  notIncluded: [
    'Données nominatives d’électeurs',
    'Prédictions ou classements éliminatoires',
    'Droit de republication presse sans accord écrit',
    'Support prioritaire 24/7 ou API haute volumétrie',
  ],
  interestIssueUrl:
    'https://github.com/ELServicesToulon/LMDPT/issues/new?title=Pack%20Data%20AN1T%20—%20intérêt%2049%E2%82%AC&body=Bonjour%2C%0A%0AJe%20suis%20int%C3%A9ress%C3%A9%C2%B7e%20par%20le%20Pack%20Data%20AN1T%20(49%20%E2%82%AC%2Fan).%0A%0AProfil%20%3A%20%0AUsage%20pr%C3%A9vu%20%3A%20%0A',
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
