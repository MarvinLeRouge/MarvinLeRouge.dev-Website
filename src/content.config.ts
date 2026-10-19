import { glob } from 'astro/loaders';
import { defineCollection } from 'astro:content';
import { projectSchema } from './content/project-schema';

/** Project sheets, one Markdown file per locale: `src/content/projects/<locale>/<slug>.md`. */
const projects = defineCollection({
  loader: glob({ pattern: '{fr,en}/*.md', base: './src/content/projects' }),
  schema: ({ image }) => projectSchema(image()),
});

export const collections = { projects };
