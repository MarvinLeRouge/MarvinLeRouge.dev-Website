import type { APIRoute } from 'astro';
import { PSEUDONYM, SITE_NAME, THEME_COLOR } from '../i18n/identity';

/** Name, colors and home screen icons. A plain website: no offline support or standalone display. */
export const GET: APIRoute = () =>
  Response.json({
    name: SITE_NAME,
    short_name: PSEUDONYM,
    start_url: '/',
    display: 'browser',
    theme_color: THEME_COLOR,
    background_color: THEME_COLOR,
    icons: [
      { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { src: '/icon-460.png', sizes: '460x460', type: 'image/png' },
    ],
  });
