import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { projectSchema } from './content/project-schema';

/** Published sheet used by the e2e tests, built only by `npm run build:e2e`. */
const E2E_FIXTURE = '{fr,en}/e2e-fixture.md';

/** Project sheets, one Markdown file per locale: `src/content/projects/<locale>/<slug>.md`. */
const projects = defineCollection({
  loader: glob({
    pattern:
      process.env.E2E_FIXTURES === '1' ? '{fr,en}/*.md' : ['{fr,en}/*.md', `!${E2E_FIXTURE}`],
    base: './src/content/projects',
  }),
  schema: ({ image }) => projectSchema(image()),
});

export const collections = { projects };
