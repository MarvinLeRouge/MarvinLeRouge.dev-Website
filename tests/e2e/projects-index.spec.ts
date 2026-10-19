import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

// Needs the published fixture sheet: see sheet.spec.ts.
test.skip(
  !!process.env.PLAYWRIGHT_BASE_URL && !process.env.E2E_FIXTURES,
  'needs the e2e build with the fixture sheet',
);

const INDEXES = [
  {
    home: '/',
    index: '/projets/',
    other: '/en/projects/',
    link: 'Projets',
    sheet: 'Fiche de test',
  },
  {
    home: '/en/',
    index: '/en/projects/',
    other: '/projets/',
    link: 'Projects',
    sheet: 'Test sheet',
  },
];

for (const { home, index, other, link, sheet } of INDEXES) {
  test.describe(`projects index ${index}`, () => {
    test('is linked from the homepage', async ({ page }) => {
      await page.goto(home);

      await page.getByRole('link', { name: link, exact: true }).click();
      await expect(page).toHaveURL((url) => url.pathname === index);
      await expect(page.getByRole('heading', { level: 1, name: link })).toBeVisible();
    });

    test('lists the published sheets and links to them', async ({ page }) => {
      await page.goto(index);

      const card = page.getByRole('listitem').filter({ hasText: sheet });
      await expect(card.getByRole('heading', { level: 2 })).toHaveText(sheet);
      await card.getByRole('link', { name: sheet }).click();
      await expect(page).toHaveURL((url) => url.pathname === `${index}e2e-fixture/`);
    });

    test('is reachable back from a sheet, and switches language to the other index', async ({
      page,
    }) => {
      await page.goto(`${index}e2e-fixture/`);
      await page.getByRole('link', { name: link, exact: true }).click();
      await expect(page).toHaveURL((url) => url.pathname === index);
      await expect(page.getByRole('link', { name: link, exact: true })).toHaveAttribute(
        'aria-current',
        'page',
      );

      const switcher = page.locator('.language-switcher a:not([aria-current])');
      await expect(switcher).toHaveAttribute('href', other);
    });

    test('has no detectable WCAG 2.2 A or AA violations', async ({ page }) => {
      await page.goto(index);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  });
}

test('lists both indexes in the sitemap', async ({ request }) => {
  const sitemap = await (await request.get('/sitemap-0.xml')).text();

  expect(sitemap).toContain('<loc>https://marvinlerouge.dev/projets/</loc>');
  expect(sitemap).toContain('<loc>https://marvinlerouge.dev/en/projects/</loc>');
});

// Translated paths are not paired by the sitemap integration: the pages declare their alternates.
test('declares the other language version of the index with hreflang', async ({ page }) => {
  await page.goto('/projets/');

  await expect(page.locator('link[hreflang="en"]')).toHaveAttribute(
    'href',
    'https://marvinlerouge.dev/en/projects/',
  );
});

test('starts the page with the banner at the top', async ({ page }) => {
  await page.goto('/projets/');

  const box = await page.locator('.sheet-banner').boundingBox();
  expect(box?.y).toBe(0);
});

test('keeps the banner within a 320 pixel wide screen', async ({ page }) => {
  await page.setViewportSize({ width: 320, height: 640 });
  await page.goto('/projets/e2e-fixture/');

  const overflow = await page.evaluate(
    () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
  );
  expect(overflow).toBe(0);
});

// Every sheet listed in the indexes, real ones included, in both views.
for (const index of ['/projets/', '/en/projects/']) {
  test(`has no detectable WCAG 2.2 A or AA violations on the sheets of ${index}`, async ({
    page,
  }) => {
    await page.goto(index);
    const sheets = await page
      .locator('.project-card h2 a')
      .evaluateAll((links) => links.map((link) => link.getAttribute('href')));
    expect(sheets.length).toBeGreaterThan(0);

    const param = index === '/projets/' ? 'vue' : 'view';
    for (const sheet of sheets) {
      for (const view of ['', `?${param}=tech`]) {
        await page.goto(`${sheet}${view}`);
        const results = await new AxeBuilder({ page })
          .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
          .analyze();
        expect(results.violations, `${sheet}${view}`).toEqual([]);
      }
    }
  });
}
