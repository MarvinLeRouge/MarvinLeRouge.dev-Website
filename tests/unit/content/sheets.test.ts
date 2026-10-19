import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { LOCALES } from '../../../src/i18n/locales';

const SHEETS_DIR = join(import.meta.dirname, '../../../src/content/projects');

const sheets = LOCALES.flatMap((locale) =>
  readdirSync(join(SHEETS_DIR, locale))
    .filter((file) => file.endsWith('.md'))
    .map((file) => ({
      name: `${locale}/${file}`,
      text: readFileSync(join(SHEETS_DIR, locale, file), 'utf8'),
    })),
);

/** Markdown body, after the frontmatter, without fenced code blocks (where `#` starts comments). */
const body = (text: string) =>
  text.replace(/^---\r?\n[\s\S]*?\r?\n---\r?\n/, '').replace(/^(```|~~~)[\s\S]*?^\1/gm, '');

describe('project sheet files', () => {
  it('finds the sheets', () => {
    expect(sheets.length).toBeGreaterThan(0);
  });

  it('ignores comments in code blocks when checking heading levels', () => {
    const text = '---\ntitle: T\n---\n### Setup\n```bash\n# install\n## build\n```\n';
    expect(body(text)).not.toMatch(/^#{1,2} /m);
  });

  describe.each(sheets)('$name', ({ text }) => {
    it('follows the writing rules: no em dash, straight quotes only', () => {
      expect(text).not.toMatch(/[—‘’“”]/);
    });

    it('starts its body headings at level 3, under the lead dev view heading', () => {
      expect(body(text)).not.toMatch(/^#{1,2} /m);
    });

    it('gives every image a text alternative', () => {
      const alts = [...body(text).matchAll(/!\[([^\]]*)\]\(/g)].map(([, alt]) => alt.trim());
      expect(alts.filter((alt) => alt === '')).toEqual([]);
    });
  });
});
