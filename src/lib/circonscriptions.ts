import type {
  CirconscriptionElectionDataset,
  CirconscriptionResult,
  DepartmentElectionDataset,
  ElectionDataset,
} from './election-types';
import circo2024 from '../data/elections/2024-legislatives-1er-tour-circonscriptions.json';
import circo2024t2 from '../data/elections/2024-legislatives-2nd-tour-circonscriptions.json';
import circoGeoIndex from '../data/geo/circonscriptions-index-2024.json';

const CIRCO_REGISTRY: Record<string, CirconscriptionElectionDataset> = {
  '2024-legislatives': circo2024 as CirconscriptionElectionDataset,
  '2024-legislatives-t2': circo2024t2 as CirconscriptionElectionDataset,
};

export { legendForNuances, nuanceColor, nuanceLabel } from './legislative-style';

/** Géographie stable des 577 circonscriptions (découpage 2024). */
export interface CirconscriptionGeo {
  code: string;
  departement: string;
  nom: string;
}

export interface CirconscriptionGeoIndex {
  version: number;
  source_election: string;
  source_label: string;
  count: number;
  circonscriptions: CirconscriptionGeo[];
}

export function getCirconscriptionResults(slug: string): CirconscriptionElectionDataset | undefined {
  return CIRCO_REGISTRY[slug];
}

/** Index géographique (577) — base de mapping présidentielle → circo. */
export function getCirconscriptionGeoIndex(): CirconscriptionGeoIndex {
  return circoGeoIndex as CirconscriptionGeoIndex;
}

export function listCircosByDepartment(departement: string): CirconscriptionGeo[] {
  const code = String(departement).padStart(2, '0');
  return getCirconscriptionGeoIndex().circonscriptions.filter(
    (c) => c.departement === code || c.departement === departement,
  );
}

export function countLeadersByNuance(
  dataset: CirconscriptionElectionDataset,
): Array<{ code: string; count: number }> {
  const counts = new Map<string, number>();
  for (const c of dataset.circonscriptions) {
    const code = c.leader_nuance_code;
    counts.set(code, (counts.get(code) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([code, count]) => ({ code, count }))
    .sort((a, b) => b.count - a.count);
}

export interface LegislativeDepartmentSummary {
  code: string;
  nom: string;
  leader_nuance_code: string;
  circo_count: number;
  /** Nuances en tête de circonscription, triées par nombre de sièges */
  breakdown: Array<{ code: string; count: number; avg_pct: number }>;
}

/** Agrège les leaders de circonscription par département (nuance la plus fréquente). */
export function aggregateDepartmentLeadersFromCircos(
  dataset: CirconscriptionElectionDataset,
  departmentNames: Map<string, string>,
): LegislativeDepartmentSummary[] {
  const byDept = new Map<string, typeof dataset.circonscriptions>();

  for (const c of dataset.circonscriptions) {
    const list = byDept.get(c.departement) ?? [];
    list.push(c);
    byDept.set(c.departement, list);
  }

  const summaries: LegislativeDepartmentSummary[] = [];

  for (const [code, circos] of byDept) {
    const nuanceStats = new Map<string, { count: number; pctSum: number }>();
    for (const c of circos) {
      const nuance = c.leader_nuance_code;
      const prev = nuanceStats.get(nuance) ?? { count: 0, pctSum: 0 };
      nuanceStats.set(nuance, {
        count: prev.count + 1,
        pctSum: prev.pctSum + c.leader_pct,
      });
    }

    const breakdown = [...nuanceStats.entries()]
      .map(([nuanceCode, stats]) => ({
        code: nuanceCode,
        count: stats.count,
        avg_pct: stats.pctSum / stats.count,
      }))
      .sort((a, b) => b.count - a.count || b.avg_pct - a.avg_pct);

    summaries.push({
      code,
      nom: departmentNames.get(code) ?? `Département ${code}`,
      leader_nuance_code: breakdown[0]?.code ?? 'DVC',
      circo_count: circos.length,
      breakdown,
    });
  }

  return summaries.sort((a, b) => a.code.localeCompare(b.code, 'fr', { numeric: true }));
}

/**
 * Part des N premiers candidats (concentration / anti-pluralité).
 * Plus bas = pluralité plus dispersée (DOE).
 */
export function topNShareExprimes(dataset: ElectionDataset, n = 3): number {
  const top = [...dataset.national.candidats]
    .sort((a, b) => b.pourcentage_exprimes - a.pourcentage_exprimes)
    .slice(0, n);
  return top.reduce((acc, c) => acc + c.pourcentage_exprimes, 0);
}

export interface PluralityComparisonRow {
  slug: string;
  label: string;
  candidats: number;
  top3_pct: number;
  leader_nom: string;
  leader_pct: number;
}

/** Comparatif pluralité 1er tour (national) entre plusieurs scrutins. */
export function compareFirstRoundPlurality(
  rows: Array<{ slug: string; label: string; dataset: ElectionDataset }>,
): PluralityComparisonRow[] {
  return rows.map(({ slug, label, dataset }) => {
    const sorted = [...dataset.national.candidats].sort(
      (a, b) => b.pourcentage_exprimes - a.pourcentage_exprimes,
    );
    const leader = sorted[0];
    return {
      slug,
      label,
      candidats: dataset.national.candidats.length,
      top3_pct: Math.round(topNShareExprimes(dataset, 3) * 100) / 100,
      leader_nom: leader?.nom ?? '—',
      leader_pct: leader?.pourcentage_exprimes ?? 0,
    };
  });
}

export type DeptToCircoMode = 'inherit-leader';

export interface MapDeptToCircoOptions {
  election: string;
  date: string;
  source: string;
  source_label: string;
  /** inherit-leader : chaque circo reprend le leader du département (pédagogie, pas un vrai résultat circo). */
  mode?: DeptToCircoMode;
}

/**
 * Mappe des résultats présidentiels départementaux sur la géographie des 577 circo 2024.
 *
 * **Attention pédagogique** : ce n’est pas un résultat officiel par circonscription.
 * Mode `inherit-leader` : chaque circo du département hérite du leader départemental
 * (bridge atlas législatives 2024 ↔ présidentielle, en attendant data.gouv circo 2027).
 */
export function mapDepartmentResultsToCircos(
  deptDataset: DepartmentElectionDataset,
  options: MapDeptToCircoOptions,
  geo: CirconscriptionGeoIndex = getCirconscriptionGeoIndex(),
): CirconscriptionElectionDataset {
  const mode = options.mode ?? 'inherit-leader';
  const byDept = new Map(deptDataset.departements.map((d) => [d.code, d]));

  const circonscriptions: CirconscriptionResult[] = [];
  let mapped = 0;
  let missingDept = 0;

  for (const g of geo.circonscriptions) {
    const dept =
      byDept.get(g.departement) ??
      byDept.get(g.departement.replace(/^0/, '')) ??
      byDept.get(g.departement.padStart(2, '0'));

    if (!dept) {
      missingDept += 1;
      circonscriptions.push({
        code: g.code,
        departement: g.departement,
        nom: g.nom,
        inscrits: 0,
        exprimes: 0,
        nb_candidats: 0,
        leader_nom: '—',
        leader_prenom: '',
        leader_nuance_code: 'DIV',
        leader_nuance: 'Données département manquantes',
        leader_voix: 0,
        leader_pct: 0,
        qualifie_t2: false,
      });
      continue;
    }

    if (mode === 'inherit-leader') {
      const sorted = [...dept.candidats].sort(
        (a, b) => b.pourcentage_exprimes - a.pourcentage_exprimes,
      );
      const leader = sorted[0];
      // Nom complet en leader_nom (évite « Marine LE PEN » → nom « PEN »)
      const leaderNom = leader?.nom ?? dept.leader_slug ?? '—';

      // Répartition pédagogique des inscrits/exprimés du département entre ses circo
      const circosInDept = geo.circonscriptions.filter((c) => c.departement === g.departement);
      const share = circosInDept.length > 0 ? 1 / circosInDept.length : 1;

      circonscriptions.push({
        code: g.code,
        departement: g.departement,
        nom: g.nom,
        inscrits: Math.round(dept.inscrits * share),
        exprimes: Math.round(dept.exprimes * share),
        nb_candidats: dept.candidats.length,
        leader_nom: leaderNom,
        leader_prenom: '',
        leader_nuance_code: leader?.slug ?? dept.leader_slug ?? 'DIV',
        leader_nuance: leaderNom,
        leader_voix: Math.round((leader?.voix ?? 0) * share),
        leader_pct: leader?.pourcentage_exprimes ?? 0,
        qualifie_t2: false,
      });
      mapped += 1;
    }
  }

  void mapped;
  void missingDept;

  return {
    election: options.election,
    date: options.date,
    source: options.source,
    source_label: options.source_label,
    circonscriptions,
  };
}

export interface CircoMapReadiness {
  geo_count: number;
  has_official_circo: boolean;
  official_slug: string | null;
  map_from_dept_available: boolean;
  note: string;
}

/** État de granularité circo pour un scrutin (ex. 2027-presidentielle). */
export function getCircoMapReadiness(slug: string): CircoMapReadiness {
  const geo = getCirconscriptionGeoIndex();
  const official = getCirconscriptionResults(slug);
  if (official) {
    return {
      geo_count: geo.count,
      has_official_circo: true,
      official_slug: slug,
      map_from_dept_available: false,
      note: 'Jeu officiel par circonscription disponible.',
    };
  }
  if (slug === '2027-presidentielle') {
    return {
      geo_count: geo.count,
      has_official_circo: false,
      official_slug: null,
      map_from_dept_available: false,
      note:
        'Scrutin 2027 non tenu : index géo 577 prêt (base 2024). Stub départements pipeline enregistré (0 dept). Import data.gouv après publication officielle ; bridge pédagogique national + atlas législatives 2024.',
    };
  }
  return {
    geo_count: geo.count,
    has_official_circo: false,
    official_slug: null,
    map_from_dept_available: true,
    note: 'Pas de jeu circo officiel pour ce slug — mapping département → géo 2024 possible si dataset départemental chargé.',
  };
}
