import { describe, expect, it } from 'vitest';
import {
  mergeLegislatives2024RealSeats,
  parseT2CirconscriptionsCsv,
  parseT2NationalCsv,
} from './legislatives-parse';
import type { CirconscriptionElectionDataset } from './election-types';

const T2_CIRCO_FIXTURE = `"Code département";"Libellé département";"Code circonscription législative";"Libellé circonscription législative";Inscrits;Votants;"% Votants";Abstentions;"% Abstentions";Exprimés;"% Exprimés/inscrits";"% Exprimés/votants";Blancs;"% Blancs/inscrits";"% Blancs/votants";Nuls;"% Nuls/inscrits";"% Nuls/votants";"Numéro de panneau 1";"Nuance candidat 1";"Nom candidat 1";"Prénom candidat 1";"Sexe candidat 1";"Voix 1";"% Voix/inscrits 1";"% Voix/exprimés 1";"Elu 1";"Numéro de panneau 2";"Nuance candidat 2";"Nom candidat 2";"Prénom candidat 2";"Sexe candidat 2";"Voix 2";"% Voix/inscrits 2";"% Voix/exprimés 2";"Elu 2"
"01";Ain;"0101";"1ère circonscription";86854;62311;"71,74%";24543;"28,26%";60005;"69,09%";"96,30%";1797;"2,07%";"2,88%";509;"0,59%";"0,82%";2;RN;MAÎTRE;Christophe;MASCULIN;26116;"30,07%";"43,52%";;3;LR;BRETON;Xavier;MASCULIN;33889;"39,02%";"56,48%";élu
`;

const T2_NATIONAL_FIXTURE = `Inscrits;Votants;% Abstentions;Blancs;Nuls;Exprimés;Nuance candidat 1;Voix 1;% Voix/inscrits 1;% Voix/exprimés 1;Nuance candidat 2;Voix 2;% Voix/inscrits 2;% Voix/exprimés 2
100;80;20,00%;2;1;77;RN;40;40,00%;51,95%;UG;37;37,00%;48,05%
`;

describe('legislatives T2 parser', () => {
  it('picks the elu cell as winner (Ain 1re)', () => {
    const rows = parseT2CirconscriptionsCsv(T2_CIRCO_FIXTURE);
    expect(rows).toHaveLength(1);
    expect(rows[0]?.code).toBe('0101');
    expect(rows[0]?.leader_nom).toBe('BRETON');
    expect(rows[0]?.leader_nuance_code).toBe('LR');
    expect(rows[0]?.leader_pct).toBeCloseTo(56.48, 2);
    expect(rows[0]?.elu_tour).toBe(2);
    expect(rows[0]?.nb_candidats).toBe(2);
  });

  it('parses France entière T2 vote shares', () => {
    const national = parseT2NationalCsv(T2_NATIONAL_FIXTURE);
    expect(national.tour).toBe(2);
    expect(national.national.inscrits).toBe(100);
    expect(national.national.candidats[0]?.nom).toBe('RN');
    expect(national.national.candidats[0]?.voix).toBe(40);
  });

  it('merges T2 winners with T1-only seats to 577 shape', () => {
    const t2 = parseT2CirconscriptionsCsv(T2_CIRCO_FIXTURE);
    const t1: CirconscriptionElectionDataset = {
      election: 't1',
      date: '2024-06-30',
      source: 'test',
      source_label: 'test',
      circonscriptions: [
        {
          code: '0101',
          departement: '01',
          nom: 'overlap',
          inscrits: 1,
          exprimes: 1,
          nb_candidats: 1,
          leader_nom: 'SKIP',
          leader_prenom: '',
          leader_nuance_code: 'RN',
          leader_nuance: 'RN',
          leader_voix: 1,
          leader_pct: 50,
          qualifie_t2: true,
        },
        {
          code: '9999',
          departement: '99',
          nom: 'elu T1 only',
          inscrits: 2,
          exprimes: 2,
          nb_candidats: 1,
          leader_nom: 'SOLO',
          leader_prenom: 'A',
          leader_nuance_code: 'ENS',
          leader_nuance: 'ENS',
          leader_voix: 2,
          leader_pct: 60,
          qualifie_t2: false,
        },
      ],
    };
    const merged = mergeLegislatives2024RealSeats(t2, t1);
    expect(merged.circonscriptions).toHaveLength(2);
    expect(merged.circonscriptions.find((c) => c.code === '0101')?.leader_nom).toBe('BRETON');
    expect(merged.circonscriptions.find((c) => c.code === '9999')?.elu_tour).toBe(1);
  });
});
