/** Couleurs et libellés — nuances législatives 2024 (1er tour). */

export const NUANCE_PALETTE: Record<string, string> = {
  RN: '#5c4a72',
  UG: '#c0392b',
  ENS: '#1e4d6b',
  LR: '#0066cc',
  UXD: '#8b6914',
  DVD: '#336699',
  DVG: '#e91e8c',
  REG: '#2d8a4e',
  EXG: '#990000',
  REC: '#8b4513',
  HOR: '#4a5568',
  DVC: '#718096',
  DSV: '#555555',
  UDI: '#2c5282',
  FI: '#cc3333',
  ECO: '#2d8a4e',
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