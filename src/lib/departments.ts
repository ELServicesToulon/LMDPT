import type { DepartmentElectionDataset } from './election-types';
import dept2017 from '../data/elections/2017-presidentielle-1er-tour-departements.json';
import dept2022 from '../data/elections/2022-presidentielle-1er-tour-departements.json';

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
};

export function getDepartmentResults(slug: string): DepartmentElectionDataset | undefined {
  return DEPT_REGISTRY[slug];
}
