#!/usr/bin/env tsx
/**
 * P45f — Enrichit l’assemblée avec des figures de la société civile
 * (créateurs, associations, vulgarisation civique). Remplace autant
 * d’élu·e·s Wikidata pour conserver N=577.
 *
 * Sources = URLs publiques uniquement (chaînes, sites asso, Wikipédia).
 * Pas de scrape live d’abonnés.
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/assemblee-influenceurs.json');

type Family =
  | 'gauche-radicale'
  | 'social-democrate'
  | 'centre'
  | 'droite'
  | 'droite-nationale'
  | 'autre';

const FAMILY_LABEL: Record<Family, string> = {
  'gauche-radicale': 'Gauche radicale',
  'social-democrate': 'Social-démocrate',
  centre: 'Centre',
  droite: 'Droite',
  'droite-nationale': 'Droite nationale',
  autre: 'Autre / transversal',
};

type Entry = {
  id: string;
  display_name: string;
  handle?: string;
  platforms: Array<{ kind: string; label: string; url: string }>;
  summary: string;
  family: Family;
  status: 'declare' | 'estime';
  confidence?: number;
  rationale: string;
  sources: Array<{ label: string; url: string }>;
  followers?: number;
  platform?: string;
};

const SEED: Entry[] = [
  {
    id: 'camille-etienne',
    display_name: 'Camille Étienne',
    handle: 'camilleetienne_',
    platforms: [
      { kind: 'instagram', label: 'Instagram', url: 'https://www.instagram.com/camilleetienne_/' },
      { kind: 'x', label: 'X @CamilleEtienne_', url: 'https://x.com/CamilleEtienne_' },
    ],
    summary:
      'Militante écologiste française, formats vidéo et tribunes sur le climat et la justice sociale — société civile, hors mandat électif.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.65,
    rationale:
      'Positionnements publics répétés sur l’écologie politique et la désobéissance civile non violente ; pas de carte d’adhésion partisane unique.',
    sources: [
      { label: 'Wikipédia — Camille Étienne', url: 'https://fr.wikipedia.org/wiki/Camille_%C3%89tienne' },
      { label: 'Profil X public', url: 'https://x.com/CamilleEtienne_' },
    ],
    followers: 450000,
    platform: 'instagram',
  },
  {
    id: 'rokhaya-diallo',
    display_name: 'Rokhaya Diallo',
    handle: 'RokhayaDiallo',
    platforms: [
      { kind: 'x', label: 'X @RokhayaDiallo', url: 'https://x.com/RokhayaDiallo' },
      { kind: 'site', label: 'Site', url: 'https://www.rokhayadiallo.com/' },
    ],
    summary:
      'Journaliste, réalisatrice et essayiste ; interventions publiques sur les discriminations et les droits civiques.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.7,
    rationale:
      'Corpus d’essais, documentaires et chroniques orientés antiracisme et féminisme intersectionnel — teinte pédagogique gauche.',
    sources: [
      { label: 'Wikipédia — Rokhaya Diallo', url: 'https://fr.wikipedia.org/wiki/Rokhaya_Diallo' },
      { label: 'Site officiel', url: 'https://www.rokhayadiallo.com/' },
    ],
    followers: 380000,
    platform: 'x',
  },
  {
    id: 'tatiana-ventose',
    display_name: 'Tatiana Ventôse',
    handle: 'VentoseTatiana',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@TatianaVentose' },
      { kind: 'x', label: 'X @VentoseTatiana', url: 'https://x.com/VentoseTatiana' },
    ],
    summary:
      'Vidéaste politique indépendante — évolution documentée hors gauche vers une ligne souverainiste / populiste (voir stance_history).',
    family: 'droite-nationale',
    status: 'estime',
    confidence: 0.65,
    rationale:
      'Rupture avec la gauche documentée ; appel vote Marine Le Pen 2022 (vote de classe) ; analyses souverainistes.',
    sources: [
      { label: 'Wikipédia — Tatiana Ventôse', url: 'https://fr.wikipedia.org/wiki/Tatiana_Vent%C3%B4se' },
      { label: 'PolitiWiki', url: 'https://www.politiwiki.fr/wiki/Tatiana_Vent%C3%B4se' },
    ],
    followers: 320000,
    platform: 'youtube',
  },
  {
    id: 'le-raptor-dissident',
    display_name: 'Le Raptor Dissident',
    handle: 'LeRaptorOff',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@LeRaptorDissident' },
      { kind: 'x', label: 'X', url: 'https://x.com/LeRaptorOff' },
    ],
    summary:
      'Créateur YouTube de décryptage politique et social, formats longs — indépendant, hors rédaction legacy.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.7,
    rationale:
      'Contenus publics orientés critique sociale et gauche ; pas un organe de parti.',
    sources: [
      { label: 'Chaîne YouTube Le Raptor Dissident', url: 'https://www.youtube.com/@LeRaptorDissident' },
    ],
    followers: 280000,
    platform: 'youtube',
  },
  {
    id: 'salome-saque',
    display_name: 'Salomé Saqué',
    handle: 'salomesaque',
    platforms: [
      { kind: 'x', label: 'X @salomesaque', url: 'https://x.com/salomesaque' },
      { kind: 'youtube', label: 'Apparitions / Blast', url: 'https://www.youtube.com/@Blastinfo' },
    ],
    summary:
      'Journaliste et autrice (jeunesse, précarité, écologie) ; présence forte sur les réseaux et médias indépendants.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.65,
    rationale:
      'Livres et reportages publics sur les jeunes et le climat ; collaborations médias indépendants de gauche.',
    sources: [
      { label: 'Wikipédia — Salomé Saqué', url: 'https://fr.wikipedia.org/wiki/Salom%C3%A9_Saqu%C3%A9' },
      { label: 'Profil X public', url: 'https://x.com/salomesaque' },
    ],
    followers: 210000,
    platform: 'x',
  },
  {
    id: 'attac-france',
    display_name: 'Attac France',
    handle: 'Attac_fr',
    platforms: [
      { kind: 'x', label: 'X @Attac_fr', url: 'https://x.com/Attac_fr' },
      { kind: 'site', label: 'Site Attac', url: 'https://france.attac.org/' },
    ],
    summary:
      'Association altermondialiste : campagnes publiques sur la justice fiscale et les traités commerciaux.',
    family: 'gauche-radicale',
    status: 'declare',
    rationale: 'Objet statutaire et campagnes publiques Attac — association clairement située à gauche altermondialiste.',
    sources: [
      { label: 'Site officiel Attac France', url: 'https://france.attac.org/' },
      { label: 'Wikipédia — Attac', url: 'https://fr.wikipedia.org/wiki/Association_pour_la_taxation_des_transactions_financi%C3%A8res_et_pour_l%27action_citoyenne' },
    ],
    followers: 120000,
    platform: 'x',
  },
  {
    id: 'greenpeace-france',
    display_name: 'Greenpeace France',
    handle: 'greenpeacefr',
    platforms: [
      { kind: 'x', label: 'X @greenpeacefr', url: 'https://x.com/greenpeacefr' },
      { kind: 'site', label: 'Site', url: 'https://www.greenpeace.fr/' },
    ],
    summary:
      'ONG environnementale : actions publiques, pétitions et campagnes climat / nucléaire / océans.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.6,
    rationale:
      'ONG écologiste ; teinte pédagogique gauche sur les arbitrages climatiques (pas un parti).',
    sources: [
      { label: 'Site Greenpeace France', url: 'https://www.greenpeace.fr/' },
      { label: 'Compte X public', url: 'https://x.com/greenpeacefr' },
    ],
    followers: 500000,
    platform: 'x',
  },
  {
    id: 'oxfam-france',
    display_name: 'Oxfam France',
    handle: 'oxfamfrance',
    platforms: [
      { kind: 'x', label: 'X @oxfamfrance', url: 'https://x.com/oxfamfrance' },
      { kind: 'site', label: 'Site', url: 'https://www.oxfamfrance.org/' },
    ],
    summary:
      'ONG de solidarité internationale : rapports publics sur les inégalités et la justice fiscale.',
    family: 'social-democrate',
    status: 'estime',
    confidence: 0.55,
    rationale:
      'Plaidoyer inégalités / fiscalité — lecture sociale-démocrate / progressiste, hors partisanerie électorale.',
    sources: [
      { label: 'Site Oxfam France', url: 'https://www.oxfamfrance.org/' },
      { label: 'Compte X public', url: 'https://x.com/oxfamfrance' },
    ],
    followers: 180000,
    platform: 'x',
  },
  {
    id: 'fondation-abbe-pierre',
    display_name: 'Fondation Abbé Pierre',
    handle: 'Fondation_AB',
    platforms: [
      { kind: 'x', label: 'X @Fondation_AB', url: 'https://x.com/Fondation_AB' },
      { kind: 'site', label: 'Site', url: 'https://www.fondation-abbe-pierre.fr/' },
    ],
    summary:
      'Fondation reconnue d’utilité publique : rapport annuel sur le mal-logement et plaidoyer logement.',
    family: 'social-democrate',
    status: 'estime',
    confidence: 0.55,
    rationale:
      'Plaidoyer logement social et indigne — teinte sociale, non partisane.',
    sources: [
      { label: 'Site Fondation Abbé Pierre', url: 'https://www.fondation-abbe-pierre.fr/' },
      { label: 'Compte X public', url: 'https://x.com/Fondation_AB' },
    ],
    followers: 220000,
    platform: 'x',
  },
  {
    id: 'bondy-blog',
    display_name: 'Bondy Blog',
    handle: 'bondyblog',
    platforms: [
      { kind: 'x', label: 'X @bondyblog', url: 'https://x.com/bondyblog' },
      { kind: 'site', label: 'Site', url: 'https://www.bondyblog.fr/' },
    ],
    summary:
      'Média issu des quartiers : reportages et tribunes sur les banlieues, la police et les discriminations.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.6,
    rationale:
      'Ligne éditoriale publique centrée quartiers populaires et droits — lecture gauche.',
    sources: [
      { label: 'Site Bondy Blog', url: 'https://www.bondyblog.fr/' },
      { label: 'Wikipédia — Bondy Blog', url: 'https://fr.wikipedia.org/wiki/Bondy_Blog' },
    ],
    followers: 150000,
    platform: 'x',
  },
  {
    id: 'disclose-ngo',
    display_name: 'Disclose',
    handle: 'disclose_ngo',
    platforms: [
      { kind: 'x', label: 'X @disclose_ngo', url: 'https://x.com/disclose_ngo' },
      { kind: 'site', label: 'Site', url: 'https://disclose.ngo/' },
    ],
    summary:
      'Média d’investigation à but non lucratif : enquêtes sourcées sur l’environnement, l’armement, la santé publique.',
    family: 'autre',
    status: 'estime',
    confidence: 0.5,
    rationale:
      'Investigation indépendante ; pas d’alignement partisan unique — placé en transversal.',
    sources: [
      { label: 'Site Disclose', url: 'https://disclose.ngo/' },
      { label: 'Compte X public', url: 'https://x.com/disclose_ngo' },
    ],
    followers: 160000,
    platform: 'x',
  },
  {
    id: 'amnesty-france',
    display_name: 'Amnesty International France',
    handle: 'amnestyfrance',
    platforms: [
      { kind: 'x', label: 'X @amnestyfrance', url: 'https://x.com/amnestyfrance' },
      { kind: 'site', label: 'Site', url: 'https://www.amnesty.fr/' },
    ],
    summary:
      'Section française d’Amnesty : campagnes droits humains, mobilisations citoyennes.',
    family: 'autre',
    status: 'estime',
    confidence: 0.5,
    rationale:
      'ONG droits humains — transversale ; teinte « autre » (pas une famille 1er tour).',
    sources: [
      { label: 'Site Amnesty France', url: 'https://www.amnesty.fr/' },
      { label: 'Compte X public', url: 'https://x.com/amnestyfrance' },
    ],
    followers: 350000,
    platform: 'x',
  },
  {
    id: 'sos-mediterranee',
    display_name: 'SOS Méditerranée',
    handle: 'SOSMedFrance',
    platforms: [
      { kind: 'x', label: 'X @SOSMedFrance', url: 'https://x.com/SOSMedFrance' },
      { kind: 'site', label: 'Site', url: 'https://www.sosmediterranee.fr/' },
    ],
    summary:
      'Association de sauvetage en mer : plaidoyer public sur les naufrages en Méditerranée.',
    family: 'autre',
    status: 'estime',
    confidence: 0.55,
    rationale:
      'Humanitaire migration — transversal, souvent lu à gauche sans être un parti.',
    sources: [
      { label: 'Site SOS Méditerranée', url: 'https://www.sosmediterranee.fr/' },
      { label: 'Compte X public', url: 'https://x.com/SOSMedFrance' },
    ],
    followers: 140000,
    platform: 'x',
  },
  {
    id: 'cyrus-north',
    display_name: 'Cyrus North',
    handle: 'CyrusNorth',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@CyrusNorth' },
      { kind: 'x', label: 'X @CyrusNorth', url: 'https://x.com/CyrusNorth' },
    ],
    summary:
      'Vulgarisateur de philosophie sur YouTube : formats courts sur éthique, politique et société.',
    family: 'autre',
    status: 'estime',
    confidence: 0.45,
    rationale:
      'Vulgarisation philosophique pluraliste — pas de ligne partisane unique.',
    sources: [
      { label: 'Chaîne YouTube Cyrus North', url: 'https://www.youtube.com/@CyrusNorth' },
      { label: 'Wikipédia — Cyrus North', url: 'https://fr.wikipedia.org/wiki/Cyrus_North' },
    ],
    followers: 900000,
    platform: 'youtube',
  },
  {
    id: 'monsieur-phi',
    display_name: 'Monsieur Phi',
    handle: 'MonsieurPhi',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@MonsieurPhi' },
    ],
    summary:
      'Chaîne de philosophie analytique et esprit critique — société civile éducative.',
    family: 'autre',
    status: 'estime',
    confidence: 0.4,
    rationale: 'Contenu philosophique / critique des biais — transversal.',
    sources: [
      { label: 'Chaîne YouTube Monsieur Phi', url: 'https://www.youtube.com/@MonsieurPhi' },
    ],
    followers: 550000,
    platform: 'youtube',
  },
  {
    id: 'la-tronche-en-biais',
    display_name: 'La Tronche en Biais',
    handle: 'TroncheBiais',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@TroncheEnBiais' },
    ],
    summary:
      'Collectif de zététique / esprit critique : conférences et vidéos sur les biais cognitifs.',
    family: 'autre',
    status: 'estime',
    confidence: 0.4,
    rationale: 'Esprit critique scientifique — hors clivage partisan classique.',
    sources: [
      { label: 'Chaîne YouTube La Tronche en Biais', url: 'https://www.youtube.com/@TroncheEnBiais' },
    ],
    followers: 400000,
    platform: 'youtube',
  },
  {
    id: 'hygiene-mentale',
    display_name: 'Hygiène Mentale',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@HygieneMentale' },
    ],
    summary:
      'Vulgarisation de l’esprit critique et de la méthode scientifique appliquée aux médias.',
    family: 'autre',
    status: 'estime',
    confidence: 0.4,
    rationale: 'Pédagogie critique des médias — transversal.',
    sources: [
      { label: 'Chaîne YouTube Hygiène Mentale', url: 'https://www.youtube.com/@HygieneMentale' },
    ],
    followers: 480000,
    platform: 'youtube',
  },
  {
    id: 'nota-bene-histoire',
    display_name: 'Nota Bene',
    handle: 'Notabenemovies',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@notabenemovies' },
    ],
    summary:
      'Vulgarisation historique à large audience : récits et contextes — société civile éducative.',
    family: 'autre',
    status: 'estime',
    confidence: 0.35,
    rationale: 'Histoire grand public — pas de ligne partisane déclarée.',
    sources: [
      { label: 'Chaîne YouTube Nota Bene', url: 'https://www.youtube.com/@notabenemovies' },
      { label: 'Wikipédia — Nota Bene (vulgarisateur)', url: 'https://fr.wikipedia.org/wiki/Nota_Bene_(vulgarisateur)' },
    ],
    followers: 2800000,
    platform: 'youtube',
  },
  {
    id: 'dirtybiology',
    display_name: 'DirtyBiology',
    handle: 'DirtyBiology',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@DirtyBiology' },
    ],
    summary:
      'Vulgarisation scientifique (biologie, évolution) par Léo Grasset — formats longs YouTube.',
    family: 'autre',
    status: 'estime',
    confidence: 0.35,
    rationale: 'Science grand public — transversal.',
    sources: [
      { label: 'Chaîne YouTube DirtyBiology', url: 'https://www.youtube.com/@DirtyBiology' },
      { label: 'Wikipédia — Léo Grasset', url: 'https://fr.wikipedia.org/wiki/L%C3%A9o_Grasset' },
    ],
    followers: 1800000,
    platform: 'youtube',
  },
  {
    id: 'science-etonnante',
    display_name: 'Science Étonnante',
    handle: 'ScienceEtonnante',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@ScienceEtonnante' },
    ],
    summary:
      'David Louapre — vulgarisation physique et maths pour le grand public.',
    family: 'autre',
    status: 'estime',
    confidence: 0.35,
    rationale: 'Vulgarisation scientifique — transversal.',
    sources: [
      { label: 'Chaîne YouTube Science Étonnante', url: 'https://www.youtube.com/@ScienceEtonnante' },
    ],
    followers: 1200000,
    platform: 'youtube',
  },
  {
    id: 'linguisticae',
    display_name: 'Linguisticae',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@Linguisticae' },
    ],
    summary:
      'Vulgarisation linguistique : langue, société, médias — formats pédagogiques.',
    family: 'autre',
    status: 'estime',
    confidence: 0.4,
    rationale: 'Linguistique et société — transversal avec lectures parfois politiques.',
    sources: [
      { label: 'Chaîne YouTube Linguisticae', url: 'https://www.youtube.com/@Linguisticae' },
    ],
    followers: 700000,
    platform: 'youtube',
  },
  {
    id: 'loopsider',
    display_name: 'Loopsider',
    handle: 'Loopsider',
    platforms: [
      { kind: 'x', label: 'X @Loopsider', url: 'https://x.com/Loopsider' },
      { kind: 'site', label: 'Site', url: 'https://www.loopsider.com/' },
    ],
    summary:
      'Média vidéo numérique : formats courts d’actualité sociale et politique.',
    family: 'social-democrate',
    status: 'estime',
    confidence: 0.5,
    rationale:
      'Ligne progressiste / société — lecture sociale-démocrate pédagogique.',
    sources: [
      { label: 'Site Loopsider', url: 'https://www.loopsider.com/' },
      { label: 'Compte X public', url: 'https://x.com/Loopsider' },
    ],
    followers: 600000,
    platform: 'x',
  },
  {
    id: 'aj-plus-francais',
    display_name: 'AJ+ français',
    handle: 'AJplusfrancais',
    platforms: [
      { kind: 'x', label: 'X @AJplusfrancais', url: 'https://x.com/AJplusfrancais' },
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@ajplusfrancais' },
    ],
    summary:
      'Média numérique (Al Jazeera Media Network) : formats courts d’actualité internationale et sociale.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.55,
    rationale:
      'Ligne éditoriale souvent critique des politiques occidentales / focus Sud — lecture gauche pédagogique.',
    sources: [
      { label: 'Chaîne YouTube AJ+ français', url: 'https://www.youtube.com/@ajplusfrancais' },
      { label: 'Compte X public', url: 'https://x.com/AJplusfrancais' },
    ],
    followers: 900000,
    platform: 'youtube',
  },
  {
    id: 'caroline-fourest',
    display_name: 'Caroline Fourest',
    handle: 'FourestCaroline',
    platforms: [
      { kind: 'x', label: 'X @CarolineFourest', url: 'https://x.com/CarolineFourest' },
      { kind: 'site', label: 'Wikipédia', url: 'https://fr.wikipedia.org/wiki/Caroline_Fourest' },
    ],
    summary:
      'Essayiste et documentariste : laïcité, droits des femmes, critiques des extrêmes.',
    family: 'centre',
    status: 'estime',
    confidence: 0.6,
    rationale:
      'Positionnements publics laïques / républicains — lecture centre à centre-gauche selon dossiers.',
    sources: [
      { label: 'Wikipédia — Caroline Fourest', url: 'https://fr.wikipedia.org/wiki/Caroline_Fourest' },
      { label: 'Profil X public', url: 'https://x.com/CarolineFourest' },
    ],
    followers: 280000,
    platform: 'x',
  },
  {
    id: 'natacha-polony',
    display_name: 'Natacha Polony',
    handle: 'NPolony',
    platforms: [
      { kind: 'x', label: 'X @NPolony', url: 'https://x.com/NPolony' },
    ],
    summary:
      'Journaliste et essayiste : école, souveraineté, critique du progressisme libéral.',
    family: 'droite',
    status: 'estime',
    confidence: 0.65,
    rationale:
      'Prises de position publiques sur l’école et la nation — lecture droite conservatrice / républicaine.',
    sources: [
      { label: 'Wikipédia — Natacha Polony', url: 'https://fr.wikipedia.org/wiki/Natacha_Polony' },
      { label: 'Profil X public', url: 'https://x.com/NPolony' },
    ],
    followers: 250000,
    platform: 'x',
  },
  {
    id: 'mathieu-bock-cote',
    display_name: 'Mathieu Bock-Côté',
    handle: 'bockcote',
    platforms: [
      { kind: 'x', label: 'X @bockcote', url: 'https://x.com/bockcote' },
    ],
    summary:
      'Sociologue et essayiste (Québec / France) : identité, immigration, critique du wokisme — présence médiatique FR.',
    family: 'droite',
    status: 'estime',
    confidence: 0.7,
    rationale:
      'Essais et chroniques conservateurs documentés — teinte droite.',
    sources: [
      { label: 'Wikipédia — Mathieu Bock-Côté', url: 'https://fr.wikipedia.org/wiki/Mathieu_Bock-C%C3%B4t%C3%A9' },
      { label: 'Profil X public', url: 'https://x.com/bockcote' },
    ],
    followers: 200000,
    platform: 'x',
  },
  {
    id: 'elisabeth-levy',
    display_name: 'Élisabeth Lévy',
    handle: 'Elisabeth_Levy',
    platforms: [
      { kind: 'x', label: 'X @Elisabeth_Levy', url: 'https://x.com/Elisabeth_Levy' },
      { kind: 'site', label: 'Causeur', url: 'https://www.causeur.fr/' },
    ],
    summary:
      'Essayiste, directrice de la rédaction de Causeur : débats société, laïcité, médias.',
    family: 'droite',
    status: 'estime',
    confidence: 0.65,
    rationale:
      'Ligne Causeur et interventions publiques — lecture droite libérale-conservatrice.',
    sources: [
      { label: 'Wikipédia — Élisabeth Lévy', url: 'https://fr.wikipedia.org/wiki/%C3%89lisabeth_L%C3%A9vy' },
      { label: 'Site Causeur', url: 'https://www.causeur.fr/' },
    ],
    followers: 120000,
    platform: 'x',
  },
  {
    id: 'damien-leveque-civique',
    display_name: 'Le Précepteur',
    platforms: [
      { kind: 'youtube', label: 'YouTube Le Précepteur', url: 'https://www.youtube.com/@LePrecepteur' },
    ],
    summary:
      'Chaîne de vulgarisation philosophique et politique (culture générale, rhétorique).',
    family: 'droite',
    status: 'estime',
    confidence: 0.55,
    rationale:
      'Contenus souvent critiques du progressisme contemporain — lecture droite culturelle.',
    sources: [
      { label: 'Chaîne YouTube Le Précepteur', url: 'https://www.youtube.com/@LePrecepteur' },
    ],
    followers: 450000,
    platform: 'youtube',
  },
  {
    id: 'academic-media',
    display_name: 'Académia Christiana (échos publics)',
    handle: 'Academia_C',
    platforms: [
      { kind: 'x', label: 'X @Academia_C', url: 'https://x.com/Academia_C' },
      { kind: 'site', label: 'Site', url: 'https://www.academia-christiana.org/' },
    ],
    summary:
      'Association de formation catholique traditionaliste : universités d’été et présence réseaux.',
    family: 'droite-nationale',
    status: 'estime',
    confidence: 0.6,
    rationale:
      'Positionnements catholiques conservateurs documentés — lecture droite nationale / conservatrice.',
    sources: [
      { label: 'Site Academia Christiana', url: 'https://www.academia-christiana.org/' },
      { label: 'Compte X public', url: 'https://x.com/Academia_C' },
    ],
    followers: 80000,
    platform: 'x',
  },
  {
    id: 'youth-for-climate-france',
    display_name: 'Youth for Climate France',
    handle: 'YouthClimateFr',
    platforms: [
      { kind: 'x', label: 'X @YouthClimateFr', url: 'https://x.com/YouthClimateFr' },
      { kind: 'site', label: 'Lien mouvement', url: 'https://youthforclimate.fr/' },
    ],
    summary:
      'Mouvement de jeunes pour le climat : grèves et actions publiques depuis 2019.',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.6,
    rationale:
      'Mobilisation climatique jeunesse — lecture écologiste de gauche.',
    sources: [
      { label: 'Site Youth for Climate France', url: 'https://youthforclimate.fr/' },
      { label: 'Compte X public', url: 'https://x.com/YouthClimateFr' },
    ],
    followers: 90000,
    platform: 'x',
  },
  {
    id: 'anv-cop21',
    display_name: 'Action Non-Violente COP21',
    handle: 'ANVCOP21',
    platforms: [
      { kind: 'x', label: 'X @ANVCOP21', url: 'https://x.com/ANVCOP21' },
      { kind: 'site', label: 'Site', url: 'https://www.anv-cop21.org/' },
    ],
    summary:
      'Collectif de désobéissance civile non violente sur le climat (ex. « Dernière Rénovation » liée).',
    family: 'gauche-radicale',
    status: 'estime',
    confidence: 0.65,
    rationale:
      'Actions climat non violentes documentées — écologie radicale pédagogique.',
    sources: [
      { label: 'Site ANV-COP21', url: 'https://www.anv-cop21.org/' },
      { label: 'Compte X public', url: 'https://x.com/ANVCOP21' },
    ],
    followers: 70000,
    platform: 'x',
  },
  {
    id: 'les-jours',
    display_name: 'Les Jours',
    handle: 'les_jours',
    platforms: [
      { kind: 'x', label: 'X @les_jours', url: 'https://x.com/les_jours' },
      { kind: 'site', label: 'Site', url: 'https://lesjours.fr/' },
    ],
    summary:
      'Média indépendant par abonnement : enquêtes au long cours (obsessions).',
    family: 'social-democrate',
    status: 'estime',
    confidence: 0.5,
    rationale:
      'Indépendance éditoriale progressiste — lecture sociale-démocrate / centre-gauche.',
    sources: [
      { label: 'Site Les Jours', url: 'https://lesjours.fr/' },
      { label: 'Wikipédia — Les Jours', url: 'https://fr.wikipedia.org/wiki/Les_Jours' },
    ],
    followers: 200000,
    platform: 'x',
  },
  {
    id: 'mcfly-carlito',
    display_name: 'McFly & Carlito',
    handle: 'McflyetCarlito',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@McFlyetCarlito' },
      { kind: 'x', label: 'X @McFlyCarlito', url: 'https://x.com/McFlyCarlito' },
    ],
    summary:
      'Duo créateur : humour et défis civiques (ex. vaccination, inscription sur les listes) — société civile pop.',
    family: 'centre',
    status: 'estime',
    confidence: 0.45,
    rationale:
      'Campagnes civiques grand public avec institutions — lecture centre / consensuelle.',
    sources: [
      { label: 'Chaîne YouTube McFly et Carlito', url: 'https://www.youtube.com/@McFlyetCarlito' },
      { label: 'Wikipédia — McFly et Carlito', url: 'https://fr.wikipedia.org/wiki/McFly_et_Carlito' },
    ],
    followers: 7500000,
    platform: 'youtube',
  },
  {
    id: 'bilal-hassani',
    display_name: 'Bilal Hassani',
    handle: 'bilalhassani',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@BilalHassani' },
      { kind: 'x', label: 'X @bilalhassani', url: 'https://x.com/bilalhassani' },
    ],
    summary:
      'Artiste et créateur LGBTQ+ : visibilité et prises de parole publiques contre les discriminations.',
    family: 'social-democrate',
    status: 'estime',
    confidence: 0.55,
    rationale:
      'Engagements publics LGBT et jeunesse — lecture progressiste.',
    sources: [
      { label: 'Wikipédia — Bilal Hassani', url: 'https://fr.wikipedia.org/wiki/Bilal_Hassani' },
      { label: 'Chaîne YouTube', url: 'https://www.youtube.com/@BilalHassani' },
    ],
    followers: 1500000,
    platform: 'youtube',
  },
  {
    id: 'clique-tv',
    display_name: 'Clique TV',
    handle: 'cliquetv',
    platforms: [
      { kind: 'youtube', label: 'YouTube', url: 'https://www.youtube.com/@cliquetv' },
      { kind: 'x', label: 'X @cliquetv', url: 'https://x.com/cliquetv' },
    ],
    summary:
      'Média culturel / société (Canal+) : entretiens longs avec figures politiques et civiles.',
    family: 'centre',
    status: 'estime',
    confidence: 0.45,
    rationale:
      'Magazine culturel pluraliste — lecture centre.',
    sources: [
      { label: 'Chaîne YouTube Clique', url: 'https://www.youtube.com/@cliquetv' },
      { label: 'Compte X public', url: 'https://x.com/cliquetv' },
    ],
    followers: 800000,
    platform: 'youtube',
  },
];

function toInfluencer(e: Entry) {
  const stance: Record<string, unknown> = {
    status: e.status,
    family: e.family,
    label: FAMILY_LABEL[e.family],
    rationale: e.rationale,
    sources: e.sources,
  };
  if (e.status === 'estime') stance.confidence = e.confidence ?? 0.5;
  return {
    id: e.id,
    display_name: e.display_name,
    ...(e.handle ? { handle: e.handle } : {}),
    platforms: e.platforms,
    summary: e.summary,
    stance,
    dependencies: [],
    verification: e.status === 'declare' ? 'documented' : 'partial',
    category: 'societe-civile',
  };
}

function main() {
  const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  const existing = new Set(raw.influencers.map((i: { id: string }) => i.id));
  const seeds = SEED.filter((s) => s.platforms.length > 0);
  const toAdd = seeds.filter((s) => !existing.has(s.id)).map(toInfluencer);

  // Normalise URLs Fondation Abbé Pierre
  for (const inf of toAdd) {
    for (const p of inf.platforms) {
      if (String(p.url).includes('fondation') && String(p.url).includes('abbe')) {
        p.url = 'https://www.fondation-abbe-pierre.fr/';
      }
    }
    for (const s of inf.stance.sources as Array<{ url: string }>) {
      if (s.url.includes('fondation') && s.url.includes('abbe')) {
        s.url = 'https://www.fondation-abbe-pierre.fr/';
      }
    }
  }

  const deputies = raw.influencers.filter(
    (i: { category?: string }) => i.category === 'elu-parlementaire',
  );
  // Remplacer des élus « bas signal » (fin de liste id) pour garder 577
  const removeCount = toAdd.length;
  const removeIds = new Set(
    deputies
      .slice()
      .reverse()
      .slice(0, removeCount)
      .map((i: { id: string }) => i.id),
  );

  raw.influencers = [
    ...raw.influencers.filter((i: { id: string }) => !removeIds.has(i.id)),
    ...toAdd,
  ];

  if (raw.influencers.length !== 577) {
    throw new Error(`Expected 577, got ${raw.influencers.length}`);
  }

  raw.updated = '2026-07-27';
  if (!String(raw.methodology_note).includes('P45f')) {
    raw.methodology_note +=
      ' Enrichissement P45f : + figures **société civile** (créateurs, ONG, vulgarisation, médias indépendants) — catégorie `societe-civile` ; remplacement d’élu·e·s Wikidata à bas signal pour conserver 577 sièges. Corpus non exhaustif.';
  }

  fs.writeFileSync(DATA, JSON.stringify(raw, null, 2) + '\n');

  // Audience overrides fragment
  const overridesPath = path.join(ROOT, 'src/data/assemblee-audience-overrides.json');
  const ov = JSON.parse(fs.readFileSync(overridesPath, 'utf8'));
  ov.defaults = ov.defaults || {};
  ov.defaults['societe-civile'] = { min: 50000, max: 400000 };
  ov.by_id = ov.by_id || {};
  for (const s of seeds) {
    if (s.followers) {
      ov.by_id[s.id] = {
        followers_total: s.followers,
        primary_platform: s.platform || 'youtube',
        status: 'estimate',
        note: 'Ordre de grandeur pédagogique (société civile).',
      };
    }
  }
  fs.writeFileSync(overridesPath, JSON.stringify(ov, null, 2) + '\n');

  const cats: Record<string, number> = {};
  for (const i of raw.influencers) {
    const c = i.category || 'influenceur';
    cats[c] = (cats[c] || 0) + 1;
  }
  console.log(
    JSON.stringify(
      {
        added: toAdd.map((i) => i.id),
        removed: [...removeIds],
        counts: cats,
        total: raw.influencers.length,
      },
      null,
      2,
    ),
  );
}

main();
