# Ambiente Livre Labs

Official Hugo website for the Ambiente Livre Labs plugin catalog and technical talks archive.

## Scope

- **Plugin catalog** with software ecosystem and category views
- **Talk archive** with event destinations (including TDC and pgConf)
- **Homepage hub** linking both discovery areas

## Stack

- Hugo (static site generation)
- Native CSS and JavaScript (no frontend framework)
- Node.js scripts for GitHub repository metadata sync and catalog validation
- GitHub Actions for scheduled refresh + build + deploy

## Repository layout

```text
assets/
  css/main.css
  js/main.js
  js/modules/
content/
  plugins/
  talks/
data/
  plugin-overrides.json
  plugins-generated.json
  software-categories.json
layouts/
scripts/
.github/workflows/build-deploy.yml
```

## Configuration

Environment variables used by the sync workflow/script:

- `GITHUB_OWNER` (default: `ambientelivre`)
- `GITHUB_ACCOUNT_TYPE` (`org` or `user`, default: `org`)
- `GITHUB_TOKEN` (optional for local runs; recommended in CI)
- `BASE_URL` (set through Hugo `baseURL`)

## Plugin catalog model

- `data/plugin-overrides.json` is the editorial source of truth for eligibility and classification overrides.
- `scripts/sync-github.mjs` fetches repositories and applies overrides.
- `data/plugins-generated.json` stores normalized, publishable plugin metadata.
- `scripts/validate-catalog.mjs` enforces required fields and catalog integrity checks.

### Editorial controls in `plugin-overrides.json`

Per repository:

- include/exclude publication
- software ecosystem
- categories
- featured status
- purpose and verified capabilities
- documentation URL
- optional curation-required marker

## Talks content model

Each talk is authored as Markdown in `content/talks/*.md` with front matter like:

- `title`, `date`
- `event`, `eventSlug`, `eventYear`
- `speakers`, `summary`, `location`
- `slidesURL`, `videoURL`, `resources`
- `technologies`, `topics`, `featured`

Event destination pages are in `content/talks/events/<event-slug>/_index.md` and automatically list talks that share the same `eventSlug`.

## Local development

### 1) Install prerequisites

- Node.js 22+
- Hugo Extended 0.138+

### 2) Sync repositories (optional for local)

```bash
npm run sync:github
```

### 3) Validate catalog

```bash
npm run validate:catalog
```

### 4) Run dev server

```bash
npm run dev
```

### 5) Production build

```bash
npm run build
```

## GitHub Actions automation

Workflow: `.github/workflows/build-deploy.yml`

Triggers:

- push to `main`
- weekly schedule (`cron`)
- manual `workflow_dispatch`

Pipeline stages:

1. Checkout + setup Node/Hugo
2. `npm run sync:github`
3. `npm run validate:catalog`
4. `npm run build`
5. Upload artifact + deploy to GitHub Pages

## Notes

- Catalog publication is intentionally conservative: only verified/curated eligible repositories are shown.
- Talks metadata is curated and does not fabricate missing fields.
- Reduced-motion users receive a low-motion experience with all core navigation preserved.
