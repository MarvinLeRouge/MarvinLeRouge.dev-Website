// Shared by the diagram generator and its tests: the settings the diagrams are generated with, and
// the hash kept in each SVG, which tells whether the SVG is up to date with what it is made from.
import { createHash } from 'node:crypto';
import { fileURLToPath } from 'node:url';

/** Font file embedded in the diagrams. */
export const FONT_PATH = fileURLToPath(
  new URL('../src/assets/fonts/share-tech-mono-latin.woff2', import.meta.url),
);

/** Site font, embedded in the diagrams. */
export const FONT = 'Share Tech Mono';

/**
 * Mermaid settings: site palette (dark background, yellow strokes, light text). A box can be
 * highlighted in red from the source, with `classDef` and `fill:#e03030`.
 */
export const MERMAID_CONFIG = {
  startOnLoad: false,
  // A syntax error fails the generator instead of drawing an error diagram.
  suppressErrorRendering: true,
  theme: 'base',
  // Plain SVG text: HTML labels (foreignObject) render inconsistently inside images.
  htmlLabels: false,
  flowchart: { htmlLabels: false, curve: 'basis' },
  fontFamily: FONT,
  themeVariables: {
    fontFamily: FONT,
    fontSize: '15px',
    background: '#111111',
    primaryColor: '#1a1a1a',
    primaryTextColor: '#f0f0f0',
    primaryBorderColor: '#ffc800',
    secondaryColor: '#0a0a0a',
    tertiaryColor: '#0a0a0a',
    lineColor: '#ffc800',
    textColor: '#f0f0f0',
    clusterBkg: '#0a0a0a',
    clusterBorder: '#666666',
    edgeLabelBackground: '#111111',
    // The default light shadow looks like a glitch on a dark background.
    dropShadow: 'none',
  },
};

/** Hash of everything a diagram is generated from: its source, the settings, the font, Mermaid. */
export function diagramHash(source, fontBytes, mermaidVersion) {
  return createHash('sha256')
    .update(source)
    .update(JSON.stringify(MERMAID_CONFIG))
    .update(fontBytes)
    .update(mermaidVersion)
    .digest('hex');
}

/** Comment holding the hash in a generated SVG. */
export const sourceHashComment = (hash) => `<!-- source-sha256: ${hash} -->`;

/** Finds the hash in a generated SVG (first capture group). */
export const SOURCE_HASH_PATTERN = /<!-- source-sha256: ([0-9a-f]{64}) -->/;
