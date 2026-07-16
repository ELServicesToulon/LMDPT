import type {
  ProgramCandidateFile,
  ProgramScrutinMeta,
  ProgramTheme,
  ProgramVeilleIndex,
} from './program-types';
import themes from '../data/programmes/taxonomy-themes.json';
import evolutionMatrix from '../data/programmes/evolution-matrix.json';
import veille2027 from '../data/programmes/presidentielle-2027/_index.json';

import macron2017 from '../data/programmes/presidentielle-2017/macron.json';
import lePen2017 from '../data/programmes/presidentielle-2017/le-pen.json';
import melenchon2017 from '../data/programmes/presidentielle-2017/melenchon.json';
import fillon2017 from '../data/programmes/presidentielle-2017/fillon.json';
import hamon2017 from '../data/programmes/presidentielle-2017/hamon.json';

import macron2022 from '../data/programmes/presidentielle-2022/macron.json';
import lePen2022 from '../data/programmes/presidentielle-2022/le-pen.json';
import melenchon2022 from '../data/programmes/presidentielle-2022/melenchon.json';
import pecresse2022 from '../data/programmes/presidentielle-2022/pecresse.json';
import zemmour2022 from '../data/programmes/presidentielle-2022/zemmour.json';

import attal2027 from '../data/programmes/presidentielle-2027/attal.json';
import melenchon2027 from '../data/programmes/presidentielle-2027/melenchon.json';
import retailleau2027 from '../data/programmes/presidentielle-2027/retailleau.json';
import ps2027 from '../data/programmes/presidentielle-2027/parti-socialiste.json';
import philippeBrun2027 from '../data/programmes/presidentielle-2027/philippe-brun.json';
import philippe2027 from '../data/programmes/presidentielle-2027/philippe.json';
import bardella2027 from '../data/programmes/presidentielle-2027/bardella.json';
import barrot2027 from '../data/programmes/presidentielle-2027/barrot.json';
import lePen2027 from '../data/programmes/presidentielle-2027/le-pen.json';
import ruffin2027 from '../data/programmes/presidentielle-2027/ruffin.json';
import lisnard2027 from '../data/programmes/presidentielle-2027/lisnard.json';

export const PROGRAM_THEMES = themes as ProgramTheme[];

export const PROGRAM_SCRUTINS: ProgramScrutinMeta[] = [
  {
    id: 'presidentielle-2017',
    label: 'Présidentielle 2017 — 1er tour',
    date: '2017-04-23',
    status: 'complete',
  },
  {
    id: 'presidentielle-2022',
    label: 'Présidentielle 2022 — 1er tour',
    date: '2022-04-10',
    status: 'complete',
  },
  {
    id: 'presidentielle-2027',
    label: 'Présidentielle 2027 — préparation',
    status: 'partial',
  },
];

const PROGRAM_REGISTRY: Record<string, ProgramCandidateFile[]> = {
  'presidentielle-2017': [
    macron2017,
    lePen2017,
    melenchon2017,
    fillon2017,
    hamon2017,
  ] as ProgramCandidateFile[],
  'presidentielle-2022': [
    macron2022,
    lePen2022,
    melenchon2022,
    pecresse2022,
    zemmour2022,
  ] as ProgramCandidateFile[],
  'presidentielle-2027': [attal2027, melenchon2027, retailleau2027, ps2027, philippeBrun2027, philippe2027, bardella2027, barrot2027, lePen2027, ruffin2027, lisnard2027] as ProgramCandidateFile[],
};

export function getThemeLabel(id: string): string {
  return PROGRAM_THEMES.find((t) => t.id === id)?.label ?? id;
}

export function listScrutins(): ProgramScrutinMeta[] {
  return PROGRAM_SCRUTINS;
}

export function getScrutin(id: string): ProgramScrutinMeta | undefined {
  return PROGRAM_SCRUTINS.find((s) => s.id === id);
}

export function listCandidates(scrutinId: string): ProgramCandidateFile[] {
  const files = PROGRAM_REGISTRY[scrutinId] ?? [];
  return [...files].sort((a, b) => a.candidate.name.localeCompare(b.candidate.name, 'fr'));
}

export function getCandidateProgram(
  scrutinId: string,
  slug: string,
): ProgramCandidateFile | undefined {
  return listCandidates(scrutinId).find((c) => c.candidate.slug === slug);
}

export function getAllProgramFiles(): ProgramCandidateFile[] {
  return Object.values(PROGRAM_REGISTRY).flat();
}

export function getEvolutionMatrix() {
  return evolutionMatrix;
}

export function getVeille2027(): ProgramVeilleIndex {
  return veille2027 as ProgramVeilleIndex;
}

export const AUTEUR_LABELS: Record<string, string> = {
  institut_montaigne: 'Institut Montaigne',
  ofce: 'OFCE',
  candidat: 'Campagne',
  lmdpt: 'Estimation LMDPT',
};

export const STATUS_LABELS: Record<string, string> = {
  nouveau: 'Nouveau',
  maintenu: 'Maintenu',
  modifie: 'Modifié',
  retire: 'Retiré',
  inconnu: 'Non précisé',
};

export const PROGRAM_STATUS_LABELS: Record<string, string> = {
  awaiting_program: 'En attente (non intégré)',
  partial: 'Partiel',
  published: 'Publié',
};
