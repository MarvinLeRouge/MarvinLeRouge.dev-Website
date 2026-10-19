import { expect, test } from '@playwright/test';

test.describe('project sheets', () => {
  // The e2e suite runs on the production build: draft sheets must not exist there.
  for (const path of ['/projets/example/', '/en/projects/example/']) {
    test(`never publishes a draft sheet: ${path}`, async ({ request }) => {
      expect((await request.get(path)).status()).toBe(404);
    });
  }

  test('keeps draft sheets out of the sitemap', async ({ request }) => {
    const response = await request.get('/sitemap-0.xml');
    const sitemap = await response.text();

    expect(response.ok()).toBe(true);
    expect(sitemap).toContain('<loc>https://marvinlerouge.dev/</loc>');
    expect(sitemap).not.toContain('/projets/example/');
    expect(sitemap).not.toContain('/en/projects/example/');
  });
});
