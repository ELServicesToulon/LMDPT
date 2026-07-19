/** Couleurs et libellés — nuances législatives 2024 (1er tour).
 * Aligné couleurs **consensus** Wiki AN / médias FR (écologie = vert, etc.).
 */
import { CONSENSUS_PARTY_COLORS } from './assemblee-wiki-colors';

export const NUANCE_PALETTE: Record<string, string> = {
  RN: CONSENSUS_PARTY_COLORS.rn,
  UG: CONSENSUS_PARTY_COLORS.nfp,
  ENS: CONSENSUS_PARTY_COLORS.ensemble,
  LR: CONSENSUS_PARTY_COLORS.lr,
  UXD: CONSENSUS_PARTY_COLORS.reconquete,
  DVD: CONSENSUS_PARTY_COLORS.lr,
  DVG: CONSENSUS_PARTY_COLORS.ps,
  REG: CONSENSUS_PARTY_COLORS.liot,
  EXG: CONSENSUS_PARTY_COLORS.exg,
  REC: CONSENSUS_PARTY_COLORS.reconquete,
  HOR: CONSENSUS_PARTY_COLORS.horizons,
  DVC: CONSENSUS_PARTY_COLORS.modem,
  DSV: CONSENSUS_PARTY_COLORS.autres,
  UDI: CONSENSUS_PARTY_COLORS.modem,
  FI: CONSENSUS_PARTY_COLORS.lfi,
  ECO: CONSENSUS_PARTY_COLORS.eco, // vert consensus
};

export const NUANCE_LABELS: Record<string, string> = {
  RN: 'RN',
  UG: 'NFP (Union de la gauche)',
  ENS: 'Ensemble',
  LR: 'LR',
  UXD: 'Extrême droite',
  DVD: 'Divers droite',
  DVG: 'Divers gauche',
  REG: 'Régionaliste',
  EXG: 'Extrême gauche',
  REC: 'Reconquête',
  HOR: 'Horizons',
  DVC: 'Divers centre',
  DSV: 'Droite souverainiste',
  UDI: 'UDI',
  FI: 'LFI',
  ECO: 'Écologiste',
};

export function nuanceColor(code: string): string {
  return NUANCE_PALETTE[code] ?? '#888888';
}

export function nuanceLabel(code: string, fallback?: string): string {
  return NUANCE_LABELS[code] ?? fallback ?? code;
}

export function legendForNuances(codes: string[]): Array<{ code: string; label: string; color: string }> {
  const seen = new Set<string>();
  const items: Array<{ code: string; label: string; color: string }> = [];
  for (const code of codes) {
    if (seen.has(code)) continue;
    seen.add(code);
    items.push({ code, label: nuanceLabel(code), color: nuanceColor(code) });
  }
  return items;
}