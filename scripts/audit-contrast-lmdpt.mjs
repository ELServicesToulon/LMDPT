import { chromium } from 'playwright';
import { writeFileSync } from 'node:fs';

const BASE = process.argv.find((a) => a.startsWith('--base='))?.slice(7) || 'https://lmdpt.iarbre.org';
const LIMIT = Number(process.argv.find((a) => a.startsWith('--limit='))?.slice(8) || 0);

function sRGBtoLin(c) { const v = c / 255; return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4); }
function relLuminance([r, g, b]) { return 0.2126 * sRGBtoLin(r) + 0.7152 * sRGBtoLin(g) + 0.0722 * sRGBtoLin(b); }
function contrastRatio(c1, c2) { const L1 = relLuminance(c1), L2 = relLuminance(c2); return (Math.max(L1, L2) + 0.05) / (Math.min(L1, L2) + 0.05); }
function parseRgb(str) {
  if (!str || str === 'transparent' || str === 'rgba(0, 0, 0, 0)') return null;
  const m = str.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
  if (!m) return null;
  if (m[4] !== undefined && Number(m[4]) < 0.5) return null;
  return [Number(m[1]), Number(m[2]), Number(m[3])];
}
async function fetchUrls() {
  const xml = await (await fetch(`${BASE.replace(/\/$/, '')}/sitemap.xml`)).text();
  const urls = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1]);
  return LIMIT > 0 ? urls.slice(0, LIMIT) : urls;
}
async function auditPage(page, url, scheme) {
  await page.emulateMedia({ colorScheme: scheme });
  await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(350);
  const samples = await page.evaluate(() => {
    const selectors = ['h1','h2','h3','p','a','li','button','label','.btn','nav a','footer a','th','td','.card-title','.card-desc','.hero-lead','.meta','.eyebrow'];
    const seen = new Set(); const out = [];
    function bgOf(el) {
      let n = el;
      for (let i = 0; i < 12 && n; i++) {
        const st = getComputedStyle(n);
        const bg = st.backgroundColor;
        if (bg && bg !== 'rgba(0, 0, 0, 0)' && bg !== 'transparent') {
          const m = bg.match(/rgba?\((\d+),\s*(\d+),\s*(\d+)(?:,\s*([\d.]+))?\)/);
          if (m && (m[4] === undefined || Number(m[4]) >= 0.85)) return bg;
        }
        n = n.parentElement;
      }
      return getComputedStyle(document.body).backgroundColor;
    }
    for (const sel of selectors) {
      let count = 0;
      for (const el of document.querySelectorAll(sel)) {
        if (count >= 8) break;
        const st = getComputedStyle(el);
        if (st.visibility === 'hidden' || st.display === 'none') continue;
        const rect = el.getBoundingClientRect();
        if (rect.width < 2 || rect.height < 2) continue;
        const text = (el.innerText || '').trim().replace(/\s+/g, ' ').slice(0, 80);
        if (!text) continue;
        const key = sel + text.slice(0, 30) + st.color + bgOf(el);
        if (seen.has(key)) continue;
        seen.add(key); count++;
        const fs = parseFloat(st.fontSize) || 16;
        const fw = parseInt(st.fontWeight, 10) || 400;
        out.push({ sel, text, color: st.color, bg: bgOf(el), large: fs >= 24 || (fs >= 18.66 && fw >= 700) });
      }
    }
    const root = getComputedStyle(document.documentElement);
    const vars = {};
    for (const v of ['--bg','--fg','--muted','--accent','--card','--delta-pos','--delta-neg','--on-accent']) vars[v] = root.getPropertyValue(v).trim();
    return { samples: out, vars };
  });
  const fails = [];
  for (const s of samples.samples) {
    const fg = parseRgb(s.color), bg = parseRgb(s.bg);
    if (!fg || !bg) continue;
    const ratio = contrastRatio(fg, bg);
    const need = s.large ? 3 : 4.5;
    if (ratio < need) fails.push({ ...s, ratio: Math.round(ratio * 100) / 100, need });
  }
  return { fails, vars: samples.vars, count: samples.samples.length };
}
async function main() {
  const urls = await fetchUrls();
  console.log('URLs', urls.length);
  const browser = await chromium.launch({ headless: true, executablePath: process.env.CHROMIUM_PATH || undefined, args: ['--no-sandbox','--disable-dev-shm-usage'] });
  const report = { pages: [], summary: {} };
  for (const scheme of ['light', 'dark']) {
    console.log('\n===', scheme, '===');
    for (const url of urls) {
      const page = await browser.newPage({ viewport: { width: 1280, height: 900 }, colorScheme: scheme });
      try {
        const r = await auditPage(page, url, scheme);
        const path = url.replace(BASE, '') || '/';
        console.log(`${scheme} ${path.padEnd(48)} fails=${r.fails.length}`);
        if (r.fails.length) for (const f of r.fails.slice(0, 4)) console.log(`  FAIL ${f.ratio}:1 [${f.sel}] "${f.text.slice(0,45)}" fg=${f.color} bg=${f.bg}`);
        report.pages.push({ url, scheme, fails: r.fails, vars: r.vars });
      } catch (e) {
        console.log('ERR', scheme, url, e.message);
        report.pages.push({ url, scheme, fails: [], error: e.message });
      } finally { await page.close(); }
    }
  }
  await browser.close();
  report.summary = {
    failPagesLight: report.pages.filter((p) => p.scheme === 'light' && p.fails.length).length,
    failPagesDark: report.pages.filter((p) => p.scheme === 'dark' && p.fails.length).length,
    totalFails: report.pages.reduce((n, p) => n + p.fails.length, 0),
    darkVars: report.pages.find((p) => p.scheme === 'dark' && p.vars)?.vars,
  };
  writeFileSync('scripts/audit-contrast-lmdpt-report.json', JSON.stringify(report, null, 2));
  console.log('\nSUMMARY', JSON.stringify(report.summary, null, 2));
  process.exit(report.summary.totalFails > 0 ? 1 : 0);
}
main().catch((e) => { console.error(e); process.exit(2); });
