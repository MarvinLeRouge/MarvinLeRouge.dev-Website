import type { APIRoute, GetStaticPaths } from 'astro';
import { getCollection } from 'astro:content';
import { readFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import sharp from 'sharp';
import { sheetSlug } from '../../../content/projects';

/** Size of the Open Graph link preview images. */
const WIDTH = 1200;
const HEIGHT = 630;

/**
 * File of the full size screenshot, as written in the sheet frontmatter: the content layer only
 * exposes the processed image URL, and the crop needs the original file.
 */
async function fullScreenshot(sheetFile: string): Promise<string> {
  const source = await readFile(join(process.cwd(), sheetFile), 'utf8');
  const path = source.match(/^\s+full:\s*(\S+)\s*$/m)?.[1];
  if (path === undefined) throw new Error(`No full size screenshot in ${sheetFile}`);
  return join(process.cwd(), dirname(sheetFile), path);
}

// One preview per sheet with a full size screenshot (drafts in development only).
export const getStaticPaths = (async () => {
  const sheets = await getCollection(
    'projects',
    (sheet) => (import.meta.env.DEV || !sheet.data.draft) && !!sheet.data.screenshot.full,
  );
  // One per slug: the language versions of a sheet share their screenshot.
  const bySlug = new Map(sheets.map((sheet) => [sheetSlug(sheet.id), sheet.filePath ?? '']));
  return [...bySlug].map(([slug, file]) => ({ params: { slug }, props: { file } }));
}) satisfies GetStaticPaths;

/**
 * Link preview cut from the top left corner of the full size screenshot, at its own scale: the text
 * stays readable, where scaling the whole screenshot down to 1200 pixels would make it unreadable.
 */
export const GET: APIRoute = async ({ props }) => {
  const file = await fullScreenshot(props.file);
  const { width = 0, height = 0 } = await sharp(file).metadata();
  // A full size screenshot smaller than the preview is scaled up instead of cut.
  const crop =
    width >= WIDTH && height >= HEIGHT
      ? sharp(file).extract({ left: 0, top: 0, width: WIDTH, height: HEIGHT })
      : sharp(file).resize(WIDTH, HEIGHT, { fit: 'cover', position: 'left top' });
  const image = await crop.png({ palette: true }).toBuffer();
  return new Response(new Uint8Array(image), { headers: { 'Content-Type': 'image/png' } });
};
