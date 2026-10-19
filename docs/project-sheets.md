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
  diagrams/        diagrams: Mermaid sources (.mmd) and generated SVG files
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
  full: ../images/jobflow-full.avif # optional: full size image, opened from the screenshot
  alt: What the screenshot shows # required, not empty
keywords: [Data pipelines, Testing, CI] # 3 or 4 recruiter keywords
recruiter:
  problem: The starting problem, in one or two sentences.
  built: What was built, in one or two sentences.
  result: The result, as an order of magnitude.
lastAction: Added a new alert provider # required to publish: latest notable change, no date
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

### Key decisions

...
```

See `src/content/projects/fr/example.md` for a complete example (a draft, never published). The `e2e-fixture.md` sheets are published but only built for the end-to-end tests (`npm run build:e2e`), never in production.

## Screenshots

Each sheet has a screenshot, named after the sheet in `src/content/projects/images/`:

- `<slug>.png`: the screenshot shown in the sheet, the index card and the link preview. **768 x 480**, cropped at 100% zoom rather than scaled down, so the text stays readable. A palette PNG (256 colors) is a good source.
- `<slug>-full.avif` (optional): the full size image. The screenshot then links to it; with JavaScript, it opens in a modal dialog (Escape or the "Close" button closes it), and the dialog scrolls when the image is larger than the screen. When present, the link preview is cropped from its top left corner.

Screenshots are served as AVIF, with the source format as fallback. Hide anything personal before the capture: tracking links, email identifiers, account avatars.

## Lead dev view structure

Every published sheet holds the same six sections, in this order, as `###` headings (checked by a unit test). An introduction may come before the first one.

| French                       | English                     |
| ---------------------------- | --------------------------- |
| Architecture                 | Architecture                |
| Décisions clés               | Key decisions               |
| Une difficulté               | A difficulty                |
| Qualité                      | Quality                     |
| Chronologie                  | Timeline                    |
| Ce que je referais autrement | What I would do differently |

## Diagrams

The architecture diagram of the lead dev view is written in [Mermaid](https://mermaid.js.org/), one source per language since the labels are translated:

1. Write `src/content/projects/diagrams/<slug>-<locale>.mmd`, for example:

   ```
   flowchart LR
     gmail[Gmail] --> parser[Parser per provider]
     parser --> ledger[(JSON ledger)]
     ledger --> sheets[Google Sheets]
   ```

2. Run `npm run diagrams`: it writes the SVG next to the source, in the colors and font of the site. Commit both files. A unit test fails when an SVG is missing or no longer matches its source, the diagram settings, the font or the Mermaid version.
3. Insert it in the body, with a short text alternative:

   ```markdown
   ![JobFlow flow: Gmail, parser per provider, JSON ledger, Google Sheets](../diagrams/jobflow-en.svg)
   ```

4. Describe the diagram in the text right after it: a diagram is a complex image, and its detailed description is required for accessibility (RGAA). The "Architecture" paragraph plays that role.

Keep diagrams small (about ten boxes at most) and no wider than the reading column (800 px, checked by a unit test): split a long chain into rows, with `flowchart TB` and `subgraph` blocks in `direction LR`. On narrow screens, a diagram keeps a readable size and scrolls horizontally. Opened on its own in the browser, a diagram shows without its styles (blocked by the site's security policy): it is only meant to be shown inside a sheet. `classDef` and `class` can highlight a box, for instance in red (`fill:#e03030`).

## Views

A published sheet shows one view at a time, selected with the "Recruiter view" / "Lead dev view" tabs (keyboard: arrow keys, Home, End). The recruiter view is shown first; the lead dev view has its own URL, to send it directly:

- French: `/projets/<slug>/?vue=tech`
- English: `/en/projects/<slug>/?view=tech`

The last view picked is remembered across sheets: a sheet URL without parameter opens that view. Without JavaScript, both views are shown one after the other.

The link preview image of a sheet is its screenshot, cropped to 1200 x 630: keep the important part of the screenshot near its center.

## Publication

The projects index (`/projets/`, `/en/projects/`) lists the published sheets of a language in `order` order, and the homepage links to it. Both only appear once the language has a published sheet: publishing the first sheet adds them, with no other change.

- A sheet is a **draft by default**. Drafts are visible with `npm run dev` for review, and never built in production.
- Publishing a sheet takes an explicit `draft: false`, after review by the developer, and a `lastAction`.
- Both language versions of a sheet are published together: the build fails when a published sheet lacks its published translation.

## Writing rules

Checked by the unit tests:

- no em dash, straight quotes and apostrophes only;
- body headings start at level 3;
- every image has a text alternative.

Checked at review:

- recruiter view: sober and factual; lead dev view: first person, with the touch of humor of the homepage;
- only stable facts or orders of magnitude: no exact test count, coverage figure, endpoint count or version, which belong to the project README and its badges;
- no confidential information (CoExel: generic description only).
