#!/usr/bin/env node
/**
 * Active GitHub Discussions (si token admin), crée catégorie + fils débats, affiche IDs Giscus.
 *
 * Usage:
 *   npm run giscus:setup
 *   GITHUB_TOKEN=ghp_… npm run giscus:setup -- --create-category
 *   GITHUB_TOKEN=ghp_… npm run giscus:setup -- --create-category --create-discussions
 *   GITHUB_TOKEN=ghp_… npm run giscus:setup -- --write-env ../../Mediconvoi/backend/.env
 */
import { readFileSync, readdirSync, appendFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const HERE = dirname(fileURLToPath(import.meta.url));
const ROOT = join(HERE, '..');
const DEBATES_DIR = join(ROOT, 'src/data/debates');

const OWNER = 'ELServicesToulon';
const REPO = 'LMDPT';
const CATEGORY_NAME = 'Débats';
/** node_id public GitHub — cf. docs/GISCUS.md */
const KNOWN_REPO_NODE_ID = 'R_kgDOTGlsIg';

const token = process.env.GITHUB_TOKEN?.trim();
const createCategory = process.argv.includes('--create-category');
const createDiscussions = process.argv.includes('--create-discussions');
const writeEnvIdx = process.argv.indexOf('--write-env');
const writeEnvPath = writeEnvIdx >= 0 ? process.argv[writeEnvIdx + 1] : null;

const PLACEHOLDER_TOKENS = new Set([
  'ghp_VOTRE_TOKEN',
  'ghp_xxx',
  'ghp_…',
  'your_token_here',
  'REPLACE_ME',
]);

function assertValidToken() {
  if (!token) return;
  if (PLACEHOLDER_TOKENS.has(token) || /VOTRE|REPLACE|xxx|\.\.\./i.test(token)) {
    console.error(
      'GITHUB_TOKEN invalide : vous avez collé le placeholder de la doc, pas un vrai token.\n' +
        'Créez un PAT : https://github.com/settings/tokens → scope « repo » (classic) ou accès admin au repo LMDPT.\n' +
        'Puis : GITHUB_TOKEN=ghp_… npm run giscus:setup -- --create-category --create-discussions --write-env …',
    );
    process.exit(1);
  }
  if (!token.startsWith('ghp_') && !token.startsWith('github_pat_')) {
    console.error('GITHUB_TOKEN : format attendu ghp_… (classic) ou github_pat_… (fine-grained).');
    process.exit(1);
  }
}

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
    if (res.status === 401) {
      throw new Error(
        `${res.status} ${path}: Bad credentials — token invalide, expiré ou révoqué. ` +
          'Vérifiez https://github.com/settings/tokens (scope repo / accès ELServicesToulon/LMDPT).',
      );
    }
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

function loadDebates() {
  return readdirSync(DEBATES_DIR)
    .filter((f) => f.endsWith('.json'))
    .map((f) => {
      const data = JSON.parse(readFileSync(join(DEBATES_DIR, f), 'utf8'));
      return {
        slug: data.slug,
        question: data.question,
        context: data.context,
        charte: data.charte,
        discussion_id: data.discussion_id ?? data.slug,
        status: data.status,
      };
    });
}

function writeEnvFile(path, repoNodeId, categoryId) {
  if (!path) return;
  const lines = [
    '',
    '# LMDPT Giscus (généré par npm run giscus:setup)',
    `PUBLIC_GISCUS_REPO=${OWNER}/${REPO}`,
    `PUBLIC_GISCUS_REPO_ID=${repoNodeId}`,
    `PUBLIC_GISCUS_CATEGORY=${CATEGORY_NAME}`,
    `PUBLIC_GISCUS_CATEGORY_ID=${categoryId}`,
    '',
  ];
  const existing = existsSync(path) ? readFileSync(path, 'utf8') : '';
  if (existing.includes('PUBLIC_GISCUS_CATEGORY_ID=')) {
    console.log(`\n${path} contient déjà PUBLIC_GISCUS_CATEGORY_ID — non modifié.`);
    return;
  }
  appendFileSync(path, lines.join('\n'));
  console.log(`\nVariables ajoutées à ${path}`);
}

async function ensureDiscussions(repoId, categoryId) {
  const debates = loadDebates().filter((d) => d.status === 'ouvert');
  const existing = await graphql(
    `query($owner: String!, $name: String!, $categoryId: ID!) {
      repository(owner: $owner, name: $name) {
        discussions(first: 50, categoryId: $categoryId) {
          nodes { title url }
        }
      }
    }`,
    { owner: OWNER, name: REPO, categoryId },
  );

  const titles = new Set(existing.repository.discussions.nodes.map((d) => d.title));

  for (const debate of debates) {
    if (titles.has(debate.question)) {
      console.log(`  skip (existe) : ${debate.slug}`);
      continue;
    }
    const body = `${debate.context}\n\n---\n\n${debate.charte}\n\n**Terme Giscus** : \`${debate.discussion_id}\`\n\nPage : https://lmdpt.iarbre.org/debats/${debate.slug}`;
    const created = await graphql(
      `mutation($repoId: ID!, $categoryId: ID!, $title: String!, $body: String!) {
        createDiscussion(input: {
          repositoryId: $repoId,
          categoryId: $categoryId,
          title: $title,
          body: $body
        }) {
          discussion { title url }
        }
      }`,
      {
        repoId,
        categoryId,
        title: debate.question,
        body,
      },
    );
    console.log(`  créé : ${created.createDiscussion.discussion.url}`);
  }
}

async function main() {
  assertValidToken();
  const repo = await gh(`/repos/${OWNER}/${REPO}`);
  console.log(`Repo: ${repo.full_name}`);
  console.log(`PUBLIC_GISCUS_REPO=${OWNER}/${REPO}`);
  console.log(`PUBLIC_GISCUS_REPO_ID=${repo.node_id}`);
  console.log(`has_discussions: ${repo.has_discussions}`);

  if (!token) {
    console.log('\nSans GITHUB_TOKEN (scope repo admin) :');
    console.log('  1. GitHub → Settings → Features → Discussions ON');
    console.log('  2. Créer catégorie « Débats »');
    console.log('  3. Relancer : GITHUB_TOKEN=ghp_… npm run giscus:setup -- --create-category --create-discussions --write-env …/backend/.env');
    console.log('  4. Installer https://github.com/apps/giscus sur le repo');
    console.log('\nRepo ID connu (déjà utilisable en build) :', KNOWN_REPO_NODE_ID);
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

  let categories = data.repository.discussionCategories.nodes;
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
    categories = [...categories, debats];
    console.log('Catégorie créée.');
  }

  console.log('\nCatégories Discussions :');
  for (const c of categories) {
    console.log(`  - ${c.name}: ${c.id}`);
  }

  if (debats) {
    console.log('\n→ Variables build / deploy :');
    console.log(`PUBLIC_GISCUS_REPO_ID=${repo.node_id}`);
    console.log(`PUBLIC_GISCUS_CATEGORY_ID=${debats.id}`);

    if (createDiscussions) {
      console.log('\nCréation fils débats manquants…');
      try {
        await ensureDiscussions(data.repository.id, debats.id);
      } catch (err) {
        const msg = err instanceof Error ? err.message : String(err);
        console.warn(`\n⚠ Création fils débats impossible (${msg}).`);
        console.warn('  Créez les fils à la main dans GitHub Discussions, ou utilisez un PAT admin.');
      }
    }

    writeEnvFile(writeEnvPath, repo.node_id, debats.id);

    console.log('\nInstaller l’app Giscus : https://github.com/apps/giscus');
    console.log('Puis : npm run deploy-lmdpt-ovh (Mediconvoi/backend)');
  } else {
    console.log(`\nCatégorie « ${CATEGORY_NAME} » absente — relancer avec --create-category`);
  }
}

main().catch((err) => {
  console.error(err.message ?? err);
  process.exit(1);
});
