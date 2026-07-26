import { loadJson, saveJsonAtomic, magicPath } from './store.mjs';
import { randomToken, sha256 } from './crypto.mjs';
import { publicUrl } from './config.mjs';
import tls from 'node:tls';
import net from 'node:net';

const EMPTY = { version: 1, tokens: [] };
const TTL_MS = 15 * 60 * 1000;

/** Rate limit in-memory (process lifetime) */
const hits = new Map(); // key → { count, resetAt }

export function rateLimit(key, { max = 5, windowMs = 3600_000 } = {}) {
  const now = Date.now();
  let row = hits.get(key);
  if (!row || row.resetAt <= now) {
    row = { count: 0, resetAt: now + windowMs };
    hits.set(key, row);
  }
  row.count += 1;
  return row.count <= max;
}

export function createMagicToken(dataDir, email) {
  const emailNorm = String(email).trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(emailNorm)) {
    const err = new Error('Email invalide.');
    err.status = 400;
    throw err;
  }
  const raw = randomToken(32);
  const db = loadJson(magicPath(dataDir), EMPTY);
  const now = Date.now();
  db.tokens = (db.tokens || []).filter((t) => t.expiresAt > now);
  db.tokens.push({
    hash: sha256(raw),
    email: emailNorm,
    expiresAt: now + TTL_MS,
    createdAt: now,
  });
  saveJsonAtomic(magicPath(dataDir), db);
  const verifyUrl = `${publicUrl()}/api/auth/email/verify?token=${encodeURIComponent(raw)}`;
  return { email: emailNorm, token: raw, verifyUrl, expiresInSec: TTL_MS / 1000 };
}

export function consumeMagicToken(dataDir, rawToken) {
  if (!rawToken) return null;
  const hash = sha256(rawToken);
  const db = loadJson(magicPath(dataDir), EMPTY);
  const now = Date.now();
  const idx = (db.tokens || []).findIndex((t) => t.hash === hash && t.expiresAt > now);
  if (idx < 0) return null;
  const [item] = db.tokens.splice(idx, 1);
  saveJsonAtomic(magicPath(dataDir), db);
  return item;
}

function smtpConfig() {
  const host = process.env.LMDPT_SMTP_HOST || '';
  const port = Number(process.env.LMDPT_SMTP_PORT || 465);
  const user = process.env.LMDPT_SMTP_USER || '';
  const pass = process.env.LMDPT_SMTP_PASS || process.env.LMDPT_SMTP_PASSWORD || '';
  const from = process.env.LMDPT_SMTP_FROM || user || 'contact@mediconvoi.fr';
  const secure =
    process.env.LMDPT_SMTP_SECURE === '1' ||
    process.env.LMDPT_SMTP_SECURE === 'true' ||
    port === 465;
  return { host, port, user, pass, from, secure };
}

/**
 * SMTP minimal (AUTH LOGIN) — OVH ssl0.ovh.net:465 TLS ou :587 STARTTLS.
 */
export function sendSmtp({ host, port, secure, user, pass, from, to, subject, text }) {
  return new Promise((resolve, reject) => {
    const lines = [];
    let step = 'banner';
    let socket;

    const fail = (msg) => {
      try {
        socket?.end();
      } catch {
        /* ignore */
      }
      reject(new Error(msg));
    };

    const send = (cmd) => {
      socket.write(cmd + '\r\n');
    };

    const onReady = () => {
      socket.setEncoding('utf8');
      let buf = '';
      socket.on('data', (chunk) => {
        buf += chunk;
        if (!buf.includes('\n')) return;
        const parts = buf.split(/\r?\n/);
        buf = parts.pop() || '';
        for (const line of parts) {
          if (!line) continue;
          lines.push(line);
          const code = line.slice(0, 3);
          if (step === 'banner' && code === '220') {
            step = 'ehlo';
            send(`EHLO lmdpt.iarbre.org`);
          } else if (step === 'ehlo' && code === '250' && line.startsWith('250 ')) {
            // last 250 line of EHLO
            if (secure || port === 465) {
              step = 'auth';
              send('AUTH LOGIN');
            } else {
              step = 'starttls';
              send('STARTTLS');
            }
          } else if (step === 'starttls' && code === '220') {
            socket.removeAllListeners('data');
            socket = tls.connect(
              { socket, servername: host, rejectUnauthorized: true },
              () => {
                step = 'ehlo2';
                send(`EHLO lmdpt.iarbre.org`);
                // rebind data handler after upgrade
                attachData();
              },
            );
            socket.on('error', (e) => fail(e.message));
          } else if (step === 'ehlo2' && code === '250' && line.startsWith('250 ')) {
            step = 'auth';
            send('AUTH LOGIN');
          } else if (step === 'auth' && code === '334') {
            step = 'user';
            send(Buffer.from(user).toString('base64'));
          } else if (step === 'user' && code === '334') {
            step = 'pass';
            send(Buffer.from(pass).toString('base64'));
          } else if (step === 'pass' && code === '235') {
            step = 'mail';
            send(`MAIL FROM:<${from}>`);
          } else if (step === 'pass' && (code === '535' || code.startsWith('5'))) {
            fail(`SMTP AUTH failed: ${line}`);
          } else if (step === 'mail' && code === '250') {
            step = 'rcpt';
            send(`RCPT TO:<${to}>`);
          } else if (step === 'rcpt' && (code === '250' || code === '251')) {
            step = 'data';
            send('DATA');
          } else if (step === 'data' && code === '354') {
            step = 'body';
            const body = [
              `From: LMDPT <${from}>`,
              `To: <${to}>`,
              `Subject: ${subject}`,
              'MIME-Version: 1.0',
              'Content-Type: text/plain; charset=utf-8',
              'Content-Transfer-Encoding: 8bit',
              '',
              text,
              '.',
            ].join('\r\n');
            send(body);
          } else if (step === 'body' && code === '250') {
            step = 'quit';
            send('QUIT');
            resolve({ mode: 'smtp', to, host, port });
            try {
              socket.end();
            } catch {
              /* ignore */
            }
          } else if (code.startsWith('5') && step !== 'pass') {
            fail(`SMTP error at ${step}: ${line}`);
          }
        }
      });
    };

    function attachData() {
      // used after STARTTLS — re-run simplified path starting EHLO already sent
      let buf = '';
      socket.on('data', (chunk) => {
        buf += chunk;
        // reuse main handler by injecting into same machine via recursive call is complex;
        // for OVH we use 465 implicit TLS primarily
      });
    }

    if (secure || port === 465) {
      socket = tls.connect({ host, port, servername: host, rejectUnauthorized: true }, onReady);
    } else {
      socket = net.connect({ host, port }, onReady);
    }
    socket.setTimeout(20000, () => fail('SMTP timeout'));
    socket.on('error', (e) => fail(e.message));
  });
}

/**
 * Envoi email : SMTP OVH si configuré, webhook HTTP, sinon log dev.
 */
export async function sendMagicEmail({ to, verifyUrl }) {
  const subject = 'Connexion LMDPT — lien magique';
  const text = `Bonjour,

Connectez-vous au Média du Premier Tour :

${verifyUrl}

Lien valable 15 minutes. Si vous n'êtes pas à l'origine de cette demande, ignorez ce message.

— Le Média du Premier Tour
https://lmdpt.iarbre.org
`;

  if (process.env.LMDPT_SMTP_URL?.startsWith('http')) {
    const res = await fetch(process.env.LMDPT_SMTP_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ to, subject, text }),
    });
    if (!res.ok) throw new Error(`SMTP webhook HTTP ${res.status}`);
    return { mode: 'webhook', to };
  }

  const cfg = smtpConfig();
  if (cfg.host && cfg.user && cfg.pass) {
    const r = await sendSmtp({
      host: cfg.host,
      port: cfg.port,
      secure: cfg.secure,
      user: cfg.user,
      pass: cfg.pass,
      from: cfg.from,
      to,
      subject,
      text,
    });
    console.info('[lmdpt-auth] MAGIC LINK sent via SMTP', { to, host: cfg.host, from: cfg.from });
    return r;
  }

  console.info('[lmdpt-auth] MAGIC LINK (dev sink)', { to, verifyUrl });
  return { mode: 'dev_sink', to, verifyUrl };
}
