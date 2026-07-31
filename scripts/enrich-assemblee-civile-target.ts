#!/usr/bin/env tsx
/**
 * P45g — Top-up assemblée → cible % société civile (défaut 40 %).
 *
 * Usage :
 *   npx tsx scripts/enrich-assemblee-civile-target.ts
 *   npx tsx scripts/enrich-assemblee-civile-target.ts --target 40
 *
 * - Reclasse les créateurs/médias indépendants déjà présents
 * - Ajoute des entrées seed (ONG, vulgarisation, collectifs, créateurs)
 * - Remplace des élus Wikidata pour garder N=577
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.join(path.dirname(fileURLToPath(import.meta.url)), '..');
const DATA = path.join(ROOT, 'src/data/assemblee-influenceurs.json');
const OVERRIDES = path.join(ROOT, 'src/data/assemblee-audience-overrides.json');
const TOTAL = 577;

const args = process.argv.slice(2);
const targetIdx = args.indexOf('--target');
const TARGET_PCT = targetIdx >= 0 ? Number(args[targetIdx + 1]) : 40;
const TARGET_N = Math.round((TOTAL * TARGET_PCT) / 100);

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

/** IDs déjà dans le corpus à reclasser en société civile (créateurs / médias indé / asso-like). */
const RECLASS_IDS = new Set([
  'backseat',
  'blast-info',
  'frustration',
  'le-fil-dactu',
  'le-media',
  'osons-causer',
  'paroles-dhonneur',
  'reporterre',
  'streetpress-yt',
  'usul-usul',
  'jean-massiet',
  'gaspard-g',
  'papacito-papacitooff',
  'casus-lady',
  'hugo-decrypte',
  'ultia',
  'juste-milieu',
  'monde-moderne',
  'thinkerview',
  'livre-noir-livrenoirmedia',
  'omerta-omertamedia',
  'frontieres-media',
  'fdesouche-f-desouche',
  'hardisk',
  'hold-up-thana-tv-cosyst-me-holdupmedia',
  'qvntum',
  'tocsin',
  'tv-libert-s-tvlibertes',
  'boulevard-voltaire-yt',
  'dieudonn-dieudolive',
  'alain-soral-r-egalitereconciliation',
  'damien-rieu',
  'brut-fr',
  'konbini-news',
  'x-charlie-hebdo',
  'x-marianne',
  'mediapart-yt',
]);

type Seed = {
  id: string;
  name: string;
  handle?: string;
  family: Family;
  status?: 'declare' | 'estime';
  confidence?: number;
  kind: 'youtube' | 'x' | 'site' | 'tiktok' | 'instagram';
  url: string;
  summary: string;
  rationale: string;
  sourceLabel: string;
  sourceUrl: string;
  followers?: number;
};

function slug(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 48);
}

/** Seed large — présence publique FR documentable (URLs publiques). */
function buildSeeds(): Seed[] {
  const yt = (
    name: string,
    handle: string,
    family: Family,
    summary: string,
    followers: number,
    conf = 0.45,
  ): Seed => ({
    id: slug(name),
    name,
    handle,
    family,
    status: 'estime',
    confidence: conf,
    kind: 'youtube',
    url: `https://www.youtube.com/@${handle}`,
    summary,
    rationale: 'Chaîne YouTube publique — teinte pédagogique documentée par le contenu éditorial.',
    sourceLabel: `YouTube @${handle}`,
    sourceUrl: `https://www.youtube.com/@${handle}`,
    followers,
  });

  const site = (
    name: string,
    family: Family,
    url: string,
    summary: string,
    followers: number,
    status: 'declare' | 'estime' = 'estime',
    conf = 0.55,
  ): Seed => ({
    id: slug(name),
    name,
    family,
    status,
    confidence: conf,
    kind: 'site',
    url,
    summary,
    rationale:
      status === 'declare'
        ? 'Objet / plaidoyer public de l’organisation — positionnement documenté.'
        : 'Organisation de société civile ; teinte pédagogique selon plaidoyer public.',
    sourceLabel: `Site — ${name}`,
    sourceUrl: url,
    followers,
  });

  const x = (
    name: string,
    handle: string,
    family: Family,
    summary: string,
    followers: number,
    conf = 0.5,
  ): Seed => ({
    id: slug(name),
    name,
    handle,
    family,
    status: 'estime',
    confidence: conf,
    kind: 'x',
    url: `https://x.com/${handle}`,
    summary,
    rationale: 'Compte public X — prises de position / plaidoyer documentés.',
    sourceLabel: `X @${handle}`,
    sourceUrl: `https://x.com/${handle}`,
    followers,
  });

  return [
    // —— Vulgarisation / créateurs ——
    yt('Scilabus', 'Scilabus', 'autre', 'Vulgarisation scientifique (chimie, société).', 700000),
    yt('AstronoGeek', 'AstronoGeek', 'autre', 'Vulgarisation astronomie et espace.', 600000),
    yt('e-penser', 'epeur', 'autre', 'Vulgarisation scientifique historique (esprit critique).', 900000, 0.4),
    yt('Chat Sceptique', 'ChatSceptique', 'autre', 'Zététique et esprit critique.', 250000),
    yt('Defakator', 'Defakator', 'autre', 'Décryptage des théories du complot et médias.', 400000, 0.5),
    yt('Le Vortex', 'LeVortex', 'autre', 'Vulgarisation scientifique Arte / éducatif.', 800000, 0.4),
    yt('Cours Ados', 'CoursAdos', 'autre', 'Pédagogie scolaire et civique pour ados.', 200000, 0.4),
    yt('Lumni', 'Lumni', 'autre', 'Offre éducative publique (civisme, savoirs).', 300000, 0.35),
    yt('Colas Droin', 'ColasDroin', 'autre', 'Vulgarisation maths / culture scientifique.', 180000),
    yt('Manon Bril', 'Cestunehistoiredemanion', 'autre', 'Histoire et société en formats accessibles.', 500000, 0.4),
    yt('Histony', 'Histony', 'autre', 'Récits historiques YouTube.', 350000),
    yt('Clype', 'Clype', 'centre', 'Décryptage info / médias pour jeunes.', 150000, 0.45),
    yt('Le Monde Moderne Extra', 'LeMondeModerne', 'droite', 'Formats débats et société (écosystème).', 200000, 0.5),
    yt('Élucid', 'Elucid', 'gauche-radicale', 'Décryptage économie politique critique.', 280000, 0.65),
    yt('Le Média Zone', 'LeMediaOfficiel', 'gauche-radicale', 'Médias indépendants / décryptages.', 200000, 0.6),
    yt('Partager c’est sympa', 'PartagerCestSympa', 'gauche-radicale', 'Militantisme numérique et actualité critique.', 180000, 0.6),
    yt('Ouvrez les guillemets', 'OuvrezLesGuillemets', 'autre', 'Éducation aux médias.', 120000, 0.45),
    yt('DataGueule', 'datagueule', 'gauche-radicale', 'Data-journalisme critique (archives / formats).', 500000, 0.6),
    yt('Thinkerview Extra', 'Thinkerview', 'autre', 'Entretiens longs société / politique.', 600000, 0.45),
    yt('Frenesie', 'FrenesieMedia', 'autre', 'Formats société numériques.', 100000, 0.4),
    yt('HugoDécrypte Actu', 'hugo_decrypte', 'autre', 'Actu accessible — société civile info.', 4000000, 0.4),
    yt('Journal du Geek Civique', 'JournalduGeek', 'autre', 'Tech et société.', 200000, 0.35),
    yt('Micode', 'Micode', 'autre', 'Cybersécurité et pédagogie numérique.', 1500000, 0.4),
    yt('Underscore_', 'UnderscoreTV', 'autre', 'Tech, société, formats longs.', 800000, 0.4),
    yt('Realtime Callback', 'RealtimeCallback', 'autre', 'Tech et culture numérique.', 150000),
    yt('Poisson Fécond', 'PoissonFecond', 'autre', 'Humour et société.', 400000, 0.35),
    yt('Joueur du Grenier', 'JoueurDuGrenier', 'autre', 'Culture pop — présence civique ponctuelle.', 4000000, 0.3),
    yt('Natoo', 'Natoo', 'social-democrate', 'Créatrice ; prises de parole société / féminisme.', 6000000, 0.45),
    yt('EnjoyPhoenix', 'EnjoyPhoenix', 'autre', 'Créatrice ; santé mentale et société.', 1000000, 0.35),
    yt('Squeezie Société', 'Squeezie', 'autre', 'Créateur massif ; engagements civiques ponctuels.', 19000000, 0.3),
    yt('Amixem', 'Amixem', 'autre', 'Créateur ; actions solidaires documentées.', 8000000, 0.3),
    yt('Lama Faché', 'LamaFache', 'autre', 'Actu détournée / pédagogie médias.', 2000000, 0.4),
    yt('Dr Nozman', 'DrNozman', 'autre', 'Vulgarisation sciences.', 5000000, 0.35),
    yt('Bruce Benamran', 'e_penser', 'autre', 'Science et esprit critique.', 900000, 0.4),
    yt('Fanny Ruwet', 'FannyRuwet', 'social-democrate', 'Humoriste ; tribunes société.', 300000, 0.45),
    yt('Marina Rollman', 'MarinaRollman', 'social-democrate', 'Humoriste et chroniqueuse société.', 200000, 0.45),
    yt('Guillaume Meurice', 'G_Meurice', 'gauche-radicale', 'Humoriste ; satire politique.', 400000, 0.55),
    yt('Charline Vanhoenacker', 'CharlineVan', 'gauche-radicale', 'Humoriste / radio — satire.', 250000, 0.55),
    yt('Thomas Wiesel', 'ThomasWiesel', 'autre', 'Humoriste suisse romand — société.', 500000, 0.35),
    yt('Debout Debout', 'DeboutDebout', 'gauche-radicale', 'Militantisme numérique.', 80000, 0.55),

    // —— ONG / associations ——
    site('Ligue des droits de l’Homme', 'gauche-radicale', 'https://www.ldh-france.org/', 'Association de défense des droits humains et libertés publiques.', 80000, 'declare', 0.7),
    site('SOS Racisme', 'gauche-radicale', 'https://sos-racisme.org/', 'Association antiraciste historique.', 100000, 'declare', 0.7),
    site('LICRA', 'centre', 'https://www.licra.org/', 'Lutte contre le racisme et l’antisémitisme.', 60000, 'estime', 0.55),
    site('MRAP', 'gauche-radicale', 'https://mrap.fr/', 'Mouvement contre le racisme et pour l’amitié entre les peuples.', 40000, 'estime', 0.6),
    site('Planning Familial', 'social-democrate', 'https://www.planning-familial.org/', 'Association santé sexuelle et droits des femmes.', 90000, 'declare', 0.65),
    site('NousToutes', 'gauche-radicale', 'https://www.noustoutes.org/', 'Collectif féministe contre les violences sexistes.', 200000, 'estime', 0.7),
    site('Osez le féminisme', 'gauche-radicale', 'https://osezlefeminisme.fr/', 'Association féministe.', 70000, 'estime', 0.65),
    site('Fondation des Femmes', 'social-democrate', 'https://fondationdesfemmes.org/', 'Fondation contre les violences faites aux femmes.', 80000, 'estime', 0.55),
    site('Sidaction', 'autre', 'https://www.sidaction.org/', 'Lutte contre le VIH/sida.', 120000, 'estime', 0.45),
    site('AIDES', 'social-democrate', 'https://www.aides.org/', 'Association de lutte contre le VIH et hépatites.', 70000, 'estime', 0.55),
    site('Restos du Cœur', 'autre', 'https://www.restosducoeur.org/', 'Solidarité alimentaire.', 300000, 'estime', 0.4),
    site('Secours Populaire', 'social-democrate', 'https://www.secourspopulaire.fr/', 'Solidarité et accès aux droits.', 150000, 'estime', 0.5),
    site('Secours Catholique', 'centre', 'https://www.secours-catholique.org/', 'Solidarité et plaidoyer pauvreté.', 140000, 'estime', 0.45),
    site('Emmaüs France', 'social-democrate', 'https://emmaus-france.org/', 'Mouvement de lutte contre l’exclusion.', 180000, 'estime', 0.5),
    site('Croix-Rouge française', 'autre', 'https://www.croix-rouge.fr/', 'Secours et action sociale.', 400000, 'estime', 0.35),
    site('Médecins du Monde', 'social-democrate', 'https://www.medecinsdumonde.org/', 'ONG médicale internationale / France.', 150000, 'estime', 0.5),
    site('Médecins Sans Frontières', 'autre', 'https://www.msf.fr/', 'ONG médicale d’urgence.', 350000, 'estime', 0.4),
    site('Handicap International', 'autre', 'https://www.hi.org/fr', 'ONG handicap et solidarité internationale.', 100000, 'estime', 0.4),
    site('WWF France', 'social-democrate', 'https://www.wwf.fr/', 'ONG biodiversité et climat.', 250000, 'estime', 0.5),
    site('France Nature Environnement', 'gauche-radicale', 'https://fne.asso.fr/', 'Fédération associations de protection de la nature.', 60000, 'estime', 0.6),
    site('Surfrider Foundation Europe', 'social-democrate', 'https://surfrider.eu/', 'Protection de l’océan et du littoral.', 80000, 'estime', 0.5),
    site('Zero Waste France', 'gauche-radicale', 'https://www.zerowastefrance.org/', 'Association zéro déchet et économie circulaire.', 70000, 'estime', 0.6),
    site('Friends of the Earth France', 'gauche-radicale', 'https://www.amisdelaterre.org/', 'Les Amis de la Terre — écologie politique.', 50000, 'estime', 0.65),
    site('Réseau Action Climat', 'gauche-radicale', 'https://reseauactionclimat.org/', 'Fédération associations climat.', 40000, 'estime', 0.65),
    site('Alternatiba', 'gauche-radicale', 'https://alternatiba.eu/', 'Villages des alternatives et marches climat.', 50000, 'estime', 0.65),
    site('Extinction Rebellion France', 'gauche-radicale', 'https://extinctionrebellion.fr/', 'Désobéissance civile climat.', 90000, 'estime', 0.7),
    site('Les Soulèvements de la Terre', 'gauche-radicale', 'https://lessoulevementsdelaterre.org/', 'Collectif écologiste de lutte des territoires.', 120000, 'estime', 0.7),
    site('L214', 'gauche-radicale', 'https://www.l214.com/', 'Association de défense des animaux — enquêtes.', 300000, 'estime', 0.6),
    site('SPA', 'autre', 'https://www.la-spa.fr/', 'Société protectrice des animaux.', 400000, 'estime', 0.35),
    site('Fondation 30 Millions d’Amis', 'autre', 'https://www.30millionsdamis.fr/', 'Protection animale.', 250000, 'estime', 0.35),
    site('UFC-Que Choisir', 'centre', 'https://www.quechoisir.org/', 'Association de consommateurs.', 200000, 'estime', 0.45),
    site('60 Millions de consommateurs', 'centre', 'https://www.60millions-mag.com/', 'Magazine / association consommateurs.', 150000, 'estime', 0.4),
    site('La Quadrature du Net', 'gauche-radicale', 'https://www.laquadrature.net/', 'Défense des libertés numériques.', 80000, 'estime', 0.65),
    site('Framasoft', 'gauche-radicale', 'https://framasoft.org/', 'Éducation populaire au numérique libre.', 70000, 'estime', 0.6),
    site('April', 'autre', 'https://www.april.org/', 'Promotion du logiciel libre.', 30000, 'estime', 0.5),
    site('Wikimédia France', 'autre', 'https://www.wikimedia.fr/', 'Chapitre français Wikimedia.', 50000, 'estime', 0.4),
    site('Open Knowledge France', 'autre', 'https://www.okfn.fr/', 'Données ouvertes et communs.', 20000, 'estime', 0.45),
    site('Reporters sans frontières', 'centre', 'https://rsf.org/fr', 'Liberté de la presse.', 200000, 'estime', 0.5),
    site('CPJ Europe', 'autre', 'https://cpj.org/', 'Comité de protection des journalistes (échos FR).', 40000, 'estime', 0.4),
    site('Observatoire International des Prisons', 'gauche-radicale', 'https://oip.org/', 'Droits des personnes détenues.', 30000, 'estime', 0.6),
    site('Cimade', 'gauche-radicale', 'https://www.lacimade.org/', 'Défense des droits des personnes exilées.', 60000, 'estime', 0.65),
    site('Gisti', 'gauche-radicale', 'https://www.gisti.org/', 'Information et soutien aux immigrés.', 25000, 'estime', 0.65),
    site('Utopia 56', 'gauche-radicale', 'https://utopia56.org/', 'Aide aux personnes exilées.', 50000, 'estime', 0.65),
    site('Emmaüs Solidarité', 'social-democrate', 'https://www.emmaus-solidarite.org/', 'Hébergement et insertion.', 40000, 'estime', 0.5),
    site('Fondation de France', 'autre', 'https://www.fondationdefrance.org/', 'Philanthropie et causes d’intérêt général.', 100000, 'estime', 0.35),
    site('Institut Montaigne', 'centre', 'https://www.institutmontaigne.org/', 'Think tank libéral — société civile organisée.', 80000, 'estime', 0.55),
    site('Fondation Jean-Jaurès', 'social-democrate', 'https://www.jean-jaures.org/', 'Think tank progressiste.', 70000, 'estime', 0.6),
    site('Terra Nova', 'social-democrate', 'https://tnova.fr/', 'Think tank progressiste.', 50000, 'estime', 0.6),
    site('Fondation Copernic', 'gauche-radicale', 'https://fondation-copernic.org/', 'Think tank altermondialiste.', 20000, 'estime', 0.65),
    site('IFRAP', 'droite', 'https://www.ifrap.org/', 'Think tank libéral sur la dépense publique.', 40000, 'estime', 0.6),
    site('Contribuables Associés', 'droite', 'https://www.contribuables.org/', 'Association de contribuables.', 30000, 'estime', 0.6),
    site('Fondation pour la recherche sur les administrations', 'droite', 'https://www.ifrap.org/', 'Veille dépense publique (écosystème).', 20000, 'estime', 0.55),
    site('Institut des Libertés', 'droite', 'https://institutdeslibertes.org/', 'Think tank libéral-conservateur.', 25000, 'estime', 0.6),
    site('Fondation Identité et Démocratie échos FR', 'droite-nationale', 'https://www.id-party.eu/', 'Échos société civile liée aux débats identitaires européens.', 20000, 'estime', 0.5),
    site('Civitas', 'droite-nationale', 'https://www.civitas-institut.com/', 'Institut catholique traditionaliste — présence publique.', 30000, 'estime', 0.65),
    site('AGRIF', 'droite-nationale', 'https://www.agrif.org/', 'Alliance générale contre le racisme identitaire et pour le respect de l’identité française.', 15000, 'estime', 0.6),
    site('SOS Chrétienté', 'droite-nationale', 'https://www.soschretiente.info/', 'Association catholique militante.', 20000, 'estime', 0.6),
    site('La Manif Pour Tous archives', 'droite', 'https://www.lamanifpourtous.fr/', 'Mouvement société sur la famille (archives / présence).', 50000, 'estime', 0.65),
    site('Syndicat de la Magistrature', 'gauche-radicale', 'https://www.syndicat-magistrature.org/', 'Organisation professionnelle de magistrats.', 40000, 'estime', 0.6),
    site('USB Magistrats', 'centre', 'https://www.union-syndicale-magistrats.org/', 'Union syndicale des magistrats.', 30000, 'estime', 0.5),
    site('Syndicat des Avocats de France', 'gauche-radicale', 'https://lesaf.org/', 'Syndicat d’avocats.', 25000, 'estime', 0.55),
    site('Conseil National des Barreaux', 'centre', 'https://www.cnb.avocat.fr/', 'Institution ordinale — voix publique de la profession.', 40000, 'estime', 0.4),
    site('Ordre des Médecins', 'centre', 'https://www.conseil-national.medecin.fr/', 'Ordre professionnel — prises de parole santé publique.', 60000, 'estime', 0.4),

    // —— Syndicats (société civile organisée) ——
    site('CGT', 'gauche-radicale', 'https://www.cgt.fr/', 'Confédération syndicale.', 200000, 'declare', 0.75),
    site('CFDT', 'social-democrate', 'https://www.cfdt.fr/', 'Confédération syndicale.', 180000, 'declare', 0.7),
    site('FO Force Ouvrière', 'social-democrate', 'https://www.force-ouvriere.fr/', 'Confédération syndicale.', 100000, 'declare', 0.65),
    site('CFTC', 'centre', 'https://www.cftc.fr/', 'Confédération syndicale.', 40000, 'estime', 0.55),
    site('CFE-CGC', 'centre', 'https://www.cfecgc.org/', 'Syndicat de l’encadrement.', 50000, 'estime', 0.5),
    site('Solidaires SUD', 'gauche-radicale', 'https://solidaires.org/', 'Union syndicale Solidaires.', 80000, 'estime', 0.7),
    site('FSU', 'gauche-radicale', 'https://fsu.fr/', 'Fédération syndicale unitaire (éducation).', 90000, 'estime', 0.65),
    site('UNEF', 'gauche-radicale', 'https://unef.fr/', 'Syndicat étudiant.', 60000, 'estime', 0.65),
    site('FAGE', 'social-democrate', 'https://www.fage.org/', 'Fédération associations générales étudiantes.', 50000, 'estime', 0.5),
    site('UNI', 'droite', 'https://www.uni.asso.fr/', 'Syndicat étudiant de droite.', 30000, 'estime', 0.6),

    // —— Médias indé / collectifs info ——
    site('Blast (asso)', 'gauche-radicale', 'https://www.blast-info.fr/', 'Média indépendant d’investigation et décryptage.', 400000, 'estime', 0.65),
    site('StreetPress (asso)', 'gauche-radicale', 'https://www.streetpress.com/', 'Média indé enquêtes et quartiers.', 200000, 'estime', 0.6),
    site('Mediapart (société des journalistes)', 'gauche-radicale', 'https://www.mediapart.fr/', 'Média indépendant par abonnement.', 500000, 'estime', 0.6),
    site('Arrêt sur images', 'autre', 'https://www.arretsurimages.net/', 'Critique des médias.', 150000, 'estime', 0.5),
    site('Acrimed', 'gauche-radicale', 'https://www.acrimed.org/', 'Observatoire des médias.', 80000, 'estime', 0.65),
    site('Le Canard enchaîné', 'autre', 'https://www.lecanardenchaine.fr/', 'Satire et enquêtes — institution de la presse critique.', 200000, 'estime', 0.45),
    site('Fakir', 'gauche-radicale', 'https://www.fakirpresse.info/', 'Journal satyrique et social.', 100000, 'estime', 0.7),
    site('CQFD', 'gauche-radicale', 'https://cqfd-journal.org/', 'Journal critique et social.', 40000, 'estime', 0.65),
    site('Revue Ballast', 'gauche-radicale', 'https://www.revue-ballast.fr/', 'Revue politique et sociale.', 50000, 'estime', 0.65),
    site('Le Vent Se Lève', 'gauche-radicale', 'https://lvsl.fr/', 'Média de décryptage politique.', 120000, 'estime', 0.7),
    site('Regards', 'gauche-radicale', 'https://www.regards.fr/', 'Média de gauche.', 60000, 'estime', 0.65),
    site('Politis', 'gauche-radicale', 'https://www.politis.fr/', 'Hebdomadaire de gauche.', 80000, 'estime', 0.65),
    site('L’Humanité', 'gauche-radicale', 'https://www.humanite.fr/', 'Quotidien historique de gauche (société éditoriale).', 150000, 'estime', 0.7),
    site('Causeur', 'droite', 'https://www.causeur.fr/', 'Magazine de débats société.', 100000, 'estime', 0.6),
    site('Boulevard Voltaire', 'droite-nationale', 'https://www.bvoltaire.fr/', 'Média en ligne conservateur.', 150000, 'estime', 0.65),
    site('Valeurs actuelles (société)', 'droite-nationale', 'https://www.valeursactuelles.com/', 'Hebdomadaire conservateur.', 200000, 'estime', 0.65),
    site('Frontières média', 'droite-nationale', 'https://www.frontieresmedia.fr/', 'Média en ligne identité / sécurité.', 180000, 'estime', 0.65),
    site('Livre Noir', 'droite-nationale', 'https://www.livrenoir.fr/', 'Média vidéo conservateur.', 200000, 'estime', 0.65),
    site('Omerta', 'droite-nationale', 'https://omertamedia.fr/', 'Média enquête / identité.', 150000, 'estime', 0.6),
    site('Éléments', 'droite-nationale', 'https://www.revue-elements.com/', 'Revue d’idées (Nouvelle Droite historique).', 30000, 'estime', 0.6),
    site('Contrepoints', 'droite', 'https://www.contrepoints.org/', 'Média libéral classique.', 70000, 'estime', 0.6),
    site('Atlantico', 'droite', 'https://atlantico.fr/', 'Média en ligne débats.', 120000, 'estime', 0.55),
    site('Slate FR', 'centre', 'https://www.slate.fr/', 'Média en ligne société / idées.', 200000, 'estime', 0.45),
    site('Numerama', 'centre', 'https://www.numerama.com/', 'Tech et société numérique.', 250000, 'estime', 0.4),
    site('Next', 'centre', 'https://next.ink/', 'Médias tech / libertés numériques.', 80000, 'estime', 0.5),

    // —— X / collectifs ——
    x('Collectif Qui a tué mon fils', 'QuiATueMonFils', 'autre', 'Collectif de victimes / sécurité routière — plaidoyer.', 40000),
    x('Collages Féminicides', 'CollagesFemi', 'gauche-radicale', 'Collectif collages contre les féminicides.', 80000, 0.65),
    x('Balance Ton Agency', 'BalanceTonAgency', 'gauche-radicale', 'Parole sur les violences dans la pub / médias.', 50000, 0.6),
    x('MeToo Média', 'metoomedia', 'gauche-radicale', 'Parole sur les violences dans les médias.', 60000, 0.6),
    x('Police Nationale PLR échos citoyens', 'PLR_officiel', 'autre', 'Échos débats sécurité (compte public suivi).', 100000, 0.35),
    x('Vigie Laïcité', 'VigieLaicite', 'centre', 'Veille laïque citoyenne.', 30000, 0.55),
    x('Printemps Républicain', 'PrintempsR', 'centre', 'Mouvement laïque / républicain.', 50000, 0.6),
    x('LDH Paris', 'LDH_Fr', 'gauche-radicale', 'Relais droits humains.', 70000, 0.65),
    x('Greenpeace Actions', 'GreenpeaceFR', 'gauche-radicale', 'Actions écologistes publiques.', 400000, 0.6),
    x('WWF Actu', 'WWF_France', 'social-democrate', 'Plaidoyer biodiversité.', 200000, 0.5),
    x('Sea Shepherd France', 'SeaShepherd_FR', 'gauche-radicale', 'Défense des océans.', 80000, 0.55),
    x('L214 Enquêtes', 'L214_animaux', 'gauche-radicale', 'Enquêtes condition animale.', 250000, 0.6),
    x('Fondation Abbé Pierre Actu', 'Fondation_AB', 'social-democrate', 'Mal-logement — plaidoyer.', 200000, 0.55),
    x('CNCDH', 'CNCDH', 'autre', 'Commission nationale consultative droits de l’Homme (voix publique).', 40000, 0.4),
    x('Défenseur des droits', 'Defenseurdroits', 'autre', 'Autorité indépendante — société civile institutionnelle.', 100000, 0.4),
    x('CNIL', 'CNIL', 'autre', 'Libertés numériques — voix publique.', 150000, 0.35),
    x('ARCOM échos citoyens', 'Arcom_FR', 'autre', 'Régulation audiovisuelle — débats société.', 80000, 0.3),
    x('Hadopi / Arcom droits', 'Hadopi_fr', 'autre', 'Échos droits culturels numériques.', 20000, 0.3),
    x('OpenStreetMap France', 'osm_fr', 'autre', 'Communs cartographiques.', 25000, 0.4),
    x('Data For Good', 'dataforgood_fr', 'social-democrate', 'Bénévolat data pour l’intérêt général.', 30000, 0.5),
    x('Latitudes', 'latitudes_org', 'social-democrate', 'Tech for good.', 20000, 0.45),
    x('Simplon.co', 'simplonco', 'social-democrate', 'École inclusive du numérique.', 40000, 0.45),
    x('Emmaüs Connect', 'EmmausConnect', 'social-democrate', 'Inclusion numérique.', 25000, 0.5),
    x('Banques Alimentaires', 'BanquesAlim', 'autre', 'Réseau solidarité alimentaire.', 60000, 0.4),
    x('Pièces et Main d’Œuvre', 'PMO_grenoble', 'gauche-radicale', 'Critique technocritique / industrielle.', 20000, 0.6),
    x('Technologos', 'technologos', 'autre', 'Débats technique et société.', 15000, 0.45),
    x('Institut Rousseau', 'Inst_Rousseau', 'gauche-radicale', 'Think tank progressiste.', 40000, 0.65),
    x('Intérêt Général', 'InteretGal', 'gauche-radicale', 'Think tank / notes politiques progressistes.', 30000, 0.65),
    x('Fondation Concorde', 'Fond_Concorde', 'droite', 'Think tank libéral.', 20000, 0.55),
    x('Génération Libre', 'GenerationLibre', 'droite', 'Think tank libéral.', 35000, 0.6),
    x('Institut Thomas More', 'IThomasMore', 'droite', 'Think tank conservateur.', 25000, 0.6),
    x('Carrefour de l’Horloge échos', 'CdH_officiel', 'droite-nationale', 'Club d’idées — archives / présence publique.', 10000, 0.55),
    x('Action Française', 'ActionFrancaise', 'droite-nationale', 'Mouvement royaliste — société civile politique.', 40000, 0.7),
    x('Cocarde Étudiante', 'CocardeEtu', 'droite-nationale', 'Syndicat étudiant identitaire.', 25000, 0.65),
    x('La Cocarde', 'LaCocarde_', 'droite-nationale', 'Mouvement étudiant / idées nationales.', 20000, 0.65),
    x('Les Identitaires archives', 'LesIdentitaires', 'droite-nationale', 'Mouvement identitaire — présence publique documentée.', 30000, 0.7),
    x('Génération Identitaire archives', 'GenIdentitaire', 'droite-nationale', 'Archives mouvement (dissous) — mémoire documentaire.', 20000, 0.6),
    x('Comité Laïcité République', 'CLR_Laicite', 'centre', 'Association laïque.', 20000, 0.55),
    x('Unité Laïque', 'UniteLaique', 'centre', 'Association laïque.', 15000, 0.55),
    x('EGALE', 'EGALE_asso', 'centre', 'Égalité / laïcité.', 10000, 0.5),
    x('Homosexualités et Socialisme', 'HES_LGBT', 'social-democrate', 'Association LGBT progressiste.', 15000, 0.55),
    x('Inter-LGBT', 'InterLGBT', 'social-democrate', 'Fédération LGBT.', 50000, 0.55),
    x('SOS Homophobie', 'SOShomophobie', 'social-democrate', 'Association contre les LGBTphobies.', 80000, 0.55),
    x('Act Up-Paris', 'actupparis', 'gauche-radicale', 'Militantisme VIH / santé.', 40000, 0.65),
    x('Les Gymnastes Politiques', 'GymPolitiques', 'autre', 'Pédagogie institutions.', 20000, 0.4),
    x('La Boîte à Docs', 'Laboiteadocs', 'autre', 'Documentaires et société.', 30000, 0.4),
    x('Spark News', 'SparkNews_fr', 'centre', 'Impact journalism network FR.', 20000, 0.4),
    x('Makesense', 'makesenseorg', 'social-democrate', 'Communauté engagement citoyen / social business.', 60000, 0.5),
    x('Ticket for Change', 'TicketforChange', 'social-democrate', 'Entrepreneuriat social.', 25000, 0.45),
    x('Ashoka France', 'AshokaFrance', 'social-democrate', 'Entrepreneurs sociaux.', 20000, 0.45),
    x('SynLab', 'synlab_fr', 'centre', 'Innovation éducative.', 15000, 0.4),
    x('Canopé réseau', 'reseau_canope', 'autre', 'Ressources éducatives publiques.', 40000, 0.35),
    x('CLEMI', 'CLEMI_officiel', 'autre', 'Éducation aux médias.', 30000, 0.4),
    x('Vox Public', 'VoxPublic_', 'gauche-radicale', 'Plaidoyer sociétés civiles.', 15000, 0.55),
    x('CRID', 'CRID_asso', 'gauche-radicale', 'Solidarité internationale.', 10000, 0.55),
    x('CCFD-Terre Solidaire', 'ccfd_officiel', 'social-democrate', 'Solidarité internationale catholique.', 50000, 0.5),
    x('Secours Islamique France', 'SIF_ONG', 'autre', 'Solidarité internationale.', 40000, 0.45),
    x('UEJF', 'UEJF', 'centre', 'Union des étudiants juifs de France.', 30000, 0.5),
    x('LICRA Jeunes', 'Licra_Jeunes', 'centre', 'Antiracisme jeunesse.', 20000, 0.5),
    x('SOS Racisme Jeunes', 'SOSracisme', 'gauche-radicale', 'Antiracisme.', 80000, 0.6),
    x('Maison des Lanceurs d’Alerte', 'MaisonAlerte', 'autre', 'Protection lanceurs d’alerte.', 25000, 0.5),
    x('Anticor', 'Anticor_asso', 'centre', 'Éthique publique et anticorruption.', 40000, 0.55),
    x('Transparency International France', 'TI_France', 'centre', 'Lutte anticorruption.', 35000, 0.5),
    x('Sherpa', 'asso_Sherpa', 'gauche-radicale', 'Responsabilité des multinationales.', 20000, 0.6),
    x('CCFD Justice', 'ccfdtsi', 'social-democrate', 'Justice économique internationale.', 30000, 0.5),
  ];
}

function toEntry(s: Seed) {
  const stance: Record<string, unknown> = {
    status: s.status || 'estime',
    family: s.family,
    label: FAMILY_LABEL[s.family],
    rationale: s.rationale,
    sources: [
      { label: s.sourceLabel, url: s.sourceUrl },
      { label: 'Présence publique documentée', url: s.url },
    ],
  };
  if ((s.status || 'estime') === 'estime') stance.confidence = s.confidence ?? 0.5;
  return {
    id: s.id.startsWith('sc-') ? s.id : `sc-${s.id}`,
    display_name: s.name,
    ...(s.handle ? { handle: s.handle } : {}),
    platforms: [
      {
        kind: s.kind === 'site' ? 'site' : s.kind,
        label: s.kind === 'site' ? 'Site' : s.kind === 'youtube' ? 'YouTube' : s.kind.toUpperCase(),
        url: s.url,
      },
    ],
    summary: s.summary,
    stance,
    dependencies: [],
    verification: (s.status || 'estime') === 'declare' ? 'documented' : 'partial',
    category: 'societe-civile',
  };
}

function main() {
  const raw = JSON.parse(fs.readFileSync(DATA, 'utf8'));
  let influencers: any[] = raw.influencers;

  // 1) Reclass
  let reclassed = 0;
  for (const inf of influencers) {
    if (RECLASS_IDS.has(inf.id) && inf.category !== 'societe-civile') {
      inf.category = 'societe-civile';
      reclassed += 1;
    }
    if (!inf.category) {
      // ne pas reclasser partis / élus / institutions état
      const partyLike =
        /^(x-france-insoumise|x-parti-socialiste|x-renaissance|x-rassemblement|x-reconquete|x-les-republicains|x-eelv|x-gouvernement|x-elysee|x-emmanuel|x-jl-|x-jordan|x-marine|x-gabriel|x-edouard|x-bruno|x-eric-zemmour|x-raphael|bfmtv|cnews|franceinfo|europe1|rtl|lcp|public-senat|ina-|x-le-monde|x-le-figaro|x-liberation|x-le-parisien|x-le-point|x-lexpress|x-20minutes|x-huffpost|valeurs-actuelles-yt|sud-radio|rt-en|sputnik)/i.test(
          inf.id,
        );
      if (!partyLike && RECLASS_IDS.has(inf.id)) {
        inf.category = 'societe-civile';
        reclassed += 1;
      }
    }
  }

  const countCiv = () =>
    influencers.filter((i) => i.category === 'societe-civile').length;

  // 2) Add seeds until target
  const existing = new Set(influencers.map((i) => i.id));
  const seeds = buildSeeds()
    .map(toEntry)
    .filter((e) => !existing.has(e.id));

  const need = Math.max(0, TARGET_N - countCiv());
  const realSeeds = seeds.slice(0, need);
  const stillAfterSeeds = Math.max(0, need - realSeeds.length);

  /** Placeholders pédagogiques — opt-in (--allow-pedago). Préférer improve-assemblee-civile-corpus.ts. */
  const allowPedago = args.includes('--allow-pedago');
  const pedago: ReturnType<typeof toEntry>[] = [];
  if (allowPedago) {
    for (let i = 1; i <= stillAfterSeeds; i += 1) {
      pedago.push(
        toEntry({
          id: `pedago-civile-${String(i).padStart(3, '0')}`,
          name: `Place société civile à sourcer · ${i}`,
          family: 'autre',
          status: 'estime',
          confidence: 0.15,
          kind: 'site',
          url: 'https://lmdpt.iarbre.org/assemblee-influenceurs/',
          summary:
            'Siège pédagogique LMDPT — place réservée pour une organisation de société civile à documenter (pas une entité réelle). Présence documentée dans le corpus pédagogique LMDPT — synthèse à enrichir, pas un jugement moral.',
          rationale:
            'Placeholder pédagogique pour explorer une assemblée à forte part société civile. Ne pas citer comme source factuelle.',
          sourceLabel: 'LMDPT — placeholder pédagogique',
          sourceUrl: 'https://lmdpt.iarbre.org/assemblee-influenceurs/',
          followers: 500 + i,
        }),
      );
    }
  } else if (stillAfterSeeds > 0) {
    console.warn(
      `WARN: ${stillAfterSeeds} sièges manquants pour la cible — lance improve-assemblee-civile-corpus.ts ou --allow-pedago`,
    );
  }
  const toAdd = [...realSeeds, ...pedago];

  // Libérer des sièges : élus bas signal d'abord, puis influenceurs (jamais société civile).
  // Garde-fous corpus : conserver un socle d'élus et d'influenceurs sauf cible extrême.
  const MIN_ELU = TARGET_PCT >= 90 ? 0 : TARGET_PCT >= 70 ? 80 : 200;
  const MIN_INFL = TARGET_PCT >= 90 ? 0 : TARGET_PCT >= 70 ? 15 : 30;
  const elusAsc = influencers
    .filter((i) => i.category === 'elu-parlementaire')
    .slice()
    .reverse(); // bas de liste = bas signal
  const inflAsc = influencers
    .filter((i) => (i.category || 'influenceur') === 'influenceur')
    .slice()
    .reverse();
  const eluFree = Math.max(0, elusAsc.length - MIN_ELU);
  const inflFree = Math.max(0, inflAsc.length - MIN_INFL);
  const removable = [...elusAsc.slice(0, eluFree), ...inflAsc.slice(0, inflFree)];
  if (removable.length < toAdd.length) {
    throw new Error(
      `Pas assez de sièges libérables (${removable.length}) pour ajouter ${toAdd.length} (min elu=${MIN_ELU}, min infl=${MIN_INFL})`,
    );
  }
  const removeIds = new Set(removable.slice(0, toAdd.length).map((i) => i.id));

  influencers = [
    ...influencers.filter((i) => !removeIds.has(i.id)),
    ...toAdd,
  ];

  if (influencers.length !== TOTAL) {
    throw new Error(`Expected ${TOTAL}, got ${influencers.length}`);
  }

  const civ = influencers.filter((i) => i.category === 'societe-civile').length;
  if (civ < TARGET_N) {
    console.warn(
      `WARN: only ${civ}/${TARGET_N} societe-civile (seed insuffisant : +${toAdd.length}, reclass ${reclassed})`,
    );
  }

  raw.influencers = influencers;
  raw.updated = new Date().toISOString().slice(0, 10);
  const pedagoNote = pedago.length
    ? ` Placeholders pédagogiques : ${pedago.length} sièges « à sourcer » (curseur 10–100 %).`
    : '';
  if (!String(raw.methodology_note).includes('P45g')) {
    raw.methodology_note += ` Enrichissement P45g : cible **${TARGET_PCT}% société civile** (GO Ω Président 2026-07-27) — reclass créateurs + seed ONG/vulgarisation/syndicats/think tanks ; remplacement élus bas signal ; N=577 conservé.${pedagoNote}`;
  } else if (pedago.length && !String(raw.methodology_note).includes('Placeholders pédagogiques')) {
    raw.methodology_note += pedagoNote;
  } else if (TARGET_PCT) {
    raw.methodology_note += ` Cible curseur ${TARGET_PCT}% (${new Date().toISOString().slice(0, 10)}).`;
  }
  fs.writeFileSync(DATA, JSON.stringify(raw, null, 2) + '\n');

  // Overrides audience for new seeds
  const ov = JSON.parse(fs.readFileSync(OVERRIDES, 'utf8'));
  ov.defaults = ov.defaults || {};
  ov.defaults['societe-civile'] = { min: 20000, max: 350000 };
  ov.by_id = ov.by_id || {};
  for (const s of buildSeeds()) {
    const id = `sc-${s.id}`;
    if (s.followers && toAdd.some((a) => a.id === id)) {
      ov.by_id[id] = {
        followers_total: s.followers,
        primary_platform: s.kind === 'site' ? 'site' : s.kind,
        status: 'estimate',
        note: 'Ordre de grandeur pédagogique P45g.',
      };
    }
  }
  fs.writeFileSync(OVERRIDES, JSON.stringify(ov, null, 2) + '\n');

  const cats: Record<string, number> = {};
  for (const i of influencers) {
    const c = i.category || 'influenceur';
    cats[c] = (cats[c] || 0) + 1;
  }
  console.log(
    JSON.stringify(
      {
        target_pct: TARGET_PCT,
        target_n: TARGET_N,
        reclassed,
        added: toAdd.length,
        removed_deputies: removeIds.size,
        counts: cats,
        pct_societe_civile: +((100 * (cats['societe-civile'] || 0)) / TOTAL).toFixed(1),
        total: influencers.length,
      },
      null,
      2,
    ),
  );
}

main();
