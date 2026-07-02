#!/usr/bin/env node
/**
 * Statut CI GitHub Actions (API publique, sans gh auth).
 * Usage: npm run ci:status
 */
const repo = process.env.GITHUB_REPOSITORY || 'ELServicesToulon/LMDPT';
const url = `https://api.github.com/repos/${repo}/actions/runs?per_page=5&branch=Main`;

const res = await fetch(url, {
  headers: { Accept: 'application/vnd.github+json', 'X-GitHub-Api-Version': '2022-11-28' },
});
if (!res.ok) {
  console.error(`GitHub API HTTP ${res.status}`);
  process.exit(1);
}

const data = await res.json();
const runs = data.workflow_runs ?? [];
if (runs.length === 0) {
  console.log('Aucun run CI trouvé.');
  process.exit(0);
}

for (const run of runs) {
  const sha = run.head_sha?.slice(0, 7) ?? '?';
  const icon = run.conclusion === 'success' ? '✓' : run.conclusion === 'failure' ? '✗' : '…';
  console.log(`${icon} ${run.conclusion ?? run.status}  ${sha}  ${run.html_url}`);
}

const latest = runs[0];
if (latest.conclusion === 'failure') process.exit(1);
