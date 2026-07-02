#!/usr/bin/env node
/**
 * Active GitHub Discussions (si token admin) et affiche les IDs Giscus.
 *
 * Usage:
 *   GITHUB_TOKEN=ghp_… node scripts/setup-giscus.mjs
 *   GITHUB_TOKEN=ghp_… node scripts/setup-giscus.mjs --create-category
 *
 * Puis configurer dans GitHub Actions (Settings → Secrets):
 *   PUBLIC_GISCUS_REPO_ID
 *   PUBLIC_GISCUS_CATEGORY_ID
 */
const OWNER = 'ELServicesToulon';
const REPO = 'LMDPT';
const CATEGORY_NAME = 'Débats';

const token = process.env.GITHUB_TOKEN?.trim();
const createCategory = process.argv.includes('--create-category');

async function gh(path, options = {}) {
  const res = await fetch(`https://api.github.com${path}`, {
    ...options,
    headers: {
      Accept: 'application/vnd.github+json',
      'X-GitHub-Api-Version': '2022-11-28',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
  });
  const text = await res.text();
  let body;
  try {
    body = text ? JSON.parse(text) : {};
  } catch {
    body = { raw: text };
  }
  if (!res.ok) {
    throw new Error(`${res.status} ${path}: ${body.message ?? text}`);
  }
  return body;
}

async function graphql(query, variables = {}) {
  const res = await fetch('https://api.github.com/graphql', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query, variables }),
  });
  const json = await res.json();
  if (json.errors?.length) {
    throw new Error(json.errors.map((e) => e.message).join('; '));
  }
  return json.data;
}

async function main() {
  const repo = await gh(`/repos/${OWNER}/${REPO}`);
  console.log(`Repo: ${repo.full_name}`);
  console.log(`PUBLIC_GISCUS_REPO=${OWNER}/${REPO}`);
  console.log(`PUBLIC_GISCUS_REPO_ID=${repo.node_id}`);
  console.log(`has_discussions: ${repo.has_discussions}`);

  if (!token) {
    console.log('\nSans GITHUB_TOKEN : activez Discussions manuellement sur GitHub.');
    console.log('Puis créez la catégorie « Débats » et relancez avec un token admin.');
    console.log('Voir docs/GISCUS.md');
    return;
  }

  if (!repo.has_discussions) {
    console.log('\nActivation de GitHub Discussions…');
    await gh(`/repos/${OWNER}/${REPO}`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ has_discussions: true }),
    });
    console.log('Discussions activées.');
  }

  const data = await graphql(
    `query($owner: String!, $name: String!) {
      repository(owner: $owner, name: $name) {
        id
        discussionCategories(first: 20) {
          nodes { id name }
        }
      }
    }`,
    { owner: OWNER, name: REPO },
  );

  const categories = data.repository.discussionCategories.nodes;
  let debats = categories.find((c) => c.name === CATEGORY_NAME);

  if (!debats && createCategory) {
    console.log(`\nCréation catégorie « ${CATEGORY_NAME} »…`);
    const created = await graphql(
      `mutation($repoId: ID!) {
        createDiscussionCategory(input: {
          repositoryId: $repoId,
          name: "${CATEGORY_NAME}",
          description: "Débats civiques LMDPT — modération charte DOE",
          emoji: ":speech_balloon:"
        }) {
          discussionCategory { id name }
        }
      }`,
      { repoId: data.repository.id },
    );
    debats = created.createDiscussionCategory.discussionCategory;
    console.log('Catégorie créée.');
  }

  console.log('\nCatégories Discussions :');
  for (const c of categories) {
    console.log(`  - ${c.name}: ${c.id}`);
  }

  if (debats) {
    console.log('\n→ Secrets GitHub Actions à configurer :');
    console.log(`PUBLIC_GISCUS_REPO_ID=${repo.node_id}`);
    console.log(`PUBLIC_GISCUS_CATEGORY_ID=${debats.id}`);
    console.log('\nInstaller aussi l’app Giscus : https://github.com/apps/giscus');
  } else {
    console.log(`\nCatégorie « ${CATEGORY_NAME} » absente.`);
    console.log('Créez-la dans GitHub UI ou relancez avec --create-category');
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
