import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import data from '../data/observatoire-censure.json';
import {
  FACTUAL_TYPES,
  STATUS_EN_VERIFICATION,
  documentedUntilLabel,
  formatMeasureDate,
  formatMeasureMonthYear,
  isFactualType,
  latestMeasureDate,
  observatoireEntries,
  observatoirePublicEntries,
  observatoirePublicFilterControls,
  officialSourceSegments,
} from './observatoire-censure';

const ROOT = join(process.cwd());
const PAGE = readFileSync(join(ROOT, 'src/pages/observatoire-censure/index.astro'), 'utf8');
const CONTRIBUER = readFileSync(join(ROOT, 'src/pages/contribuer/index.astro'), 'utf8');
const CHARTE = readFileSync(join(ROOT, 'src/pages/charte.astro'), 'utf8');

const MOTIF_SOURCE_PHRASE =
  'Quand une sanction a un motif officiel, nous le citons. Les autres motifs sont rapportés avec leur source, jamais repris à notre compte.';

const EN_VERIFICATION_NAMES = [
  'Valeurs actuelles',
  'Le Média',
  'Blast',
  'Dieudonné',
  'Alain Soral / É&R',
  'Fdesouche',
  'Papacito',
  'Livre Noir',
  'Omerta',
  'Hold-Up / Thana TV (écosystème)',
  'Usul',
  'TV Libertés',
] as const;

const PUBLIC_NAMES = [
  'RT France',
  'C8',
  'NRJ 12',
  'CNews',
  'C8 — TPMP (sanctions Arcom)',
  'Rossiya RTR / RTR Planeta',
  'Rossiya 24 / Russia 24',
  'Perviy Kanal / Channel One Russia',
  'NTV / NTV Mir',
  'Sud Radio',
  'Sputnik',
  'RT en français (comptes sociaux)',
  'Sputnik (comptes sociaux FR)',
] as const;

describe('observatoire-censure dataset', () => {
  const entries = observatoireEntries();
  const publicEntries = observatoirePublicEntries(entries);

  it('compte 25 fiches (14 médias + 11 comptes) et les conserve toutes', () => {
    expect(data.media).toHaveLength(14);
    expect(data.influencers).toHaveLength(11);
    expect(entries).toHaveLength(25);
    for (const name of [...PUBLIC_NAMES, ...EN_VERIFICATION_NAMES]) {
      expect(entries.map((e) => e.name)).toContain(name);
    }
  });

  it('n’expose plus de teinte politique', () => {
    for (const row of [...data.media, ...data.influencers] as Record<string, unknown>[]) {
      expect(row.political_hue_label).toBeUndefined();
      expect(row.political_hue).toBeUndefined();
    }
  });

  it('n’a pas de date d’ajout par fiche', () => {
    for (const row of [...data.media, ...data.influencers] as Record<string, unknown>[]) {
      expect(row.added).toBeUndefined();
      expect(row.added_at).toBeUndefined();
      expect(row.date).toBeUndefined();
    }
  });

  it('restreint les types factuels aux six valeurs', () => {
    expect(FACTUAL_TYPES).toEqual([
      'chaîne TV',
      'radio',
      'média en ligne',
      'personnalité',
      'plateforme',
      'autorité publique',
    ]);
    for (const entry of entries) {
      expect(isFactualType(entry.factual_type)).toBe(true);
    }
  });

  it('applique les types demandés', () => {
    const byName = Object.fromEntries(entries.map((e) => [e.name, e]));
    expect(byName['TV Libertés']?.factual_type).toBe('média en ligne');
    expect(byName['RT en français (comptes sociaux)']?.factual_type).toBe('chaîne TV');
    expect(byName['Sud Radio']?.factual_type).toBe('radio');
    expect(byName['Dieudonné']?.factual_type).toBe('personnalité');
    expect(byName['Alain Soral / É&R']?.factual_type).toBe('personnalité');
    expect(byName['Papacito']?.factual_type).toBe('personnalité');
    expect(byName['Usul']?.factual_type).toBe('personnalité');
  });

  it('n’attribue aucune fiche « autorité publique » ni « plateforme »', () => {
    expect(entries.filter((e) => e.factual_type === 'autorité publique')).toHaveLength(0);
    expect(entries.filter((e) => e.factual_type === 'plateforme')).toHaveLength(0);
  });

  it('ne lie que des URL https de source officielle', () => {
    for (const entry of entries) {
      if (!entry.official_source_url) continue;
      expect(entry.official_source_url.startsWith('https://')).toBe(true);
      expect(entry.official_source_label).toBeTruthy();
      for (const ref of entry.official_sources || []) {
        expect(ref.url.startsWith('https://')).toBe(true);
        expect(ref.label).toBeTruthy();
      }
    }
  });

  it('calcule le libellé public de fraîcheur depuis le max des fiches publiques', () => {
    expect(latestMeasureDate(entries)).toBe('2026-02');
    expect(formatMeasureDate('2026-02')).toBe('février 2026');
    expect(formatMeasureDate('2025-02-19')).toBe('19 février 2025');
    expect(formatMeasureDate(undefined)).toBe('—');
    expect(formatMeasureMonthYear('2025-02-19')).toBe('février 2025');
    const latestPublic = latestMeasureDate(publicEntries);
    expect(latestPublic).toBe('2025-02-19');
    expect(documentedUntilLabel(publicEntries)).toBe(
      'Fiches documentées jusqu’en février 2025',
    );
    expect(documentedUntilLabel([{ measure_date: '2026-02' }])).toBe(
      'Fiches documentées jusqu’en février 2026',
    );
  });

  it('sort les fiches en vérification de la liste publique sans les supprimer', () => {
    expect(STATUS_EN_VERIFICATION).toBe('En vérification');
    const publicNames = publicEntries.map((e) => e.name);
    expect(publicNames.sort()).toEqual([...PUBLIC_NAMES].sort());
    for (const name of EN_VERIFICATION_NAMES) {
      expect(publicNames).not.toContain(name);
      expect(entries.some((e) => e.name === name && e.status === STATUS_EN_VERIFICATION)).toBe(
        true,
      );
    }
    expect(PAGE).toContain('observatoirePublicEntries');
    expect(PAGE).not.toMatch(/observatoireEntries\(\)/);
  });

  it('masque un filtre sans fiche publique', () => {
    const values = observatoirePublicFilterControls(publicEntries).map((c) => c.value);
    expect(values).toEqual(['all', 'chaîne TV', 'radio', 'média en ligne']);
    expect(values).not.toContain('plateforme');
    expect(values).not.toContain('autorité publique');
    expect(values).not.toContain('personnalité');
  });

  it('lie Perviy Kanal et NTV aux règlements (UE) 2022/2474 et 2023/180', () => {
    const url2474 = 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32022R2474';
    const url180 = 'https://eur-lex.europa.eu/legal-content/FR/TXT/?uri=CELEX:32023R0180';
    const sourceLabel =
      'Règlement (UE) 2022/2474, appliqué par le règlement d\u2019exécution (UE) 2023/180, à compter du 1er février 2023';
    for (const name of ['Perviy Kanal / Channel One Russia', 'NTV / NTV Mir']) {
      const entry = entries.find((e) => e.name === name);
      expect(entry?.official_source_url).toBe(url2474);
      expect(entry?.official_source_label).toBe(sourceLabel);
      expect(entry?.official_sources).toEqual([
        { url: url2474, label: 'Règlement (UE) 2022/2474' },
        { url: url180, label: 'règlement d\u2019exécution (UE) 2023/180' },
      ]);
      const segments = officialSourceSegments(entry!);
      expect(segments).toEqual([
        { type: 'link', url: url2474, label: 'Règlement (UE) 2022/2474' },
        { type: 'text', text: ', appliqué par le ' },
        { type: 'link', url: url180, label: 'règlement d\u2019exécution (UE) 2023/180' },
        { type: 'text', text: ', à compter du 1er février 2023' },
      ]);
      expect(entry?.measure_date).toBe('2023-02-01');
      expect(entry?.status).toBeUndefined();
      expect(entry?.motif_officiel.toLocaleLowerCase('fr-FR')).toContain(
        'règlement (ue) 2022/2474',
      );
      expect(entry?.motif_officiel.toLocaleLowerCase('fr-FR')).toContain(
        'règlement d\u2019exécution (ue) 2023/180',
      );
      expect(entry?.motif_officiel).toContain('1er février 2023');
      expect(entry?.motif_officiel).not.toMatch(/2022\/879/);
      expect(entry?.motif_officiel).not.toMatch(/sixième paquet/i);
      expect(publicEntries.map((e) => e.name)).toContain(name);
    }
    expect(PAGE).toContain('officialSourceSegments');
  });

  it('retire la mention du communiqué Conseil de l’UE du 02/03/2022', () => {
    const blob = JSON.stringify(data);
    expect(blob).not.toMatch(/communiqué 2 mars 2022/i);
    expect(blob).not.toMatch(/communiqué RT\/Sputnik/);
    expect(PAGE).not.toMatch(/communiqué 2 mars 2022/i);
  });

  it('remplace le jargon motif officieux dans le chapô et la méthode', () => {
    expect(data.disclaimer).toBe(
      `Synthèse documentaire LMDPT — pas d’avis juridique. ${MOTIF_SOURCE_PHRASE}`,
    );
    expect(PAGE).toContain(MOTIF_SOURCE_PHRASE);
    expect(PAGE).not.toMatch(/lecture secondaire/);
    expect(PAGE).not.toMatch(/fait LMDPT/);
    expect(PAGE).toContain('observatoirePublicFilterControls');
    expect(PAGE).toContain('documentedUntilLabel');
  });
});

describe('contribuer — mention RGPD', () => {
  it('affiche le texte mot pour mot et le mailto public', () => {
    expect(CONTRIBUER).toContain(
      'Vos coordonnées servent seulement à traiter votre contribution et sont supprimées une fois celle-ci traitée. Pour y accéder ou les effacer :',
    );
    expect(CONTRIBUER).toContain("mailto:${contactEmail}");
    expect(CONTRIBUER).toContain("const contactEmail = 'lemediadupremiertour@gmail.com'");
    expect(CONTRIBUER).not.toMatch(/durée/i);
    expect(CONTRIBUER).not.toMatch(/Emmanuel/);
    expect(CONTRIBUER).not.toMatch(/Lecourt/);
  });
});

describe('charte — date de mise à jour', () => {
  it('porte la date du merge (16/11/2026)', () => {
    expect(CHARTE).toContain("const updated = '2026-11-16'");
    expect(CHARTE).toContain('16 novembre 2026');
  });
});
