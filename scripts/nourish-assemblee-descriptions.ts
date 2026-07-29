#!/usr/bin/env tsx
/**
 * Nourrit TOUTES les descriptions de l’assemblée + historiques d’évolution
 * documentés (« il n’y a que les imbéciles qui ne changent pas d’avis »).
 *
 * - Ne invente pas de bascule : stance_history seulement si motifs sourcés.
 * - Enrichit summary / rationale pour les 577 sièges à partir des champs existants.
 *
 * Usage : npx tsx scripts/nourish-assemblee-descriptions.ts
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/assemblee-influenceurs.json');
const WATCH = path.join(ROOT, 'src/data/assemblee-stance-veille-watchlist.json');

const FAMILY_LABEL: Record<string, string> = {
  'gauche-radicale': 'gauche radicale',
  'social-democrate': 'social-démocrate',
  centre: 'centre',
  droite: 'droite',
  'droite-nationale': 'droite nationale',
  autre: 'transversale / autre',
};

type Hist = {
  as_of: string;
  family: string;
  label: string;
  status: 'declare' | 'estime';
  confidence?: number;
  motifs: string[];
  sources: Array<{ label: string; url: string }>;
};

/** Bascules publiques documentées (Wikipédia / sources ouvertes). */
const EVOLUTIONS: Record<
  string,
  {
    summary: string;
    stance: {
      family: string;
      label: string;
      status: 'declare' | 'estime';
      confidence?: number;
      rationale: string;
      sources: Array<{ label: string; url: string }>;
    };
    history: Hist[];
  }
> = {
  'tatiana-ventose': {
    // déjà patché — on ne regénère que si absent ; script skip si history longue
    summary: '',
    stance: {
      family: 'droite-nationale',
      label: 'Droite nationale',
      status: 'estime',
      confidence: 0.65,
      rationale: '',
      sources: [],
    },
    history: [],
  },
  'alain-soral-r-egalitereconciliation': {
    summary:
      'Essayiste et vidéaste : passé par la gauche communiste puis le Front national (comité central), avant de fonder Égalité & Réconciliation. Évolution documentée vers une ligne d’extrême droite antisystème — teinte pédagogique actuelle droite nationale, pas une carte d’adhésion.',
    stance: {
      family: 'droite-nationale',
      label: 'Droite nationale',
      status: 'estime',
      confidence: 0.75,
      rationale:
        'Parcours public : PCF (années 1990, revendiqué) → FN → E&R ; discours nationaliste / « antisioniste » documenté. Teinte pédagogique droite nationale.',
      sources: [
        { label: 'Wikipédia — Alain Soral', url: 'https://fr.wikipedia.org/wiki/Alain_Soral' },
        { label: 'Site Égalité & Réconciliation', url: 'https://www.egaliteetreconciliation.fr/' },
      ],
    },
    history: [
      {
        as_of: '1990-2005',
        family: 'gauche-radicale',
        label: 'Gauche radicale',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Affirme un engagement communiste dans les années 1990 (propos et biographies publiques).',
          'Présence médiatique / essais avant le basculement vers le FN.',
        ],
        sources: [
          { label: 'Wikipédia — Alain Soral (années 1990)', url: 'https://fr.wikipedia.org/wiki/Alain_Soral' },
        ],
      },
      {
        as_of: '2005-2009',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'declare',
        motifs: [
          'Adhésion au Front national ; membre du comité central.',
          'Rupture progressive avec la gauche partisane.',
        ],
        sources: [
          { label: 'Wikipédia — passage FN', url: 'https://fr.wikipedia.org/wiki/Alain_Soral' },
        ],
      },
      {
        as_of: '2007+',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'estime',
        confidence: 0.8,
        motifs: [
          'Fondation d’Égalité & Réconciliation avec d’anciens cadres du GUD.',
          'Companonnage public avec Dieudonné ; ligne « dissidente » hors médias mainstream.',
        ],
        sources: [
          { label: 'Wikipédia — E&R / Dieudonné', url: 'https://fr.wikipedia.org/wiki/Alain_Soral' },
        ],
      },
    ],
  },
  'dieudonn-dieudolive': {
    summary:
      'Humoriste devenu figure politique controversée : carrière spectacle à gauche / antiraciste des années 1990, puis bascule vers une ligne antisystème et des spectacles jugés antisémites. Teinte pédagogique actuelle « autre / transversal » (hors carte partisane classique) — synthèse documentaire, pas un jugement moral.',
    stance: {
      family: 'autre',
      label: 'Autre / transversal',
      status: 'estime',
      confidence: 0.6,
      rationale:
        'Parcours public documenté : humoriste engagé puis proximité Soral / listes antisystème ; condamnation pénale pour propos antisémites. Placement « autre » (hors famille 1er tour classique).',
      sources: [
        { label: 'Wikipédia — Dieudonné', url: 'https://fr.wikipedia.org/wiki/Dieudonn%C3%A9' },
      ],
    },
    history: [
      {
        as_of: '1990-2002',
        family: 'gauche-radicale',
        label: 'Gauche radicale',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Duo Élie et Dieudonné ; sketches antiracistes et présence médiatique grand public.',
          'Soutiens ponctuels à des causes de gauche dans les années 1990.',
        ],
        sources: [
          { label: 'Wikipédia — débuts', url: 'https://fr.wikipedia.org/wiki/Dieudonn%C3%A9' },
        ],
      },
      {
        as_of: '2002-2009',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.6,
        motifs: [
          'Candidatures / listes « antisystème » ; rupture progressive avec les médias traditionnels.',
          'Rapprochement public avec Alain Soral.',
        ],
        sources: [
          { label: 'Wikipédia — bascule politique', url: 'https://fr.wikipedia.org/wiki/Dieudonn%C3%A9' },
        ],
      },
      {
        as_of: '2010+',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.65,
        motifs: [
          'Spectacles et discours « antisionistes » ; plusieurs condamnations pour provocation à la haine.',
          'Diffusion hors circuits mainstream (sites, tournées).',
        ],
        sources: [
          { label: 'Wikipédia — condamnations / ligne', url: 'https://fr.wikipedia.org/wiki/Dieudonn%C3%A9' },
        ],
      },
    ],
  },
  'x-eric-zemmour': {
    summary:
      'Essayiste et chroniqueur devenu candidat à la présidentielle 2022 (Reconquête). Long parcours médiatique (Figaro, CNews) avant l’entrée en campagne — évolution du commentaire vers l’offre électorale. Teinte pédagogique droite nationale.',
    stance: {
      family: 'droite-nationale',
      label: 'Droite nationale',
      status: 'declare',
      confidence: 0.9,
      rationale:
        'Fondateur de Reconquête ; candidature présidentielle 2022 documentée ; ligne identitaire / souverainiste assumée publiquement.',
      sources: [
        { label: 'Wikipédia — Éric Zemmour', url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Zemmour' },
        { label: 'Compte X public', url: 'https://x.com/ZemmourEric' },
      ],
    },
    history: [
      {
        as_of: '1980-2019',
        family: 'droite',
        label: 'Droite',
        status: 'estime',
        confidence: 0.6,
        motifs: [
          'Journaliste et essayiste (Figaro Magazine, etc.) — commentaire conservateur avant parti.',
          'Présence TV (CNews) comme éditorialiste, hors candidature.',
        ],
        sources: [
          { label: 'Wikipédia — carrière médiatique', url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Zemmour' },
        ],
      },
      {
        as_of: '2021-2022',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'declare',
        motifs: [
          'Annonce de candidature présidentielle ; création de Reconquête.',
          'Campagne axée immigration, identité, « grand remplacement » (propos publics).',
        ],
        sources: [
          { label: 'Wikipédia — présidentielle 2022', url: 'https://fr.wikipedia.org/wiki/%C3%89ric_Zemmour' },
        ],
      },
    ],
  },
  'x-gabriel-attal': {
    summary:
      'Cadre Renaissance / ex-Premier ministre. Parcours : engagement de jeunesse (dont un temps à gauche / Jospin selon biographies), puis majorité macroniste — évolution vers le centre gouvernemental documentée. Teinte pédagogique centre.',
    stance: {
      family: 'centre',
      label: 'Centre',
      status: 'declare',
      confidence: 0.85,
      rationale:
        'Affiliation Renaissance / majorité présidentielle documentée ; fonctions ministérielles puis Matignon.',
      sources: [
        { label: 'Wikipédia — Gabriel Attal', url: 'https://fr.wikipedia.org/wiki/Gabriel_Attal' },
        { label: 'Compte X public', url: 'https://x.com/GabrielAttal' },
      ],
    },
    history: [
      {
        as_of: '2000s',
        family: 'social-democrate',
        label: 'Social-démocrate',
        status: 'estime',
        confidence: 0.45,
        motifs: [
          'Engagements de jeunesse cités dans les biographies (sensibilité de gauche / soutien Jospin selon sources secondaires).',
        ],
        sources: [
          { label: 'Wikipédia — parcours', url: 'https://fr.wikipedia.org/wiki/Gabriel_Attal' },
        ],
      },
      {
        as_of: '2016+',
        family: 'centre',
        label: 'Centre',
        status: 'declare',
        motifs: [
          'Ralliement à En Marche / Renaissance.',
          'Ascension ministérielle puis nomination Premier ministre.',
        ],
        sources: [
          { label: 'Wikipédia — Renaissance / Matignon', url: 'https://fr.wikipedia.org/wiki/Gabriel_Attal' },
        ],
      },
    ],
  },
  'x-edouard-philippe': {
    summary:
      'Maire du Havre, ex-Premier ministre, fondateur d’Horizons. Issu de la droite (UMP/LR) avant de gouverner avec Macron — bascule centre/centre-droit documentée. Teinte pédagogique centre.',
    stance: {
      family: 'centre',
      label: 'Centre',
      status: 'declare',
      confidence: 0.8,
      rationale:
        'Fondateur Horizons ; alliance avec la majorité présidentielle ; passé UMP/LR documenté.',
      sources: [
        { label: 'Wikipédia — Édouard Philippe', url: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe' },
      ],
    },
    history: [
      {
        as_of: '2000-2017',
        family: 'droite',
        label: 'Droite',
        status: 'declare',
        motifs: [
          'Cadre UMP puis Les Républicains ; maire du Havre.',
        ],
        sources: [
          { label: 'Wikipédia — LR / Havre', url: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe' },
        ],
      },
      {
        as_of: '2017+',
        family: 'centre',
        label: 'Centre',
        status: 'declare',
        motifs: [
          'Premier ministre d’Emmanuel Macron.',
          'Création d’Horizons (2021) dans l’espace centre-droit macroniste.',
        ],
        sources: [
          { label: 'Wikipédia — Matignon / Horizons', url: 'https://fr.wikipedia.org/wiki/%C3%89douard_Philippe' },
        ],
      },
    ],
  },
  'x-bruno-retailleau': {
    summary:
      'Cadre Les Républicains, ministre de l’Intérieur. Ligne droite conservatrice / sécuritaire documentée ; pas de bascule majeure de famille, mais durcissement thématique sécuritaire dans le débat public. Teinte pédagogique droite.',
    stance: {
      family: 'droite',
      label: 'Droite',
      status: 'declare',
      confidence: 0.85,
      rationale: 'Affiliation LR et fonctions gouvernementales documentées.',
      sources: [
        { label: 'Wikipédia — Bruno Retailleau', url: 'https://fr.wikipedia.org/wiki/Bruno_Retailleau' },
      ],
    },
    history: [
      {
        as_of: '1990-2024',
        family: 'droite',
        label: 'Droite',
        status: 'declare',
        motifs: [
          'Parcours RPR / UMP / LR continu.',
          'Montée en puissance sur les thèmes régaliens (immigration, ordre public).',
        ],
        sources: [
          { label: 'Wikipédia — parcours', url: 'https://fr.wikipedia.org/wiki/Bruno_Retailleau' },
        ],
      },
    ],
  },
  'papacito-papacitooff': {
    summary:
      'Créateur et auteur associé à la sphère « ultrdroite » numérique (humour viriliste, nationalisme). Pas une trajectoire « gauche → droite » classique : émergence après la génération Soral/Dieudonné, avec une rhétorique plus « audible » en ligne (analyses médiatiques). Teinte pédagogique droite nationale.',
    stance: {
      family: 'droite-nationale',
      label: 'Droite nationale',
      status: 'estime',
      confidence: 0.7,
      rationale:
        'Contenus et positionnements publics nationalistes / anti-gauche documentés ; polémiques (ex. vidéo 2021) largement relayées.',
      sources: [
        { label: 'France Culture — influenceurs ultradroite', url: 'https://www.radiofrance.fr/franceculture/les-influenceurs-politiques-d-ultradroite-sortent-de-l-ombre-7168476' },
        { label: 'Compte X / présence publique', url: 'https://x.com/PapacitoOff' },
      ],
    },
    history: [
      {
        as_of: '2015-2020',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Montée en audience sur YouTube / réseaux dans la nébuleuse post-Soral.',
          'Codes humour / virilisme plutôt que cadre partisan classique.',
        ],
        sources: [
          { label: 'France Culture — génération influenceurs', url: 'https://www.radiofrance.fr/franceculture/les-influenceurs-politiques-d-ultradroite-sortent-de-l-ombre-7168476' },
        ],
      },
      {
        as_of: '2021+',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'estime',
        confidence: 0.7,
        motifs: [
          'Polémique nationale (vidéo mettant en scène un militant « gauchiste ») et plaintes politiques.',
          'Relais médiatiques accrûs ; proximité symbolique avec des figures souverainistes / Reconquête selon analyses.',
        ],
        sources: [
          { label: 'France Culture — affaire Papacito', url: 'https://www.radiofrance.fr/franceculture/les-influenceurs-politiques-d-ultradroite-sortent-de-l-ombre-7168476' },
        ],
      },
    ],
  },
  'hold-up-thana-tv-cosyst-me-holdupmedia': {
    summary:
      'Écosystème documentaire / médias « Hold-Up » : apparu pendant le Covid avec une ligne complotiste / antisystème. Évolution d’un objet « crise sanitaire » vers une offre médiatique critique des institutions. Teinte pédagogique « autre » (transversal antisystème), pas une famille 1er tour classique.',
    stance: {
      family: 'autre',
      label: 'Autre / transversal',
      status: 'estime',
      confidence: 0.55,
      rationale:
        'Documentaire Hold-Up et suites médiatiques — critique institutions / narratifs officiels ; placement transversal.',
      sources: [
        { label: 'Wikipédia — Hold-up (documentaire)', url: 'https://fr.wikipedia.org/wiki/Hold-up_(documentaire)' },
      ],
    },
    history: [
      {
        as_of: '2020',
        family: 'autre',
        label: 'Autre / transversal',
        status: 'estime',
        confidence: 0.6,
        motifs: [
          'Sortie du documentaire Hold-Up sur la crise Covid — viralité et controverses.',
          'Structuration d’un écosystème de suites / chaînes associées.',
        ],
        sources: [
          { label: 'Wikipédia — Hold-up', url: 'https://fr.wikipedia.org/wiki/Hold-up_(documentaire)' },
        ],
      },
    ],
  },
  'x-raphael-glucksmann': {
    summary:
      'Essayiste et eurodéputé Place publique. Fils de l’intellectuel André Glucksmann ; engagement progressiste / social-démocrate européen documenté. Teinte pédagogique social-démocrate.',
    stance: {
      family: 'social-democrate',
      label: 'Social-démocrate',
      status: 'declare',
      confidence: 0.8,
      rationale: 'Place publique / PSE — affiliation et mandat européen documentés.',
      sources: [
        { label: 'Wikipédia — Raphaël Glucksmann', url: 'https://fr.wikipedia.org/wiki/Rapha%C3%ABl_Glucksmann' },
      ],
    },
    history: [
      {
        as_of: '2000-2018',
        family: 'social-democrate',
        label: 'Social-démocrate',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Essais et interventions médias avant la création de Place publique.',
          'Ligne droits humains / Europe (Géorgie, Ukraine) documentée.',
        ],
        sources: [
          { label: 'Wikipédia — parcours', url: 'https://fr.wikipedia.org/wiki/Rapha%C3%ABl_Glucksmann' },
        ],
      },
      {
        as_of: '2018+',
        family: 'social-democrate',
        label: 'Social-démocrate',
        status: 'declare',
        motifs: [
          'Fondation de Place publique ; listes européennes.',
          'Siège au Parlement européen (groupe S&D).',
        ],
        sources: [
          { label: 'Wikipédia — Place publique / PE', url: 'https://fr.wikipedia.org/wiki/Rapha%C3%ABl_Glucksmann' },
        ],
      },
    ],
  },
  'le-raptor-dissident': {
    summary:
      'Vidéaste de décryptage politique. Souvent classé à gauche radicale / anticapitaliste dans les analyses médias, tout en étant cité dans les cartographies de l’« ultrdroite » numérique par d’autres observateurs — tension documentée. Teinte pédagogique retenue : gauche radicale (estime), à réviser si bascule sourcée.',
    stance: {
      family: 'gauche-radicale',
      label: 'Gauche radicale',
      status: 'estime',
      confidence: 0.55,
      rationale:
        'Contenus critiques du capitalisme / ordre établi ; lectures divergentes selon les observatoires — confiance modérée.',
      sources: [
        { label: 'Chaîne YouTube', url: 'https://www.youtube.com/@LeRaptorDissident' },
        { label: 'INA / revue des médias — cartographies influence', url: 'https://larevuedesmedias.ina.fr/influenceurs-extreme-droite-rn-desinformation-campagne-legislatives' },
      ],
    },
    history: [
      {
        as_of: '2015+',
        family: 'gauche-radicale',
        label: 'Gauche radicale',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Formats longs de critique sociale et politique sur YouTube.',
          'Mentions croisées dans des dossiers sur la polarisation numérique (lectures parfois contradictoires).',
        ],
        sources: [
          { label: 'Chaîne YouTube Le Raptor Dissident', url: 'https://www.youtube.com/@LeRaptorDissident' },
        ],
      },
    ],
  },
  /** Casus Lady — bascule documentée (PolitiWiki) ; teinte actuelle ambiguë Knafo/Lisnard. */
  'casus-lady': {
    summary:
      'Vidéaste / streameuse (TikTok, YouTube, X) : satire et critique idéologique. Parcours documenté : influence Soralienne revendiquée → vote Zemmour 2022 (Reconquête) au nom de la liberté d’expression → débats publics avec Jack le fou → ligne « égérie » liberté d’expression (modèle US). En 2025 elle dit n’être « plus nationaliste ». Teinte pédagogique provisoire : droite (zone Knafo / Lisnard, pas clair) — fiction LMDPT, pas une carte d’adhésion.',
    stance: {
      family: 'droite',
      label: 'Droite',
      status: 'estime',
      confidence: 0.4,
      rationale:
        'Pas clair : entre Sarah Knafo (Reconquête / droite nationale) et David Lisnard (droite libérale / Nouvelle Énergie). Cadre public dominant = liberté d’expression ; votes 2022 Zemmour puis 2024 RN / République Souveraine documentés. Confiance basse — à réviser.',
      sources: [
        { label: 'PolitiWiki — Casus Lady', url: 'https://politiwiki.fr/wiki/Casus_Lady' },
        { label: 'YouTube — chaîne Casus Lady', url: 'https://www.youtube.com/@CasusLady' },
        {
          label: 'ZioClo — débats Jack le fou / Casus Lady (ex.)',
          url: 'https://www.youtube.com/results?search_query=Casus+Lady+Jack+le+fou',
        },
      ],
    },
    history: [
      {
        as_of: '≈2019-2022',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Revendique une influence de Soral (« Soral m’a beaucoup fait évoluer… ») tout en niant avoir un gourou ; cite aussi Onfray.',
          'Auto-étiquette publique « Nationale Socialiste » / « Nationale Socialiste Libérale » (2022) — ensuite désavouée comme maladroite.',
        ],
        sources: [
          { label: 'PolitiWiki — positionnement / Soral', url: 'https://politiwiki.fr/wiki/Casus_Lady' },
        ],
      },
      {
        as_of: '2022',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'declare',
        confidence: 0.7,
        motifs: [
          'Vote déclaré Éric Zemmour (présidentielle) — candidat Reconquête.',
          'Motif revendiqué : liberté d’expression / d’opinion, pas un programme partisan complet.',
        ],
        sources: [
          { label: 'PolitiWiki — élections 2022 (vote Zemmour)', url: 'https://politiwiki.fr/wiki/Casus_Lady' },
        ],
      },
      {
        as_of: '2024',
        family: 'droite-nationale',
        label: 'Droite nationale',
        status: 'estime',
        confidence: 0.55,
        motifs: [
          'Européennes 2024 : vote déclaré République Souveraine (liste divers).',
          'Législatives 2024 : vote RN déclaré — présenté comme choix de circonscription / solidarité anti-silence, pas comme adhésion programmatique.',
          'Débats filmés avec Jack le fou (ZioClo etc.) : crispation autour de l’extrême droite vs liberté d’expression.',
        ],
        sources: [
          { label: 'PolitiWiki — européennes / législatives 2024', url: 'https://politiwiki.fr/wiki/Casus_Lady' },
          {
            label: 'ZioClo — Ragna-rock clash Casus Lady et Jack le fou',
            url: 'https://www.youtube.com/results?search_query=Ragna-rock+Casus+Lady+Jack+le+fou',
          },
        ],
      },
      {
        as_of: '2025+',
        family: 'droite',
        label: 'Droite',
        status: 'estime',
        confidence: 0.4,
        motifs: [
          'Déclare ne plus se reconnaître nationaliste (« Je ne suis plus nationaliste du tout ») tout en maintenant un discours « social » économique.',
          'Ligne publique dominante : liberté d’expression « à l’américaine » — lecture pédagogique proche d’une droite libérale (Lisnard) tout en restant audible dans l’orbite Knafo/Reconquête.',
          'Ambiguïté assumée LMDPT : pas de carte d’adhésion ; confiance basse.',
        ],
        sources: [
          { label: 'PolitiWiki — août 2025 / plus nationaliste', url: 'https://politiwiki.fr/wiki/Casus_Lady' },
          { label: 'Chaîne YouTube Casus Lady', url: 'https://www.youtube.com/@CasusLady' },
        ],
      },
    ],
  },
};

const FAMILY_LABEL_STANCE: Record<string, string> = {
  'gauche-radicale': 'Gauche radicale',
  'social-democrate': 'Social-démocrate',
  centre: 'Centre',
  droite: 'Droite',
  'droite-nationale': 'Droite nationale',
  autre: 'Autre / transversal',
};

function catPhrase(cat: string | undefined, name: string): string {
  if (cat === 'elu-parlementaire') {
    return `${name} — figure du débat parlementaire (données publiques / Wikidata)`;
  }
  if (cat === 'societe-civile') {
    return `${name} — société civile (créateur, association, syndicat, média indé ou vulgarisation)`;
  }
  return `${name} — figure du débat public numérique / médiatique`;
}

function nourishSummary(inf: any): string {
  const fam = FAMILY_LABEL[String(inf.stance?.family)] || 'non classée';
  const platforms = (inf.platforms || [])
    .map((p: { kind: string }) => p.kind)
    .filter(Boolean);
  const plat =
    platforms.length > 0
      ? `Présence : ${[...new Set(platforms)].slice(0, 4).join(', ')}.`
      : 'Présence publique documentée.';
  const status =
    inf.stance?.status === 'declare'
      ? 'Teinte déclarée / sourcée'
      : 'Teinte estimée (faisceau d’indices)';
  const base = (inf.summary || '').trim().replace(/\s+/g, ' ');
  const evol =
    Array.isArray(inf.stance_history) && inf.stance_history.length > 1
      ? ' Évolution de position documentée (voir historique / motifs).'
      : Array.isArray(inf.stance_history) && inf.stance_history.length === 1
        ? ' Trajectoire rappelée dans l’historique pédagogique.'
        : '';

  // Conserver le fond existant s’il est déjà riche
  if (base.length >= 160 && base.includes('Teinte') === false) {
    return `${base}${evol} ${status} : famille pédagogique ${fam}. Fiction LMDPT — pas une carte d’adhésion.`.replace(
      /\s+/g,
      ' ',
    ).trim();
  }

  const head = catPhrase(inf.category, inf.display_name);
  const mid =
    base.length >= 40 && !base.startsWith(inf.display_name)
      ? base
      : `${status.toLowerCase()} ${fam}.`;
  return `${head}. ${mid} ${plat}${evol} Pas un score moral — synthèse documentaire à recouper.`.replace(
    /\s+/g,
    ' ',
  ).trim();
}

function nourishRationale(inf: any): string {
  const r = (inf.stance?.rationale || '').trim();
  if (r.length >= 80) return r;
  const fam = FAMILY_LABEL_STANCE[String(inf.stance?.family)] || 'Autre';
  const cat = inf.category || 'influenceur';
  if (cat === 'elu-parlementaire') {
    return (
      r ||
      `Affiliation / groupe parlementaire ou positionnement public documenté — famille pédagogique ${fam}.`
    );
  }
  if (Array.isArray(inf.stance_history) && inf.stance_history.length) {
    return (
      r ||
      `Teinte actuelle ${fam} après évolution documentée (motifs dans stance_history). Confiance limitée aux sources listées.`
    );
  }
  return (
    r ||
    `Lecture pédagogique ${fam} à partir des sources listées (déclaration ou faisceau d’indices). Pas une carte d’adhésion.`
  );
}

function main() {
  const data = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  let histApplied = 0;
  let summaries = 0;
  let rationales = 0;

  for (const inf of data.influencers) {
    const evo = EVOLUTIONS[inf.id];
    let curated = false;
    if (evo && evo.history.length > 0) {
      // Ne pas écraser historiques riches déjà curés si EVOLUTIONS vide
      if (
        (inf.id === 'tatiana-ventose' || inf.id === 'casus-lady') &&
        (inf.stance_history?.length || 0) >= 3 &&
        evo.history.length === 0
      ) {
        // keep existing
      } else {
        if (evo.summary) {
          inf.summary = evo.summary;
          curated = true;
        }
        if (evo.stance.rationale) {
          inf.stance = {
            ...inf.stance,
            ...evo.stance,
            sources:
              evo.stance.sources.length > 0 ? evo.stance.sources : inf.stance.sources,
          };
          curated = true;
        }
        inf.stance_history = evo.history;
        histApplied += 1;
      }
    }

    const beforeS = inf.summary;
    const beforeR = inf.stance?.rationale || '';
    if (!curated) {
      inf.summary = nourishSummary(inf);
      inf.stance.rationale = nourishRationale(inf);
    }
    if (inf.stance.status === 'estime' && inf.stance.confidence == null) {
      inf.stance.confidence = 0.5;
    }
    if (inf.summary !== beforeS) summaries += 1;
    if (inf.stance.rationale !== beforeR) rationales += 1;
  }

  if (!String(data.methodology_note).includes('P46b')) {
    data.methodology_note +=
      ' Enrichissement P46b : descriptions nourries pour les 577 sièges ; `stance_history` étendu aux bascules publiques documentées (Soral, Dieudonné, Zemmour, Attal, Philippe, Ventôse, etc.). Motto veille : « il n’y a que les imbéciles qui ne changent pas d’avis ».';
  }
  data.updated = '2026-07-28';
  fs.writeFileSync(DATA, JSON.stringify(data, null, 2) + '\n');

  // Watchlist : ajouter les IDs avec history
  if (fs.existsSync(WATCH)) {
    const w = JSON.parse(fs.readFileSync(WATCH, 'utf8'));
    const have = new Set(w.entries.map((e: { id: string }) => e.id));
    for (const inf of data.influencers) {
      if (!inf.stance_history?.length || have.has(inf.id)) continue;
      w.entries.push({
        id: inf.id,
        display_name: inf.display_name,
        expected_family: String(inf.stance.family),
        previous_families: [
          ...new Set(
            (inf.stance_history || [])
              .map((h: Hist) => h.family)
              .filter((f: string) => f !== inf.stance.family),
          ),
        ],
        priority: 'medium',
        notes: 'Historique stance_history présent — surveiller nouvelles bascules.',
        watch_urls: (inf.platforms || []).slice(0, 2).map((p: { url: string }) => p.url),
      });
      have.add(inf.id);
    }
    w.updated = '2026-07-28';
    fs.writeFileSync(WATCH, JSON.stringify(w, null, 2) + '\n');
  }

  const withHist = data.influencers.filter((i: { stance_history?: unknown[] }) =>
    Array.isArray(i.stance_history) && i.stance_history.length > 0,
  ).length;
  const lens = data.influencers.map((i: { summary: string }) => i.summary.length);
  console.log(
    JSON.stringify(
      {
        hist_applied: histApplied,
        summaries_touched: summaries,
        rationales_touched: rationales,
        with_history: withHist,
        summary_min: Math.min(...lens),
        summary_avg: Math.round(lens.reduce((a: number, b: number) => a + b, 0) / lens.length),
      },
      null,
      2,
    ),
  );
}

main();
