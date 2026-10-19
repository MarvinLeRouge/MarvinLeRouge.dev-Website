import { z } from 'astro/zod';
import type { Locale } from '../i18n/locales';

/**
 * Sections of the lead dev view, in order: every published sheet holds them as `###` headings,
 * so readers find the same structure from one sheet to the next.
 */
export const LEAD_DEV_SECTIONS: Readonly<Record<Locale, readonly string[]>> = {
  fr: [
    'Architecture',
    'Décisions clés',
    'Une difficulté',
    'Qualité',
    'Chronologie',
    'Ce que je referais autrement',
  ],
  en: [
    'Architecture',
    'Key decisions',
    'A difficulty',
    'Quality',
    'Timeline',
    'What I would do differently',
  ],
};

const text = z.string().trim().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });

/**
 * Frontmatter of a project sheet. The recruiter view lives here, short and structured;
 * the lead dev view is the Markdown body.
 * Takes the screenshot schema as a parameter: Astro's `image()` helper in the content layer,
 * any schema in tests.
 */
export function projectSchema<Image extends z.ZodType>(image: Image) {
  return z
    .object({
      title: text,
      tagline: text,
      stack: z.array(text).min(1),
      repo: z.url({ protocol: /^https$/, hostname: /^github\.com$/ }),
      /**
       * Screenshot shown in the sheet (readable at 768 x 480), and optionally the full size image
       * it links to, opened in a modal dialog when JavaScript is available.
       */
      screenshot: z.object({ src: image, full: image.optional(), alt: text }),
      keywords: z.array(text).min(3).max(4),
      recruiter: z.object({ problem: text, built: text, result: text }),
      /** Latest notable change, as a sentence without date: shows the project is alive. */
      lastAction: text.optional(),
      adrs: z.array(z.object({ title: text, url: httpsUrl })).optional(),
      demo: httpsUrl.optional(),
      /** Position in the projects index, smallest first. */
      order: z.int().positive(),
      /** Drafts are never built in production: publishing a sheet takes an explicit `draft: false`. */
      draft: z.boolean().default(true),
    })
    .refine((sheet) => sheet.draft || sheet.lastAction !== undefined, {
      message: 'A published sheet needs its lastAction',
      path: ['lastAction'],
    });
}
