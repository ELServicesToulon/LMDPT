export interface DebateSource {
  label: string;
  url: string;
}

export interface DebateArgument {
  text: string;
  source: DebateSource;
}

export interface DebatePosition {
  id: string;
  label: string;
  arguments: DebateArgument[];
}

export type DebateStatus = 'ouvert' | 'clos';

export interface DebateDataset {
  slug: string;
  question: string;
  date: string;
  status: DebateStatus;
  context: string;
  charte: string;
  positions: DebatePosition[];
  related: string[];
  discussion_id?: string;
}

export interface DebateSummary {
  slug: string;
  question: string;
  description: string;
  date: string;
  status: DebateStatus;
  href: string;
}
