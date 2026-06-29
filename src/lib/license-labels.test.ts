import { describe, expect, it } from 'vitest';
import dataJournal from '../data/data-journal.json';
import manifest from '../../data/cache/sources-manifest.json';
import { formatLicenseLabel } from './license-labels';

describe('formatLicenseLabel', () => {
  it('maps data.gouv.fr license ids to French labels', () => {
    expect(formatLicenseLabel('lov2')).toBe('Licence Ouverte 2.0');
    expect(formatLicenseLabel('fr-lo')).toBe('Licence Ouverte (Etalab)');
    expect(formatLicenseLabel('notspecified')).toBe('Licence non précisée par le producteur');
  });

  it('returns unknown codes as-is', () => {
    expect(formatLicenseLabel('Licence Ouverte 2.0 (Ministère)')).toBe(
      'Licence Ouverte 2.0 (Ministère)',
    );
  });
});

describe('license coverage (/sources)', () => {
  it('every integrated journal entry has a license', () => {
    for (const entry of dataJournal) {
      expect(entry.license, entry.label).toBeTruthy();
    }
  });

  it('every detailed dataset in manifest has a license', () => {
    for (const dataset of manifest.datasets) {
      expect(dataset.license, dataset.title).toBeTruthy();
    }
  });
});