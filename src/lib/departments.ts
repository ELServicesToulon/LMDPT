import type { DepartmentElectionDataset } from './election-types';
import dept2022 from '../data/elections/2022-presidentielle-1er-tour-departements.json';

export {
  CANDIDATE_COLORS,
  CANDIDATE_LABELS,
  CANDIDATE_SLUGS,
  candidateSlug,
  parseDepartmentTxt,
  PRESIDENTIELLE_2022_DEPT_SOURCE_URL,
} from './department-parse';
export type { CandidateSlug } from './department-parse';
export { buildDepartmentDataset } from './department-build';

const DEPT_REGISTRY: Record<string, DepartmentElectionDataset> = {
  '2022-presidentielle': dept2022 as DepartmentElectionDataset,
};

export function getDepartmentResults(slug: string): DepartmentElectionDataset | undefined {
  return DEPT_REGISTRY[slug];
}
