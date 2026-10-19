// @ts-check
import sitemap from '@astrojs/sitemap';
import { defineConfig } from 'astro/config';

export default defineConfig({
  site: 'https://marvinlerouge.dev',
  // French at the root, English under /en/. Keep in sync with src/i18n/locales.ts.
  i18n: {
    defaultLocale: 'fr',
    locales: ['fr', 'en'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [
    sitemap({
      // Alternates per locale, matching the hreflang links of the pages.
      i18n: { defaultLocale: 'fr', locales: { fr: 'fr', en: 'en' } },
      filter: (page) => !page.endsWith('/404/'),
    }),
  ],
  // Keep straight quotes and apostrophes as written (writing rule): no typographic substitution.
  markdown: { smartypants: false },
  // Whitespace compression collapses meaningful spaces between inline elements.
  compressHTML: false,
  vite: {
    // The language preference script is bundled through `?worker&url` into a standalone file
    // loaded as a classic script: it must stay an IIFE, not an ES module.
    worker: { format: 'iife' },
  },
  build: {
    // Hashed external stylesheets: long-term cacheable and CSP-friendly.
    inlineStylesheets: 'never',
  },
});
