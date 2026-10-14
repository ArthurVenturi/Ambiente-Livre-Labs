import fs from 'node:fs/promises';
import path from 'node:path';

const ROOT = process.cwd();
const requiredFields = ['name', 'slug', 'htmlUrl', 'software', 'categories'];

async function readJson(filePath) {
  const raw = await fs.readFile(filePath, 'utf8');
  return JSON.parse(raw);
}

function validatePlugin(plugin, index) {
  const errors = [];
  for (const field of requiredFields) {
    if (!(field in plugin)) {
      errors.push(`items[${index}] missing ${field}`);
    }
  }

  if (plugin.software === null || plugin.software === '') {
    errors.push(`items[${index}] software requires curation`);
  }

  if (!Array.isArray(plugin.categories) || plugin.categories.length === 0) {
    errors.push(`items[${index}] categories must contain at least one value`);
  }

  if (typeof plugin.htmlUrl !== 'string' || !plugin.htmlUrl.startsWith('https://github.com/')) {
    errors.push(`items[${index}] htmlUrl must point to GitHub`);
  }

  return errors;
}

async function main() {
  const pluginsPath = path.join(ROOT, 'data', 'plugins-generated.json');
  const catalog = await readJson(pluginsPath);

  if (!Array.isArray(catalog.items)) {
    throw new Error('plugins-generated.json must include an items array');
  }

  const errors = [];
  catalog.items.forEach((plugin, index) => {
    errors.push(...validatePlugin(plugin, index));
  });

  if (errors.length > 0) {
    console.error('Catalog validation failed:');
    errors.forEach((error) => console.error(`- ${error}`));
    process.exitCode = 1;
    return;
  }

  console.log(`Catalog validation passed with ${catalog.items.length} plugins.`);
}

main().catch((error) => {
  console.error(error.message);
  process.exitCode = 1;
});
