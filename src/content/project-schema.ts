import { z } from 'astro/zod';

const text = z.string().trim().min(1);
const httpsUrl = z.url({ protocol: /^https$/ });

/**
 * Frontmatter of a project sheet. The recruiter view lives here, short and structured;
 * the lead dev view is the Markdown body.
 * Takes the screenshot schema as a parameter: Astro's `image()` helper in the content layer,
 * any schema in tests.
 */
export function projectSchema<Image extends z.ZodType>(image: Image) {
  return z.object({
    title: text,
    tagline: text,
    stack: z.array(text).min(1),
    repo: z.url({ protocol: /^https$/, hostname: /^github\.com$/ }),
    screenshot: z.object({ src: image, alt: text }),
    keywords: z.array(text).min(3).max(4),
    recruiter: z.object({ problem: text, built: text, result: text }),
    adrs: z.array(z.object({ title: text, url: httpsUrl })).optional(),
    demo: httpsUrl.optional(),
    /** Position in the projects index, smallest first. */
    order: z.int().positive(),
    /** Drafts are never built in production: publishing a sheet takes an explicit `draft: false`. */
    draft: z.boolean().default(true),
  });
}
