import fs from 'node:fs/promises';
import path from 'node:path';

const OWNER = process.env.GITHUB_OWNER || 'ambientelivre';
const ACCOUNT_TYPE = process.env.GITHUB_ACCOUNT_TYPE || 'org';
const TOKEN = process.env.GITHUB_TOKEN;
const ROOT = process.cwd();
const DATA_PATH = path.join(ROOT, 'data', 'plugins-generated.json');
const OVERRIDES_PATH = path.join(ROOT, 'data', 'plugin-overrides.json');

async function fetchRepos() {
  const endpoint = ACCOUNT_TYPE === 'user'
    ? `https://api.github.com/users/${OWNER}/repos?per_page=100&type=public&page=`
    : `https://api.github.com/orgs/${OWNER}/repos?per_page=100&type=public&page=`;

  const repos = [];
  let page = 1;

  while (true) {
    const headers = {
      Accept: 'application/vnd.github+json'
    };
    if (TOKEN) headers.Authorization = 'Bearer ' + TOKEN;

    const response = await fetch(`${endpoint}${page}`, {
      headers
    });

    if (!response.ok) {
      const body = await response.text();
      throw new Error(`GitHub API ${response.status}: ${body.slice(0, 180)}`);
    }

    const batch = await response.json();
    if (!Array.isArray(batch) || batch.length === 0) break;
    repos.push(...batch);
    if (batch.length < 100) break;
    page += 1;
  }

  return repos;
}

function normalizeRepo(repo, override = {}) {
  const categories = Array.isArray(override.categories)
    ? override.categories.filter(Boolean)
    : [];

  return {
    name: repo.name,
    slug: repo.name.toLowerCase(),
    description: override.editorialDescription || repo.description || '',
    htmlUrl: repo.html_url,
    defaultBranch: repo.default_branch || 'main',
    language: repo.language || 'Unknown',
    license: repo.license?.spdx_id || 'Unknown',
    stargazersCount: repo.stargazers_count ?? 0,
    updatedAt: repo.updated_at,
    archived: Boolean(repo.archived),
    software: override.software || null,
    categories,
    featured: Boolean(override.featured),
    purpose: override.purpose || '',
    verifiedCapabilities: override.verifiedCapabilities || [],
    documentationURL: override.documentationURL || repo.homepage || '',
    eligibilitySource: override.include ? 'manual-override' : 'topic-match',
    classificationNeedsCuration: Boolean(override.classificationNeedsCuration || !override.software)
  };
}

function isEligible(repo, override, defaults) {
  if (override?.include === true) return true;
  if (override?.include === false) return false;
  if (defaults.excludeArchived && repo.archived) return false;
  const topics = new Set(repo.topics || []);
  return defaults.includeByTopic.some((topic) => topics.has(topic));
}

async function main() {
  const overrides = JSON.parse(await fs.readFile(OVERRIDES_PATH, 'utf8'));
  const repos = await fetchRepos();
  const selected = repos
    .filter((repo) => isEligible(repo, overrides.repositories[repo.name], overrides.defaults))
    .map((repo) => normalizeRepo(repo, overrides.repositories[repo.name]))
    .sort((a, b) => a.name.localeCompare(b.name));

  const payload = {
    generatedAt: new Date().toISOString(),
    owner: OWNER,
    items: selected
  };
  await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');
  await fs.writeFile(DATA_PATH, JSON.stringify(payload, null, 2) + '\n', 'utf8');

  console.log(`Synced ${selected.length} eligible repositories for ${OWNER}.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
