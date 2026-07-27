/**
 * Fourches caudines — IA modératrice en cheffe LMDPT
 * Zéro biais éditorial · transparence des teintes politiques ·
 * blocage des autorités religieuses ou idéologiques (pas des idées politiques du 1er tour).
 */

export type GateVerdict = {
  allowed: boolean;
  code?: 'RELIGIOUS_AUTHORITY' | 'IDEOLOGICAL_AUTHORITY' | 'HATE_OR_VIOLENCE' | 'OK';
  reason: string;
  flags: string[];
};

function norm(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .replace(/\s+/g, ' ')
    .trim();
}

/** Signaux d’autorité religieuse (commandement / prosélytisme d’autorité, pas débat d’idées) */
const RELIGIOUS_AUTHORITY: Array<{ re: RegExp; flag: string }> = [
  { re: /\b(au nom (de|du|d')\s*(dieu|allah|jesus|jésus|yahvé|yahweh))\b/i, flag: 'invocation-autorité-divine' },
  { re: /\b(le pape|l['']imam|le rabbin|l['']évêque|le curé|le prêtre|le pasteur|l['']ayatollah)\s+(ordonne|exige|interdit|commande|déclare que)\b/i, flag: 'clerc-commande' },
  { re: /\b(fatwa|excommunication|djihad|jihad)\b/i, flag: 'vocabulaire-autorité-religieuse' },
  { re: /\b(seul(e)?\s+(dieu|allah|le coran|la bible|la torah|l['']église|l['']islam|le christianisme|le judaïsme)\s+(a|détient|possède)\s+(raison|vérité|autorité))\b/i, flag: 'monopole-vérité-religieuse' },
  { re: /\b(soumettez[- ]vous|obéissez)\s+(à|a)\s+(dieu|allah|l['']église|la charia|la sharia)\b/i, flag: 'obéissance-religieuse' },
  { re: /\b(charia|sharia)\s+(doit|devra|impose|s['']applique)\b/i, flag: 'imposition-religieuse' },
];

/** Autorité idéologique totalisante (pas une opinion de 1er tour) */
const IDEOLOGICAL_AUTHORITY: Array<{ re: RegExp; flag: string }> = [
  { re: /\b(une seule (pensée|vérité|voix|parti)\s+(est|sera)\s+(autorisée|légitime|permise))\b/i, flag: 'monopole-idéologique' },
  { re: /\b(tous les (opposants|dissidents|mécréants|hérétiques)\s+(doivent|devront)\s+(se taire|être (éliminés|réduits|bannis|emprisonnés)))\b/i, flag: 'répression-dissidence' },
  { re: /\b(culte de la personnalité|notre guide suprême|le chef a toujours raison)\b/i, flag: 'culte-autorité' },
  { re: /\b(interdit de (critiquer|contester|débattre)\s+(le parti|la doctrine|l['']idéologie))\b/i, flag: 'interdit-débat' },
  { re: /\b(la (seule|unique)\s+(idéologie|doctrine)\s+(légitime|vraie|correcte))\b/i, flag: 'idéologie-unique' },
];

const HATE_OR_VIOLENCE: Array<{ re: RegExp; flag: string }> = [
  { re: /\b(mort (aux|à)|il faut (tuer|éliminer|exterminer))\b/i, flag: 'appel-violence' },
  { re: /\b(gas chambers|chambre(s)? à gaz)\b/i, flag: 'apologie-crimes' },
];

/**
 * Passe les fourches caudines de la modératrice IA.
 * Les idées politiques de 1er tour (même tranchées) restent autorisées si pas d’autorité religieuse/idéologique.
 */
export function gateModeratorChief(text: string): GateVerdict {
  const raw = String(text || '');
  const t = norm(raw);
  const flags: string[] = [];

  for (const { re, flag } of HATE_OR_VIOLENCE) {
    if (re.test(raw) || re.test(t)) {
      flags.push(flag);
      return {
        allowed: false,
        code: 'HATE_OR_VIOLENCE',
        reason:
          'Refusé : appel à la haine ou à la violence. LMDPT documente le débat civique, pas les menaces.',
        flags,
      };
    }
  }

  for (const { re, flag } of RELIGIOUS_AUTHORITY) {
    if (re.test(raw) || re.test(t)) {
      flags.push(flag);
      return {
        allowed: false,
        code: 'RELIGIOUS_AUTHORITY',
        reason:
          'Refusé par la modératrice IA : aucune autorité religieuse ne passe les fourches caudines. Les idées politiques du 1er tour restent bienvenues ; le commandement religieux, non.',
        flags,
      };
    }
  }

  for (const { re, flag } of IDEOLOGICAL_AUTHORITY) {
    if (re.test(raw) || re.test(t)) {
      flags.push(flag);
      return {
        allowed: false,
        code: 'IDEOLOGICAL_AUTHORITY',
        reason:
          'Refusé par la modératrice IA : aucune autorité idéologique totalisante (monopole de vérité, interdiction du débat). Les positions politiques transparentes du 1er tour restent autorisées.',
        flags,
      };
    }
  }

  return {
    allowed: true,
    code: 'OK',
    reason: 'OK — teinte politique à afficher en transparence (zéro biais éditorial).',
    flags,
  };
}

export const MODERATOR_CHIEF_POLICY = {
  zeroBias: true,
  transparentPoliticalHue: true,
  blockReligiousAuthority: true,
  blockIdeologicalAuthority: true,
  line: 'La démocratie avant l’élimination — zéro biais, zéro parti pris, transparence des couleurs politiques.',
} as const;
