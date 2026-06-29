/** Libellés français pour les identifiants licence data.gouv.fr. */
const LICENSE_LABELS: Record<string, string> = {
  lov2: 'Licence Ouverte 2.0',
  'fr-lo': 'Licence Ouverte (Etalab)',
  notspecified: 'Licence non précisée par le producteur',
  odbi: 'Open Database License (ODbL)',
};

export function formatLicenseLabel(code: string): string {
  const key = code.toLowerCase().trim();
  return LICENSE_LABELS[key] ?? code;
}