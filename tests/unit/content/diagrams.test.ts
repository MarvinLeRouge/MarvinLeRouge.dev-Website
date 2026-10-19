import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { diagramHash, FONT_PATH, SOURCE_HASH_PATTERN } from '../../../scripts/diagram-source.mjs';

const DIAGRAMS_DIR = join(import.meta.dirname, '../../../src/content/projects/diagrams');

/** Reading column of the sheets (48rem) plus a small margin: wider diagrams get scaled down. */
const MAX_DIAGRAM_WIDTH = 800;

const files = readdirSync(DIAGRAMS_DIR);
const fontBytes = readFileSync(FONT_PATH);
const mermaidVersion = JSON.parse(
  readFileSync(join(import.meta.dirname, '../../../node_modules/mermaid/package.json'), 'utf8'),
).version;
const names = (extension: string) =>
  files.filter((file) => file.endsWith(extension)).map((file) => file.slice(0, -extension.length));

describe('architecture diagrams', () => {
  it('finds the diagram sources', () => {
    expect(names('.mmd').length).toBeGreaterThan(0);
  });

  it('pairs every Mermaid source with its generated SVG', () => {
    expect(names('.svg').sort()).toEqual(names('.mmd').sort());
  });

  describe.each(names('.mmd'))('%s', (name) => {
    const svg = readFileSync(join(DIAGRAMS_DIR, `${name}.svg`), 'utf8');

    it('is up to date with its source and settings: run npm run diagrams after a change', () => {
      const source = readFileSync(join(DIAGRAMS_DIR, `${name}.mmd`));
      const hash = diagramHash(source, fontBytes, mermaidVersion);
      expect(svg.match(SOURCE_HASH_PATTERN)?.[1]).toBe(hash);
    });

    it('fits the reading column without shrinking its text: split long chains in rows', () => {
      const [, , width] = (svg.match(/viewBox="([^"]+)"/)?.[1] ?? '').split(' ').map(Number);
      expect(width).toBeLessThanOrEqual(MAX_DIAGRAM_WIDTH);
    });

    it('embeds the site font, as an image cannot load external fonts', () => {
      expect(svg).toContain("font-family: 'Share Tech Mono'");
      expect(svg).toContain('url(data:font/woff2;base64,');
    });
  });
});
