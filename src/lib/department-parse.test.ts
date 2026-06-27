import { describe, expect, it } from 'vitest';
import { buildDepartmentDataset } from './department-build';
import { candidateSlug, parseDepartmentTxt } from './department-parse';
import { parse2017DepartmentSheet } from './department-parse-xls';

const SAMPLE = `Code du département;Libellé du département;Etat saisie;Inscrits;Abstentions;% Abs/Ins;Votants;% Vot/Ins;Blancs;% Blancs/Ins;% Blancs/Vot;Nuls;% Nuls/Ins;% Nuls/Vot;Exprimés;% Exp/Ins;% Exp/Vot;Sexe;Nom;Prénom;Voix;% Voix/Ins;% Voix/Exp
01;Ain;Complet;100;20;20,00;80;80,00;1;0,01;1,25;1;0,01;1,25;78;78,00;97,50;M;MACRON;Emmanuel;30;30,00;38,46
01;Ain;Complet;100;20;20,00;80;80,00;1;0,01;1,25;1;0,01;1,25;78;78,00;97,50;F;LE PEN;Marine;25;25,00;32,05
02;Aisne;Complet;200;40;20,00;160;80,00;2;0,01;1,25;2;0,01;1,25;156;78,00;97,50;F;LE PEN;Marine;50;25,00;32,05
02;Aisne;Complet;200;40;20,00;160;80,00;2;0,01;1,25;2;0,01;1,25;156;78,00;97,50;M;MACRON;Emmanuel;40;20,00;25,64
`;

describe('department-parse', () => {
  it('parses semicolon TXT rows', () => {
    const rows = parseDepartmentTxt(SAMPLE);
    expect(rows).toHaveLength(4);
    expect(rows[0]?.code).toBe('01');
    expect(rows[0]?.pctExprimes).toBe(38.46);
  });

  it('maps candidate slugs', () => {
    expect(candidateSlug('MACRON', 'Emmanuel')).toBe('macron');
    expect(candidateSlug('LE PEN', 'Marine')).toBe('le-pen');
    expect(candidateSlug('FILLON', 'François')).toBe('fillon');
  });

  it('builds department dataset with leaders', () => {
    const dataset = buildDepartmentDataset(parseDepartmentTxt(SAMPLE), {
      election: 'Test',
      date: '2022-04-10',
      source: 'https://example.com',
      source_label: 'Test',
    });
    expect(dataset.departements).toHaveLength(2);
    expect(dataset.departements[0]?.leader_slug).toBe('macron');
    expect(dataset.departements[1]?.leader_slug).toBe('le-pen');
  });

  it('parses 2017 XLS wide rows', () => {
    const wide = parse2017DepartmentSheet([
      [
        'Code du département',
        'Libellé du département',
        'Inscrits',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        '',
        'Exprimés',
        '% Exp/Ins',
        '% Exp/Vot',
        'Sexe',
        'Nom',
        'Prénom',
        'Voix',
        '% Voix/Ins',
        '% Voix/Exp',
      ],
      [
        1,
        'Ain',
        100,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        80,
        0,
        0,
        'M',
        'MACRON',
        'Emmanuel',
        30,
        0,
        38,
      ],
      [
        2,
        'Aisne',
        200,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        0,
        156,
        0,
        0,
        'F',
        'LE PEN',
        'Marine',
        50,
        0,
        32,
      ],
    ]);
    expect(wide).toHaveLength(2);
    expect(wide[0]?.exprimes).toBe(80);
    expect(wide[0]?.candidates[0]?.prenom).toBe('Emmanuel');
    expect(wide[0]?.candidates[0]?.pctExprimes).toBe(38);
  });
});
