#!/usr/bin/env node
/**
 * LMDPT — API commentaires citoyens
 * - Prévisualisation IA : reformulation FR + teinte politique (idées 1er tour)
 * - Publication après validation du posteur
 * - Hiérarchie modo : lecteur < contributeur < modo < modo-senior < redaction
 *
 * Port défaut : 8796 (127.0.0.1)
 * Stockage : ./data/comments.json + ./data/moderators.json
 */
import { createServer } from 'node:http';
import { readFileSync, writeFileSync, existsSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createHash, randomUUID } from 'node:crypto';

const __dirname = dirname(fileURLToPath(import.meta.url));
const DATA_DIR = process.env.LMDPT_COMMENTS_DATA || join(__dirname, 'data');
const PORT = Number(process.env.LMDPT_COMMENTS_PORT || 8796);
const HOST = process.env.LMDPT_COMMENTS_HOST || '127.0.0.1';
const OLLAMA = (process.env.OLLAMA_HOST || 'http://127.0.0.1:11434').replace(/\/$/, '');
const OLLAMA_MODEL = process.env.LMDPT_COMMENTS_MODEL || 'gemma2:27b';

const ROLE_LEVEL = {
  lecteur: 0,
  contributeur: 1,
  modo: 2,
  'modo-senior': 3,
  redaction: 4,
};

const HUES = [
  { slug: 'melenchon', label: 'Mélenchon / LFI', color: '#cc2443', themes: ['insoumis', 'lfi', 'retraite 60', 'smic', 'planification', 'sixième république'] },
  { slug: 'ruffin', label: 'Ruffin', color: '#c0392b', themes: ['ruffin', 'ouvrier', 'picardie'] },
  { slug: 'parti-socialiste', label: 'Socialiste / social-démocrate', color: '#ff8080', themes: ['socialiste', 'ps', 'égalité', 'service public', 'glucksmann', 'hollande'] },
  { slug: 'glucksmann', label: 'Glucksmann / Place publique', color: '#e85d75', themes: ['glucksmann', 'place publique', 'europe sociale'] },
  { slug: 'roussel', label: 'Roussel / PCF', color: '#dd0000', themes: ['communiste', 'pcf', 'roussel', 'nucléaire'] },
  { slug: 'ecolo', label: 'Écologiste', color: '#00c000', themes: ['écologie', 'climat', 'biodiversité', 'transition'] },
  { slug: 'attal', label: 'Attal / Renaissance', color: '#ffeb00', themes: ['attal', 'renaissance', 'école', 'autorité'] },
  { slug: 'philippe', label: 'Philippe / Horizons', color: '#0001b8', themes: ['philippe', 'horizons', 'centre'] },
  { slug: 'barrot', label: 'Barrot / centre', color: '#ff9900', themes: ['barrot', 'modem', 'démocrates', 'europe'] },
  {
    slug: 'retailleau',
    label: 'Retailleau / LR',
    color: '#0066cc',
    themes: [
      'retailleau',
      'républicains',
      'lr',
      'sécurité',
      'immigration',
      'prison',
      'détenu',
      'détention',
      'emprisonnement',
      'peine',
      'justice pénale',
    ],
  },
  { slug: 'lisnard', label: 'Lisnard', color: '#162561', themes: ['lisnard', 'maire', 'collectivités'] },
  { slug: 'le-pen', label: 'Le Pen / RN', color: '#0d378a', themes: ['le pen', 'rn', 'priorité nationale', 'référendum', 'frontières'] },
  { slug: 'bardella', label: 'Bardella / RN', color: '#0d378a', themes: ['bardella', 'rn', 'jeunesse'] },
  { slug: 'pluraliste', label: 'Pluraliste / transversal 1er tour', color: '#5a6570', themes: ['premier tour', 'pluralité', 'démocratie', 'proportionnelle', 'représentation'] },
];

const previews = new Map(); // token → preview payload (TTL in-memory)

function ensureData() {
  mkdirSync(DATA_DIR, { recursive: true });
  const commentsPath = join(DATA_DIR, 'comments.json');
  const modsPath = join(DATA_DIR, 'moderators.json');
  if (!existsSync(commentsPath)) {
    writeFileSync(commentsPath, JSON.stringify({ version: 1, comments: [] }, null, 2));
  }
  if (!existsSync(modsPath)) {
    // Tokens en clair uniquement en local data (hors git) — à remplacer en prod
    const seed = {
      version: 1,
      accounts: [
        { id: 'redaction-1', display: 'Rédaction LMDPT', role: 'redaction', token: 'lmdpt-redaction-change-me' },
        { id: 'modo-senior-1', display: 'Modo senior', role: 'modo-senior', token: 'lmdpt-modo-senior-change-me' },
        { id: 'modo-1', display: 'Modérateur', role: 'modo', token: 'lmdpt-modo-change-me' },
      ],
      hierarchy: ['lecteur', 'contributeur', 'modo', 'modo-senior', 'redaction'],
      note: 'Le posteur anonyme agit en contributeur (niveau 1). Les modos gèrent file d’attente et masquage.',
    };
    writeFileSync(modsPath, JSON.stringify(seed, null, 2));
  }
}

function loadComments() {
  ensureData();
  return JSON.parse(readFileSync(join(DATA_DIR, 'comments.json'), 'utf8'));
}

function saveComments(db) {
  writeFileSync(join(DATA_DIR, 'comments.json'), JSON.stringify(db, null, 2));
}

function loadMods() {
  ensureData();
  return JSON.parse(readFileSync(join(DATA_DIR, 'moderators.json'), 'utf8'));
}

function findMod(token) {
  if (!token) return null;
  const mods = loadMods();
  return mods.accounts.find((a) => a.token === token) || null;
}

function json(res, status, body) {
  const payload = JSON.stringify(body);
  res.writeHead(status, {
    'Content-Type': 'application/json; charset=utf-8',
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Headers': 'Content-Type, X-Mod-Token, X-Author-Key',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Cache-Control': 'no-store',
  });
  res.end(payload);
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    const chunks = [];
    req.on('data', (c) => chunks.push(c));
    req.on('end', () => {
      try {
        const raw = Buffer.concat(chunks).toString('utf8');
        resolve(raw ? JSON.parse(raw) : {});
      } catch (e) {
        reject(e);
      }
    });
    req.on('error', reject);
  });
}

function classifyHeuristic(text) {
  const t = text
    .toLowerCase()
    .normalize('NFD')
    .replace(/\p{M}/gu, '');
  let best = { slug: 'pluraliste', score: 0, hit: '' };
  for (const h of HUES) {
    if (h.slug === 'pluraliste') continue;
    let score = 0;
    const hits = [];
    for (const theme of h.themes) {
      const th = theme
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
      if (t.includes(th)) {
        score += 2;
        hits.push(theme);
      }
    }
    if (score > best.score) best = { slug: h.slug, score, hit: hits.slice(0, 3).join(', ') };
  }
  if (best.score === 0) {
    return { slug: 'pluraliste', confidence: 0.35, rationale: 'Aucune proximité nette — teinte pluraliste (1er tour).' };
  }
  return {
    slug: best.slug,
    confidence: Math.min(0.85, 0.4 + best.score * 0.1),
    rationale: `Proximité lexicale : ${best.hit}`,
  };
}

/**
 * Reformulation locale FR (secours si Ollama off / timeout).
 * Corrige orthographe courante, liaisons, accords simples, ponctuation.
 * Ne change pas le sens ni n'ajoute d'opinion.
 */
function lightReformulate(text) {
  let s = String(text || '')
    .replace(/\r\n/g, '\n')
    .replace(/[ \t]+/g, ' ')
    .replace(/\n{3,}/g, '\n\n')
    .trim();
  if (!s) return s;

  // Apostrophes typographiques → '
  s = s.replace(/[’‘‛′]/g, "'");

  // Espaces autour ponctuation
  s = s.replace(/\s+([,;:!?…])/g, '$1');
  s = s.replace(/([,;:!?])(?=[^\s])/g, '$1 ');
  s = s.replace(/\s+\./g, '.');

  // Fusions / typos fréquentes (ordre long → court)
  const phraseFixes = [
    [/\bdenprison\b/gi, "d'emprisonnement"],
    [/\bde\s*nprison\b/gi, "d'emprisonnement"],
    [/\bplaces\s+denprison\b/gi, "places d'emprisonnement"],
    [/\bplaces\s+de\s+prison\b/gi, 'places de prison'],
    [/\bcout(s)?\s+de\s+d[eé]tention\b/gi, 'coût$1 de détention'],
    [/\bcouts?\s+de\s+sentence\b/gi, 'coûts de sentence'],
  ];
  for (const [re, rep] of phraseFixes) s = s.replace(re, rep);

  // Dictionnaire mot à mot (après normalisation espaces)
  const WORD_MAP = {
    // accents / orthographe
    a: 'à', // préposition (sauf exceptions traitées après)
    ca: 'ça',
    meme: 'même',
    memes: 'mêmes',
    etre: 'être',
    ete: 'été',
    tres: 'très',
    deja: 'déjà',
    des: 'des',
    ou: 'où', // souvent où interrogatif/relatif — conservateur, voir exceptions
    aussi: 'aussi',
    plutot: 'plutôt',
    apres: 'après',
    grace: 'grâce',
    voila: 'voilà',
    // justice / prison (cas utilisateur)
    detenus: 'détenus',
    detenu: 'détenu',
    detenues: 'détenues',
    detenue: 'détenue',
    detention: 'détention',
    denprison: "d'emprisonnement",
    emprisonement: 'emprisonnement',
    emprisonemment: 'emprisonnement',
    metier: 'métier',
    metiers: 'métiers',
    cout: 'coût',
    couts: 'coûts',
    nun: 'un',
    nune: 'une',
    dun: "d'un",
    dune: "d'une",
    pourrai: 'pourrais',
    // politique / général
    egalite: 'égalité',
    liberte: 'liberté',
    securite: 'sécurité',
    democratie: 'démocratie',
    republicain: 'républicain',
    republicaine: 'républicaine',
    election: 'élection',
    elections: 'élections',
    presidentielle: 'présidentielle',
    assemblee: 'assemblée',
  };

  s = s
    .split(/(\s+)/)
    .map((tok, i, arr) => {
      if (/^\s+$/.test(tok)) return tok;
      const punctLead = tok.match(/^([«"'(]*)/)?.[1] || '';
      const punctTrail = tok.match(/([»"'.,;:!?…)]*)$/)?.[1] || '';
      const core =
        punctTrail.length > 0
          ? tok.slice(punctLead.length, tok.length - punctTrail.length)
          : tok.slice(punctLead.length);
      if (!core) return tok;

      const lower = core
        .toLowerCase()
        .normalize('NFD')
        .replace(/\p{M}/gu, '');
      const isCap = /^[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]/.test(core);
      const isAllCap = core === core.toUpperCase() && /[A-ZÀÂÄÉÈÊËÏÎÔÙÛÜÇ]/.test(core) && core.length > 1;

      // "a" préposition vs verbe avoir (heuristique)
      if (lower === 'a') {
        // next non-space token
        let next = '';
        for (let j = i + 1; j < arr.length; j++) {
          if (!/^\s+$/.test(arr[j])) {
            next = arr[j].toLowerCase().replace(/[^a-zàâäéèêëïîôùûüç']/gi, '');
            break;
          }
        }
        const verbLike =
          /^(eu|ete|été|fait|dit|pu|su|voulu|du|dû|pris|mis|vu|été|ete|été)$/i.test(next);
        if (verbLike) return punctLead + (isCap ? 'A' : 'a') + punctTrail;
        // défaut préposition (très fréquent en commentaire citoyen)
        return punctLead + (isCap ? 'À' : 'à') + punctTrail;
      }

      let fixed = WORD_MAP[lower];
      if (fixed) {
        if (isAllCap) fixed = fixed.toUpperCase();
        else if (isCap) fixed = fixed.charAt(0).toUpperCase() + fixed.slice(1);
        return punctLead + fixed + punctTrail;
      }
      return tok;
    })
    .join('');

  // Accords sujets pluriels (ils/elles/les X) + verbe 3e sing → pluriel courant
  s = s.replace(
    /\b(Ils|Elles|les détenus|Les détenus|les citoyens|Les citoyens)\s+([a-zàâäéèêëïîôùûüç']+)\b/gi,
    (m, subj, verb) => {
      const v = verb.toLowerCase();
      const plural = {
        rembourse: 'remboursent',
        apprend: 'apprennent',
        participe: 'participent',
        construit: 'construisent',
        travaille: 'travaillent',
        doit: 'doivent',
        peut: 'peuvent',
        veut: 'veulent',
        fait: 'font',
        paie: 'paient',
        paye: 'payent',
      };
      if (plural[v]) {
        const rep = plural[v];
        const out = verb[0] === verb[0].toUpperCase() ? rep.charAt(0).toUpperCase() + rep.slice(1) : rep;
        return `${subj} ${out}`;
      }
      return m;
    },
  );

  // "Ils ... et rembourse" (verbe après et)
  s = s.replace(
    /\b(Ils|Elles)\b([^.!?]{0,80}?)\bet\s+(rembourse|apprend|participe|travaille|paie|paye)\b/gi,
    (m, subj, mid, verb) => {
      const map = {
        rembourse: 'remboursent',
        apprend: 'apprennent',
        participe: 'participent',
        travaille: 'travaillent',
        paie: 'paient',
        paye: 'payent',
      };
      const v = verb.toLowerCase();
      return `${subj}${mid}et ${map[v] || verb}`;
    },
  );

  // "leurs cout" déjà mappé ; "leur cout" → leurs coûts si pluriel context
  s = s.replace(/\bleur coût\b/gi, 'leurs coûts');
  s = s.replace(/\bleurs coût\b/gi, 'leurs coûts');

  // Capitalisation début de chaque phrase
  s = s
    .split(/([.!?…]\s+)/)
    .map((part, idx) => {
      if (!part || /^[.!?…]\s+$/.test(part)) return part;
      const t = part.trimStart();
      if (!t) return part;
      const lead = part.slice(0, part.length - t.length);
      return lead + t.charAt(0).toUpperCase() + t.slice(1);
    })
    .join('');

  // Première lettre
  s = s.charAt(0).toUpperCase() + s.slice(1);

  // Point final
  if (!/[.!?…]$/.test(s)) s += '.';

  // Espaces doubles
  s = s.replace(/\s{2,}/g, ' ').replace(/\s+([.!?…,;:])/g, '$1');

  return s.trim();
}

async function ollamaPreview(raw) {
  const hueList = HUES.map((h) => `${h.slug}|${h.label}`).join('\n');
  const prompt = `Tu es l'assistant éditorial neutre du Média du Premier Tour (LMDPT).
Tâche:
1) Reformule le message citoyen en français correct, clair, respectueux, sans ajouter d'opinion.
2) Attribue UNE teinte d'idées parmi la liste (slug) correspondant aux idées des candidats/listes du 1er tour — ce n'est PAS une étiquette d'appartenance partisane de l'auteur.
3) Justifie en une phrase neutre.

Slugs autorisés:
${hueList}

Message:
"""
${raw.slice(0, 2000)}
"""

Réponds UNIQUEMENT en JSON valide:
{"reformulated":"...","slug":"...","confidence":0.0,"rationale":"..."}`;

  const timeoutMs = Number(process.env.LMDPT_COMMENTS_OLLAMA_TIMEOUT_MS || 45000);
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), timeoutMs);
  try {
    const res = await fetch(`${OLLAMA}/api/generate`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        model: OLLAMA_MODEL,
        prompt,
        stream: false,
        format: 'json',
        options: { temperature: 0.15, num_predict: 350 },
      }),
      signal: ctrl.signal,
    });
    if (!res.ok) throw new Error(`ollama ${res.status}`);
    const data = await res.json();
    const text = String(data.response || '');
    const m = text.match(/\{[\s\S]*\}/);
    if (!m) throw new Error('no json');
    const parsed = JSON.parse(m[0]);
    const slug = HUES.some((h) => h.slug === parsed.slug) ? parsed.slug : 'pluraliste';
    const reformulated = String(parsed.reformulated || '').trim();
    // Si le modèle renvoie l'original inchangé, appliquer quand même le correcteur local
    const finalText =
      reformulated && reformulated.toLowerCase() !== raw.trim().toLowerCase()
        ? reformulated
        : lightReformulate(raw);
    return {
      reformulated: finalText.slice(0, 4000),
      slug,
      confidence: Math.max(0, Math.min(1, Number(parsed.confidence) || 0.5)),
      rationale: String(parsed.rationale || '').slice(0, 500),
      engine: `ollama:${OLLAMA_MODEL}`,
    };
  } finally {
    clearTimeout(timer);
  }
}

async function buildPreview(raw) {
  const clean = String(raw || '').trim().slice(0, 4000);
  if (clean.length < 8) {
    const err = new Error('Message trop court (8 caractères min).');
    err.status = 400;
    throw err;
  }
  // garde-fous basiques
  if (/(https?:\/\/|www\.)/i.test(clean) && clean.split(/\s+/).length < 5) {
    const err = new Error('Lien seul refusé — développez votre idée en quelques mots.');
    err.status = 400;
    throw err;
  }

  let result;
  const heuristicOnly = process.env.LMDPT_COMMENTS_HEURISTIC_ONLY === '1';
  const preferHeuristic = process.env.LMDPT_COMMENTS_PREFER_HEURISTIC === '1';
  try {
    if (heuristicOnly || preferHeuristic) throw new Error('heuristic-only');
    result = await ollamaPreview(clean);
    // Si Ollama n'a presque rien changé, enrichir avec le correcteur local
    if (
      result.reformulated &&
      result.reformulated.replace(/\s+/g, ' ').trim().toLowerCase() ===
        clean.replace(/\s+/g, ' ').trim().toLowerCase()
    ) {
      result.reformulated = lightReformulate(clean);
      result.engine = `${result.engine}+local-fix`;
    }
  } catch (e) {
    const h = classifyHeuristic(clean);
    const reformulated = lightReformulate(clean);
    const changed =
      reformulated.replace(/\s+/g, ' ').trim().toLowerCase() !==
      clean.replace(/\s+/g, ' ').trim().toLowerCase();
    result = {
      reformulated,
      slug: h.slug,
      confidence: changed ? Math.max(h.confidence, 0.55) : h.confidence,
      rationale:
        h.rationale +
        (e?.message === 'heuristic-only'
          ? ' (correcteur local — mode secours).'
          : ` (correcteur local — Ollama indisponible: ${String(e?.message || e).slice(0, 80)}).`),
      engine: 'heuristic-fr',
    };
  }
  const hue = HUES.find((x) => x.slug === result.slug) || HUES[HUES.length - 1];
  const token = randomUUID();
  const payload = {
    token,
    raw: clean,
    reformulated: result.reformulated,
    candidateSlug: hue.slug,
    candidateLabel: hue.label,
    color: hue.color,
    confidence: result.confidence,
    rationale: result.rationale,
    engine: result.engine,
    createdAt: new Date().toISOString(),
    expiresAt: Date.now() + 30 * 60 * 1000,
  };
  previews.set(token, payload);
  return payload;
}

function authorKey(req, body) {
  return (
    req.headers['x-author-key'] ||
    body.authorKey ||
    createHash('sha256').update(req.headers['user-agent'] || 'anon').digest('hex').slice(0, 16)
  );
}

const server = createServer(async (req, res) => {
  if (req.method === 'OPTIONS') {
    return json(res, 204, {});
  }

  const url = new URL(req.url || '/', `http://${HOST}:${PORT}`);
  const path = url.pathname.replace(/\/+$/, '') || '/';

  try {
    if (req.method === 'GET' && (path === '/health' || path === '/api/comments/health')) {
      return json(res, 200, { ok: true, service: 'lmdpt-comments', ollama: OLLAMA_MODEL });
    }

    if (req.method === 'GET' && path === '/api/comments/hues') {
      return json(res, 200, {
        hues: HUES.map(({ slug, label, color }) => ({ slug, label, color })),
        disclaimer:
          'La couleur indique une proximité d’idées avec des candidats/listes du 1er tour — pas une appartenance partisane du contributeur.',
      });
    }

    if (req.method === 'GET' && path.startsWith('/api/comments/thread/')) {
      const threadId = decodeURIComponent(path.replace('/api/comments/thread/', ''));
      const db = loadComments();
      const list = db.comments
        .filter((c) => c.threadId === threadId && c.status === 'published')
        .sort((a, b) => new Date(a.publishedAt || a.createdAt) - new Date(b.publishedAt || b.createdAt));
      return json(res, 200, { threadId, comments: list });
    }

    if (req.method === 'POST' && path === '/api/comments/preview') {
      const body = await readBody(req);
      const preview = await buildPreview(body.raw || body.text || '');
      return json(res, 200, {
        previewToken: preview.token,
        raw: preview.raw,
        reformulated: preview.reformulated,
        politicalHue: {
          slug: preview.candidateSlug,
          label: preview.candidateLabel,
          color: preview.color,
          confidence: preview.confidence,
          rationale: preview.rationale,
        },
        engine: preview.engine,
        disclaimer:
          'Teinte d’idées 1er tour (IA). Vous devez valider la reformulation avant publication. LMDPT reste neutre (Democracy Over Elimination).',
      });
    }

    if (req.method === 'POST' && path === '/api/comments/publish') {
      const body = await readBody(req);
      const token = body.previewToken;
      const preview = previews.get(token);
      if (!preview || preview.expiresAt < Date.now()) {
        return json(res, 400, { error: 'Prévisualisation expirée — relancez l’analyse IA.' });
      }
      if (!body.accepted) {
        previews.delete(token);
        return json(res, 200, { cancelled: true });
      }
      // posteur doit confirmer le texte reformulé
      const finalText = String(body.reformulated || preview.reformulated).trim().slice(0, 4000);
      if (finalText.length < 8) return json(res, 400, { error: 'Texte final trop court.' });

      const threadId = String(body.threadId || 'general').slice(0, 200);
      const displayName = String(body.displayName || 'Citoyen·ne').slice(0, 40);
      const key = authorKey(req, body);

      const comment = {
        id: randomUUID(),
        threadId,
        displayName,
        authorKeyHash: createHash('sha256').update(key).digest('hex').slice(0, 24),
        raw: preview.raw,
        body: finalText,
        politicalHue: {
          slug: preview.candidateSlug,
          label: preview.candidateLabel,
          color: preview.color,
          confidence: preview.confidence,
          rationale: preview.rationale,
        },
        engine: preview.engine,
        status: 'pending', // file modo sauf auto si redaction
        createdAt: new Date().toISOString(),
        publishedAt: null,
        moderation: { history: [] },
      };

      // contributeurs : pending ; si token modo+ avec auto-publish option
      const mod = findMod(req.headers['x-mod-token'] || body.modToken);
      if (mod && ROLE_LEVEL[mod.role] >= ROLE_LEVEL.modo && body.forcePublish) {
        comment.status = 'published';
        comment.publishedAt = new Date().toISOString();
        comment.moderation.history.push({ at: comment.publishedAt, by: mod.id, action: 'force-publish' });
      }

      const db = loadComments();
      db.comments.push(comment);
      saveComments(db);
      previews.delete(token);

      return json(res, 201, {
        id: comment.id,
        status: comment.status,
        message:
          comment.status === 'published'
            ? 'Commentaire publié.'
            : 'Commentaire enregistré — en attente de validation par la modération.',
        comment: comment.status === 'published' ? publicComment(comment) : { id: comment.id, status: comment.status },
      });
    }

    // --- Moderation ---
    if (req.method === 'GET' && path === '/api/comments/mod/queue') {
      const mod = findMod(req.headers['x-mod-token']);
      if (!mod || ROLE_LEVEL[mod.role] < ROLE_LEVEL.modo) return json(res, 403, { error: 'Modo requis' });
      const db = loadComments();
      const queue = db.comments.filter((c) => c.status === 'pending');
      return json(res, 200, { role: mod.role, queue });
    }

    if (req.method === 'GET' && path === '/api/comments/mod/hierarchy') {
      return json(res, 200, {
        hierarchy: [
          { role: 'lecteur', level: 0, rights: 'Lecture seule' },
          { role: 'contributeur', level: 1, description: 'Poste après validation IA + file modo' },
          { role: 'modo', level: 2, description: 'Approuve / masque les commentaires' },
          { role: 'modo-senior', level: 3, description: 'Peut réassigner la teinte politique' },
          { role: 'redaction', level: 4, description: 'Supervision éditoriale complète' },
        ],
      });
    }

    if (req.method === 'POST' && path === '/api/comments/mod/action') {
      const mod = findMod(req.headers['x-mod-token']);
      if (!mod || ROLE_LEVEL[mod.role] < ROLE_LEVEL.modo) return json(res, 403, { error: 'Modo requis' });
      const body = await readBody(req);
      const { commentId, action, slug } = body;
      const db = loadComments();
      const c = db.comments.find((x) => x.id === commentId);
      if (!c) return json(res, 404, { error: 'Commentaire introuvable' });

      const at = new Date().toISOString();
      if (action === 'approve') {
        c.status = 'published';
        c.publishedAt = at;
      } else if (action === 'reject' || action === 'hide') {
        c.status = 'hidden';
      } else if (action === 'recolor' && ROLE_LEVEL[mod.role] >= ROLE_LEVEL['modo-senior']) {
        const hue = HUES.find((h) => h.slug === slug);
        if (!hue) return json(res, 400, { error: 'slug teinte inconnu' });
        c.politicalHue = {
          slug: hue.slug,
          label: hue.label,
          color: hue.color,
          confidence: c.politicalHue?.confidence ?? 0.5,
          rationale: `Réassigné par ${mod.role}`,
        };
      } else {
        return json(res, 400, { error: 'action invalide ou droits insuffisants' });
      }
      c.moderation.history.push({ at, by: mod.id, role: mod.role, action, slug: slug || null });
      saveComments(db);
      return json(res, 200, { ok: true, comment: c });
    }

    return json(res, 404, { error: 'not found' });
  } catch (e) {
    const status = e.status || 500;
    return json(res, status, { error: e.message || 'error' });
  }
});

function publicComment(c) {
  return {
    id: c.id,
    displayName: c.displayName,
    body: c.body,
    politicalHue: c.politicalHue,
    publishedAt: c.publishedAt,
    createdAt: c.createdAt,
  };
}

ensureData();
server.listen(PORT, HOST, () => {
  console.log(`lmdpt-comments listening on http://${HOST}:${PORT}`);
  console.log(`data: ${DATA_DIR}`);
});
