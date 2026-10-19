import { expect, test } from '@playwright/test';

const ADDRESS = 'contact@marvinlerouge.dev';

const HOMEPAGES = [
  { path: '/', spelledOut: 'contact (arobase) marvinlerouge (point) dev' },
  { path: '/en/', spelledOut: 'contact (at) marvinlerouge (dot) dev' },
];

for (const { path, spelledOut } of HOMEPAGES) {
  test.describe(`contact on ${path}`, () => {
    test('shows the civil name and links to GitHub and LinkedIn in the same tab', async ({
      page,
    }) => {
      await page.goto(path);

      await expect(page.getByText('Jean Ceugniet')).toBeVisible();
      await expect(page.getByRole('link', { name: 'GitHub', exact: true })).toHaveAttribute(
        'href',
        'https://github.com/MarvinLeRouge',
      );
      await expect(page.getByRole('link', { name: 'LinkedIn', exact: true })).toHaveAttribute(
        'href',
        'https://www.linkedin.com/in/jean-ceugniet-developpeur-web/',
      );
      await expect(page.locator('a[target]')).toHaveCount(0);
    });

    test('never serves the address in plain text', async ({ request }) => {
      const html = await (await request.get(path)).text();

      expect(html).not.toContain(ADDRESS);
      expect(html).not.toContain('mailto:');
    });

    test('reveals the address as a mailto link', async ({ page }) => {
      await page.goto(path);

      const link = page.getByRole('link', { name: ADDRESS });
      await expect(link).toHaveAttribute('href', `mailto:${ADDRESS}`);
    });
  });

  test.describe(`contact on ${path} without JavaScript`, () => {
    test.use({ javaScriptEnabled: false });

    test('shows a readable spelled-out address', async ({ page }) => {
      await page.goto(path);

      await expect(page.getByText(spelledOut)).toBeVisible();
      await expect(page.locator('a[href^="mailto:"]')).toHaveCount(0);
    });
  });
}
