#!/usr/bin/env node
/**
 * CNAME lmdpt.iarbre.org → elservices toulon.github.io (GitHub Pages).
 * Jeton : IARBE_CLOUDFLARE_API_TOKEN ou résolution Bitwarden via mediconvoi/backend.
 *
 * Usage : npm run dns:iarbre
 * Dry-run : npm run dns:iarbre -- --dry-run
 */
import { spawnSync } from "node:child_process";
import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { loadWorkspaceEnv } from "../../mediconvoi/scripts/load-workspace-env.mjs";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, "..");
const dryRun = process.argv.includes("--dry-run");

const SUBDOMAIN = "lmdpt";
const FQDN = `${SUBDOMAIN}.iarbre.org`;
const GITHUB_PAGES_TARGET = "elservicestoulon.github.io";

function loadEnvFiles() {
  loadWorkspaceEnv({ cwd: REPO_ROOT, projectEnvPath: path.join(REPO_ROOT, ".env") });
}

async function resolveCloudflareToken() {
  const direct = (process.env.IARBE_CLOUDFLARE_API_TOKEN || process.env.CLOUDFLARE_API_TOKEN || "").trim();
  if (direct) return direct;

  const backendDir = path.resolve(REPO_ROOT, "..", "mediconvoi", "backend");
  const resolver = path.join(backendDir, "scripts", "resolve-iarbre-cloudflare-token.ts");
  if (!existsSync(resolver)) return null;

  const snippet = `
    import { resolveIarbreCloudflareToken } from './scripts/resolve-iarbre-cloudflare-token.ts';
    const r = await resolveIarbreCloudflareToken();
    if (r?.token) console.log(r.token);
  `;
  const res = spawnSync("npx", ["tsx", "-e", snippet], {
    cwd: backendDir,
    encoding: "utf8",
    shell: true,
    env: process.env,
  });
  const token = (res.stdout || "").trim().split(/\s+/).pop();
  return token && token.length > 20 ? token : null;
}

async function upsertCname(headers, zoneId) {
  const listRes = await fetch(
    `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records?name=${FQDN}`,
    { headers },
  );
  const records = (await listRes.json()).result ?? [];
  const body = {
    type: "CNAME",
    name: SUBDOMAIN,
    content: GITHUB_PAGES_TARGET,
    ttl: 1,
    // DNS only — recommandé GitHub Pages + certificat Let's Encrypt côté GitHub
    proxied: false,
  };

  const existing = records.find((r) => r.type === "CNAME");
  if (existing?.content === GITHUB_PAGES_TARGET && existing.proxied === false) {
    console.log(`  ✓ CNAME ${FQDN} → ${GITHUB_PAGES_TARGET} (DNS only) déjà OK`);
    return true;
  }

  if (dryRun) {
    console.log(`  [dry-run] ${existing ? "PATCH" : "POST"} CNAME ${FQDN} → ${GITHUB_PAGES_TARGET} (proxied: false)`);
    return true;
  }

  if (existing) {
    const patchRes = await fetch(
      `https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records/${existing.id}`,
      { method: "PATCH", headers, body: JSON.stringify(body) },
    );
    const patchData = await patchRes.json();
    if (!patchData.success) {
      console.error("  ❌ Échec PATCH:", patchData.errors);
      return false;
    }
    console.log(`  ✅ CNAME ${FQDN} → ${GITHUB_PAGES_TARGET} (mis à jour, DNS only)`);
    return true;
  }

  const createRes = await fetch(`https://api.cloudflare.com/client/v4/zones/${zoneId}/dns_records`, {
    method: "POST",
    headers,
    body: JSON.stringify(body),
  });
  const createData = await createRes.json();
  if (!createData.success) {
    console.error("  ❌ Échec création:", createData.errors);
    return false;
  }
  console.log(`  ✅ CNAME ${FQDN} → ${GITHUB_PAGES_TARGET} (créé, DNS only)`);
  return true;
}

async function main() {
  loadEnvFiles();
  console.log(`[DNS] ${FQDN} → ${GITHUB_PAGES_TARGET} (GitHub Pages)\n`);

  const token = await resolveCloudflareToken();
  if (!token) {
    console.error("❌ Jeton Cloudflare iarbre.org introuvable.");
    console.error("   Définir IARBE_CLOUDFLARE_API_TOKEN ou configurer Bitwarden (voir iarbre/docs/BITWARDEN-CLOUDFLARE-GCP.md).");
    console.error(`\n   Manuel : CNAME ${SUBDOMAIN} → ${GITHUB_PAGES_TARGET} (DNS only / nuage gris).`);
    process.exit(1);
  }

  const headers = { Authorization: `Bearer ${token}`, "Content-Type": "application/json" };
  const zoneRes = await fetch("https://api.cloudflare.com/client/v4/zones?name=iarbre.org", { headers });
  const zoneData = await zoneRes.json();
  const zoneId = zoneData.result?.[0]?.id;

  if (!zoneId) {
    console.error("❌ Zone iarbre.org introuvable (token sans droit DNS ?).");
    process.exit(1);
  }

  console.log("[DNS] Zone:", zoneId);
  const ok = await upsertCname(headers, zoneId);
  process.exit(ok ? 0 : 1);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
