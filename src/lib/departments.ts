import type { DepartmentElectionDataset } from './election-types';
import dept2017 from '../data/elections/2017-presidentielle-1er-tour-departements.json';
import dept2022 from '../data/elections/2022-presidentielle-1er-tour-departements.json';
import dept2027 from '../data/elections/2027-presidentielle-1er-tour-departements.json';

export {
  candidateColor,
  candidateLabel,
  CANDIDATE_LABELS,
  CANDIDATE_PALETTE,
  legendForSlugs,
} from './candidate-style';

const DEPT_REGISTRY: Record<string, DepartmentElectionDataset> = {
  '2017-presidentielle': dept2017 as DepartmentElectionDataset,
  '2022-presidentielle': dept2022 as DepartmentElectionDataset,
  '2027-presidentielle': dept2027 as DepartmentElectionDataset,
};

export type DepartmentMapReadiness = {
  slug: string;
  registered: boolean;
  dept_count: number;
  map_ready: boolean;
  stub: boolean;
  note: string;
};

export function getDepartmentResults(slug: string): DepartmentElectionDataset | undefined {
  return DEPT_REGISTRY[slug];
}

/** Pipeline cartes départementales : stub 2027 = enregistré, 0 ligne jusqu’au scrutin. */
export function getDepartmentMapReadiness(slug: string): DepartmentMapReadiness {
  const ds = DEPT_REGISTRY[slug];
  if (!ds) {
    return {
      slug,
      registered: false,
      dept_count: 0,
      map_ready: false,
      stub: false,
      note: 'Pas de dataset départemental pour ce slug.',
    };
  }
  const count = ds.departements.length;
  const stub = slug === '2027-presidentielle' && count === 0;
  return {
    slug,
    registered: true,
    dept_count: count,
    map_ready: count > 0,
    stub,
    note: stub
      ? 'Stub pipeline 2027 enregistré (0 département). Import data.gouv après le scrutin — miroir 2017/2022.'
      : `${count} départements chargés.`,
  };
}
