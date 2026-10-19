import { z } from 'astro/zod';
import { describe, expect, it } from 'vitest';
import { projectSchema } from '../../../src/content/project-schema';

// Stands in for Astro's image() helper, only available inside the content layer.
const schema = projectSchema(z.string());

const validSheet = {
  title: 'Example',
  tagline: 'What the project does, in one sentence.',
  stack: ['Python', 'SQL'],
  repo: 'https://github.com/MarvinLeRouge/Example',
  screenshot: { src: './example.png', alt: 'Main screen of the example' },
  keywords: ['Data pipelines', 'Testing', 'CI'],
  recruiter: { problem: 'The problem.', built: 'What was built.', result: 'The result.' },
  order: 1,
};

const issuePaths = (sheet: unknown) =>
  schema.safeParse(sheet).error?.issues.map((issue) => issue.path.join('.')) ?? [];

describe('projectSchema', () => {
  it('accepts a complete sheet and makes it a draft by default', () => {
    const parsed = schema.parse(validSheet);
    expect(parsed.draft).toBe(true);
  });

  it('accepts the optional ADR and demo links', () => {
    const sheet = {
      ...validSheet,
      draft: false,
      adrs: [
        {
          title: 'ADR-0001',
          url: 'https://github.com/MarvinLeRouge/Example/blob/main/docs/adr/0001.md',
        },
      ],
      demo: 'https://example.org/demo',
    };
    expect(schema.parse(sheet)).toMatchObject({ draft: false, demo: sheet.demo });
  });

  it('requires a text alternative for the screenshot', () => {
    expect(issuePaths({ ...validSheet, screenshot: { src: './example.png', alt: '  ' } })).toEqual([
      'screenshot.alt',
    ]);
  });

  it.each([2, 5])('rejects %i recruiter keywords', (count) => {
    const keywords = Array.from({ length: count }, (_, index) => `Keyword ${index}`);
    expect(issuePaths({ ...validSheet, keywords })).toEqual(['keywords']);
  });

  it.each(['https://gitlab.com/MarvinLeRouge/Example', 'http://github.com/MarvinLeRouge/Example'])(
    'rejects a repository outside GitHub over https: %s',
    (repo) => {
      expect(issuePaths({ ...validSheet, repo })).toEqual(['repo']);
    },
  );

  it('requires every part of the recruiter view', () => {
    const recruiter = { problem: 'The problem.', built: 'What was built.' };
    expect(issuePaths({ ...validSheet, recruiter })).toEqual(['recruiter.result']);
  });

  it('rejects a non-positive or fractional order', () => {
    expect(issuePaths({ ...validSheet, order: 0 })).toEqual(['order']);
    expect(issuePaths({ ...validSheet, order: 1.5 })).toEqual(['order']);
  });
});
