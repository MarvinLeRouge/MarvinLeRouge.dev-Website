[🇫🇷 Version française](project-sheets.fr.md) | 🇬🇧 English version

---

# Project sheets

Each project sheet presents one project in two views: a short **recruiter view** (read in 30 seconds) and a detailed **lead dev view**. A sheet exists once per language.

## Files

```
src/content/projects/
  fr/<slug>.md     French version, published at /projets/<slug>/
  en/<slug>.md     English version, published at /en/projects/<slug>/
  images/          screenshots
```

The same file name in `fr/` and `en/` links the two versions of a sheet (language switch, `hreflang`). A sheet may exist in one language only.

## Format

The **frontmatter** holds the recruiter view and the metadata. It is validated at build time: a missing or invalid field fails the build. The **Markdown body** is the lead dev view.

```markdown
---
title: JobFlow
tagline: One sentence on what the project does.
stack: [Python, SQL] # at least one
repo: https://github.com/MarvinLeRouge/JobFlow # https, GitHub only
screenshot:
  src: ../images/jobflow.png # path relative to the sheet
  alt: What the screenshot shows # required, not empty
keywords: [Data pipelines, Testing, CI] # 3 or 4 recruiter keywords
recruiter:
  problem: The starting problem, in one or two sentences.
  built: What was built, in one or two sentences.
  result: The result, as an order of magnitude.
adrs: # optional
  - title: 'ADR-0002: JSON ledger keyed by Message-ID'
    url: https://github.com/MarvinLeRouge/JobFlow/blob/main/docs/adr/0002-....md
demo: https://... # optional, https
order: 1 # position in the projects index, unique per language
draft: true # true by default
---

Lead dev view, in the first person.

### Architecture

Body headings start at level 3 (`###`): level 2 is the view title.
```

See `src/content/projects/fr/example.md` for a complete example (a draft, never published). The `e2e-fixture.md` sheets are published but only built for the end-to-end tests (`npm run build:e2e`), never in production.

## Views

A published sheet shows one view at a time, selected with the "Recruiter view" / "Lead dev view" tabs (keyboard: arrow keys, Home, End). The recruiter view is shown first; the lead dev view has its own URL, to send it directly:

- French: `/projets/<slug>/?vue=tech`
- English: `/en/projects/<slug>/?view=tech`

The last view picked is remembered across sheets: a sheet URL without parameter opens that view. Without JavaScript, both views are shown one after the other.

The link preview image of a sheet is its screenshot, cropped to 1200 x 630: keep the important part of the screenshot near its center.

## Publication

The projects index (`/projets/`, `/en/projects/`) lists the published sheets of a language in `order` order, and the homepage links to it. Both only appear once the language has a published sheet: publishing the first sheet adds them, with no other change.

- A sheet is a **draft by default**. Drafts are visible with `npm run dev` for review, and never built in production.
- Publishing a sheet takes an explicit `draft: false`, after review by the developer.

## Writing rules

Checked by the unit tests:

- no em dash, straight quotes and apostrophes only;
- body headings start at level 3.

Checked at review:

- recruiter view: sober and factual; lead dev view: first person, with the touch of humor of the homepage;
- only stable facts or orders of magnitude: no exact test count, coverage figure, endpoint count or version, which belong to the project README and its badges;
- no confidential information (CoExel: generic description only).
