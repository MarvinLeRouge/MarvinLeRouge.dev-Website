// Converts the Mermaid sources of the project sheets (src/content/projects/diagrams/*.mmd) into SVG
// files next to them, styled like the site. Run by hand after editing a diagram: npm run diagrams
// The SVG embeds the site font (an image cannot load external fonts) and a hash of everything it
// is generated from, which the unit tests compare to detect a forgotten regeneration.
import { readdir, readFile, writeFile } from 'node:fs/promises';
import { join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { chromium } from 'playwright';
import {
  diagramHash,
  FONT,
  FONT_PATH,
  MERMAID_CONFIG,
  sourceHashComment,
} from './diagram-source.mjs';

const root = fileURLToPath(new URL('..', import.meta.url));
const diagramsDir = join(root, 'src/content/projects/diagrams');
const mermaidVersion = JSON.parse(
  await readFile(join(root, 'node_modules/mermaid/package.json'), 'utf8'),
).version;
const fontBytes = await readFile(FONT_PATH);
const font = fontBytes.toString('base64');
const fontFace = `@font-face { font-family: '${FONT}'; src: url(data:font/woff2;base64,${font}) format('woff2'); }`;

const sources = (await readdir(diagramsDir)).filter((file) => file.endsWith('.mmd'));
const browser = await chromium.launch();
try {
  const page = await browser.newPage();
  // Same font in the page as in the SVG: Mermaid sizes the boxes from the measured text.
  await page.setContent(`<style>${fontFace}</style><p style="font-family: '${FONT}'">.</p>`);
  await page.evaluate((family) => document.fonts.load(`16px '${family}'`), FONT);
  await page.addScriptTag({ path: join(root, 'node_modules/mermaid/dist/mermaid.min.js') });
  await page.evaluate((config) => window.mermaid.initialize(config), MERMAID_CONFIG);

  for (const file of sources) {
    const source = await readFile(join(diagramsDir, file));
    let svg;
    try {
      ({ svg } = await page.evaluate(
        ([id, text]) => window.mermaid.render(id, text),
        [`diagram-${file.replace(/\W/g, '-')}`, source.toString()],
      ));
    } catch (error) {
      throw new Error(`${file}: ${error.message}`, { cause: error });
    }
    const hash = diagramHash(source, fontBytes, mermaidVersion);
    const output = svg
      .replace(/^<svg([^>]*)>/, `<svg$1>${sourceHashComment(hash)}<style>${fontFace}</style>`)
      .concat('\n');
    await writeFile(join(diagramsDir, file.replace(/\.mmd$/, '.svg')), output);
    console.log(`${file} -> ${file.replace(/\.mmd$/, '.svg')}`);
  }
} finally {
  await browser.close();
}
