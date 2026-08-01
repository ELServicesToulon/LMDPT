/** Observatoire de la censure — loader + gates anti-diffamation. */
import data from '../data/observatoire-censure.json';

export type ObsSource = { label: string; url: string };

export type ObsMedia = {
  id: string;
  name: string;
  type: string;
  action_label: string;
  motif_officiel?: string;
  motif_officieux?: string;
  verification: 'documented' | 'partial';
  sources?: ObsSource[];
};

export type ObsInfluencer = {
  id: string;
  display_name: string;
  handle?: string;
  motif_officiel?: string;
  motif_officieux?: string;
  verification: 'documented' | 'partial';
  sources?: ObsSource[];
};

export function loadObservatoire() {
  return data as {
    schema: string;
    title: string;
    updated: string;
    disclaimer: string;
    media: ObsMedia[];
    influencers: ObsInfluencer[];
  };
}

export function httpsSources(entry: { sources?: ObsSource[] }): ObsSource[] {
  return (entry.sources ?? []).filter((s) => /^https?:\/\//i.test(s.url || ''));
}

/** documented ⇒ ≥1 URL https (fail-closed anti-diffamation). */
export function documentedHasHttps(entry: {
  verification: string;
  sources?: ObsSource[];
}): boolean {
  if (entry.verification !== 'documented') return true;
  return httpsSources(entry).length >= 1;
}

/** Motif officieux affichable seulement si ≥1 source https. */
export function mayShowOfficieux(entry: {
  motif_officieux?: string;
  sources?: ObsSource[];
}): boolean {
  return Boolean(entry.motif_officieux?.trim()) && httpsSources(entry).length >= 1;
}
