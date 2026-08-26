#!/usr/bin/env node
/**
 * LMDPT — Hero vidéo du jour (croquis N&B sans texte) pilotée par le scoop.
 *
 * Pipeline local (pas d'API Imagine ZDR) :
 *   renifleur + alertes → motif → Cairo sketch → ffmpeg Ken Burns → override JSON
 *
 * Usage:
 *   node scripts/hero-daily-video.mjs
 *   node scripts/hero-daily-video.mjs --dry-run
 *   node scripts/hero-daily-video.mjs --force
 *
 * Sorties (public/) :
 *   videos/2027/daily/hero-YYYY-MM-DD.mp4
 *   videos/2027/hero-daily-live.mp4          (copie cache-busted jour)
 *   illustrations/2027/hero-daily-live.jpg|.webp
 *   illustrations/2027/hero-daily-override.json
 */
import { execFileSync, spawnSync } from 'node:child_process';
import {
  copyFileSync,
  existsSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = join(__dirname, '..');
const PUBLIC = join(ROOT, 'public');
const TZ = 'Europe/Paris';

const args = new Set(process.argv.slice(2));
const DRY = args.has('--dry-run');
const FORCE = args.has('--force');

function parisDayKey(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function daySeed(dayKey) {
  // stable seed from YYYY-MM-DD
  return [...dayKey].reduce((a, c) => (a * 33 + c.charCodeAt(0)) >>> 0, 7);
}

function readJson(path, fallback = null) {
  try {
    return JSON.parse(readFileSync(path, 'utf8'));
  } catch {
    return fallback;
  }
}

/** Map scoop keywords → motif (visuel sans texte). */
function pickMotif(scoopText) {
  const t = (scoopText || '').toLowerCase();
  const rules = [
    {
      motif: 'documents',
      re: /ing[eé]rence|d[eé]sinformation|manipulation|projet de loi|s[eé]nat|nunez|nu[nñ]ez|l[eé]gifrance|justice|p[eé]nal/,
    },
    {
      motif: 'censure',
      re: /censure|arcom|r[eé]seaux sociaux|mod[eé]ration|libert[eé] d.?expression|ban|suspension/,
    },
    {
      motif: 'hemicycle',
      re: /assembl[eé]e|h[eé]micycle|d[eé]put[eé]|l[eé]gislativ|majorit[eé]|an1t/,
    },
    {
      motif: 'campagne',
      re: /candidat|campagne|pr[eé]sidentielle|2027|parti|meeting|sondage/,
    },
    { motif: 'urne', re: /vote|urne|scrutin|1er tour|premier tour|bulletin|citoyen/ },
  ];
  for (const r of rules) {
    if (r.re.test(t)) return r.motif;
  }
  return 'urne';
}

function loadScoop() {
  const renifleur = readJson(join(ROOT, 'src/data/renifleur/latest.json'), { items: [] });
  const alertes = readJson(join(ROOT, 'src/data/alertes-citoyennes.json'), {});
  const items = Array.isArray(renifleur.items) ? renifleur.items : [];

  // Prefer freshest renifleur titles (max 5) + active alerte lead
  const headlines = items
    .slice(0, 8)
    .map((it) => `${it.title || ''} ${it.summary || ''}`)
    .join('\n');

  const alerteBits = [
    alertes.lead,
    alertes.signal,
    ...(Array.isArray(alertes.items)
      ? alertes.items.slice(0, 4).map((p) => `${p.title || ''} ${p.fact || ''}`)
      : []),
  ]
    .filter(Boolean)
    .join('\n');

  // Motif : priorité **top scoop** renifleur (1 item), fallback alerte, sinon headlines
  const top = items[0] || null;
  const scoopTitle =
    (top && top.title) ||
    (Array.isArray(alertes.items) && alertes.items[0]?.title) ||
    'Scoop civique du jour';
  const topText = `${top?.title || ''} ${top?.summary || ''}`;
  let motif = pickMotif(topText);
  if (motif === 'urne' && alerteBits) motif = pickMotif(alerteBits);
  if (motif === 'urne' && headlines) motif = pickMotif(headlines);

  return {
    scoopTitle: String(scoopTitle).slice(0, 200),
    scoopSource: top?.source_label || top?.url || 'renifleur+alertes',
    scoopUrl: top?.url || null,
    motif,
    renifleurFetchedAt: renifleur.fetched_at || null,
    alertesUpdated: alertes.updated || null,
  };
}

function which(bin) {
  const r = spawnSync('which', [bin], { encoding: 'utf8' });
  return r.status === 0 ? r.stdout.trim() : null;
}

function run(cmd, argv, opts = {}) {
  console.log(`$ ${cmd} ${argv.join(' ')}`);
  if (DRY) return;
  execFileSync(cmd, argv, { stdio: 'inherit', ...opts });
}

function main() {
  const dayKey = parisDayKey();
  const scoop = loadScoop();
  const seed = daySeed(dayKey) ^ (scoop.motif.length * 997);
  const overridePath = join(PUBLIC, 'illustrations/2027/hero-daily-override.json');
  const prev = readJson(overridePath);

  const prevVideoRel = String(prev?.heroVideoFile || prev?.heroVideo || '')
    .replace(/^\//, '')
    .split(/[?#]/)[0];
  if (
    !FORCE &&
    prev?.dayKey === dayKey &&
    prev?.motif === scoop.motif &&
    prevVideoRel &&
    existsSync(join(PUBLIC, prevVideoRel))
  ) {
    console.log(`[hero-daily] already fresh for ${dayKey} motif=${scoop.motif} (use --force to regen)`);
    console.log(JSON.stringify({ dayKey, ...scoop, skipped: true }, null, 2));
    return;
  }

  const py = which('python3') || 'python3';
  const ffmpeg = which('ffmpeg') || 'ffmpeg';
  const cwebp = which('cwebp');

  const dailyDir = join(PUBLIC, 'videos/2027/daily');
  const illDir = join(PUBLIC, 'illustrations/2027');
  mkdirSync(dailyDir, { recursive: true });

  const sketchJpg = join(illDir, `hero-daily-${dayKey}.jpg`);
  const liveJpg = join(illDir, 'hero-daily-live.jpg');
  const liveWebp = join(illDir, 'hero-daily-live.webp');
  const dayMp4 = join(dailyDir, `hero-${dayKey}.mp4`);
  const liveMp4 = join(PUBLIC, 'videos/2027/hero-daily-live.mp4');

  const sketchScript = join(__dirname, 'hero-daily-sketch.py');

  console.log(`[hero-daily] day=${dayKey} motif=${scoop.motif} seed=${seed}`);
  console.log(`[hero-daily] scoop: ${scoop.scoopTitle.slice(0, 100)}…`);

  run(py, [
    sketchScript,
    '--motif',
    scoop.motif,
    '--seed',
    String(seed),
    '--out',
    sketchJpg,
  ]);

  if (!DRY) {
    copyFileSync(sketchJpg, liveJpg);
    if (cwebp) {
      run(cwebp, ['-q', '82', liveJpg, '-o', liveWebp]);
    } else {
      // ffmpeg webp fallback
      run(ffmpeg, ['-y', '-i', liveJpg, '-frames:v', '1', liveWebp]);
    }
  }

  // Ken Burns push-in 6s 1280x720
  run(ffmpeg, [
    '-y',
    '-loop',
    '1',
    '-i',
    sketchJpg,
    '-vf',
    [
      'scale=1600:900:force_original_aspect_ratio=increase',
      'crop=1600:900',
      "zoompan=z='min(1.0+0.02*on/150,1.12)':x='iw/2-(iw/zoom/2)+18*on/150':y='ih/2-(ih/zoom/2)':d=150:s=1280x720:fps=25",
      'format=yuv420p',
    ].join(','),
    '-t',
    '6',
    '-c:v',
    'libx264',
    '-pix_fmt',
    'yuv420p',
    '-profile:v',
    'high',
    '-crf',
    '20',
    '-movflags',
    '+faststart',
    dayMp4,
  ]);

  if (!DRY) {
    copyFileSync(dayMp4, liveMp4);
  }

  const override = {
    schema: 'lmdpt-hero-daily-override-v1',
    dayKey,
    timezone: TZ,
    generatedAt: new Date().toISOString(),
    forceDaily: true,
    motif: scoop.motif,
    scoop: {
      title: scoop.scoopTitle,
      source: scoop.scoopSource,
      url: scoop.scoopUrl,
      renifleurFetchedAt: scoop.renifleurFetchedAt,
      alertesUpdated: scoop.alertesUpdated,
    },
    // Fixed live paths — cache bust via ?d=dayKey in client
    heroVideo: `/videos/2027/hero-daily-live.mp4?d=${dayKey}`,
    heroVideoFile: '/videos/2027/hero-daily-live.mp4',
    heroPosterWebp: `/illustrations/2027/hero-daily-live.webp?d=${dayKey}`,
    heroPosterJpg: `/illustrations/2027/hero-daily-live.jpg?d=${dayKey}`,
    heroAlt:
      'Croquis encre noir et blanc du jour (sans texte) — illustration civique laïque liée au scoop du jour.',
    id: `scoop-${dayKey}-${scoop.motif}`,
    galleryVideo: {
      src: `/videos/2027/hero-daily-live.mp4?d=${dayKey}`,
      poster: `/illustrations/2027/hero-daily-live.webp?d=${dayKey}`,
      caption: 'Vidéo hero du jour — croquis N&B, mise à jour quotidienne.',
    },
    engine: 'local-cairo+ffmpeg',
    note: 'API Imagine video bloquée ZDR (upload_url) — pipeline local serveur.',
  };

  if (!DRY) {
    writeFileSync(overridePath, JSON.stringify(override, null, 2) + '\n');
  }

  console.log('[hero-daily] SHIP');
  console.log(JSON.stringify(override, null, 2));
}

main();
