[🇫🇷 Version française](README.fr.md) | 🇬🇧 English version

---

# 🌐 MarvinLeRouge.dev-Website

> _Source of [marvinlerouge.dev](https://marvinlerouge.dev): personal site of a backend developer / data engineer, with bilingual project sheets offering a recruiter view and a technical view. Static site built with Astro._

[![CI](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/ci.yml/badge.svg)](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/ci.yml)
[![Deploy](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/build-deploy.yml/badge.svg)](https://github.com/MarvinLeRouge/MarvinLeRouge.dev-Website/actions/workflows/build-deploy.yml)
[![Coverage](https://img.shields.io/codecov/c/github/MarvinLeRouge/MarvinLeRouge.dev-Website/main?flag=frontend&label=coverage&logo=codecov)](https://app.codecov.io/gh/MarvinLeRouge/MarvinLeRouge.dev-Website)
[![Astro](https://img.shields.io/badge/Astro-7-BC52EE?logo=astro&logoColor=white)](https://astro.build)
[![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![License](https://img.shields.io/github/license/MarvinLeRouge/MarvinLeRouge.dev-Website?cacheSeconds=3600)](LICENSE)

---

## About

The site complements the GitHub profile: GitHub shows the code, the site explains the reasoning behind it (design decisions, difficulties, case studies).

- Fully static output: plain HTML and CSS, no client-side JavaScript beyond small progressive enhancements.
- The contact address never appears in plain text in the HTML: a small script reveals it, with a spelled-out fallback without JavaScript.
- French first at the root, English under `/en/`. The language picked with the switcher is remembered in the browser (`localStorage`, no cookie).
- No audience measurement.
- Accessibility is a design constraint, not an afterthought.

---

## Tech stack

| Layer      | Technology                                                                                                                                                                                           |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Generator  | ![Astro](https://img.shields.io/badge/Astro-BC52EE?logo=astro&logoColor=white&style=flat-square)                                                                                                     |
| Language   | ![TypeScript](https://img.shields.io/badge/TypeScript-3178C6?logo=typescript&logoColor=white&style=flat-square)                                                                                      |
| Linting    | ![ESLint](https://img.shields.io/badge/ESLint-4B32C3?logo=eslint&logoColor=white&style=flat-square)                                                                                                  |
| Formatting | ![Prettier](https://img.shields.io/badge/Prettier-F7B93E?logo=prettier&logoColor=black&style=flat-square)                                                                                            |
| Serving    | ![Docker](https://img.shields.io/badge/Docker-2496ED?logo=docker&logoColor=white&style=flat-square) ![Nginx](https://img.shields.io/badge/Nginx-009639?logo=nginx&logoColor=white&style=flat-square) |
| Tests      | Vitest, Playwright, axe-core, lychee                                                                                                                                                                 |
| Git hooks  | Husky, lint-staged, gitleaks, git-cliff                                                                                                                                                              |

---

## Development

Requires Node.js 24 (see `.nvmrc`) and gitleaks (see [CONTRIBUTING.md](CONTRIBUTING.md)).

```bash
npm install          # dependencies and git hooks
npm run dev          # local dev server with hot reload
npm run build        # static build into dist/
npm run preview      # serve the built site locally
npm run check        # Astro and TypeScript diagnostics
npm run lint         # ESLint
npm run format:check # Prettier
npm test             # unit tests (Vitest)
npm run test:cov     # unit tests with the coverage gate
npm run test:e2e     # end-to-end and accessibility tests on the built site
npm run social-images # regenerate the link preview images, favicon.ico and the avatar icons
```

### Docker

Both services run behind the local Traefik (external network `traefik-public`). Add `website.marvinlerouge.local` and `website-prod.marvinlerouge.local` to `/etc/hosts`.

```bash
docker compose up --build                 # dev server with hot reload on http://website.marvinlerouge.local
docker compose --profile prod up --build  # production image (Nginx) on http://website-prod.marvinlerouge.local
scripts/smoke-docker.sh http://website-prod.marvinlerouge.local   # status codes, headers, caching
PLAYWRIGHT_BASE_URL=http://website-prod.marvinlerouge.local npm run test:e2e   # e2e tests against the real CSP
```

`docker-compose.prod.yml` is the production stack, deployed on the server by the `Build & Deploy` workflow after each merge on `main`. Deployment, rollback and troubleshooting: [docs/operations.md](docs/operations.md).

---

## Project structure

```
src/
  assets/      self-hosted fonts and avatar, font licenses
  components/  reusable page sections
  content/     project sheets (Markdown, FR and EN) and their schema, see docs/project-sheets.md
  i18n/        locales, identity links and every user-facing string (FR, EN)
  layouts/     page layouts (document head, shared structure)
  pages/       one file per route
  scripts/     client scripts (language preference, email reveal)
  styles/      global stylesheets
tests/
  e2e/         Playwright and axe tests on the built site
  unit/        Vitest tests for client scripts and locale logic
public/        files served as is (favicons, home screen icons, link preview images)
docker/        Nginx configuration of the production image
docs/          roadmap, operations runbook, project sheet guide and translated community files
scripts/       git hook helpers, Docker smoke test and social image generator
```

---

## Roadmap

See [docs/roadmap.md](docs/roadmap.md).

---

## License

The source code is released under the [MIT License](LICENSE). The site content (texts, project sheets, case studies, screenshots and images) is not covered by it: all rights reserved. The fonts in `src/assets/fonts/` (Bebas Neue, Share Tech Mono) are distributed under the SIL Open Font License 1.1, see the license files next to them.
