/** Croquis unique d’un texte éditorial — jamais partagé entre deux posts. */
export interface EditorialCover {
  src: string;
  alt: string;
}

export type EditorialKind = 'analyse' | 'debat';
