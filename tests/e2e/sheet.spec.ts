import AxeBuilder from '@axe-core/playwright';
import { expect, test, type Page } from '@playwright/test';

// The published fixture sheet only exists in the e2e build (`npm run build:e2e`), not in the
// production image the suite can also target. Set E2E_FIXTURES=1 for a server built with it.
test.skip(
  !!process.env.PLAYWRIGHT_BASE_URL && !process.env.E2E_FIXTURES,
  'needs the e2e build with the fixture sheet',
);

const FR_SHEET = '/projets/e2e-fixture/';
const EN_SHEET = '/en/projects/e2e-fixture/';

const tab = (page: Page, name: RegExp) => page.getByRole('tab', { name });
const recruiterPanel = (page: Page) => page.locator('#view-recruiter');
const leadDevPanel = (page: Page) => page.locator('#view-lead-dev');

test.describe('project sheet', () => {
  test('shows the recruiter view by default', async ({ page }) => {
    await page.goto(FR_SHEET);

    await expect(tab(page, /recruteur/i)).toHaveAttribute('aria-selected', 'true');
    await expect(recruiterPanel(page)).toBeVisible();
    await expect(leadDevPanel(page)).toBeHidden();
    await expect(page).toHaveURL((url) => url.search === '');
  });

  test('opens the lead dev view from the URL', async ({ page }) => {
    await page.goto(`${FR_SHEET}?vue=tech`);

    await expect(tab(page, /lead dev/i)).toHaveAttribute('aria-selected', 'true');
    await expect(leadDevPanel(page)).toBeVisible();
    await expect(recruiterPanel(page)).toBeHidden();
  });

  test('switches view, updates the URL and remembers the choice across sheets', async ({
    page,
  }) => {
    await page.goto(FR_SHEET);
    await tab(page, /lead dev/i).click();

    await expect(leadDevPanel(page)).toBeVisible();
    await expect(page).toHaveURL(/\?vue=tech$/);

    await page.goto(EN_SHEET);
    await expect(tab(page, /lead dev/i)).toHaveAttribute('aria-selected', 'true');
    await expect(page).toHaveURL(/\?view=tech$/);
  });

  test('is operable with the keyboard', async ({ page }) => {
    await page.goto(FR_SHEET);
    await tab(page, /recruteur/i).focus();

    await page.keyboard.press('ArrowRight');
    await expect(tab(page, /lead dev/i)).toBeFocused();
    await expect(leadDevPanel(page)).toBeVisible();

    await expect(tab(page, /recruteur/i)).toHaveAttribute('tabindex', '-1');

    await page.keyboard.press('Home');
    await expect(tab(page, /recruteur/i)).toBeFocused();
    await expect(recruiterPanel(page)).toBeVisible();

    await page.keyboard.press('End');
    await expect(tab(page, /lead dev/i)).toBeFocused();

    await page.keyboard.press('ArrowLeft');
    await expect(tab(page, /recruteur/i)).toBeFocused();
    await expect(recruiterPanel(page)).toBeVisible();
  });

  test('exposes the views as labelled tab panels', async ({ page }) => {
    await page.goto(FR_SHEET);

    await expect(page.getByRole('tablist', { name: 'Vue de la fiche' })).toBeVisible();
    await expect(page.getByRole('tabpanel', { name: /recruteur/i })).toBeVisible();
  });

  test('picks the view before the body is parsed, with a standalone classic script', async ({
    page,
    request,
  }) => {
    // Records the view attribute at the moment the body element is created (the init script
    // runs before <html> exists, hence observing the whole document).
    await page.addInitScript(() => {
      new MutationObserver((_, observer) => {
        if (!document.body) return;
        document.documentElement.dataset.viewAtBody =
          document.documentElement.getAttribute('data-sheet-view') ?? 'none';
        observer.disconnect();
      }).observe(document, { childList: true, subtree: true });
    });
    await page.goto(`${FR_SHEET}?vue=tech`);
    await expect(page.locator('html')).toHaveAttribute('data-view-at-body', 'lead-dev');

    const script = page.locator('head script[src*="sheet-view"]');
    await expect(script).toHaveCount(1);
    await expect(script).not.toHaveAttribute('type', 'module');
    await expect(script).not.toHaveAttribute('defer');

    const source = await (await request.get((await script.getAttribute('src')) ?? '')).text();
    expect(source).not.toMatch(/^\s*(import|export)\b/m);
  });

  test('links to the homepage and to the translated sheet', async ({ page }) => {
    await page.goto(FR_SHEET);

    await expect(page.getByRole('link', { name: 'MarvinLeRouge.dev' })).toHaveAttribute(
      'href',
      '/',
    );
    await expect(
      page.getByRole('navigation', { name: 'Langue' }).getByRole('link', { name: /EN/ }),
    ).toHaveAttribute('href', EN_SHEET);
  });

  test('uses the screenshot as a 1200 x 630 link preview', async ({ page }) => {
    await page.goto(FR_SHEET);
    const image = await page.locator('meta[property="og:image"]').getAttribute('content');

    await page.goto(new URL(image ?? '').pathname);
    const size = await page
      .locator('img')
      .evaluate((img: HTMLImageElement) => [img.naturalWidth, img.naturalHeight]);
    expect(size).toEqual([1200, 630]);
  });

  for (const view of ['', '?vue=tech']) {
    test(`has no detectable WCAG 2.2 A or AA violations: view ${view || 'recruiter'}`, async ({
      page,
    }) => {
      await page.goto(FR_SHEET + view);

      const results = await new AxeBuilder({ page })
        .withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa', 'wcag22aa'])
        .analyze();

      expect(results.violations).toEqual([]);
    });
  }
});

test.describe('project sheet without JavaScript', () => {
  test.use({ javaScriptEnabled: false });

  test('shows both views one after the other, without tabs', async ({ page }) => {
    await page.goto(FR_SHEET);

    await expect(recruiterPanel(page)).toBeVisible();
    await expect(leadDevPanel(page)).toBeVisible();
    await expect(page.getByRole('tablist')).toBeHidden();
    await expect(page.getByRole('heading', { level: 2, name: 'Vue lead dev' })).toBeVisible();
  });
});

test.describe('project sheet diagrams', () => {
  test('shows the architecture diagram with its text alternative', async ({ page }) => {
    // CSP violations of the page are reported as console errors.
    const consoleErrors: string[] = [];
    page.on('console', (message) => {
      if (message.type() === 'error') consoleErrors.push(message.text());
    });
    await page.goto(`${FR_SHEET}?vue=tech`);

    const diagram = page.getByRole('img', { name: /Chaîne de publication/ });
    await diagram.scrollIntoViewIfNeeded();
    await expect(diagram).toBeVisible();
    expect(await diagram.evaluate((img: HTMLImageElement) => img.naturalWidth)).toBeGreaterThan(0);
    expect(consoleErrors).toEqual([]);
  });

  test('keeps the diagram readable on a narrow screen, scrolling instead of shrinking', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 375, height: 800 });
    await page.goto(`${FR_SHEET}?vue=tech`);

    const diagram = page.getByRole('img', { name: /Chaîne de publication/ });
    const width = await diagram.evaluate((img) => img.getBoundingClientRect().width);
    expect(width).toBeGreaterThan(375);
    const pageOverflow = await page.evaluate(
      () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
    );
    expect(pageOverflow).toBe(0);
  });
});
